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
		// TODO
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
		console.log(evt);
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
