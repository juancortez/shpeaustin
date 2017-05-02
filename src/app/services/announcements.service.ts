import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class AnnouncementsService {

	constructor(private http: Http) { }

	getAnnouncements(){
		return this.http.get('./data/announcements')
			.map(res => res.json());
	}
}

    