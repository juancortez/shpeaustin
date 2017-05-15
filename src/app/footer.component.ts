import { Component } 				from "@angular/core";

import { FARM_CREDIT, SPONSOR_TWO } from './static/sponsors.template';

import { SubscribeService } 		from './services/subscribe.service';

declare var $: any;

@Component({
  selector: "footer",
  templateUrl: "./templates/footer.component.html",
  styleUrls: [ "./styles/footer.component.css" ]  
})


export class FooterComponent {
	farmCredit: Object = FARM_CREDIT;
	sponsorTwo: Object = SPONSOR_TWO;
	formEmail: string;

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
		} else{
            $(`.${className}`).text("Success!").css({
                'background': "green",
                'border-color': 'green'
            });
		}

        setTimeout(function() {
            $(`.${className}`).text("Submit").css({
                'background': "#0137A2",
                'border-color': '#2e6da4'
            });
        }, 4000);
	}
}
