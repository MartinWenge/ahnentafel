import { Component, OnDestroy, OnInit } from '@angular/core';
import { Person, PersonMitVerbindungen, PersonConnection } from '../models/person';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { ApiConfigService } from '../services/api-config.service';
import { PersonenlisteBereitstellenService } from '../services/personenliste-bereitstellen.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-ansicht-detail',
  standalone: false,
  templateUrl: './ansicht-detail.component.html',
  styleUrl: './ansicht-detail.component.css'
})
export class AnsichtDetailComponent implements OnInit, OnDestroy {
  suchePersonForm: FormGroup;
  //suchText$ = new Subject<string>();
  allePersonen: Person[] = [];
  suchErgebnisse: Person[] = [];
  gefundenePerson: Person | null = null;
  mitVerbindungenPerson: PersonMitVerbindungen | null = null;
  apiUrlPersonZumSuchem: string = "api/verbindungen"
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
      this.mitVerbindungenPerson = null;
      this.isLoading = true;

      let parameter = new HttpParams();
      if (this.gefundenePerson?.vorname) {
        parameter = parameter.set('vorname', this.gefundenePerson.vorname);
      }
      if (this.gefundenePerson?.nachname) {
        parameter = parameter.set('nachname', this.gefundenePerson.nachname);
      }
      if (this.gefundenePerson?.geburtstag) {
        parameter = parameter.set('geburtstag', String(this.gefundenePerson.geburtstag));
      }
      if (this.gefundenePerson?.tenant) {
        parameter = parameter.set('tenant', this.gefundenePerson.tenant);
      }

      this.http.get<PersonMitVerbindungen>(this.apiConfig.apiUrl + this.apiUrlPersonZumSuchem, { params: parameter })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log("Erfolgreich Verbindungen zu Person abgerufen");
            this.erfolgsmeldung = `Verbindungen zu ${this.gefundenePerson?.vorname} ${this.gefundenePerson?.nachname} gefunden`;
            this.fehlermeldung = ''
            this.mitVerbindungenPerson = response;
            this.entferneVerbindung();
            this.suchePersonForm.reset()
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            let errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';

            if (error.error instanceof ErrorEvent) {
              errorMessage = `Fehler: ${error.error.message}`;
            } else {
              switch (error.status) {
                case 422:
                  errorMessage = 'Die Eingabeparameter konnten nicht verarbeitet werden';
                  break;
                case 500:
                  errorMessage = 'Ein unerwarteter Serverfehler ist aufgetreten.';
                  break;
                default:
                  errorMessage = `Unbekannter Fehler ${error.status}: Ein Problem ist aufgetreten.`;
                  break;
              }
            }
            this.fehlermeldung = errorMessage;
            this.erfolgsmeldung = '';
            this.isLoading = false;
          }
        });
    }
  }

  handlePersonClick(clickedPerson: Person): void {
    console.log(`${clickedPerson.vorname} ${clickedPerson.nachname} wurde geklickt.`);
  }
}
