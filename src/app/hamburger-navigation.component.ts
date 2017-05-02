import { Component } from '@angular/core';

@Component({
  selector: 'hamburger-navigation',
  templateUrl: './templates/hamburger-navigation.component.html',
  styleUrls: [ './styles/hamburger-navigation.component.css' ]
})

export class HamburgerNavigationComponent{
	showNavigation: boolean = false;
	/* left: 37, up: 38, right: 39, down: 40, spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36 */
	keys:any = {
		'37': 1, 
		'38': 1, 
		'39': 1, 
		'40': 1
	};

	toggleNavigation(){
		this.showNavigation = !this.showNavigation;
		if(this.showNavigation) this.disableScroll();
		else this.enableScroll();
	}

	private enableScroll() {
	    if (window.removeEventListener)
	        window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
	    window.onmousewheel = document.onmousewheel = null; 
	    window.onwheel = null; 
	    window.ontouchmove = null;  
	    document.onkeydown = null;  
	}

	private disableScroll() {
	  if (window.addEventListener) // older FF
	      window.addEventListener('DOMMouseScroll', this.preventDefault, false);
	  window.onwheel = this.preventDefault; // modern standard
	  window.onmousewheel = document.onmousewheel = this.preventDefault; // older browsers, IE
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
