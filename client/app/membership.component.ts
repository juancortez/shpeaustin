import { Component, OnInit, ViewChild } from "@angular/core";
import { CalendarService } 	 from './services/calendar.service';
import { JobService } 		 from './services/jobs.service';
import { ModalComponent } from './modal.component';

declare var $: any;
declare var Calendar: any;
// declare var modal: any;

@Component({
  selector: "membership",
  template: require("./templates/membership.component.html"),
  styles: [ require("./styles/membership.component.less") ]
})


export class MembershipComponent implements OnInit{
  @ViewChild(ModalComponent)
  public readonly modal: ModalComponent;
  private _cache = {};

	constructor(private calendarService: CalendarService, private jobService: JobService){}
	entries: any;
	jobs: any;
  jobsLoading: boolean = true;

	ngOnInit(){
		$("#owl-example").owlCarousel({
      responsiveClass:true,
      responsive:{
          0:{
            items:1
          },
          600:{
            items:2
          },
          700:{
            items:3
          },
          1000:{
            items:4
          },
          1200:{
            items:5
          }
      }
    });

		this.calendarService.getCalendarEntries().subscribe(entries => {
			this.entries = entries;
			this._constructCalendar(entries);

		}, err => {
			console.error(err);
		});

		this.jobService.getJobs().subscribe(data => {
			this.jobs = data.jobs;
      this.jobsLoading = false;
		}, err => {
			console.error(err);
      this.jobsLoading = false;
		});
	}

	moreInformation(event: any){
		let type = event.target.getAttribute('data');
    if(!this._cache[type]){
      let classes = $(event.target).prev().attr('class').split(' ');  
      let icon = [];
      icon = classes.filter((name) => {
        return name !== "fa" && name !== "fa-5x";
      });
      icon = icon.length > 0 ? icon[0] : "";
      this._cache[type] = icon;
    }

    this.modal.show({type, icon: this._cache[type]});
	}

	private _constructCalendar(entries: any){
		var cal = Calendar();
        cal.init(null, entries);
	}
}
