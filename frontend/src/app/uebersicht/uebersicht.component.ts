import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, Subject } from 'rxjs';
import { Person } from '../models/person';
import { PersonenlisteBereitstellenService } from '../services/personenliste-bereitstellen.service';


@Component({
  selector: 'app-uebersicht',
  standalone: false,
  templateUrl: './uebersicht.component.html',
  styleUrl: './uebersicht.component.css'
})
export class UebersichtComponent implements OnInit, OnDestroy {

  allePersonen: Person[] = [];
  private destroy$ = new Subject<void>();

  constructor(private personenBereitstellen: PersonenlisteBereitstellenService) { }

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
