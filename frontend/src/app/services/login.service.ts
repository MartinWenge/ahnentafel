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
  private tenantIdSubject = new BehaviorSubject<string | null>(null);
  tenantId$: Observable<string | null> = this.tenantIdSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    const storedTenantId = sessionStorage.getItem('tenantId');
    if (storedTenantId) {
      this.tenantIdSubject.next(storedTenantId);
    }
  }

  /**
   * Validiert die Nutzername und empfängt die tenantId vom Backend.
   * @returns Ein Observable, das die tenantId enthält oder null bei Fehler.
   */
  validateToken(username: string, password: string): Observable<{ user: UserOut } | null> {
    let user_in: UserIn = {
      username: username,
      password: password
    };

    return this.http.post<UserOut>(this.apiConfig.apiUrl + this.apiUrlValidateUser, user_in)
      .pipe(
        map(response => {
          if (response && response.tenant) {
            this.tenantIdSubject.next(response.tenant);
            sessionStorage.setItem('tenantId', response.tenant);
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
    return !!this.tenantIdSubject.getValue();
  }

  getTenantId(): string | null {
    return this.tenantIdSubject.getValue();
  }

  logout(): void {
    this.tenantIdSubject.next(null);
    sessionStorage.removeItem('tenantId');
  }
}
