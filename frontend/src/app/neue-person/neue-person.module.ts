import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeuePersonComponent } from './neue-person.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiConfigService } from '../api-config.service';

@NgModule({
  declarations: [
    NeuePersonComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  exports: [
    NeuePersonComponent
  ],
  providers: [
    ApiConfigService
  ]
})
export class NeuePersonModule { }
