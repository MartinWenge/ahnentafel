import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './contact.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    ContactComponent
  ],
  imports: [
    CommonModule,
    MatCardModule
  ],
  exports: [
    ContactComponent
  ],
  providers: []
})
export class ContactModule { }
