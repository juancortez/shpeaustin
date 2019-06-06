import * as invariant from 'invariant';

import { Component, OnInit, OnDestroy, OnChanges, AfterViewInit } from "@angular/core";
import { createInterviewElement } from "./react/App";

@Component({
    selector: "interview-component",
    template: require("./templates/interview.component.html")
  })
  
  export class InterviewComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
    private rootDomID: string;

    constructor(){}
    
	ngOnInit(){
		this.rootDomID = (+new Date()).toString();
    }
    
    protected getRootDomNode() {
        const node = document.getElementById(this.rootDomID);
        invariant(node, `Node '${this.rootDomID} not found!`);
        return node;
    }
 

    private isMounted(): boolean {
        return !!this.rootDomID;
    }
 
    protected render() {
        if (this.isMounted()) {
            const domNode = this.getRootDomNode();
            createInterviewElement(domNode);
        }
    }

    ngOnChanges() {
        this.render();
    }
 
    ngAfterViewInit() {
        this.render();
    }
 
    ngOnDestroy() {
        // TODO: onDestroy logic
    }
  }