import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Person } from '../models/person';
import { ApiConfigService } from './api-config.service';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class PersonenlisteBereitstellenService {

  private apiUrlGetPersonen = 'api/personen/';
  private personenCache$: Observable<Person[]> | null = null;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService, private loginService: LoginService) { }

  getAllePersonen(): Observable<Person[]> {
    if (!this.personenCache$) {
      let parameter = new HttpParams();
      const tenant: string = (this.loginService.getTenantId() || "").toString();
      parameter = parameter.set('tenant', tenant);
      this.personenCache$ = this.http.get<Person[]>(this.apiConfig.apiUrl + this.apiUrlGetPersonen, { params: parameter })
        .pipe(shareReplay(1));
    }
    return this.personenCache$;
  }

  invalidateCache(): void {
    this.personenCache$ = null;
  }
}
