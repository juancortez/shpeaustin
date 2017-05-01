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
var officers_service_1 = require("./services/officers.service");
var OfficersComponent = (function () {
    function OfficersComponent(officersService) {
        this.officersService = officersService;
        this.executiveOfficers = [];
        this.officers = [];
    }
    OfficersComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.officersService.getOfficers().subscribe(function (officers) {
            officers.forEach(function (officer) {
                if (officer.executive)
                    _this.executiveOfficers.push(officer);
                else
                    _this.officers.push(officer);
            });
        }, function (err) {
            console.error(err);
        });
    };
    return OfficersComponent;
}());
OfficersComponent = __decorate([
    core_1.Component({
        selector: 'officers',
        templateUrl: './templates/officers.component.html',
        styleUrls: ['./styles/officers.component.css']
    }),
    __metadata("design:paramtypes", [officers_service_1.OfficersService])
], OfficersComponent);
exports.OfficersComponent = OfficersComponent;
//# sourceMappingURL=officers.component.js.map