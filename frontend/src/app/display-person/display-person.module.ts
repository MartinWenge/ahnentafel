import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayPersonComponent } from './display-person.component';

import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    DisplayPersonComponent
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatCardModule
  ],
  exports: [
    DisplayPersonComponent
  ],
  providers: []
})
export class DisplayPersonModule { }
