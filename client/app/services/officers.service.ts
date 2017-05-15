import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class OfficersService {

	constructor(private http: Http) { }

	getOfficers(){
		return this.http.get('./data/officerList')
			.map(res => res.json());
	}
}

    