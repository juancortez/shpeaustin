import { Injectable }    from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from './auth.service';
import CookieProvider from "./../utils/CookieProvider";

import 'rxjs/add/operator/map';

@Injectable()
export class CookieService {

	constructor(private http: Http, private authService: AuthService) {}

	cookieLogIn(credentialsCookie: string): Promise<any>{
		return new Promise((resolve, reject) => {
    	this.authService.checkAuthCookie(credentialsCookie).subscribe((response) => {
    		console.log("Authenticated via cookie.");
    		return resolve(response);
    	}, err => {
    		return reject(err);
    	});
		});
	}

	setCookie(name: string, value: string, expireDays: number, path: string = '/') {
        return CookieProvider.setCookie(name, value, expireDays, path);
    }

    getCookie(name: string) {
        return CookieProvider.getCookie(name);
    }

}