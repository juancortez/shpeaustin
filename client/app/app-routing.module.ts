import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent }   		  from './home.component';
import { AboutComponent }   	  from './about.component';
import { OfficersComponent } 	  from './officers.component';
import { MembershipComponent } 	from './membership.component';
import { ContactComponent } 	  from './contact.component';
import { NotFoundComponent }	  from './not-found.component';
import { AdminComponent }       from './admin.component';
import { InterviewComponent }   from './interview.component';
import { LoginComponent }       from './login.component';
import { AuthGuard }            from './guards/auth-guard.service';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home',  			 component: HomeComponent },
  { path: 'about',  		 component: AboutComponent },
  { path: 'membership',  component: MembershipComponent },
  { path: 'officers',    component: OfficersComponent },
  { path: 'contact',  	 component: ContactComponent },
  { path: 'login',       component: LoginComponent },
  { path: 'admin',       component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'interview',   component: InterviewComponent},
  { path: '404',			   component: NotFoundComponent },

  { path: '**', 			   redirectTo: '/404' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
