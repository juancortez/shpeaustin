import { Component, OnInit } 		   from "@angular/core";
import { AdminCardComponent }  from './admin-card.component';

import { Observable} from 'rxjs/Rx';

import { OfficersService } from './services/officers.service';
import { AnnouncementsService } from './services/announcements.service';
import { JobService } from './services/jobs.service';
import { DatabaseService } from './services/database.service';

declare var $: any;

@Component({
  selector: "admin",
  templateUrl: "./templates/admin.component.html",
  styleUrls: [ "./styles/admin.component.css" ]  
})


export class AdminComponent implements OnInit {
	officers: string[];
	jobPosition: string;
	jobCompany: string;
	jobDescription: string;
	jobLink: string;
	jobPoster: string;

	announcementOfficer: string;
	formAnnouncement: string;

	databaseKeys: any = [];
	activateDeleteButton: boolean = false;

	viewDataKey: string;
	updateDataKey: string;

	updatedData: any;

	constructor( private officersService: OfficersService,
		private announcementsService: AnnouncementsService,
		private jobService: JobService,
		private databaseService: DatabaseService
	){}

	ngOnInit(){
		this.getOfficers();
		this.getDatabaseKeys();
	}

	deleteKeys(){
		let keysToDelete = this.databaseKeys.filter((key: any) => {
			return key.selected;
		}).map((key: any) => {
			return key.name
		});
		
		keysToDelete.forEach((key:string) => {
			this.databaseService.deleteKey(key).subscribe(
				res => {
					if(res.status === 200) console.log(`${key} was successfully cleared!`);
				}, 
				err => {
					console.error(`${key} was unsuccessfully cleared.`);
				}
			);
		});
	}

	viewKey(){
		let className: string = 'viewKey';

		this.addLoader(className);

		this.databaseService.getKey(this.viewDataKey).subscribe(
			data => {
				this.showData(data);
				this.removeLoader(className, true);
			}, 
			err => {
				console.error(err);
				this.removeLoader(className, false);
			}
		);
	}

	updateKey(){
		let className: string = 'updateKey';

		this.addLoader(className);
		console.log(this.viewDataKey);
		console.log(this.updatedData);

		this.databaseService.updateKey(this.viewDataKey, this.updatedData).subscribe(
			data => {
				this.removeLoader(className, true);
			}, 
			err => {
				console.error(err);
				this.removeLoader(className, false);
			}
		);
	}

	newJob(): void{
		let className: string = 'newJob';

      	let payload = {
        	'position': this.jobPosition, 
            'company': this.jobCompany,
            'description': this.jobDescription,
            'url': this.jobLink,
            'poster': this.jobPoster,
            'ts': new Date().getTime()
      	};

      	this.addLoader(className);

  		this.jobService.addJob(payload).subscribe(
		    res => {
		    	console.log(res);
		    	this.removeLoader(className, true);	
		    },
		    error => {
		    	console.error(error);
		    	this.removeLoader(className, false);
		    }
	  	);
	}

	newAnnouncement(): void{
		let className: string = 'newAnnouncement';

		let payload = {
	        officer: this.announcementOfficer,
	        timestamp: new Date().getTime(),
	        announcement: this.formAnnouncement
		};

		this.addLoader(className);

  		this.announcementsService.addAnnouncement(payload).subscribe(
		    res => {
		    	console.log(res);
		    	this.removeLoader(className, true);	
		    },
		    error => {
		    	console.error(error);
		    	this.removeLoader(className, false);
		    }
	  	);
	}

	isValid(name:string): boolean{
		if(this[name] === undefined) return false;
		return /.{1,}/.test(this[name]);
	}

	isValidJSON(data: any): boolean {
		try{
			JSON.parse(this.updatedData);
			return true;
		} catch(e){
			return false;
		}
	}

	allJobEntriesValid(): boolean{
		return ['jobPosition', 'jobCompany', 'jobDescription', 'jobLink', 'jobPoster'].every((element) => {
			return this.isValid(element);
		});
	}

	allAnnouncementEntriesValid(): boolean{
		return ['announcementOfficer', 'formAnnouncement'].every((element) => {
			return this.isValid(element);
		});
	}

	onOfficerChange(evt: string): void{
		this.announcementOfficer = evt;
	}

	deleteCheckboxChange(evt: any): void{}

	onViewKeyChange(evt: any): void{
		this.viewDataKey = evt.name;
	}

	onUpdateKeyChange(evt: any): void{
		this.updateDataKey = evt.name;
	}

	copy(): void{
        var success = this.copyToClipboard(document.getElementById("hidden-output"));
        $('html, body').animate({
            scrollTop: $(".json-container").offset().top - 90
        }, 1);
        var text = success ? "Successfully copied!" : "Copy unsuccessful!";
        var copyStatus = $(".copy-status");
        if (success) {
            copyStatus.css({
                color: "green"
            });
        } else {
            copyStatus.css({
                color: "red"
            });
        }
        $(".copy-status").text(text).show();
        setTimeout(function() {
            copyStatus.hide();
        }, 2000);
	}

	private copyToClipboard(elem: any) {
        // create hidden text element, if it doesn't already exist
        var targetId = "_hiddenCopyText_",
            origSelectionStart, origSelectionEnd;
        var target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "1200px";
        target.id = targetId;
        document.body.appendChild(target);

        target.textContent = elem.textContent;
        // select the content
        var currentFocus = document.activeElement;
        target.focus();
        target.setSelectionRange(0, target.value.length);

        // copy the selection
        var succeed;
        try {
            succeed = document.execCommand("copy");
        } catch (e) {
            succeed = false;
        }
        // restore original focus
        if (currentFocus && typeof currentFocus.focus === "function") {
            currentFocus.focus();
        }

        target.textContent = "";
        return succeed;
    }

	private showData(data: any){
		$(".json-container .output-container").show();
        $(".json-container .output-container i").show();
        $("#hidden-output").text(JSON.stringify(data));
        $(".output").text(JSON.stringify(data, null, 4));
        $('html, body').animate({
            scrollTop: $(".json-container").offset().top - 90
        }, 1000);
	}

    private getOfficers() {
    	this.officersService.getOfficers().subscribe(
      		officers => {
      			this.officers = officers;
      			this.announcementOfficer = this.officers[0]['name'];
      		},
      		error => {
      			console.error(error);
      			this.officers = [];
      		}
      	);
    }

    private getDatabaseKeys(){
    	this.databaseService.getAllKeys().subscribe(
    		keys => {
    			keys.forEach((key: string) => {
    				let keyObject = {};
    				keyObject['name'] = key;
    				keyObject['selected'] = false;
    				this.databaseKeys.push(keyObject);
    			});
    			let firstKeyName = this.databaseKeys && this.databaseKeys.length > 0 ? this.databaseKeys[0].name : "";
    			this.viewDataKey = firstKeyName;
    			this.updateDataKey = firstKeyName;
    		}, 
    		err => {
    			console.error(err);
    		}
    	);
    }

	private addLoader(className: string){
		$(`.${className}`).html('<i class="fa fa-cog fa-spin fa-2x fa-fw"></i>');
	}

	private removeLoader(className: string, success: boolean){
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
        }, 3000);
	}
}
