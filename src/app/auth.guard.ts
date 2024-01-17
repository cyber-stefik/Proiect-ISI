// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import {map, Observable} from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private afAuth: AngularFireAuth, private router: Router) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        return this.afAuth.authState.pipe(map(user => {
            if (user) {
                // User is authenticated, allow access
                return true;
            } else {
                // User is not authenticated, navigate to login page
                this.router.navigate(['/login']);
                return false;
            }
        }));
    }
}
