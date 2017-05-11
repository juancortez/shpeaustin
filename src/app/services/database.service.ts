import { Injectable }    from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable} from 'rxjs/Rx';

import 'rxjs/add/operator/map';

@Injectable()
export class DatabaseService {

	constructor(private http: Http) { }

	getAllKeys(): Observable<any>{
		return this.http.get('/data/all/keys')
			.map(res => res.json());
	}

	deleteKey(key: string): Observable<any>{
		return this.http.delete(`/data/${key}`);
	}
}

    