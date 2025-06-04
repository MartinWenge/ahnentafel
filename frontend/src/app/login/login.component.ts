import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading: boolean = false;
  erfolgsmeldung: string = "";
  fehlermeldung: string = "";

  constructor(private fb: FormBuilder, private loginService: LoginService){
    this.loginForm = this.fb.group({
      tokenInput: ['', [Validators.required,
          Validators.minLength(12),
          Validators.maxLength(12)]]
    })
  }

  onSubmit(): void {
    if(this.loginForm.valid){
      this.fehlermeldung = '';
      this.erfolgsmeldung = '';
      this.isLoading = true;
      const token = this.loginForm.get('tokenInput')?.value;

      this.loginService.validateToken(token).subscribe({
        next: response => {
          if (response && response.tenantId) {
            this.erfolgsmeldung = "Login erfolgreich";
          } else {
            this.fehlermeldung = 'Ungültiger Token oder Login fehlgeschlagen.';
          }
          this.loginForm.reset();
          this.isLoading = false;
        },
        error: error => {
          this.fehlermeldung = 'Fehler bei der Verbindung zum Server.';
          console.error('Fehler: ', error);
        }
      });
    } else {
      this.fehlermeldung = 'Fehler beim Login';
      this.erfolgsmeldung = '';
    }
  }
}
