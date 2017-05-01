import { Component, OnInit, Input } from '@angular/core';
declare var $: any;

@Component({
  selector: 'officer',
  templateUrl: './templates/officer.component.html',
  styleUrls: [ './styles/officer.component.css' ]
})



export class OfficerComponent implements OnInit{
	@Input() officer: any;
	@Input() index: number;
	isMobile: boolean = false;
	showFlip: boolean = true;

	ngOnInit(){
		this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if(this.isMobile){
			$('.card').addClass('flipped-0');
       		if(this.showFlip == true){
				setTimeout(function (){
				  $($(document).find('.card')[0]).toggleClass('flipped-0').toggleClass('flipped-60');
				}, 100);
				setTimeout(function (){
				  $($(document).find('.card')[0]).toggleClass('flipped-60').toggleClass('flipped-0');
				}, 1100); 
			}
       } else{	
			if(this.showFlip == true){
				if(this.index === 0){
					setTimeout(function (){
					  $($(document).find('.card')[0]).toggleClass('flipped-60');
					}, 100);
					setTimeout(function (){
					  $($(document).find('.card')[0]).toggleClass('flipped-60');
					}, 1100); 
				}
			}
		}
	}

	toggleCard(event: any){
		if(!this.isMobile) return;
		$('.card').removeClass('flipped-0');				
		$(this).toggleClass('flipped-0');
		event.preventDefault();
	}
}
