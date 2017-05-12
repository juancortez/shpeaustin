import { Injectable }       												from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot}  from '@angular/router';
import { AuthService }      												from '../services/auth.service';
import { CookieService } 													from '../services/cookie.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		let url: string = state.url;

		return this.checkLogin(url).then((success) => {
			this.authService.isLoggedIn = true;
			return true;
		}, (err) => {
			this.authService.isLoggedIn = false;
			this._redirect(url);
			return false;
		});
	}

	checkLogin(url: string): Promise<boolean> {
		return new Promise((resolve, reject) => {
			if (this.authService.isLoggedIn) { 
				return resolve(true);
			}

			let credentialsCookie = this.cookieService.getCookie('credentials');
			if(credentialsCookie){
				this.cookieService.cookieLogIn(credentialsCookie).then((response) => {
		    		return resolve(true);
		    	}).catch((err) => {
		    		console.error(err);
		    		return reject(false);
		    	});
			} else{
				return reject(false);
			}
		});
	}

	_redirect(url:string){
		// Store the attempted URL for redirecting
		this.authService.redirectUrl = url;

		// Navigate to the login page with extras
		this.router.navigate(['/login']);
	}
}