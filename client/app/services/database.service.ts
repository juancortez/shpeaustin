import { Injectable }    from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable} from 'rxjs/Rx';

import { CookieService } from './cookie.service';

import 'rxjs/add/operator/map';

@Injectable()
export class DatabaseService {

	constructor(private http: Http, private cookieService: CookieService) { }

	getAllKeys(): Observable<any>{
		let credentialsCookie = this.cookieService.getCookie('credentials');

		return this.http.get(`/data/all/keys?credentials=${credentialsCookie}`)
			.map(res => res.json());
	}

	getKey(key: string) : Observable<any> {
		return this.http.get(`/data/${key}`)
			.map(res => {
				return res.json()
			});
	}

	deleteKey(key: string): Observable<any>{
		let credentialsCookie = this.cookieService.getCookie('credentials');
		return this.http.delete(`/data/${key}?credentials=${credentialsCookie}`);
	}

	updateKey(key: string, payload: any): Observable<any>{
		let credentialsCookie = this.cookieService.getCookie('credentials');
		
		let headers = new Headers({ 
			'Content-Type': 'application/json'
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	return this.http.put(`/data/${key}?credentials=${credentialsCookie}`, payload, options);
	}
}