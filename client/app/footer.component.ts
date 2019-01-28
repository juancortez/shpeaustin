import { Component } 				from "@angular/core";

import { FARM_CREDIT, SPONSOR_TWO } from './static/sponsors.template';

import { SubscribeService } 		from './services/subscribe.service';
import "./styles/footer.component.less";

declare var $: any;

@Component({
  selector: "footer",
  template: require("./templates/footer.component.html")
})


export class FooterComponent {
	farmCredit: Object = FARM_CREDIT;
	sponsorTwo: Object = SPONSOR_TWO;
	formEmail: string;
	visible: boolean = false;
	newsletterStatus: string = "Thank you, please check your e-mail!";

	constructor(private subscribeService: SubscribeService){}

	isValidEmail(): boolean{
		return /@.*\..{2,}/.test(this.formEmail);
	}

	onSubmit(): void{
		let payload = {
			'email': this.formEmail
		};

		this.addLoader();
		this.subscribeService.add(payload).then((response) => {
			this.removeLoader("subscribe", true);
		}).catch((err) => {
			this.removeLoader("subscribe", false);
		});
	}

	private addLoader(className: string = "subscribe"){
		$(`.${className}`).html('<i style="font-size: 20px;" class="fa fa-cog fa-spin fa-2x fa-fw"></i>');
	}

	private removeLoader(className: string = "subscribe", success: boolean){
		$(`.${className}`).html('Submit');
		if(!success){
			$(`.${className}`).text("Failure").css({
                'background': "#D8000C",
                'border-color': 'red'
            });
            this.newsletterStatus = "Sorry, please try again later."
		} else{
            $(`.${className}`).text("Success!").css({
                'background': "green",
                'border-color': 'green'
            });
            this.newsletterStatus = "Thank you, please check your e-mail!";
		}

		setTimeout(() => {
			this.visible = true;
		}, 2000);
		
	}
}
