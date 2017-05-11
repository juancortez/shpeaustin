import { Injectable }    from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class JobService {

	constructor(private http: Http) { }

	getJobs(){
		return this.http.get('/data/jobs')
			.map(res => res.json());
	}

	addJob(payload: any){
		let headers = new Headers({ 
			'Content-Type': 'application/json'
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	return this.http.post('/update/jobs', payload, options)
      		.map(res => res.json());
	}
}

    