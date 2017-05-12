import { Injectable }    from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { CookieService } from './cookie.service';
import { DatabaseService } from './database.service';

import 'rxjs/add/operator/map';

@Injectable()
export class JobService {

	constructor(private http: Http, private databaseService: DatabaseService, private cookieService: CookieService) {}

	getJobs(){
		return this.databaseService.getKey('jobs');
	}

	addJob(payload: any){
		let credentialsCookie = this.cookieService.getCookie('credentials');

		let headers = new Headers({ 
			'Content-Type': 'application/json'
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	return this.http.post(`/update/jobs?credentials=${credentialsCookie}`, payload, options)
      		.map(res => res.json());
	}
}

    