import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NeuePersonModule } from './neue-person/neue-person.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NeuePersonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
