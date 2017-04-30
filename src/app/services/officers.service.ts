import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

@Injectable()
export class OfficersService {

	constructor(private http: Http) { }

	getOfficers(){
		return this.http.get('/officersData')
      		.map(res => res.json());
	}
}