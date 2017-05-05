import { Component } from "@angular/core";

@Component({
  selector: "contact",
  templateUrl: "./templates/contact.component.html",
  styleUrls: [ "./styles/contact.component.css" ]
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

	onCategoryChange(category: string){
		this.formCategory = category;
	}

	onMessageChange(message: string):void{
		this.formMessage = message;
	}

	onSubmit():void {
		console.log(this);
		this.submitted = true;
	}
}
