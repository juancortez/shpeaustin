/*
	This class was written to facilitate communication between the
	SHPE-Austin Slack bot and the SHPE-Austin website. The primary method
	used is sendMessage() which sends messages to any channel, provided a
	channelID and message.
*/

let instance = null; // used to create a Singleton

class BotKitHelper{
	constructor(bot){
		if(instance) return instance;

		instance = this;
		this.bot = bot;
		this.fullTeamList = [];
		this.fullChannelList = [];
		this._invokeUsersListAPI().then((data) => {
			this.fullTeamList = data;
		});
		this._invokeChannelsListAPI().then((data) => {
			this.fullChannelList = data;
		});
	}

	/*
		botKitHelper.getUsersList().then((users) => {
	    	console.log(users);
		});
	*/
	getUsersList(){
		return this._invokeUsersListAPI();
	}

	/*
		botKitHelper.getChannelsList().then((channels) => {
	    	console.log(channels);
		});
	*/
	getChannelsList(){
		return this._invokeChannelsListAPI();
	}

	/*
		@param message 	   {String}		message to send to Slack 		    			 REQUIRED
		@param channelName {String}		name of channel to send message to  			 REQUIRED
		@param attachment  {Object} 	object of attachments: only supports attachment  OPTIONAL

		botKitHelper.sendMessage({
        	message: "Message to Send",
        	channelName: "Channel-Name",
        	attachment: {
        		type: "announcement",
				author: "Juan Cortez",
				announcement: "Blah"
        	},
        	cb: function(err){
				if(err) return console.error(err);
        	}
    	})
    */
	sendMessage({message, channelName, attachment = {}, cb}){
		let channel = this.retrieveChannel(channelName);

		if(channel.length > 0){
			channel = channel[0];
        	let channelId = channel['id'];
        	console.log(`Sending ${message} to ${channelId}...`);

        	this.bot.sendWebhook(this._buildMessage({
        		message,
        		channelId,
        		attachment
        	}),function(err,res) {
			  if (err) return cb({reason: err});
			  return cb(false);
			});

		} else{
			let err = `${channelName} channel was not found. Unable to send message.`;
			return cb({
				reason: err
			});
		}
	}

	_buildMessage({message, channelId, attachment}){
		let returnMessage = {
			text: message,
			channel: channelId,
			username: "SHPE-Bot",
		    icon_emoji: ":computer:"
		};
	
		if(Object.keys(attachment).length === 0) return returnMessage;

		let{
			author,
			announcement,
			type
		} = attachment;

		if(type === "announcement"){
			let attachmentStructure = {
	            "fallback": `New announcement posted by ${author}: ${announcement}`,
	            "color": "#002266",
	            "author_name": `Officer: ${author}`,
	            "title": "SHPE Website",
	            "title_link": "http://us.austinshpe.org",
	            "text": `Announcement: ${announcement}`,
	            "footer": "SHPE Austin",
	            "ts": new Date().getTime()
	        };	
	        returnMessage['text'] = `${author} just posted a new announcement to the SHPE Website!`;
			returnMessage['attachments'] = [attachmentStructure];
        	return returnMessage;	
		} else{
			console.error(`${type} attachment not yet supported. Please add support.`);
			return returnMessage;
		}
	}

	retrieveChannel(name){
		let result = [];
		result = this.fullChannelList.filter((channel) => {
			let channelName = channel['name'];
			return channelName === name;
		});
		return result;
	}

	// @ https://api.slack.com/methods/users.list
	_invokeUsersListAPI(){
		return new Promise((resolve, reject) => {
			if(this.fullTeamList.length > 0){
				return resolve(this.fullTeamList);
			} else {
				this.bot.api.users.list({}, (err, response) => {
					let fullTeamList = [];
				    if (response.hasOwnProperty('members') && response.ok) {
				        var total = response.members.length;
				        for (var i = 0; i < total; i++) {
				            var member = response.members[i];
				            fullTeamList.push({name: member.name, id: member.id});
				        }
				    }
				    return resolve(fullTeamList);
				});
			}
		});
	}

	// @ https://api.slack.com/methods/channels.list
	_invokeChannelsListAPI(){
		return new Promise((resolve, reject) => {
			this.bot.api.channels.list({}, (err, response) => {
				if(this.fullChannelList.length > 0){
					return resolve(this.fullChannelList);
				} else{
					let fullChannelList = [];
				    if (response.hasOwnProperty('channels') && response.ok) {
				        var total = response.channels.length;
				        for (var i = 0; i < total; i++) {
				            var channel = response.channels[i];
				            fullChannelList.push({name: channel.name, id: channel.id});
				        }
				    }
				    return resolve(fullChannelList);
				}
			})
		}); 
	}
}


module.exports = BotKitHelper;