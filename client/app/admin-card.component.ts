import { Component, Input } from "@angular/core";
import "./styles/admin-card.component.less";

@Component({
  selector: "admin-card",
  template: require("./templates/admin-card.component.html")
})


export class AdminCardComponent {
	@Input() title: string = 'Title';  
	@Input() description: string = 'Description';  	
}
