import { Component, OnInit } 		from '@angular/core';
import { NewsletterService } from './services/newsletter.service';

@Component({
  selector: 'home',
  templateUrl: './templates/home.component.html',
  styleUrls: [ './styles/home.component.css' ],
  
})


export class HomeComponent implements OnInit{
	newsletter: string;

	constructor(private newsletterService: NewsletterService){}

	ngOnInit(){
		this.newsletterService.getNewsletterLink().subscribe(data => {
			this.newsletter = data.newsletter.link;
			console.log(this.newsletter);
		}, err => {
			console.error(err);
		});
		         // Twitter Feed
         !function(d:any,s:any,id:any){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
	}
}
