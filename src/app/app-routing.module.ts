// app-routing.module.ts
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { EsriMapComponent } from './pages/esri-map/esri-map.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component'; // Import the DashboardComponent
import { AuthGuard } from './auth.guard'; // Import the AuthGuard

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'map',
    component: EsriMapComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'dashboard', // Add this route for the dashboard
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full',
  }
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
