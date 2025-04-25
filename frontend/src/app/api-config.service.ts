import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  //public readonly apiUrl: string =  'http://localhost:8000/';
  public readonly apiUrl: string =  'http://backend:8000/';

  constructor() { }
}
