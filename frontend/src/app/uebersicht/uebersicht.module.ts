import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UebersichtComponent } from './uebersicht.component';

import { HttpClientModule } from '@angular/common/http';
import { ApiConfigService } from '../services/api-config.service';

@NgModule({
  declarations: [
    UebersichtComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    UebersichtComponent
  ],
  providers: [
    ApiConfigService
  ]
})
export class UebersichtModule { }