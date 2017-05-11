import { Component, Input } from "@angular/core";

@Component({
  selector: "admin-card",
  templateUrl: "./templates/admin-card.component.html",
  styleUrls: [ "./styles/admin-card.component.css" ]  
})


export class AdminCardComponent {
	@Input() title: string = 'Title';  
	@Input() description: string = 'Description';  	
}
