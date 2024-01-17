// home.component.ts

import { Component, OnInit } from '@angular/core';
import { FirebaseService, Location} from '../../services/database/firebase';
import firebase from 'firebase/compat/app';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    locations: Location[];

    constructor(private firebaseService: FirebaseService) {}

    getRandomFeedback(location: any): string {
      const feedbackArray = location.feedback || [];
      const randomIndex = Math.floor(Math.random() * feedbackArray.length);
      return feedbackArray[randomIndex] || 'No feedback yet';
    }

    async addRating(locationId: string, newRating: number): Promise<void> {
        try {
            // Retrieve the document based on the 'id' field
            const querySnapshot = await this.firebaseService.db.collection('locations', ref => ref.where('id', '==', locationId)).get().toPromise();

            // Process the results (assuming 'id' is unique)
            querySnapshot.forEach((doc) => {
                // Update the rating or perform other operations
                console.log(`Adding rating ${newRating} for location ${locationId}`);
                const locationData = doc.data() as Location;

                // Update the location data (replace with your actual update logic)
                locationData.ratings.push(newRating);

                // Save the updated data back to Firestore
                this.firebaseService.db.collection('locations').doc(doc.id).update(locationData);
            });
        } catch (error) {
            console.error('Error adding rating:', error);
        }
    }

    async addFeedback(locationId: string, newFeedback: string): Promise<void> {
        try {
            // Retrieve the document based on the 'id' field
            const querySnapshot = await this.firebaseService.db.collection('locations', ref => ref.where('id', '==', locationId)).get().toPromise();

            // Process the results (assuming 'id' is unique)
            querySnapshot.forEach((doc) => {
                // Update the rating or perform other operations
                let locationData = doc.data();
                console.log(locationData)
                locationData["feedback"].push(newFeedback)
                // Save the updated data back to Firestore
                this.firebaseService.db.collection('locations').doc(doc.id).set(locationData);
            });
        } catch (error) {
            console.error('Error adding rating:', error);
        }
    }

    async addToFavorites(locationId: string): Promise<void> {
      // Assuming you have a method in FirebaseService to add the location to favorites
      const user = firebase.auth().currentUser; // Get the currently authenticated user

      const querySnapshot = await this.firebaseService.db.collection('users', ref => ref.where('email', '==', user.email)).get().toPromise();;

      querySnapshot.forEach((doc) => {
        // Update the rating or perform other operations
        let userData = doc.data();
        console.log(`addToFavorites - before ${userData["favorites"]}`);
        userData["favorites"].push(locationId);
        console.log(`addToFavorites - after ${userData["favorites"]}`);
        // Save the updated data back to Firestore
        this.firebaseService.db.collection('users').doc(user.uid).set(userData);
      });
    }

    onAddToFavoritesClick(locationId: string): void {
        // Add any additional logic if needed
        this.addToFavorites(locationId);
    }

    isValidRating(newRating: number): boolean {
      return newRating > 0;
    }

    ngOnInit() {
        this.firebaseService.getLocations().subscribe(locations => {
            this.locations = locations;
        });
    }
}
