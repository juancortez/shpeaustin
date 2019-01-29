import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import "./styles/hamburger-navigation.component.less";

@Component({
  selector: 'hamburger-navigation',
  template: require("./templates/hamburger-navigation.component.html")
})

export class HamburgerNavigationComponent{
	showNavigation: boolean = false;
	@Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>();

	/* left: 37, up: 38, right: 39, down: 40, spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36 */
	keys:any = {
		'37': 1, 
		'38': 1, 
		'39': 1, 
		'40': 1
	};
	router: any;

	constructor(private _router: Router){ this.router = _router; }

	toggleNavigation(){
		this.showNavigation = !this.showNavigation;
		this.notify.emit(this.showNavigation); 
		if(this.showNavigation){
			this.disableScroll();
		} else{
			this.enableScroll();	
		} 
	}

	getCurrentPath(route: any): boolean{
		let currentUrl = this.router.url;
		return route.match(currentUrl);
	}

	private enableScroll() {
	    if (window.removeEventListener)
	        window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
	    window.onmousewheel = (document as any).onmousewheel = null; 
	    window.onwheel = null; 
	    window.ontouchmove = null;  
	    document.onkeydown = null;  
	}

	private disableScroll() {
	  if (window.addEventListener) // older FF
	      window.addEventListener('DOMMouseScroll', this.preventDefault, false);
	  window.onwheel = this.preventDefault; // modern standard
	  window.onmousewheel = (document as any).onmousewheel = this.preventDefault; // older browsers, IE
	  window.ontouchmove  = this.preventDefault; // mobile
	  document.onkeydown  = this.preventDefaultForScrollKeys;
	}

	private preventDefault(e:any) {
	  e = e || window.event;
	  if (e.preventDefault)
	      e.preventDefault();
	  e.returnValue = false;  
	}

	private preventDefaultForScrollKeys(e:any) {
	    if (this.keys && this.keys.hasOwnProperty(e.keyCode) && this.keys[e.keyCode]) {
	        this.preventDefault(e);
	        return false;
	    }
	}
}
