import { Component } from "@angular/core";
import "./styles/about.component.less";
import { SHPE_MISSION, SHPE_VISION, SHPE_HISTORY, SHPE_AUSTIN_HISTORY, SHPE_BYLAWS } from './static/text.template';

@Component({
  selector: "about",
  template: require("./templates/about.component.html")
})


export class AboutComponent {
	mission: string = SHPE_MISSION;
	vision: string = SHPE_VISION;
	history: string = SHPE_HISTORY;
	austinHistory: string = SHPE_AUSTIN_HISTORY;
	bylaws: string = SHPE_BYLAWS;
}
