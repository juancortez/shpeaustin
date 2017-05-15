import { Component, Input } from '@angular/core';

@Component({
  selector: 'carousel',
  template: require("./templates/carousel.component.html"),
  styleUrls: [],
  
})


export class CarouselComponent {
	@Input() pillar: string = 'pillar';
	@Input() pillarDescription: string = 'pillarDescription';   
}
