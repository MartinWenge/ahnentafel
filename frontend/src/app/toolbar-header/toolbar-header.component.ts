import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-toolbar-header',
  standalone: false,
  templateUrl: './toolbar-header.component.html',
  styleUrl: './toolbar-header.component.css'
})
export class ToolbarHeaderComponent {

  @Output() navigateToPage = new EventEmitter<'start' | 'contact'>();

  constructor() {}

  navigateToStart(): void {
    this.navigateToPage.emit('start');
  }

  showContact(): void {
    this.navigateToPage.emit('contact');
  }

}
