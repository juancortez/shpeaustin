// Officer pictures: https://drive.google.com/drive/u/0/folders/0B6Mzl2FjDeV0fmNzS1NIZDMycFp6UWlKRTlYeVgzY1BnNGdlOGpnTHNsbWxiMmNGa3pXME0
// http://jpeg-optimizer.com/
function Officer(name, position, email, phone, hometown, company, executive, image_url, linkedin){
	this.name = name;
	this.position = position;
	this.email = email;
	this.phone = phone;
	this.hometown = hometown;
	this.company = company;
	this.executive = executive;
	this.image_url = image_url;
	this.linkedin = linkedin;
}

module.exports = Officer;