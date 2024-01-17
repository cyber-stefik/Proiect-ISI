// dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from '../../services/database/firebase';
import { Location } from '../../services/database/firebase';
import firebase from "firebase/compat/app";
import {from, map, Observable, ObservedValueOf} from "rxjs";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    currentUserEmail: string;
    userData: firebase.User;
    userFavorites: any[]; // Add this property to store user's favorites

    constructor(private afAuth: AngularFireAuth, private firebaseService: FirebaseService) {
        this.userFavorites = [];
    }

    ngOnInit() {
        this.afAuth.authState.subscribe(async user => {
            if (user) {
                this.currentUserEmail = user.email;
                this.firebaseService.getUserDataByEmail(this.currentUserEmail).subscribe(userData => {
                    this.userData = userData;
                });
            }
        });
    }
}
