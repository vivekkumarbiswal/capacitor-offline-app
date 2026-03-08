import { Component } from '@angular/core';
import { Network } from '@capacitor/network';
import { SyncService } from './services/sync.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private syncService: SyncService) {}

  async ngOnInit() {
    Network.addListener('networkStatusChange', (status) => {
      console.log('Network status:', status);

      if (status.connected) {
        console.log('Internet back → syncing offline users');

        this.syncService.syncOfflineUsers().subscribe();
      }
    });
  }
}
