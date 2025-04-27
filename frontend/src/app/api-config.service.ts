import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  public readonly apiUrl: string =  'http://localhost:8000/';
  //public readonly apiUrl: string =  'http://static.255.83.99.91.clients.your-server.de:8000/';

  constructor() { }
}
