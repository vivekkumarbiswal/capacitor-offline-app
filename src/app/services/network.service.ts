import { Injectable } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private statusSubject = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    this.initializeNetworkListeners();
  }

  private async initializeNetworkListeners() {
    // Get initial status
    const status = await Network.getStatus();
    this.statusSubject.next(status.connected);

    // Listen for changes
    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      console.log('Network status changed:', status.connected ? 'Online' : 'Offline');
      this.statusSubject.next(status.connected);
    });
  }

  get isOnline$(): Observable<boolean> {
    return this.statusSubject.asObservable();
  }

  get isOnline(): boolean {
    return this.statusSubject.value;
  }
}
