import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { stammbaumGraph } from '../models/graph';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class StammbaumBereitstellenService {

  private apiUrlGetStammbaum = 'api/stammbaum'
  private stammbaumCache$: Observable<stammbaumGraph> | null = null;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService, private loginService: LoginService) { }

  getStammbaum(): Observable<stammbaumGraph> | null {
    if (!this.stammbaumCache$) {
      let parameter = new HttpParams();
      const tenant: string = (this.loginService.getTenantId() || "").toString();
      parameter = parameter.set('tenant', tenant);
      this.stammbaumCache$ = this.http.get<stammbaumGraph>(this.apiConfig.apiUrl + this.apiUrlGetStammbaum, { params: parameter })
        .pipe(shareReplay(1));
    }
    return this.stammbaumCache$;
  }
}
