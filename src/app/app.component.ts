import { Component, OnInit } from '@angular/core';
import { SyncService } from './services/sync.service';
import { NetworkService } from './services/network.service';
import { SwUpdate } from '@angular/service-worker';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isOnline$: Observable<boolean>;

  constructor(
    private syncService: SyncService,
    private networkService: NetworkService,
    private swUpdate: SwUpdate
  ) {
    this.isOnline$ = this.networkService.isOnline$;
  }

  async ngOnInit() {
    // Auto-sync when coming online
    this.isOnline$.subscribe((isOnline) => {
      if (isOnline) {
        console.log('App is online - triggering background sync');
        // Small delay to ensure network is stable
        setTimeout(() => {
          this.syncService.syncOfflineUsers().subscribe();
        }, 2000);
      }
    });
  }
}
