import { Component, ElementRef, OnInit } from '@angular/core';
import "./styles/navigation.component.less";

declare var $: any;

@Component({
  selector: 'shpe-navigation',
  template: require("./templates/navigation.component.html"),
  host: {
    '(window:resize)': 'responsiveEvent($event)'
  }
})
export class NavigationComponent implements OnInit{
	constructor(private _elementRef: ElementRef){}
	responsiveActivated: boolean = false;
	height: number;
	mobile: boolean = false;

	responsiveEvent(event: any): void{
		if(this.mobile) return;
		let windowWidth = event.target.innerWidth;
		if(windowWidth >= 995) this.responsiveActivated = false;
		else this.responsiveActivated = true;
	}

	ngOnInit(){
		let windowWidth: number = window.innerWidth;
		if(windowWidth >= 995) this.responsiveActivated = false;
		else this.responsiveActivated = true;
	}

	hamburgerSelect(message:boolean):void {
		this.mobile = message;
		this.height = $(window).height();
		$(this._elementRef.nativeElement).height($(window).height());
	}
}
