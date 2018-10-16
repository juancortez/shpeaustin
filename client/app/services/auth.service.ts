import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

@Injectable()
export class AuthService {
	constructor(private http: Http){}
  	isLoggedIn: boolean = false;

	// store the URL so we can redirect after logging in
	redirectUrl: string;

	login({username, password}: any): Observable<any> {
		let endcodedCredentials = btoa(username + ":" + password)

		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': 'Basic ' + endcodedCredentials
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	let payload = {};
		return this.http.post('/authentication/login', payload, options).map((res) => {
			if(res.status === 200) this.isLoggedIn = true;
			else this.isLoggedIn = false;
			return res.json();
		});
	}

	checkAuthCookie(credentialsCookie: string): Observable<any>{
		let headers = new Headers({
			'Content-Type': 'application/json'
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	return this.http.get(`/data/officerlogin?credentials=${credentialsCookie}`, options).map((res) => {
      		if(res.status === 200) this.isLoggedIn = true;
      		else this.isLoggedIn = false;
      		return res;
      	});
	}

	logout(): void {
		this.isLoggedIn = false;
  	}
}