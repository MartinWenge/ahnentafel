import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayGraphModule } from '../display-graph/display-graph.module';
import { UebersichtComponent } from './uebersicht.component';

import { HttpClientModule } from '@angular/common/http';
import { ApiConfigService } from '../services/api-config.service';
import { PersonenlisteBereitstellenService } from '../services/personenliste-bereitstellen.service';

@NgModule({
  declarations: [
    UebersichtComponent
  ],
  imports: [
    CommonModule,
    DisplayGraphModule,
    HttpClientModule,
  ],
  exports: [
    UebersichtComponent
  ],
  providers: [
    ApiConfigService,
    PersonenlisteBereitstellenService
  ]
})
export class UebersichtModule { }