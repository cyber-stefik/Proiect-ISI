// login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string;

  constructor(private fb: FormBuilder, private afAuth: AngularFireAuth, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  login() {
    const email = this.loginForm.get('email').value;
    const password = this.loginForm.get('password').value;

    this.afAuth.signInWithEmailAndPassword(email, password)
        .then(() => {
          // Handle successful login
          console.log('Logged in successfully' + this.afAuth.user);
          this.router.navigate(['/dashboard']); // Redirect to the dashboard
        })
        .catch(error => {
          console.log('Login failed', error.message);
          this.errorMessage = error.message;
        });
  }
}
