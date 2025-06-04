import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { LoginService } from './services/login.service';
import { Subscription } from 'rxjs';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy{
  currentPage: 'start' | 'contact' = 'start';
  isLoggedIn: boolean = false;
  private isLoggedInSubscription!: Subscription;

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.isLoggedInSubscription = this.loginService.tenantId$.pipe(
      map(tenantId => !!tenantId)
    ).subscribe(loggedInStatus => {
      this.isLoggedIn = loggedInStatus;
    });
  }

  ngOnDestroy(): void {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
  }

  onTabChange(event: MatTabChangeEvent) {
    console.log('Ausgewählter Tab Label:', event.tab.textLabel);
  }

  handleNavigation(page: 'start' | 'contact'): void {
    this.currentPage = page;
  }

  logout(){
    this.loginService.logout();
  }
}
