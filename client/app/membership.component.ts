import { Component, OnInit } from "@angular/core";
import { CalendarService } 	 from './services/calendar.service';
import { JobService } 		 from './services/jobs.service';

declare var $: any;
declare var Calendar: any;
declare var modal: any;

@Component({
  selector: "membership",
  template: require("./templates/membership.component.html"),
  styles: [ require("./styles/membership.component.less") ]
})


export class MembershipComponent implements OnInit{
	constructor(private calendarService: CalendarService, private jobService: JobService){}
	entries: any;
	jobs: any;

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
		}, err => {
			console.error(err);
		});

	}

	moreInformation(event: any){
		console.log("more information");
	}

	private _constructCalendar(entries: any){
		var cal = Calendar();
        cal.init(null, entries);
	}

    descriptions = {  
       "mentoring":[  
          "Our chapter has partnered with both The University of Texas at Austin Chapter and SHPE Jr. Chapters to create a mentorship program. Professionals in",
          " the SHPE Austin chapter are matched with college students with similar career choices and provide mentorship and career advice."
       ],
       "community_outreach":[  
          "Our chapter prides itself with community outreach and hosts various activities with The University of Texas at Austin chapter.",
          "Some of the annual events that SHPE Austin hosts are Noche de Ciencias and Introduce a Girl to Engineering Day. Each month, our ",
          "Community Service Director hosts a community service event, ranging from mentoring children, cleaning parks, and participating in toy drives."
       ],
       "leadership_development":[  
          "Throughout the year, officer positions become available and members are encouraged to apply for these positions. If you are interested in learning more about",
          " how the officer board functions or want to enhance your leadership skills as a professional, come around to our events so we can meet you!"
       ],
       "professional_development":[  
          "As a professional, it is important to continue developing your skills so the SHPE Austin chapter provides members with workshops where members can ",
          "become better public speakers, find ways to enhance their brands, and teach how to mentor students."
       ],
       "chapter_development":[  
          "When becoming a professional, it can be daunting to move to a new city. The SHPE Austin chapter makes the transition a little easier by ",
          " hosting socials and events around Austin. Check out our calendar and join us at some of our events to learn more about what Austin, TX has to offer."
       ],
       "sports":[  
          "Austin, TX is well known for being an outdoors city and there are various leagues that SHPE Austin participates in. In past years, our chapter has been part of ",
          "many leagues, including soccer, volleyball, softball, and football."
       ],
       "national_conferences":[  
          "The <a href='http://www.shpe.org/'>Society of Hispanic Professional Engineers National</a> Organization hosts a yearly natinal conference and brings together all ",
          "the chapters across the world, including SHPE Jr. Chapters, University Chapters, and Professional Chapters. The National Conference is usually held in November and ",
          "offers networking opportunities and professional workshops for all members of any age."
       ],
       "regional_conferences":[  
          "Every year, one University chapter from each region is chosen to host a Regional conference. The Regional Conference offers many of the same benefits and opportunities ",
          "as the national conference, but at a smaller level. The Regional Conference is usually held during the month of March and includes activities and events available for all ",
          "levels, including SHPE Jr, University, and Professional."
       ]
    };	
}
