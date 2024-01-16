import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore'
import Point from '@arcgis/core/geometry/Point';


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

    getData() {
        return this.colectieDeDate;
    }

}
