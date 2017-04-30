"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var NavigationComponent = (function () {
    function NavigationComponent() {
        this.responsiveActivated = false;
    }
    NavigationComponent.prototype.responsiveEvent = function (event) {
        var windowWidth = event.target.innerWidth;
        if (windowWidth >= 995)
            this.responsiveActivated = false;
        else
            this.responsiveActivated = true;
    };
    NavigationComponent.prototype.ngOnInit = function () {
        var windowWidth = window.innerWidth;
        if (windowWidth >= 995)
            this.responsiveActivated = false;
        else
            this.responsiveActivated = true;
    };
    return NavigationComponent;
}());
NavigationComponent = __decorate([
    core_1.Component({
        selector: 'shpe-navigation',
        templateUrl: './templates/navigation.component.html',
        styleUrls: ['./styles/navigation.component.css'],
        host: {
            '(window:resize)': 'responsiveEvent($event)'
        }
    })
], NavigationComponent);
exports.NavigationComponent = NavigationComponent;
//# sourceMappingURL=navigation.component.js.map