// app.component.ts
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthenticated: boolean;

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.router.navigate(['/home']); // Redirect to home after logout
    });
  }
}
