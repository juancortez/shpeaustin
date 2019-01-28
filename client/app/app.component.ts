import { Component }          from '@angular/core';
import "./styles/app.component.less";

@Component({
  selector: 'my-app',
  template: `
    <shpe-navigation></shpe-navigation>
    <router-outlet></router-outlet>
    <footer></footer>
  `
})
export class AppComponent {
}
