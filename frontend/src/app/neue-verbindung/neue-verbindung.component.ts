import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil, Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';
import { Person, PersonenVerbinden } from '../models/person';
import { PersonenlisteBereitstellenService } from '../services/personenliste-bereitstellen.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../services/api-config.service';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-neue-verbindung',
  standalone: false,
  templateUrl: './neue-verbindung.component.html',
  styleUrl: './neue-verbindung.component.css'
})
export class NeueVerbindungComponent implements OnInit, OnDestroy {
  neueVerbindungForm: FormGroup;
  allePersonen: Person[] = [];
  suchErgebnis1: Person[] = [];
  suchErgebnis2: Person[] = [];
  gefundenePerson1: Person | null = null;
  gefundenePerson2: Person | null = null;
  erfolgsmeldung: string = '';
  fehlermeldung: string = '';
  verbindungHinzugefuegt: boolean = false;
  private apiURLPostNeueVerbindung = 'api/neueverbindung';
  private destroy$ = new Subject<void>();
  isLoading: boolean = false;

  constructor(private bf: FormBuilder, private http: HttpClient, private apiConfig: ApiConfigService,
    private personenBereitstellen: PersonenlisteBereitstellenService, private loginService: LoginService) {
    this.neueVerbindungForm = this.bf.group({
      person1: [null, Validators.required],
      person2: [null, Validators.required],
      verbindungsart: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    this.personenBereitstellen.getAllePersonen()
      .pipe(takeUntil(this.destroy$))
      .subscribe(personen => {
        this.allePersonen = personen;
        this.setupSuche1();
        this.setupSuche2();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetVerbindungHinzugefuegt(): void {
    this.verbindungHinzugefuegt = false;
  }

  setupSuche1(): void {
    this.neueVerbindungForm.controls['person1'].valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        map(term => term ? this.filterPersonen(term) : [])
      ).subscribe(ergebnisse => {
        this.suchErgebnis1 = ergebnisse
      })
  }

  setupSuche2(): void {
    this.neueVerbindungForm.controls['person2'].valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        map(term => term ? this.filterPersonen(term) : [])
      ).subscribe(ergebnisse => {
        this.suchErgebnis2 = ergebnisse
      })
  }

  filterPersonen(term: string): Person[] {
    term = term.toLowerCase();
    return this.allePersonen.filter(person =>
      person.vorname.toLowerCase().includes(term) || person.nachname.toLowerCase().includes(term)
    );
  }

  onInputChange1(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const inputValue = event.target.value;
      this.neueVerbindungForm.controls['person1'].setValue(inputValue);
    }
  }

  onInputChange2(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const inputValue = event.target.value;
      this.neueVerbindungForm.controls['person2'].setValue(inputValue);
    }
  }

  selectPerson1(person: Person): void {
    this.gefundenePerson1 = person;
    this.neueVerbindungForm.patchValue({
      person1: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnis1 = [];
  }

  selectPerson2(person: Person): void {
    this.gefundenePerson2 = person;
    this.neueVerbindungForm.patchValue({
      person2: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnis2 = [];
  }

  entferneVerbindung(): void {
    this.gefundenePerson1 = null;
    this.gefundenePerson2 = null;
    this.neueVerbindungForm.patchValue({ person1: null });
    this.neueVerbindungForm.patchValue({ person2: null });
  }

  onSubmit(): void {
    if (this.neueVerbindungForm.valid) {
      this.isLoading = true;
      const tenant = this.loginService.getTenantId();
      const neueVerbindung: PersonenVerbinden = {
        person1: {
          vorname: this.gefundenePerson1?.vorname,
          nachname: this.gefundenePerson1?.nachname,
          geburtstag: this.gefundenePerson1?.geburtstag,
          tenant: tenant === null ? undefined : tenant
        },
        person2: {
          vorname: this.gefundenePerson2?.vorname,
          nachname: this.gefundenePerson2?.nachname,
          geburtstag: this.gefundenePerson2?.geburtstag,
          tenant: tenant === null ? undefined : tenant
        },
        verbindungsart: this.neueVerbindungForm.value.verbindungsart
      }

      this.http.post<PersonenVerbinden>(this.apiConfig.apiUrl + this.apiURLPostNeueVerbindung, neueVerbindung)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.erfolgsmeldung = `${this.gefundenePerson1?.vorname} ist jetzt ${this.neueVerbindungForm.value.verbindungsart} von ${this.gefundenePerson2?.vorname}`;
          this.fehlermeldung = '';
          this.neueVerbindungForm.reset();
          this.gefundenePerson1 = null;
          this.gefundenePerson2 = null;
          this.personenBereitstellen.invalidateCache();
          this.personenBereitstellen.getAllePersonen().subscribe(updatedPersonen => {
            this.allePersonen = updatedPersonen;
            this.setupSuche1();
            this.setupSuche2();
            this.verbindungHinzugefuegt = true;
            this.isLoading = false;
          });
        },
        error: (error) => {
          console.error('Fehler beim Erstellen der Verbindung')
          this.fehlermeldung = 'Fehler beim Erstellen der Verbindung';
          this.erfolgsmeldung = '';
          this.isLoading = false;
        }
      });
    } else {
      this.fehlermeldung = 'Bitte fülle alle Felder aus.';
      this.erfolgsmeldung = '';
    }
  }
}
