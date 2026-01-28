import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:5200/api/users';

    constructor(private http: HttpClient) { }

    getProfile(): Observable<any> {
        return this.http.get(`${this.apiUrl}/profile`);
    }

    createChild(user: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create-child`, user);
    }

    getChildren(): Observable<any> {
        return this.http.get(`${this.apiUrl}/children`);
    }

    getDownline(): Observable<any> {
        return this.http.get(`${this.apiUrl}/downline`);
    }
}
