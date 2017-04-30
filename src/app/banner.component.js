"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var BannerComponent = (function () {
    function BannerComponent() {
    }
    return BannerComponent;
}());
BannerComponent = __decorate([
    core_1.Component({
        selector: 'banner',
        template: "\n    <div class = \"shpe-austin\">\n       <a class=\"dark-shpe-blue\" href=\"/\">SHPE Austin<br>\n         <span class=\"small\">Society of Hispanic <br> Professional Engineers</span>\n        </a>\n    </div>\n  ",
        styleUrls: ['./styles/banner.component.css']
    })
], BannerComponent);
exports.BannerComponent = BannerComponent;
//# sourceMappingURL=banner.component.js.map