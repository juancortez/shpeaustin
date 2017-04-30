import { Component, OnInit } from '@angular/core';
import { OfficersService } from './services/officers.service';

@Component({
  selector: 'officers',
  templateUrl: './templates/officers.component.html',
  styleUrls: [ './styles/officers.component.css' ]
})


export class OfficersComponent implements OnInit{
	officers: any = [];

	constructor(private officersService: OfficersService) { }

	ngOnInit(){
		this.officersService.getOfficers().subscribe(officers => {
			console.log(officers);
			this.officers = officers;
		})
	}
}
