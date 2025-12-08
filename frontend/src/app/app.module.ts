import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
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
import { LoginService } from './services/login.service';
import { LoginModule } from './login/login.component.module';
import { ContactModule } from './contact/contact.component.module';
import { AuthInterceptor } from './auth.interceptor';

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
    LoginModule,
    ContactModule,
    MatTabsModule,
    MatCardModule
  ],
  providers: [
    LoginService,
    {
      provide: HTTP_INTERCEPTORS, // Das Token, das Angular Interceptoren erkennt
      useClass: AuthInterceptor,  // Die Klasse, die verwendet werden soll
      multi: true                 // Wichtig: Erlaubt die Registrierung mehrerer Interceptoren
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
