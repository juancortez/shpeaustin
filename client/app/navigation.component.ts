import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'shpe-navigation',
  template: require("./templates/navigation.component.html"),
  styles: [ require("./styles/navigation.component.less") ],
  host: {
    '(window:resize)': 'responsiveEvent($event)'
  }
})
export class NavigationComponent implements OnInit{
	responsiveActivated: boolean = false;

	responsiveEvent(event: any): void{
		let windowWidth = event.target.innerWidth;
		if(windowWidth >= 995) this.responsiveActivated = false;
		else this.responsiveActivated = true;
	}

	ngOnInit(){
		let windowWidth: number = window.innerWidth;
		if(windowWidth >= 995) this.responsiveActivated = false;
		else this.responsiveActivated = true;
	}

}
