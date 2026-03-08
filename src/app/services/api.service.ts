import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private getApiUrl(): string {
    const platform = Capacitor.getPlatform();

    if (platform === 'android') {
      return 'http://192.168.0.16:3000/users';
    }

    if (platform === 'ios') {
      return 'http://localhost:3000/users';
    }

    return 'http://localhost:3000/users';
  }

  private bashUrl = this.getApiUrl();

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.bashUrl);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.bashUrl, user);
  }
}
