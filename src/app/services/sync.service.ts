import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { IndexeddbService } from './indexeddb.service';
import { User } from '../models/user.model';
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
  ) {}

  submitUser(user: User) {
    console.log('Trying to send user to API');

    if (!navigator.onLine) {
      console.log('Offline → saving to IndexedDB');
      return this.indexeddbService.addUser(user);
    }

    console.log('Online → calling API');

    return this.apiService.addUser(user).pipe(
      catchError((err) => {
        console.log('API ERROR', err);
        console.log('Server failed → saving offline');

        return this.indexeddbService.addUser(user);
      }),
    );
  }

  // syncOfflineUsers() {
  //   return this.indexeddbService.getUsers().pipe(
  //     switchMap((users) => {
  //       if (!users.length) {
  //         return of([]);
  //       }

  //       return from(users).pipe(
  //         mergeMap((user) =>
  //           this.apiService.addUser({
  //             name: user.name,
  //             email: user.email,
  //           }),
  //         ),

  //         toArray(),

  //         switchMap(() => this.indexeddbService.clearUsers()),
  //       );
  //     }),
  //   );
  // }

  // syncOfflineUsers() {
  //   return this.indexeddbService.getUsers().pipe(
  //     switchMap((users) => {
  //       if (!users.length) {
  //         console.log('No offline users to sync');
  //         return of([]);
  //       }

  //       console.log('Syncing', users.length, 'offline users');

  //       return from(users).pipe(
  //         mergeMap((user) =>
  //           this.apiService.addUser(user).pipe(
  //             tap(() => {
  //               console.log('Synced user:', user);
  //             }),
  //             catchError((err) => {
  //               console.log('Failed syncing user:', user);
  //               return of(null);
  //             }),
  //           ),
  //         ),
  //       );
  //     }),
  //   );
  // }

  syncOfflineUsers() {
    console.log('SUNC STARTED');
    return this.indexeddbService.getUsers().pipe(
      switchMap((users) => {
        if (!users.length) {
          console.log('No offline users');
          return of([]);
        }

        return from(users).pipe(
          mergeMap((user) => this.apiService.addUser(user)),
          toArray(),
          switchMap(() => this.indexeddbService.clearUsers()),
          tap(() => {
            console.log('SYNC COMPLETED');
            this.syncCompleted.next();
          }),
        );
      }),
    );
  }
}
