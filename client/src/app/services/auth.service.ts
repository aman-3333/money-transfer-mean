import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5200/api/auth';
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Check if user is logged in (optional: call profile endpoint on load)
    }

    getCaptcha(): Observable<any> {
        return this.http.get(`${this.apiUrl}/captcha`);
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((user: any) => {
                this.currentUserSubject.next(user);
            })
        );
    }



    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((user: any) => {
                this.currentUserSubject.next(user);
            })
        );
    }

    logout(): Observable<any> {
        return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
            tap(() => {
                this.currentUserSubject.next(null);
            })
        );
    }

    isLoggedIn(): boolean {
        return !!this.currentUserSubject.value;
    }
}
