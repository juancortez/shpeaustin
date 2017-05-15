import { Injectable }    from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { DatabaseService } from './database.service';

import 'rxjs/add/operator/map';

@Injectable()
export class SubscribeService {

	constructor(private http: Http, private databaseService: DatabaseService) {}

	getMailChimpId(){
		return this.databaseService.getKey('mailchimp');
	}

	add(payload: any): Promise<any>{
		let headers = new Headers({ 
			'Content-Type': 'application/json'
		});

      	let options = new RequestOptions({ 
      		headers: headers 
      	});

		return new Promise((resolve, reject) => {
			this.getMailChimpId().subscribe(response => {
				this.http.post(`/communication/mailchimp/lists/${response.id}/subscribe`, payload, options).subscribe(response => {
					resolve(response);
				}, err => {
					reject(err);
				});
			}, 
			error => {
				reject(error);
			})
		});
	}
}

    