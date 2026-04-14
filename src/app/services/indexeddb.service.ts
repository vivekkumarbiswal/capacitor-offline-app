import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable, from } from 'rxjs';
import { switchMap, mergeMap, toArray } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IndexeddbService {
  constructor(private dbService: NgxIndexedDBService) {}

  addUser(user: User): Observable<any> {
    return this.dbService.add('offlineUsers', user);
  }

  getOfflineUsers(): Observable<User[]> {
    return this.dbService.getAll('offlineUsers');
  }

  clearOfflineUsers(): Observable<any> {
    return this.dbService.clear('offlineUsers');
  }

  // Caching methods
  getCachedUsers(): Observable<User[]> {
    return this.dbService.getAll('cachedUsers');
  }

  setCachedUsers(users: User[]): Observable<any> {
    return this.dbService.clear('cachedUsers').pipe(
      switchMap(() => {
        // Add multiple users sequentially
        return from(users).pipe(
          mergeMap(user => this.dbService.add('cachedUsers', user)),
          toArray()
        );
      })
    );
  }
}
