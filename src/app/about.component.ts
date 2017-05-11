import { Component } from "@angular/core";

import { SHPE_MISSION, SHPE_VISION, SHPE_HISTORY, SHPE_AUSTIN_HISTORY, SHPE_BYLAWS } from './static/text.template';

@Component({
  selector: "about",
  templateUrl: "./templates/about.component.html",
  styleUrls: [ "./styles/about.component.css" ]  
})


export class AboutComponent {
	mission: string = SHPE_MISSION;
	vision: string = SHPE_VISION;
	history: string = SHPE_HISTORY;
	austinHistory: string = SHPE_AUSTIN_HISTORY;
	bylaws: string = SHPE_BYLAWS;
}
