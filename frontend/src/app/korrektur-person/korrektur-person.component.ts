import { Component, OnDestroy, OnInit } from '@angular/core';
import { Person, PersonConnection } from '../models/person';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { ApiConfigService } from '../services/api-config.service';
import { PersonenlisteBereitstellenService } from '../services/personenliste-bereitstellen.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-korrektur-person',
  standalone: false,
  templateUrl: './korrektur-person.component.html',
  styleUrl: './korrektur-person.component.css'
})
export class KorrekturPersonComponent implements OnInit, OnDestroy {
  allePersonen: Person[] = [];
  suchErgebnisse: Person[] = [];
  ausgewaehltePerson: Person | null = null;
  loeschenForm: FormGroup;
  private destroy$ = new Subject<void>();
  isLoading: boolean = false;
  selectedCorrectionType: string = "";
  apiUrlPersonLoeschen: string = "api/deleteperson"
  erfolgsmeldung: string = '';
  fehlermeldung: string = '';
  personIstGeloescht: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private apiConfig: ApiConfigService, private personenBereitstellen: PersonenlisteBereitstellenService) {
    this.loeschenForm = this.fb.group({
      personLoeschen: ['', Validators.required],
    })
  }

  onCorrectionTypeChange(event: any | undefined): void {
    if (event) {
      this.selectedCorrectionType = event;
    }
  }

  resetPersonIstGeloescht(): void {
    this.personIstGeloescht = false;
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
    this.loeschenForm.controls['personLoeschen'].valueChanges
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
      this.loeschenForm.controls['personLoeschen'].setValue(inputValue);
    }
  }

  selectPerson(person: Person): void {
    this.ausgewaehltePerson = person;
    this.loeschenForm.patchValue({
      personLoeschen: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnisse = [];
  }

  entferneVerbindung(): void {
    this.ausgewaehltePerson = null;
    this.loeschenForm.patchValue({ personLoeschen: null });
  }

  onSubmit(): void {
    if (this.loeschenForm.valid) {
      this.isLoading = true;

      const personZumLoeschen: PersonConnection = {
        vorname: this.ausgewaehltePerson?.vorname,
        nachname: this.ausgewaehltePerson?.nachname,
        geburtstag: this.ausgewaehltePerson?.geburtstag,
        tenant: this.ausgewaehltePerson?.tenant
      }

      this.http.post<PersonConnection>(this.apiConfig.apiUrl + this.apiUrlPersonLoeschen, personZumLoeschen)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Person erfolgreich gelöscht', response);
            this.erfolgsmeldung = 'Person erfolgreich gelöscht!';
            this.fehlermeldung = '';
            this.loeschenForm.reset();
            this.ausgewaehltePerson = null;
            this.personenBereitstellen.invalidateCache();
            this.personenBereitstellen.getAllePersonen().subscribe(updatedPersonen => {
              this.allePersonen = updatedPersonen;
              this.setupSuche();
              this.isLoading = false;
            });
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Fehler beim Löschen der Person', error);
            this.fehlermeldung = 'Fehler beim Löschen der Person.';
            this.erfolgsmeldung = '';
          }
        });
    } else {
      this.fehlermeldung = 'Bitte füllen Sie alle erforderlichen Felder aus.';
      this.erfolgsmeldung = '';
    }
  }
}
