import { Injectable }    from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AuthService } from './auth.service';

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
		let d:Date = new Date();
		d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
		let expires:string = `expires=${d.toUTCString()}`;
		let cpath:string = path ? `; path=${path}` : '';
		document.cookie = `${name}=${value}; ${expires}${cpath}`;
  }

  getCookie(name: string) {
      let ca: Array<string> = document.cookie.split(';');
      let caLen: number = ca.length;
      let cookieName = `${name}=`;
      let c: string;

      for (let i: number = 0; i < caLen; i += 1) {
          c = ca[i].replace(/^\s+/g, '');
          if (c.indexOf(cookieName) == 0) {
              return c.substring(cookieName.length, c.length);
          }
      }
      return '';
  }

}

    