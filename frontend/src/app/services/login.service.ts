import { Injectable } from '@angular/core';
import { ApiConfigService } from './api-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, map, catchError } from 'rxjs';
import { UserIn, UserOut } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly apiUrlValidateUser = 'api/login';
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$: Observable<string | null> = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    const storedToken = sessionStorage.getItem('session_token');
    if (storedToken) {
      this.tokenSubject.next(storedToken);
    }
  }

  validateToken(username: string, password: string): Observable<{ user: UserOut } | null> {
    let user_in: UserIn = {
      username: username,
      password: password
    };

    return this.http.post<UserOut>(this.apiConfig.apiUrl + this.apiUrlValidateUser, user_in)
      .pipe(
        map(response => {
          if (response && response.token) {
            this.tokenSubject.next(response.token);
            sessionStorage.setItem('session_token', response.token);
            return { user: response };
          } else {
            return null;
          }
        }),
        catchError(error => {
          console.error('Login failed:', error);
          this.logout();
          return of(null);
        })
      );
  }

  isLoggedIn(): boolean {
    return !!this.tokenSubject.getValue();
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  logout(): void {
    this.tokenSubject.next(null);
    sessionStorage.removeItem('session_token');
  }
}
