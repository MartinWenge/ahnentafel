import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeueVerbindungComponent } from './neue-verbindung.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiConfigService } from '../services/api-config.service';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';

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
    MatButtonModule
  ],
  exports: [
    NeueVerbindungComponent
  ],
  providers: [
    ApiConfigService
  ]
})
export class NeueVerbindungModule { }
