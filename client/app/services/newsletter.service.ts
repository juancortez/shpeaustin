import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/map';

@Injectable()
export class NewsletterService {

	constructor(private http: Http) { }

	getNewsletterLink(){
		return this.http.get('./data/newsletter')
			.map(res => res.json());
	}
}

    