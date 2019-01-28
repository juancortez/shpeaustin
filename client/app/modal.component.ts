import { Component, ElementRef } from "@angular/core";

import { DESCRIPTIONS } from './static/membership-info.template';
import "./styles/modal.component.less";

@Component({
  selector: "modal",
  template: require("./templates/modal.component.html"),
  host: {
  	'(document:keydown)': 'handleKeyboardEvents($event)'
  }
})


export class ModalComponent{
	constructor(private elementRef: ElementRef){}	

	public visible = false;
	private visibleAnimate = false;
	private message: any = "Message";
	private title: string = "Title";
	private icon: string = "";
	
	public show(args): void {
		let title = args.type;
		let option = title.replace(/ /g,"_").toLowerCase(); // replace spaces with an underscore
		this.title = title || this.title;
		this.message = DESCRIPTIONS[option] || this.message;
		this.icon = args.icon;
		this.visible = true;
	    setTimeout(() => this.visibleAnimate = true);
	}

	private hide(): void {
		this.visibleAnimate = false;
		this.visible = false;
	}

	private handleKeyboardEvents(event){
		if(event.code === "Escape"){
			this.visible = false;
			this.visibleAnimate = false;
		}
	}
}

