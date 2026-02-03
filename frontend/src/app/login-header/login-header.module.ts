import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoginService } from '../services/login.service';
import { LoginHeaderComponent } from './login-header.component';

@NgModule({
  declarations: [
    LoginHeaderComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressBarModule
  ],
  exports: [
    LoginHeaderComponent
  ],
  providers: [
    LoginService
  ]
})
export class LoginHeaderModule { }