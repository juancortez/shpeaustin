import { Component, Input } from "@angular/core";

@Component({
  selector: "admin-card",
  template: require("./templates/admin-card.component.html"),
  styles: [ require("./styles/admin-card.component.less") ]  
})


export class AdminCardComponent {
	@Input() title: string = 'Title';  
	@Input() description: string = 'Description';  	
}
