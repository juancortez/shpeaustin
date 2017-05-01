import { Component, OnInit } from '@angular/core';
import { OfficersService } from './services/officers.service';

@Component({
  selector: 'officers',
  templateUrl: './templates/officers.component.html',
  styleUrls: [ './styles/officers.component.css' ]
})


export class OfficersComponent implements OnInit{
	executiveOfficers: any = [];
	officers: any = [];

	constructor(private officersService: OfficersService) { }

	ngOnInit(){
		this.officersService.getOfficers().subscribe(officers => {
			officers.forEach((officer: any) => {
				if(officer.executive) this.executiveOfficers.push(officer);
				else this.officers.push(officer);
			});
		}, err => {
			console.error(err);
		});
	}
}
