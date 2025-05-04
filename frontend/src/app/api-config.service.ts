import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  public readonly apiUrl: string =  'http://localhost:8080/';
  //public readonly apiUrl: string =  '/';

  constructor() { }
}
