import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription, map } from 'rxjs';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-toolbar-header',
  standalone: false,
  templateUrl: './toolbar-header.component.html',
  styleUrl: './toolbar-header.component.css'
})
export class ToolbarHeaderComponent implements OnInit, OnDestroy {
  @Output() navigateToPage = new EventEmitter<'start' | 'contact'>();

  isLoggedIn: boolean = false;
  private isLoggedInSubscription!: Subscription;

  constructor(private loginService: LoginService) { }

  ngOnInit(): void {
    this.isLoggedInSubscription = this.loginService.token$.pipe(
      map(token => !!token)
    ).subscribe(loggedInStatus => {
      this.isLoggedIn = loggedInStatus;
    });
  }

  ngOnDestroy(): void {
    if (this.isLoggedInSubscription) {
      this.isLoggedInSubscription.unsubscribe();
    }
  }

  navigateToStart(): void {
    this.navigateToPage.emit('start');
  }

  showContact(): void {
    this.navigateToPage.emit('contact');
  }

  logout(): void {
    this.loginService.logout();
  }
}
