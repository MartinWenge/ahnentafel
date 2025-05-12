import { Component, OnDestroy, OnInit } from '@angular/core';
import { Person } from '../models/person';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { ApiConfigService } from '../api-config.service';
import { PersonenlisteBereitstellenService } from '../personenliste-bereitstellen.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
  selector: 'app-korrektur-person',
  standalone: false,
  templateUrl: './korrektur-person.component.html',
  styleUrl: './korrektur-person.component.css'
})
export class KorrekturPersonComponent implements OnInit, OnDestroy{
  allePersonen: Person[] = [];
  private destroy$ = new Subject<void>();
  selectedCorrectionType: string = "delete";

  constructor(private http: HttpClient, private apiConfig: ApiConfigService, private personenBereitstellen: PersonenlisteBereitstellenService) {}

  onCorrectionTypeChange(event: any | undefined): void {
    if (event) {
      this.selectedCorrectionType = event;
      console.log('Ausgewählte Korrekturart:', this.selectedCorrectionType);
    }
    else {
      console.log("value undefined: ", event );
    }
  }

  ngOnInit(): void {
      this.personenBereitstellen.getAllePersonen()
        .pipe(takeUntil(this.destroy$))
        .subscribe(personen => {
          this.allePersonen = personen;
        });
    }
  
    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
}
