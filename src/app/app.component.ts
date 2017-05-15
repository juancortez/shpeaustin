import { Component }          from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <shpe-navigation></shpe-navigation>
    <router-outlet></router-outlet>
    <footer></footer>
  `,
  styleUrls: ['./styles/app.component.css']
})
export class AppComponent {
}
