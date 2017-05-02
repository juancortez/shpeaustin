import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { AppRoutingModule } from './app-routing.module';


/* API Services */
import { OfficersService } from './services/officers.service';
import { CalendarService } from './services/calendar.service';
import { JobService }      from './services/jobs.service';

/* App Component */
import { AppComponent }                     from './app.component';

/* Pages */
import { HomeComponent }                    from './home.component';
import { AboutComponent }                   from './about.component';
import { OfficersComponent }                from './officers.component';
import { MembershipComponent }              from './membership.component'
import { ContactComponent }                 from './contact.component';

/* Navigation Components */
import { NavigationComponent }              from './navigation.component';
import { NavigationLinksComponent }         from './navigation-links.component';
import { SocialMediaComponent }             from './social-media.component';
import { BannerComponent }                  from './banner.component';
import { HamburgerNavigationComponent }     from './hamburger-navigation.component';

/* Helpers */
import { SmallCardComponent }               from './card.component';
import { OfficerComponent }                 from './officer.component';
import { CarouselComponent }                from './carousel.component';
import { JobComponent }                     from './job.component';





@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationComponent,
    SocialMediaComponent,
    BannerComponent,
    NavigationLinksComponent,
    AboutComponent,
    SmallCardComponent,
    OfficersComponent,
    OfficerComponent,
    HamburgerNavigationComponent,
    MembershipComponent,
    ContactComponent,
    CarouselComponent,
    JobComponent
  ],
  providers: [ 
    OfficersService,
    CalendarService,
    JobService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
