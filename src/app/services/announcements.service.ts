import { Injectable }    from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class AnnouncementsService {

	constructor(private http: Http) {}

	getAnnouncements(){
		return this.http.get('./data/announcements')
			.map(res => res.json());
	}

	addAnnouncement(payload: any){
		let headers = new Headers({ 
			'Content-Type': 'application/json'
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	return this.http.post('/update/announcements', payload, options)
      		.map(res => res.json());
	}
}

    