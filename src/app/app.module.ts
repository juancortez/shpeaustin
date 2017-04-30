import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { AppRoutingModule } from './app-routing.module';


/* API Services */
import { OfficersService } from './services/officers.service';

/* Component Services */
import { AppComponent }             from './app.component';
import { HomeComponent }            from './home.component';
import { NavigationComponent }      from './navigation.component';
import { SocialMediaComponent }     from './social-media.component';
import { BannerComponent }          from './banner.component';
import { NavigationLinksComponent } from './navigation-links.component';
import { AboutComponent }           from './about.component';
import { SmallCardComponent }       from './card.component';
import { OfficersComponent }        from './officers.component';
import { HamburgerNavigationComponent }        from './hamburger-navigation.component';


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
    HamburgerNavigationComponent
  ],
  providers: [ 
    OfficersService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
