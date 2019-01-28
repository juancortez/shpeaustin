import { Component, OnInit }   from "@angular/core";
import { Router }      from '@angular/router';
import { AuthService } from './services/auth.service';
import { CookieService } from './services/cookie.service';
import "./styles/login.component.less";

@Component({
  selector: "login",
  template: require("./templates/login.component.html")
})


export class LoginComponent implements OnInit{
	constructor(private authService: AuthService, private router: Router, private cookieService: CookieService) {}
	formUsername: string = "";
	formPassword: string = "";

	ngOnInit(){
		let credentialsCookie = this.cookieService.getCookie('credentials');
		if(credentialsCookie){
			this.cookieService.cookieLogIn(credentialsCookie).then((response) => {
	    		this._checkLoggedIn();
	    	}).catch((err) => {
	    		// console.error(err);
	    	});
		}
	}

	login(): void {
		this._regularLogin().then((response) => {
			this._checkLoggedIn();
			// not sure why i have to place cookie in both paths?
			this.cookieService.setCookie('credentials', response['id'], 31, '/');
			this.cookieService.setCookie('credentials', response['id'], 31, '/admin');
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
}