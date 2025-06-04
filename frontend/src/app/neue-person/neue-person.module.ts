import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeuePersonComponent } from './neue-person.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiConfigService } from '../services/api-config.service';
import { LoginService } from '../services/login.service';
import { MatInputModule} from '@angular/material/input';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatButtonModule} from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    NeuePersonComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressSpinner,
    MatListModule
  ],
  exports: [
    NeuePersonComponent
  ],
  providers: [
    ApiConfigService,
    LoginService
  ]
})
export class NeuePersonModule { }
