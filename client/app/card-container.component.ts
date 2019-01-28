import { Component, Input, OnInit } from "@angular/core";
import "./styles/card-container.component.less";

@Component({
  selector: "card-container",
  template: require("./templates/card-container.component.html")
})


export class CardContainerComponent{
	@Input() title: string = 'Title';
}
