import { Component, OnInit } from '@angular/core';
import { OfficersService } from './services/officers.service';

@Component({
  selector: 'officers',
  template: require("./templates/officers.component.html"),
  styles: [ require("./styles/officers.component.less") ]
})


export class OfficersComponent implements OnInit{
	executiveOfficers: any = [];
	officers: any = [];
	err: boolean = false;

	constructor(private officersService: OfficersService) { }

	ngOnInit(){
		this.officersService.getOfficers().subscribe(officers => {	
			officers.forEach((officer: any) => {
				if(officer.executive) this.executiveOfficers.push(officer);
				else this.officers.push(officer);
			});
		}, err => {
			this.err = true;
			console.error(err);
		});
	}
}
