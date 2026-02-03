import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login-header',
  standalone: false,
  templateUrl: './login-header.component.html',
  styleUrl: './login-header.component.css'
})
export class LoginHeaderComponent implements OnInit, OnDestroy {
  private isLoggedInSubscription!: Subscription;
  isLoggedIn: boolean = false;

  constructor(public loginService: LoginService) {}

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    
  }

  neuEinloggen(): void {
    this.loginService.logout();
  }
}
