import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { stammbaumGraph } from '../models/graph';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class StammbaumBereitstellenService {

  private apiUrlGetStammbaum = 'api/stammbaum'
  private stammbaumCache$: Observable<stammbaumGraph> | null = null;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getStammbaum(): Observable<stammbaumGraph> | null {
    if (!this.stammbaumCache$) {
      this.stammbaumCache$ = this.http.get<stammbaumGraph>(this.apiConfig.apiUrl + this.apiUrlGetStammbaum)
        .pipe(shareReplay(1));
    }
    return this.stammbaumCache$;
  }
}
