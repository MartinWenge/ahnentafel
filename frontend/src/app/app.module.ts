import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolbarHeaderModule } from './toolbar-header/toolbar-header.module';
import { NeuePersonModule } from './neue-person/neue-person.module';
import { NeueVerbindungModule } from './neue-verbindung/neue-verbindung.modules';
import { KorrekturPersonModule } from './korrektur-person/korrektur-person.module';
import { UebersichtModule } from './uebersicht/uebersicht.module';
import { AnsichtDetailModule } from './ansicht-detail/ansicht-detail.module';
import { DisplayPersonModule } from './display-person/display-person.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

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
    UebersichtModule,
    AnsichtDetailModule,
    DisplayPersonModule,
    MatTabsModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
