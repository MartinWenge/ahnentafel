export interface Person {
  id?: number;
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

export interface PersonIn extends Person {
  verbindungMit: number;
  verbindungsart: string;
}
