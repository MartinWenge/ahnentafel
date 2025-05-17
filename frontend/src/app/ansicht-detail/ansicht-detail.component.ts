import { Component, OnDestroy, OnInit } from '@angular/core';
import { Person } from '../models/person';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { ApiConfigService } from '../api-config.service';
import { PersonenlisteBereitstellenService } from '../personenliste-bereitstellen.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-ansicht-detail',
  standalone: false,
  templateUrl: './ansicht-detail.component.html',
  styleUrl: './ansicht-detail.component.css'
})
export class AnsichtDetailComponent implements OnInit, OnDestroy {
  suchePersonForm: FormGroup;
  suchText$ = new Subject<string>();
  allePersonen: Person[] = [];
  suchErgebnisse: Person[] = [];
  gefundenePerson: Person | null = null;
  erfolgsmeldung: string = '';
  fehlermeldung: string = '';
  private destroy$ = new Subject<void>();
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private apiConfig: ApiConfigService, private personenBereitstellen: PersonenlisteBereitstellenService) {
    this.suchePersonForm = this.fb.group({
      gesuchtePerson: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.personenBereitstellen.getAllePersonen()
      .pipe(takeUntil(this.destroy$))
      .subscribe(personen => {
        this.allePersonen = personen;
        this.setupSuche();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSuche(): void {
    this.suchePersonForm.controls['gesuchtePerson'].valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        map(term => term ? this.filterPersonen(term) : [])
      )
      .subscribe(ergebnisse => {
        this.suchErgebnisse = ergebnisse;
      });
  }

  filterPersonen(term: string): Person[] {
    term = term.toLowerCase();
    return this.allePersonen.filter(person =>
      person.vorname.toLowerCase().includes(term) || person.nachname.toLowerCase().includes(term)
    );
  }

  onInputChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const inputValue = event.target.value;
      this.suchePersonForm.controls['gesuchtePerson'].setValue(inputValue);
    }
  }

  selectPerson(person: Person): void {
    this.gefundenePerson = person;
    this.suchePersonForm.patchValue({
      gesuchtePerson: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnisse = [];
  }

  entferneVerbindung(): void {
    this.gefundenePerson = null;
    this.suchePersonForm.patchValue({ gesuchtePerson: null });
  }

  onSubmit(): void {
    if (this.suchePersonForm.valid) {
      this.isLoading = true;
      console.log("suche Person in Datenbank...");
      setTimeout(() => {
        this.erfolgsmeldung = "Daten geladen";
        this.isLoading = false;
      }, 1000);
    }
  }
}
