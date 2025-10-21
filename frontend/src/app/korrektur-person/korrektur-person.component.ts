import { Component, OnDestroy, OnInit } from '@angular/core';
import { Person, PersonConnection, PersonMitVerbindungen, PersonenVerbinden } from '../models/person';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
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
  connectionsErstePerson: Person[] = [];
  suchErgebnisse: Person[] = [];
  suchErgebnis1: Person[] = [];
  suchErgebnis2: Person[] = [];
  ausgewaehltePerson: Person | null = null;
  gefundenePerson1: Person | null = null;
  gefundenePerson2: Person | null = null;
  loeschenForm: FormGroup;
  loeseVerbindungForm: FormGroup;
  private destroy$ = new Subject<void>();
  isLoading: boolean = false;
  selectedCorrectionType: string = "";
  apiUrlPersonLoeschen: string = "api/deleteperson";
  apiUrlPersonZumSuchem: string = "api/verbindungen";
  apiUrlVerbindungZumLoesen: string = "api/deleteverbindung";
  erfolgsmeldung: string = '';
  fehlermeldung: string = '';
  personIstGeloescht: boolean = false;
  verbindungIstGeloest: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private apiConfig: ApiConfigService, private personenBereitstellen: PersonenlisteBereitstellenService) {
    this.loeschenForm = this.fb.group({
      personLoeschen: ['', Validators.required],
    }),
      this.loeseVerbindungForm = this.fb.group({
        person1: ['', Validators.required],
        person2: ['', Validators.required]
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

  resetverbindungIstGeloest(): void {
    this.verbindungIstGeloest = false;
  }

  ngOnInit(): void {
    this.personenBereitstellen.getAllePersonen()
      .pipe(takeUntil(this.destroy$))
      .subscribe(personen => {
        this.allePersonen = personen;
        this.connectionsErstePerson = personen;
        this.setupSuche();
        this.setupSuche1();
        this.setupSuche2();
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

  setupSuche1(): void {
    this.loeseVerbindungForm.controls['person1'].valueChanges
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
    this.loeseVerbindungForm.controls['person2'].valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        map(term => term ? this.filterPerson2(term) : [])
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

  filterPerson2(term: string): Person[] {
    term = term.toLowerCase();
    return this.connectionsErstePerson.filter(person =>
      person.vorname.toLowerCase().includes(term) || person.nachname.toLowerCase().includes(term)
    );
  }

  onInputChange(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const inputValue = event.target.value;
      this.loeschenForm.controls['personLoeschen'].setValue(inputValue);
    }
  }

  onInputChange1(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const inputValue = event.target.value;
      this.loeseVerbindungForm.controls['person1'].setValue(inputValue);
    }
  }

  onInputChange2(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const inputValue = event.target.value;
      this.loeseVerbindungForm.controls['person2'].setValue(inputValue);
    }
  }

  selectPerson(person: Person): void {
    this.ausgewaehltePerson = person;
    this.loeschenForm.patchValue({
      personLoeschen: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnisse = [];
  }

  selectPerson1(person: Person): void {
    this.gefundenePerson1 = person;
    this.loeseVerbindungForm.patchValue({
      person1: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnis1 = [];

    let parameter = new HttpParams();
    if (this.gefundenePerson1?.vorname) {
      parameter = parameter.set('vorname', this.gefundenePerson1.vorname);
    }
    if (this.gefundenePerson1?.nachname) {
      parameter = parameter.set('nachname', this.gefundenePerson1.nachname);
    }
    if (this.gefundenePerson1?.geburtstag) {
      parameter = parameter.set('geburtstag', String(this.gefundenePerson1.geburtstag));
    }
    if (this.gefundenePerson1?.tenant) {
      parameter = parameter.set('tenant', this.gefundenePerson1.tenant);
    }
    this.http.get<PersonMitVerbindungen>(this.apiConfig.apiUrl + this.apiUrlPersonZumSuchem, { params: parameter })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log("Erfolgreich Verbindungen zu Person abgerufen");
          this.fehlermeldung = ''
          this.connectionsErstePerson = [
            ...(response.ehepartner || []),
            ...(response.eltern || []),
            ...(response.kinder || [])
          ];
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

  selectPerson2(person: Person): void {
    this.gefundenePerson2 = person;
    this.loeseVerbindungForm.patchValue({
      person2: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    });
    this.suchErgebnis2 = [];
  }

  setzeGefundenePersonZurueck(): void {
    this.ausgewaehltePerson = null;
    this.loeschenForm.patchValue({ personLoeschen: null });
  }

  setzeGefundenePersonenZurueck(): void {
    this.gefundenePerson1 = null;
    this.gefundenePerson2 = null;
    this.connectionsErstePerson = [];
    this.loeseVerbindungForm.patchValue({ person1: null });
    this.loeseVerbindungForm.patchValue({ person2: null });
  }

  onSubmitLoeschePerson(): void {
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
      this.fehlermeldung = 'Bitte fülle alle erforderlichen Felder aus.';
      this.erfolgsmeldung = '';
    }
  }

  onSubmitLoeseVerbindung(): void {
    if (this.loeseVerbindungForm.valid) {
      this.isLoading = true;
      const verbindungZumLoesen: PersonenVerbinden = {
        person1: {
          vorname: this.gefundenePerson1?.vorname,
          nachname: this.gefundenePerson1?.nachname,
          geburtstag: this.gefundenePerson1?.geburtstag,
          tenant: this.gefundenePerson1?.tenant
        },
        person2: {
          vorname: this.gefundenePerson2?.vorname,
          nachname: this.gefundenePerson2?.nachname,
          geburtstag: this.gefundenePerson2?.geburtstag,
          tenant: this.gefundenePerson2?.tenant
        },
        verbindungsart: "loeschen"
      }

      this.http.post<PersonenVerbinden>(this.apiConfig.apiUrl + this.apiUrlVerbindungZumLoesen, verbindungZumLoesen)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.erfolgsmeldung = `${this.gefundenePerson1?.vorname} ist jetzt nicht mehr mit ${this.gefundenePerson2?.vorname} verbunden`;
            this.fehlermeldung = '';
            this.loeseVerbindungForm.reset();
            this.gefundenePerson1 = null;
            this.gefundenePerson2 = null;
            this.personenBereitstellen.invalidateCache();
            this.personenBereitstellen.getAllePersonen().subscribe(updatedPersonen => {
              this.allePersonen = updatedPersonen;
              this.setupSuche();
              this.setupSuche1();
              this.setupSuche2();
              this.verbindungIstGeloest = true;
              this.isLoading = false;
            });
          },
          error: (error) => {
            console.error('Fehler beim Lösen der Verbindung')
            this.fehlermeldung = 'Fehler beim Lösen der Verbindung';
            this.erfolgsmeldung = '';
            this.isLoading = false;
          }
        });

    } else {
      this.fehlermeldung = 'Bitte fülle alle erforderlichen Felder aus.';
      this.erfolgsmeldung = '';
    }
  }
}
