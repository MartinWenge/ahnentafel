import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnsichtDetailComponent } from './ansicht-detail.component';

import { HttpClientModule } from '@angular/common/http';
import { ApiConfigService } from '../api-config.service';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AnsichtDetailComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinner
  ],
  exports: [
    AnsichtDetailComponent
  ],
  providers: [
    ApiConfigService
  ]
})
export class AnsichtDetailModule { }