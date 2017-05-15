import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "card-container",
  template: require("./templates/card-container.component.html"),
  styles: [ require("./styles/card-container.component.less") ]  
})


export class CardContainerComponent{
	@Input() title: string = 'Title';
}
