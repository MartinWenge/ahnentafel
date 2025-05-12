import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KorrekturPersonComponent } from './korrektur-person.component';
import { ApiConfigService } from '../api-config.service';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [
    KorrekturPersonComponent
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatButtonToggleModule
  ],
  exports: [
    KorrekturPersonComponent
  ],
  providers: [
    ApiConfigService
  ]
})
export class KorrekturPersonModule { }
