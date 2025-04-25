import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ApiConfigService } from '../api-config.service';
import { debounceTime, distinctUntilChanged, takeUntil, map } from 'rxjs/operators';

interface Person {
  id?: number;
  vorname: string;
  nachname: string;
  geburtstag: Date;
  geburtsort?: string;
  todestag?: Date;
  todesort?: string;
  beruf?: string;
}

@Component({
  selector: 'app-neue-person',
  standalone: false,
  templateUrl: './neue-person.component.html',
  styleUrls: ['./neue-person.component.css']
})
export class NeuePersonComponent implements OnInit, OnDestroy {
  personForm: FormGroup;
  suchText$ = new Subject<string>(); // Verwenden Subject für manuelle Steuerung
  allePersonen: Person[] = [];
  suchErgebnisse: Person[] = [];
  verbundenePerson: Person | null = null;
  erfolgsmeldung: string = '';
  fehlermeldung: string = '';
  private apiUrlGetPersonen = 'api/personen';
  private apiUrlPostNeuePerson = 'api/neueperson';
  private destroy$ = new Subject<void>(); // Zum Unsubscriben von Observables

  constructor(private fb: FormBuilder, private http: HttpClient, private apiConfig: ApiConfigService) {
    this.personForm = this.fb.group({
      vorname: ['', Validators.required],
      nachname: ['', Validators.required],
      geburtstag: ['', Validators.required],
      geburtsort: [''],
      todestag: [''],
      todesort: [''],
      beruf: [''],
      verbindung: [''], // Verwenden für die Anzeige des Namens der verbundenen Person
      verbindungId: [null]
    });
  }

  ngOnInit(): void {
    this.http.get<Person[]>(this.apiConfig.apiUrl + this.apiUrlGetPersonen)
      .pipe(takeUntil(this.destroy$))
      .subscribe(personen => {
        this.allePersonen = personen;
        this.setupSuche(); // Suche erst einrichten, wenn die Daten geladen sind
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSuche(): void {
    this.personForm.controls['verbindung'].valueChanges
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
      (this.personForm.controls['verbindung'].valueChanges as any).next(inputValue);
    }
  }

  selectPerson(person: Person): void {
    this.verbundenePerson = person;
    this.personForm.patchValue({ verbindung: `${person.vorname} ${person.nachname}`, verbindungId: person.id });
    this.suchErgebnisse = [];
  }

  entferneVerbindung(): void {
    this.verbundenePerson = null;
    this.personForm.patchValue({ verbindung: '', verbindungId: null });
  }

  onSubmit(): void {
    if (this.personForm.valid) {
      const neuePerson = { ...this.personForm.value };
      if (this.verbundenePerson) {
        neuePerson.verbindungId = this.verbundenePerson.id;
      } else {
        delete neuePerson.verbindungId;
      }
      delete neuePerson.verbindung; // Das Anzeigefeld für die Verbindung muss nicht mitgesendet werden

      this.http.post<Person>(this.apiConfig.apiUrl + this.apiUrlPostNeuePerson, neuePerson)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Person erfolgreich erstellt', response);
            this.erfolgsmeldung = 'Person erfolgreich erstellt!';
            this.fehlermeldung = '';
            this.personForm.reset();
            this.verbundenePerson = null;
          },
          error: (error) => {
            console.error('Fehler beim Erstellen der Person', error);
            this.fehlermeldung = 'Fehler beim Erstellen der Person.';
            this.erfolgsmeldung = '';
          }
        });
    } else {
      this.fehlermeldung = 'Bitte füllen Sie alle erforderlichen Felder aus.';
      this.erfolgsmeldung = '';
    }
  }
}