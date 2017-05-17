import { Component, OnInit } 	from "@angular/core";

import { CookieService } 		from "./services/cookie.service";

declare var $: any;
declare var Chat: any;

@Component({
  selector: "chat-ui",
  template: require("./templates/chat.component.html"),
  styles: [ require("./styles/chat.component.less") ]  
})


export class ChatComponent implements OnInit{
	chatMessage: any;
	chat: any = Chat;
	chatToggle: any;
	contentContainer: any;

	constructor(private cookieService: CookieService){}

	ngOnInit(){
		this.chat.initialize();
		this.chatMessage = $("#chat-message");
		this.contentContainer = $(".content-container");

		let cookie = this.cookieService.getCookie('chat-minimized');
		if(cookie === "true" || this.isMobile()) $("#chat-header i").click();
	}

	sendCommand(){
		let message = this.chatMessage.val();
		this.chat.sendMessage(message);
		this.chatMessage.val(''); 
	}

	toggleChat(event){
        this.contentContainer.toggle();
        this.chatToggle = this.chatToggle ? this.chatToggle : event.target;
        
        if($(this.chatToggle).hasClass('fa-angle-double-up')){
            $("#chat-container").css({'height': '368px'});
            this.cookieService.setCookie('chat-minimized', 'false', 31, '/contact');
            $(this.chatToggle).removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
        } else{
            $("#chat-container").css({'height': '30px'});
            this.cookieService.setCookie('chat-minimized', 'true', 31, '/contact');
            $(this.chatToggle).removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
        }
	}

	private isMobile(): boolean {
		return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	}
}
