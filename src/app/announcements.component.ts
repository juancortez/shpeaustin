import { Component, OnInit } 	from "@angular/core";
import { AnnouncementsService } from "./services/announcements.service";

declare var $: any;

@Component({
  selector: "announcements",
  templateUrl: "./templates/announcements.component.html",
  styleUrls: [ "./styles/announcements.component.css" ]  
})


export class AnnouncementsComponent implements OnInit{
	announcements:any = [];

	constructor(private announcementsService: AnnouncementsService){}

	ngOnInit(){
		this.announcementsService.getAnnouncements().subscribe(data => {
			this.announcements = data.announcements;
			this._buildAnnouncementUI();
		}, err =>{
			console.error(err);
		});
	}

	private _buildAnnouncementUI(){
        let announcement:any = this.announcements;
        let numAnnouncements:number = this.announcements.length;

        for(let i = numAnnouncements-1; i > -1; i--){ 
            this._constructAnnouncement(announcement, i, 0);
        }

        $(".announcement-content-container").css({'text-align': 'left'});
        $(".fa-spinner").hide();
	}

	private _constructAnnouncement(announcement:any, i:number, flag:number){
    	if(typeof i == "undefined"){
    		i = announcement.length - 1;// can fall here due to asynchornous call
    	}
        let announcementInfo:string = '<p class="officer-post"> <span class="post-info"></span> <span class="post-content"></span></p>';
		let officerName = announcement[i].officer;
        let timestamp = announcement[i].timestamp;
        let content = announcement[i].announcement;
        let date:any = new Date(timestamp);
        let calDate = date.toLocaleDateString();
        let time = date.toLocaleTimeString();
        let postInfoText:string = officerName + " (" + calDate + " @ " + time  + ")";
        let postInfo:any = $(announcementInfo).find('.post-info')[0];
        $(postInfo).text(postInfoText + " ");
        let postContent = $(announcementInfo).find('.post-content')[0];
        let announcementLink;
        if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(content)) {
            let splitAnnouncement = content.split(' ');
            for(let j = 0, length = splitAnnouncement.length; j < length; j++){
                if(new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(splitAnnouncement[j])){
                    announcementLink = document.createElement('a');
                    announcementLink.setAttribute('href', splitAnnouncement[j]);
                    announcementLink.text = "(Attached link)";
                }
            }
        }

        content = content.replace(/\n/g, "<br /><br />");
        $(postContent).html(content + " ")
        
        $(postContent).append(announcementLink);
        let innerP:string = '<p class="officer-post">';
        let completeHtml = innerP;
        completeHtml = $(completeHtml).append(postInfo);
        completeHtml = $(completeHtml).append(postContent);
        if(flag === 0){
            $('.announcement-content-container').append(completeHtml);
        } else if(flag === 1){
            $('.announcement-content-container').prepend(completeHtml);
        }
	}
}
