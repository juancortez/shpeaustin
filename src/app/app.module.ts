import { NgModule }                         from '@angular/core';
import { BrowserModule }                    from '@angular/platform-browser';
import { FormsModule }                      from '@angular/forms';
import { HttpModule }                       from '@angular/http';

import { AppRoutingModule }                 from './app-routing.module';

/* Pipes */
import { SafePipe }                         from './safe-pipe.component';

/* API Services */
import { OfficersService }                  from './services/officers.service';
import { CalendarService }                  from './services/calendar.service';
import { JobService }                       from './services/jobs.service';
import { AnnouncementsService }             from './services/announcements.service';
import { NewsletterService }                from './services/newsletter.service';
import { AuthService }                      from './services/auth.service';
import { DatabaseService }                  from './services/database.service';
import { CookieService }                    from './services/cookie.service';

/* App Component */
import { AppComponent }                     from './app.component';

/* Pages */
import { HomeComponent }                    from './home.component';
import { AboutComponent }                   from './about.component';
import { OfficersComponent }                from './officers.component';
import { MembershipComponent }              from './membership.component'
import { ContactComponent }                 from './contact.component';
import { NotFoundComponent }                from './not-found.component';
import { AdminComponent }                   from './admin.component';
import { LoginComponent }                   from './login.component';

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
import { WelcomeComponent }                 from './welcome.component';
import { AnnouncementsComponent }           from './announcements.component';
import { CardContainerComponent }           from './card-container.component';
import { OnlyNumber }                       from './only-number.component';
import { AdminCardComponent }               from './admin-card.component';

/* Guards */
import { AuthGuard }                        from './guards/auth-guard.service';


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
    JobComponent,
    WelcomeComponent,
    AnnouncementsComponent,
    NotFoundComponent,
    CardContainerComponent,
    SafePipe,
    OnlyNumber,
    AdminComponent,
    LoginComponent,
    AdminCardComponent
  ],
  providers: [ 
    OfficersService,
    CalendarService,
    JobService,
    AnnouncementsService,
    NewsletterService,
    AuthGuard,
    AuthService,
    DatabaseService,
    CookieService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
