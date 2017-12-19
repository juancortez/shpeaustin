import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class CalendarService {

	constructor(private http: Http) { }

	getCalendarEntries(){
		return this.http.get('./data/calendar')
			.map(res => res.json());
	}
}