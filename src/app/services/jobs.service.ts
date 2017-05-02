import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class JobService {

	constructor(private http: Http) { }

	getJobs(){
		return this.http.get('./data/jobs')
			.map(res => res.json());
	}
}

    