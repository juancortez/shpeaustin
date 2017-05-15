import { Injectable }    from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { CookieService } from './cookie.service';
import { DatabaseService } from './database.service';

import 'rxjs/add/operator/map';

@Injectable()
export class AnnouncementsService {

	constructor(private http: Http, private databaseService: DatabaseService, private cookieService: CookieService) {}

	getAnnouncements(){
		return this.databaseService.getKey('announcements');
	}

	addAnnouncement(payload: any){
		let credentialsCookie = this.cookieService.getCookie('credentials');

		let headers = new Headers({ 
			'Content-Type': 'application/json'
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	return this.http.post(`/update/announcements?credentials=${credentialsCookie}`, payload, options)
      		.map(res => res.json());
	}
}

    