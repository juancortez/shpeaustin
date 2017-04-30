"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/http");
var app_routing_module_1 = require("./app-routing.module");
/* API Services */
var officers_service_1 = require("./services/officers.service");
/* Component Services */
var app_component_1 = require("./app.component");
var home_component_1 = require("./home.component");
var navigation_component_1 = require("./navigation.component");
var social_media_component_1 = require("./social-media.component");
var banner_component_1 = require("./banner.component");
var navigation_links_component_1 = require("./navigation-links.component");
var about_component_1 = require("./about.component");
var card_component_1 = require("./card.component");
var officers_component_1 = require("./officers.component");
var hamburger_navigation_component_1 = require("./hamburger-navigation.component");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [
            platform_browser_1.BrowserModule,
            forms_1.FormsModule,
            http_1.HttpModule,
            app_routing_module_1.AppRoutingModule
        ],
        declarations: [
            app_component_1.AppComponent,
            home_component_1.HomeComponent,
            navigation_component_1.NavigationComponent,
            social_media_component_1.SocialMediaComponent,
            banner_component_1.BannerComponent,
            navigation_links_component_1.NavigationLinksComponent,
            about_component_1.AboutComponent,
            card_component_1.SmallCardComponent,
            officers_component_1.OfficersComponent,
            hamburger_navigation_component_1.HamburgerNavigationComponent
        ],
        providers: [
            officers_service_1.OfficersService
        ],
        bootstrap: [app_component_1.AppComponent]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map