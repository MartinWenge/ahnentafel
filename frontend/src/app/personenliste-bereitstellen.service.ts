import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Person } from './models/person';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class PersonenlisteBereitstellenService {

  private apiUrlGetPersonen = 'api/personen/';
  private personenCache$: Observable<Person[]> | null = null;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) { }

  getAllePersonen(): Observable<Person[]> {
    if (!this.personenCache$) {
      this.personenCache$ = this.http.get<Person[]>(this.apiConfig.apiUrl + this.apiUrlGetPersonen)
        .pipe(shareReplay(1)); // Cache das letzte Ergebnis (1 bedeutet die letzte Emission)
    }
    console.log("successfully pulled list of persons");
    return this.personenCache$;
  }

  invalidateCache(): void {
    this.personenCache$ = null;
  }
}
