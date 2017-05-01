"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var OfficerComponent = (function () {
    function OfficerComponent() {
    }
    return OfficerComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], OfficerComponent.prototype, "officer", void 0);
OfficerComponent = __decorate([
    core_1.Component({
        selector: 'officer',
        templateUrl: './templates/officer.component.html',
        styleUrls: ['./styles/officer.component.css']
    })
], OfficerComponent);
exports.OfficerComponent = OfficerComponent;
//# sourceMappingURL=officer.component.js.map