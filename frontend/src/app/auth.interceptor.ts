import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginService } from './services/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loginService: LoginService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const session_token = this.loginService.getToken()
    if(session_token){
      const clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${session_token}`
        }
      });
      return next.handle(clonedRequest);
    }
    return next.handle(request);
  }
};
