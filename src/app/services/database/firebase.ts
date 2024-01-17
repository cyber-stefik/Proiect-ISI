import { Injectable } from '@angular/core';
import {map, Observable, take} from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore'
import Point from '@arcgis/core/geometry/Point';
import firebase from "firebase/compat";
import User = firebase.User;

export interface Location {
  address: string,
  coordinates: Point[],
  description: string,
  feedback: string,
  id: string,
  ratings: number[],
  schedule: string[]
}

@Injectable()
export class FirebaseService {

    listFeed: Observable<any[]>;
    objFeed: Observable<any>;
    colectieDeDate: Observable<any>;


    constructor(public db: AngularFirestore) {

    }

    connectToDatabase() {
      this.colectieDeDate = this.db
        .collection("locations")
        .valueChanges();
      /*this.colectieDeDate.subscribe((items: Location[]) => {
        console.log("got new items from list: ", items);
        //this.graphicsLayer.removeAll();
        for (let item of items) {
          console.log(item);
        }
      });
      this.colectieDeDate.forEach((item) => {
        console.log(item);
      })*/
    }

    getUserDataByEmail(email: string): Observable<User | null> {
        return this.db.collection<User>('users', ref => ref.where('email', '==', email)).valueChanges().pipe(
            take(1),
            map((users: User[]) => users.length > 0 ? users[0] : null)
        );
    }

    getLocations(): Observable<Location[]> {
        return this.db.collection<Location>('locations').valueChanges();
    }

    getData() {
        return this.colectieDeDate;
    }

}
