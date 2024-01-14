// signup.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string;

  constructor(private fb: FormBuilder, private auth: AngularFireAuth, private router: Router) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  async signup() {
    try {
      const { email, password, confirmPassword } = this.signupForm.value;

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      console.log('Email entered:', email);
      await this.auth.createUserWithEmailAndPassword(email, password);
      console.log('Signed up successfully');
      // Handle successful signup
      console.log('Signup successful');
      // Redirect to the login page
      await this.router.navigate(['/login']);

    } catch (error) {
      console.error('Signup failed', error.message);
      this.errorMessage = error.message;
    }
  }
}
