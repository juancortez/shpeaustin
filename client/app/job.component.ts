import { Component, Input} from "@angular/core";

@Component({
  selector: "job",
  template: require("./templates/job.component.html"),
  styles: [ require("./styles/job.component.less") ]
})


export class JobComponent{
  @Input() position: string = 'Position'; 
  @Input() company: string = 'Company'; 
  @Input() description: string = 'Description'; 
  @Input() poster: string = 'Poster'; 
  @Input() url: string = 'http://www.google.com'; 
}
