//new Officer(current.name, current.position, current.email, current.phone, current.hometown, current.company, current.executive, current.image_url);
module.exports = function Officer(name, position, email, phone, hometown, company, executive, image_url){
	this.name = name;
	this.position = position;
	this.email = email;
	this.phone = phone;
	this.hometown = hometown;
	this.company = company;
	this.executive = executive;
	this.image_url = image_url;

	Officer.prototype.getName = function(){
	  	return this.name;
	  }
}