import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarHeaderComponent } from './toolbar-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LoginService } from '../services/login.service';

@NgModule({
  declarations: [
    ToolbarHeaderComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule
  ],
  exports: [
    ToolbarHeaderComponent
  ],
  providers: [
    LoginService
  ]
})
export class ToolbarHeaderModule { }