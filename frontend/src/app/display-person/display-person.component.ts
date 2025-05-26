import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Person } from '../models/person';

@Component({
  selector: 'app-display-person',
  standalone: false,
  templateUrl: './display-person.component.html',
  styleUrl: './display-person.component.css'
})
export class DisplayPersonComponent {
  @Input() person!: Person;

  @Output() personClicked = new EventEmitter<Person>();

  @Input() highlightColor: string | undefined;

  onPersonClick(): void {
    this.personClicked.emit(this.person);
  }
}
