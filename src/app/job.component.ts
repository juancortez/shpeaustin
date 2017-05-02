import { Component, Input} from "@angular/core";

@Component({
  selector: "job",
  templateUrl: "./templates/job.component.html",
  styleUrls: [ "./styles/job.component.css" ]
})


export class JobComponent{
  @Input() position: string = 'Position'; 
  @Input() company: string = 'Company'; 
  @Input() description: string = 'Description'; 
  @Input() poster: string = 'Poster'; 
  @Input() url: string = 'http://www.google.com'; 
}
