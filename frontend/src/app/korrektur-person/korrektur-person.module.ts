import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KorrekturPersonComponent } from './korrektur-person.component';
import { ApiConfigService } from '../services/api-config.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatInputModule} from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';
import { LoginService } from '../services/login.service';

@NgModule({
  declarations: [
    KorrekturPersonComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatListModule,
    MatButtonToggleModule,
    MatProgressSpinner,
    MatInputModule,
    MatRadioModule,
    MatButtonModule
  ],
  exports: [
    KorrekturPersonComponent
  ],
  providers: [
    ApiConfigService,
    LoginService
  ]
})
export class KorrekturPersonModule { }
