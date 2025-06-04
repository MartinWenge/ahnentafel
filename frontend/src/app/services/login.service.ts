import { Injectable } from '@angular/core';
import { ApiConfigService } from './api-config.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, tap, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly apiUrlGetValidateAccessToken = 'api/accesstoken';
  private tenantIdSubject = new BehaviorSubject<string | null>(null);
  tenantId$: Observable<string | null> = this.tenantIdSubject.asObservable();

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    const storedTenantId = localStorage.getItem('tenantId');
    if (storedTenantId) {
      this.tenantIdSubject.next(storedTenantId);
    }
  }

  /**
   * Validiert den Token und empfängt die tenantId vom Backend.
   * @param token Der zu validierende Token.
   * @returns Ein Observable, das die tenantId enthält oder null bei Fehler.
   */
  validateToken(token: string): Observable<{ tenantId: string } | null> {
    let parameter = new HttpParams();
    parameter = parameter.set('token', token);
    return this.http.get<{ tenantId: string }>(this.apiConfig.apiUrl + this.apiUrlGetValidateAccessToken, { params: parameter})
    .pipe(
      tap(response => {
        if (response && response.tenantId) {
          this.tenantIdSubject.next(response.tenantId);
          localStorage.setItem('tenantId', response.tenantId);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        this.logout();
        return of(null);
      })
    )
  }

  isLoggedIn(): boolean {
    return !!this.tenantIdSubject.getValue();
  }

  getTenantId(): string | null {
    return this.tenantIdSubject.getValue();
  }

  logout(): void {
    this.tenantIdSubject.next(null);
    localStorage.removeItem('tenantId');
  }
}
