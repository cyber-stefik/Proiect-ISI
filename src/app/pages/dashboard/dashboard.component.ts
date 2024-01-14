import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUserEmail: string;
  welcomeMessage: string;

  constructor(private afAuth: AngularFireAuth) {
    this.welcomeMessage = 'Welcome to the Dashboard!';
    console.log('Dashboard component loaded');
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUserEmail = user.email;
        console.log('Current user email:', this.currentUserEmail);
      }
    });
  }
}
