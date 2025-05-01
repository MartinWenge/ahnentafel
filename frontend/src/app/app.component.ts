import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  onTabChange(event: MatTabChangeEvent) {
    console.log('Ausgewählter Tab Index:', event.index);
    console.log('Ausgewählter Tab Label:', event.tab.textLabel);
  }
}
