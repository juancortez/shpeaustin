import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "card-container",
  templateUrl: "./templates/card-container.component.html",
  styleUrls: [ "./styles/card-container.component.css" ]  
})


export class CardContainerComponent{
	@Input() title: string = 'Title';
}
