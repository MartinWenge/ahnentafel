import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ApiConfigService } from '../services/api-config.service';
import { PersonenlisteBereitstellenService } from '../services/personenliste-bereitstellen.service';
import { debounceTime, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';
import { Person, PersonIn } from '../models/person';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-neue-person',
  standalone: false,
  templateUrl: './neue-person.component.html',
  styleUrls: ['./neue-person.component.css']
})
export class NeuePersonComponent implements OnInit, OnDestroy {
  personForm: FormGroup;
  suchText$ = new Subject<string>();
  allePersonen: Person[] = [];
  suchErgebnisse: Person[] = [];
  verbundenePerson: Person | null = null;
  erfolgsmeldung: string = '';
  fehlermeldung: string = '';
  private apiUrlPostNeuePerson = 'api/neueperson';
  private destroy$ = new Subject<void>();
  isLoading: boolean = false;
  personIstErstellt: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private apiConfig: ApiConfigService, private loginService: LoginService, private personenBereitstellen: PersonenlisteBereitstellenService) {
    this.personForm = this.fb.group({
      vorname: ['', Validators.required],
      nachname: ['', Validators.required],
      geburtsname: [''],
      geschlecht: ['', Validators.required],
      geburtstag: ['', Validators.required],
      geburtsort: [''],
      todestag: [null],
      todesort: [''],
      beruf: [''],
      verbindungMit: [null, Validators.required],
      verbindungsart: ['', Validators.required]
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
    this.personForm.controls['verbindungMit'].valueChanges
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
      this.personForm.controls['verbindungMit'].setValue(inputValue);
    }
  }

  selectPerson(person: Person): void {
    this.verbundenePerson = person;
    this.personForm.patchValue({
      verbindungMit: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnisse = [];
  }

  entferneVerbindung(): void {
    this.verbundenePerson = null;
    this.personForm.patchValue({ verbindungMit: null });
  }

  resetPersonIstErstellt(): void {
    this.personIstErstellt = false;
  }

  onSubmit(): void {
    if (this.personForm.valid) {
      this.isLoading = true;
      this.erfolgsmeldung = '';
      this.fehlermeldung = '';
      const formValue = this.personForm.value;
      const neuePerson: PersonIn = {
        ...formValue,
        tenant: this.loginService.getTenantId(),
        verbindungMit: this.verbundenePerson
          ? {
            vorname: this.verbundenePerson.vorname,
            nachname: this.verbundenePerson.nachname,
            geburtstag: this.verbundenePerson.geburtstag,
            tenant: this.verbundenePerson.tenant
          }
          : null
      };

      if (formValue.todestag === '') {
        neuePerson.todestag = undefined;
      }

      this.http.post<Person>(this.apiConfig.apiUrl + this.apiUrlPostNeuePerson, neuePerson)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.erfolgsmeldung = `${neuePerson.vorname} ${neuePerson.nachname} erfolgreich angelegt!`;
            this.fehlermeldung = '';
            this.personForm.reset();
            this.verbundenePerson = null;
            this.personenBereitstellen.invalidateCache();
            this.personenBereitstellen.getAllePersonen().subscribe(updatedPersonen => {
              this.allePersonen = updatedPersonen;
              this.setupSuche();
              this.personIstErstellt = true;
              this.isLoading = false;
            });
          },
          error: (error) => {
            console.error('Fehler beim Erstellen der Person', error);
            this.fehlermeldung = 'Fehler beim Erstellen der Person.';
            this.erfolgsmeldung = '';
            this.isLoading = false;
          }
        });
    } else {
      this.fehlermeldung = 'Bitte füllen Sie alle erforderlichen Felder aus.';
      this.erfolgsmeldung = '';
    }
  }
}
