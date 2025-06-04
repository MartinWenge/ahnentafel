import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KorrekturPersonComponent } from './korrektur-person.component';
import { ApiConfigService } from '../services/api-config.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule} from '@angular/material/form-field';

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
    MatButtonModule
  ],
  exports: [
    KorrekturPersonComponent
  ],
  providers: [
    ApiConfigService
  ]
})
export class KorrekturPersonModule { }
