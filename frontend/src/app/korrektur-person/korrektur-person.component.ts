import { Component, OnDestroy, OnInit } from '@angular/core';
import { Person, PersonConnection, PersonMitVerbindungen, PersonenVerbinden } from '../models/person';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, map, Subject } from 'rxjs';
import { takeUntil } from 'rxjs';
import { ApiConfigService } from '../services/api-config.service';
import { LoginService } from '../services/login.service';
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
  suchErgebnis3: Person[] = [];
  ausgewaehltePerson: Person | null = null;
  gefundenePerson1: Person | null = null;
  gefundenePerson2: Person | null = null;
  gefundenePerson3: Person | null = null;
  loeschenForm: FormGroup;
  loeseVerbindungForm: FormGroup;
  korrigierePersonForm: FormGroup;
  private destroy$ = new Subject<void>();
  isLoading: boolean = false;
  selectedCorrectionType: string = "";
  apiUrlPersonZumSuchem: string = "api/verbindungen";
  apiUrlPersonLoeschen: string = "api/deleteperson";
  apiUrlVerbindungZumLoesen: string = "api/deleteverbindung";
  apiUrlKorrigierePerson: string = "api/korrekturperson";
  erfolgsmeldung: string = '';
  fehlermeldung: string = '';
  personIstGeloescht: boolean = false;
  verbindungIstGeloest: boolean = false;
  personendatenKorrigiert: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpClient, private apiConfig: ApiConfigService, private personenBereitstellen: PersonenlisteBereitstellenService, private loginService: LoginService) {
    this.loeschenForm = this.fb.group({
      personLoeschen: ['', Validators.required],
    }),
      this.loeseVerbindungForm = this.fb.group({
        person1: ['', Validators.required],
        person2: ['', Validators.required]
      }),
      this.korrigierePersonForm = this.fb.group({
        personKorrigieren: ['', Validators.required],
        vorname: ['', Validators.required],
        nachname: ['', Validators.required],
        geburtsname: [''],
        geschlecht: ['', Validators.required],
        geburtstag: ['', Validators.required],
        geburtsort: [''],
        todestag: [null],
        todesort: [''],
        beruf: ['']
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

  resetPersonendatenKorrigiert(): void {
    this.personendatenKorrigiert = false;
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
        this.setupSuche3();
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

  setupSuche3(): void {
    this.korrigierePersonForm.controls['personKorrigieren'].valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
        map(term => term ? this.filterPersonen(term) : [])
      ).subscribe(ergebnisse => {
        this.suchErgebnis3 = ergebnisse
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

  onInputChange3(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const inputValue = event.target.value;
      this.korrigierePersonForm.controls['personKorrigieren'].setValue(inputValue);
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

  selectPerson3(person: Person): void {
    this.gefundenePerson3 = person;
    this.korrigierePersonForm.patchValue({
      personKorrigieren: `${person.vorname} ${person.nachname}, ${new Date(person.geburtstag).toLocaleDateString()}`
    })
    this.suchErgebnis3 = [];
    this.korrigierePersonForm.patchValue({ vorname: person.vorname });
    this.korrigierePersonForm.patchValue({ nachname: person.nachname });
    this.korrigierePersonForm.patchValue({ geschlecht: person.geschlecht });
    this.korrigierePersonForm.patchValue({ geburtsname: person.geburtsname });
    this.korrigierePersonForm.patchValue({ geburtstag: person.geburtstag });
    this.korrigierePersonForm.patchValue({ geburtsort: person.geburtsort });
    this.korrigierePersonForm.patchValue({ todestag: person.todestag });
    this.korrigierePersonForm.patchValue({ todesort: person.todesort });
    this.korrigierePersonForm.patchValue({ beruf: person.beruf });
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

  setzeGefundenePersonZurueck2(): void {
    this.gefundenePerson3 = null;
    this.korrigierePersonForm.patchValue({ personKorrigieren: null });
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
              this.setupSuche3();
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

  onSubmitKorrigierePerson(): void {
    if (this.korrigierePersonForm.valid) {
      this.isLoading = true;

      const tenant = this.loginService.getTenantId();
      const originId = this.gefundenePerson3 ? this.gefundenePerson3.id : undefined;
      const korrekturPerson: Person = {
        id: originId,
        tenant: tenant === null ? undefined : tenant,
        vorname: this.korrigierePersonForm.controls["vorname"].value,
        nachname: this.korrigierePersonForm.controls["nachname"].value,
        geburtstag: this.korrigierePersonForm.controls["geburtstag"].value,
        geburtsort: this.korrigierePersonForm.controls["geburtsort"].value,
        geburtsname: this.korrigierePersonForm.controls["geburtsname"].value,
        geschlecht: this.korrigierePersonForm.controls["geschlecht"].value,
        beruf: this.korrigierePersonForm.controls["beruf"].value,
        todestag: this.korrigierePersonForm.controls["todestag"].value,
        todesort: this.korrigierePersonForm.controls["todesort"].value
      }

      this.http.post<Person>(this.apiConfig.apiUrl + this.apiUrlKorrigierePerson, korrekturPerson)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.erfolgsmeldung = `${korrekturPerson.vorname} ${korrekturPerson.nachname} erfolgreich korrigiert!`;
            this.fehlermeldung = '';
            this.korrigierePersonForm.reset();
            this.gefundenePerson3 = null;
            this.personenBereitstellen.invalidateCache();
            this.personenBereitstellen.getAllePersonen().subscribe(updatedPersonen => {
              this.allePersonen = updatedPersonen;
              this.setupSuche();
              this.setupSuche1();
              this.setupSuche2();
              this.setupSuche3();
              this.personendatenKorrigiert = true;
              this.isLoading = false;
            });
          },
          error: (error) => {
            this.fehlermeldung = 'Fehler bei der Korrektur der Person.';
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
