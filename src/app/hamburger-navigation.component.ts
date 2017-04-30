import { Component } from '@angular/core';

@Component({
  selector: 'hamburger-navigation',
  templateUrl: './templates/hamburger-navigation.component.html',
  styleUrls: [ './styles/hamburger-navigation.component.css' ]
})

export class HamburgerNavigationComponent{
	showNavigation: boolean = false;

	toggleNavigation(){
		this.showNavigation = !this.showNavigation;
	}
}
