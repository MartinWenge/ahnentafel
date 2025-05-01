export interface Person {
  id?: number;
  vorname: string;
  nachname: string;
  geburtstag: Date;
  geburtsort?: string;
  todestag?: Date;
  todesort?: string;
  beruf?: string;
}