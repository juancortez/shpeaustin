import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'officer',
  templateUrl: './templates/officer.component.html',
  styleUrls: [ './styles/officer.component.css' ]
})

export class OfficerComponent{
	@Input() officer: any;
}
