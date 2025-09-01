import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeueVerbindungComponent } from './neue-verbindung.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiConfigService } from '../services/api-config.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { LoginService } from '../services/login.service';

@NgModule({
  declarations: [
    NeueVerbindungComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinner,
    MatRadioModule
  ],
  exports: [
    NeueVerbindungComponent
  ],
  providers: [
    ApiConfigService,
    LoginService
  ]
})
export class NeueVerbindungModule { }
