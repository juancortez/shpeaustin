import { Component, OnInit }   from "@angular/core";
import { Router }      from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: "login",
  templateUrl: "./templates/login.component.html",
  styleUrls: [ "./styles/login.component.css" ]  
})


export class LoginComponent implements OnInit{
	constructor(public authService: AuthService, public router: Router) {}
	formUsername: string = "";
	formPassword: string = "";

	ngOnInit(){
		let credentialsCookie = this.getCookie('credentials');
		if(credentialsCookie){
			this._cookieLogIn(credentialsCookie).then((response) => {
				console.log("Authenticated via cookie");
	    		this._checkLoggedIn();
	    	}).catch((err) => {
	    		console.error(err);
	    	});
		}
	}

	login(): void {
		this._regularLogin().then((response) => {
			this._checkLoggedIn();
			this.setCookie('credentials', response['uuid'], 31, '/login');
		}).catch((err) =>{
			console.error(err);
		});
  	}

  	logout() {
		this.authService.logout();
	}

	isValidUsername(){
		return /.{2}/.test(this.formUsername);
	}

	isValidPassword(){
		return /.{2}/.test(this.formPassword);
	}

	allValid(){
		return this.isValidUsername() && this.isValidPassword();
	}

  	private _regularLogin(): Promise<any>{
  		return new Promise((resolve, reject) => {
		    this.authService.login({ 'username': this.formUsername, 'password': this.formPassword}).subscribe((result) => {		
		    	resolve(result);
		    }, err =>{
		    	reject(err);
		    });
  		});
  	}

  	private _cookieLogIn(credentialsCookie: string): Promise<any>{
  		return new Promise((resolve, reject) => {
	    	this.authService.checkAuthCookie(credentialsCookie).subscribe((response) => {
	    		return resolve(response);
	    	}, err => {
	    		return resolve(err);
	    	});
  		});
  	}

	private _checkLoggedIn(){
  		if (this.authService.isLoggedIn) {
			// Get the redirect URL from our auth service
			// If no redirect has been set, use the default
			let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/admin';
			// Redirect the user
			this.router.navigate([redirect]);
      	} else{
      		console.error("Invalid credentials");
      	}
	}

	private setCookie(name: string, value: string, expireDays: number, path: string = '') {
		let d:Date = new Date();
		d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
		let expires:string = `expires=${d.toUTCString()}`;
		let cpath:string = path ? `; path=${path}` : '';
		document.cookie = `${name}=${value}; ${expires}${cpath}`;
    }

    private getCookie(name: string) {
        let ca: Array<string> = document.cookie.split(';');
        let caLen: number = ca.length;
        let cookieName = `${name}=`;
        let c: string;

        for (let i: number = 0; i < caLen; i += 1) {
            c = ca[i].replace(/^\s+/g, '');
            if (c.indexOf(cookieName) == 0) {
                return c.substring(cookieName.length, c.length);
            }
        }
        return '';
    }
}