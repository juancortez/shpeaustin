import './polyfills';

import { NgModule }                         from '@angular/core';
import { BrowserModule }                    from '@angular/platform-browser';
import { FormsModule }                      from '@angular/forms';
import { HttpModule }                       from '@angular/http';

import { AppRoutingModule }                 from './app/app-routing.module';

/* Pipes */
import { SafePipe }                         from './app/safe-pipe.component';

/* API Services */
import { OfficersService }                  from './app/services/officers.service';
import { CalendarService }                  from './app/services/calendar.service';
import { JobService }                       from './app/services/jobs.service';
import { AnnouncementsService }             from './app/services/announcements.service';
import { NewsletterService }                from './app/services/newsletter.service';
import { AuthService }                      from './app/services/auth.service';
import { DatabaseService }                  from './app/services/database.service';
import { CookieService }                    from './app/services/cookie.service';
import { SubscribeService }                 from './app/services/subscribe.service';

/* App Component */
import { AppComponent }                     from './app/app.component';

/* Pages */
import { HomeComponent }                    from './app/home.component';
import { AboutComponent }                   from './app/about.component';
import { OfficersComponent }                from './app/officers.component';
import { MembershipComponent }              from './app/membership.component'
import { ContactComponent }                 from './app/contact.component';
import { NotFoundComponent }                from './app/not-found.component';
import { AdminComponent }                   from './app/admin.component';
import { LoginComponent }                   from './app/login.component';

/* Navigation Components */
import { NavigationComponent }              from './app/navigation.component';
import { NavigationLinksComponent }         from './app/navigation-links.component';
import { SocialMediaComponent }             from './app/social-media.component';
import { BannerComponent }                  from './app/banner.component';
import { HamburgerNavigationComponent }     from './app/hamburger-navigation.component';

/* Helpers */
import { SmallCardComponent }               from './app/card.component';
import { OfficerComponent }                 from './app/officer.component';
import { CarouselComponent }                from './app/carousel.component';
import { JobComponent }                     from './app/job.component';
import { WelcomeComponent }                 from './app/welcome.component';
import { AnnouncementsComponent }           from './app/announcements.component';
import { CardContainerComponent }           from './app/card-container.component';
import { OnlyNumber }                       from './app/only-number.component';
import { AdminCardComponent }               from './app/admin-card.component';
import { ChatComponent }                    from './app/chat.component';
import { ModalComponent }                   from './app/modal.component';

/* Footer */
import { FooterComponent }                  from './app/footer.component';

/* Guards */
import { AuthGuard }                        from './app/guards/auth-guard.service';

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
    AdminCardComponent,
    FooterComponent,
    ChatComponent,
    ModalComponent
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
    CookieService,
    SubscribeService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
