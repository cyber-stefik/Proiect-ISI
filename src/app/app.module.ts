// app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EsriMapComponent } from './pages/esri-map/esri-map.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import {FirebaseService} from "./services/database/firebase";
import {FirebaseMockService} from "./services/database/firebase-mock";
import {HomeComponent} from "./pages/home/home.component";

@NgModule({
  declarations: [
    AppComponent,
    EsriMapComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    HomeComponent,
    // ... other components
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AppRoutingModule,
  ],
  providers: [FirebaseService,
    FirebaseMockService],
  bootstrap: [AppComponent],
})
export class AppModule {}
