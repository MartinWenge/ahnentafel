import { Injectable } from '@angular/core';
import { ApiConfigService } from './api-config.service';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, map, catchError, Subscription, interval, takeWhile } from 'rxjs';
import { UserIn, UserOut } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly apiUrlValidateUser = 'api/login';

  private timerSubscription?: Subscription;

  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$: Observable<string | null> = this.tokenSubject.asObservable();

  private minutenSessionZeitSubject = new BehaviorSubject<number>(30);
  minutenSessionZeit$: Observable<number> = this.minutenSessionZeitSubject.asObservable();

  private prozentSessionZeitSubject = new BehaviorSubject<number>(100);
  prozentSessionZeit$: Observable<number> = this.prozentSessionZeitSubject.asObservable();

  startZeitSession: number = 0;
  endZeitSession: number = 0;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.checkExistingToken();
  }

  startSessionTimer(start: number, ende: number) {
    this.timerSubscription?.unsubscribe();
    const zeitGesamt: number = ende - start;

    this.timerSubscription = interval(1000).pipe(
      map(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = ende - now;
        const prozent: number = (remaining / zeitGesamt) * 100;
        return Math.max(0, Math.min(100, prozent));
      }),
      takeWhile(prozent => prozent > 0, true)
    ).subscribe(prozent => {
      this.prozentSessionZeitSubject.next(prozent);
      this.minutenSessionZeitSubject.next(Math.round(prozent / 100 * 30));
      if (prozent < 0.1) this.logout();
    });
  }

  checkExistingToken(): void {
    try {
      const token = sessionStorage.getItem("session_token");
      if (token) {
        this.tokenSubject.next(token);

        const now = Math.floor(Date.now() / 1000);
        const exp = this.readExpFromToken(token);
        const iat = this.readIATFromToken(token);
        if (exp > now) {
          this.startSessionTimer(iat, exp);
        } else {
          this.logout();
        }
      }
    }
    catch (e) {
      console.log("fehlerhaftes session token");
      this.logout();
    }

  }

  readExpFromToken(token: string): number {
    try {
      const metaInformation: string = token.split(".")[1];
      const metaPayload = JSON.parse(atob(metaInformation));
      return metaPayload.exp ? metaPayload.exp : 0;
    } catch (e) {
      return 0;
    }
  }

  readIATFromToken(token: string): number {
    try {
      const metaInformation: string = token.split(".")[1];
      const metaPayload = JSON.parse(atob(metaInformation));
      return metaPayload.iat ? metaPayload.iat : 0;
    } catch (e) {
      return 0;
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
            this.startZeitSession = this.readIATFromToken(response.token)
            this.endZeitSession = this.readExpFromToken(response.token);
            this.startSessionTimer(this.startZeitSession, this.endZeitSession);
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
