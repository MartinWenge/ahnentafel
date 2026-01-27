import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayGraphComponent } from './display-graph.component';

import { HttpClientModule } from '@angular/common/http';
import { ApiConfigService } from '../services/api-config.service';
import { StammbaumBereitstellenService } from '../services/stammbaum-bereitstellen.service';

@NgModule({
  declarations: [
    DisplayGraphComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    DisplayGraphComponent
  ],
  providers: [
    ApiConfigService,
    StammbaumBereitstellenService
  ]
})
export class DisplayGraphModule { }