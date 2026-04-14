import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api.service';
import { SyncService } from 'src/app/services/sync.service';
import { IndexeddbService } from 'src/app/services/indexeddb.service';
import { NetworkService } from 'src/app/services/network.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  userForm!: FormGroup;
  users: User[] = [];
  isOnline$: Observable<boolean>;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private syncService: SyncService,
    private indexeddbService: IndexeddbService,
    private networkService: NetworkService
  ) {
    this.isOnline$ = this.networkService.isOnline$;
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.loadUsers();

    // Re-load users when a background sync finishes (meaning new data is on server)
    this.syncService.syncCompleted.subscribe(() => {
      console.log('Reloading users after successful background sync...');
      this.loadUsers();
    });
  }

  submitForm() {
    if (this.userForm.invalid) return;

    const user = this.userForm.value;
    const wasOnline = this.networkService.isOnline;

    this.syncService.submitUser(user).subscribe({
      next: () => {
        if (wasOnline) {
          // If online, the item was added to the server, so refresh the list
          this.loadUsers();
        } else {
          // If offline, the item is hidden until sync, so just show a log
          console.log('Submission saved locally (hidden from UI until online)');
        }
        this.userForm.reset();
      },
      error: (err) => console.error('Submission failed', err)
    });
  }

  loadUsers() {
    this.isLoading = true;

    if (this.networkService.isOnline) {
      // ONLINE: Fetch from API, update CACHE, then update UI
      this.apiService.getUsers().pipe(
        switchMap((data) => {
          // Save latest server data to cache for next offline period
          return this.indexeddbService.setCachedUsers(data).pipe(
            map(() => data)
          );
        }),
        catchError((err) => {
          console.warn('API fetch failed while online, falling back to cache:', err);
          return this.indexeddbService.getCachedUsers();
        })
      ).subscribe((data) => {
        this.users = data;
        this.isLoading = false;
      });
    } else {
      // OFFLINE: Strictly fetch from CACHE (excludes pending items in offlineUsers store)
      console.log('App is offline - fetching from local cache only');
      this.indexeddbService.getCachedUsers().subscribe((data) => {
        this.users = data;
        this.isLoading = false;
      });
    }
  }
}
