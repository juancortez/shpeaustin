import { Component }          from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <shpe-navigation></shpe-navigation>
    <router-outlet></router-outlet>
    <footer></footer>
  `,
  styles: [ require("./styles/app.component.less") ]
})
export class AppComponent {
}
