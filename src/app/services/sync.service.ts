import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IndexeddbService } from './indexeddb.service';
import { User } from '../models/user.model';
import { NetworkService } from './network.service';
import { from, of, Subject } from 'rxjs';
import { switchMap, mergeMap, toArray, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  syncCompleted = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private indexeddbService: IndexeddbService,
    private networkService: NetworkService
  ) {}

  submitUser(user: User) {
    if (!this.networkService.isOnline) {
      console.log('App is Offline → saving to IndexedDB (Hidden from UI)');
      return this.indexeddbService.addUser(user);
    }

    console.log('App is Online → calling API');
    return this.apiService.addUser(user).pipe(
      // After online success, we should refresh the main cache (usually handled in FormComponent)
      catchError((err) => {
        console.warn('API call failed while online, falling back to offline storage');
        return this.indexeddbService.addUser(user);
      })
    );
  }

  syncOfflineUsers() {
    console.log('Checking for offline data to sync...');
    return this.indexeddbService.getOfflineUsers().pipe(
      switchMap((users) => {
        if (!users || users.length === 0) {
          console.log('No offline data to sync.');
          return of([]);
        }

        console.log(`Syncing ${users.length} pending items...`);
        return from(users).pipe(
          mergeMap((user) =>
            this.apiService.addUser({ name: user.name, email: user.email }).pipe(
              catchError((err) => {
                console.error('Failed to sync user:', user, err);
                return of(null); // Keep other syncs going
              })
            )
          ),
          toArray(),
          switchMap(() => this.indexeddbService.clearOfflineUsers()),
          tap(() => {
            console.log('SYNC SUCCESSFUL');
            this.syncCompleted.next(); // Trigger UI refresh
          })
        );
      })
    );
  }
}
