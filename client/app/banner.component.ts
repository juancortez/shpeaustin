import { Component } from '@angular/core';

@Component({
  selector: 'banner',
  template: `
    <div class = "shpe-austin">
       <a class="dark-shpe-blue" href="/home">SHPE Austin<br>
         <span class="small">Society of Hispanic <br> Professional Engineers</span>
        </a>
    </div>
  `,
  styles: [ require("./styles/banner.component.less") ]
})


export class BannerComponent {
  


}
