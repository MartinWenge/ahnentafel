import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarHeaderModule } from './toolbar-header/toolbar-header.module';
import { NeuePersonModule } from './neue-person/neue-person.module';
import { NeueVerbindungModule } from './neue-verbindung/neue-verbindung.modules';
import { KorrekturPersonModule } from './korrektur-person/korrektur-person.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { KorrekturPersonComponent } from './korrektur-person/korrektur-person.component';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ToolbarHeaderModule,
    NeuePersonModule,
    NeueVerbindungModule,
    KorrekturPersonModule,
    MatTabsModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
