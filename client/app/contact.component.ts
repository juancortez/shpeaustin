import { Component } from "@angular/core";

import { Http, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: "contact",
  template: require("./templates/contact.component.html"),
  styles: [ require("./styles/contact.component.less") ]
})

export class ContactComponent {
	categories:any = [
		'General',
		'Athletics',
		'Corporate',
		'Events',
		'Mentorship',
		'Regional/National Conferences',
		'Scholarship',
		'Website',
		'Other'
	];
	formName: string = "";
	formEmail: string = "";
	formPhone: string = "";
	formCategory: string = this.categories[0];
	formMessage: string = "";
	submitted = false;
	validEmail = true;
	success = false;
	physicalAddress = false;

  	constructor(private http: Http){}

  	toggle(){
  		this.physicalAddress = !this.physicalAddress;
  	}

	isValidPhoneNumber(): boolean{
		return /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/.test(this.formPhone);
	}

	isValidName(): boolean{
		return /.{1,}/.test(this.formName);
	}

	isValidEmail(): boolean{
		return /@.*\..{2,}/.test(this.formEmail);
	}

	isValidMessage(): boolean{
		return /.{1,}/.test(this.formMessage);
	}

	onCategoryChange(category: string){
		this.formCategory = category;
	}

	onSubmit():void {
		let headers = new Headers({ 
			'Content-Type': 'application/json'
		});
      	let options = new RequestOptions({ 
      		headers: headers 
      	});

      	let payload = {
        	'name': this.formName, 
            'email': this.formEmail,
            'phone': this.formPhone,
            'category': this.formCategory,
            'message': this.formMessage
      	};


  		let handle = this.http.post('/communication/contact', payload, options);

		handle.subscribe(
		    res => {
		    	if(res && res.status === 200){
		    		this.success = true;	
		    		this.submitted = true;
		    	} else{
		    		console.error(res);
		    	}	
		    },
		    error => {
		    	this.success = false;
		    	this.submitted = true;
		      	console.error(error);
		    }
	  	);
	}

	allValid(): boolean{
		return this.isValidName() && this.isValidEmail() && this.isValidPhoneNumber() && this.isValidMessage();
	}
}
