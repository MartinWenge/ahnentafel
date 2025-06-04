export interface Person {
  id?: number;
  tenant?: string;
  vorname: string;
  nachname: string;
  geburtsname?: string;
  geschlecht: string;
  geburtstag: Date;
  geburtsort?: string;
  todestag?: Date;
  todesort?: string;
  beruf?: string;
}

export interface PersonConnection {
  vorname?: string;
  nachname?: string;
  geburtstag?: Date;
  tenant?: string;
}

export interface PersonIn extends Person {
  verbindungMit: PersonConnection;
  verbindungsart: string;
}

export interface PersonMitVerbindungen {
  bezugsperson: Person;
  eltern?: Person[];
  kinder?: Person[];
  ehepartner?: Person[];
}
