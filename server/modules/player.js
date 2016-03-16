function Player(id, type){
	this.id = id;	// Short ID #
	this.t = type;	// 0: UFO, 1: Bot
	this.a = 0;		// Y Angle
	this.h = -1;	// ID of Holder
	this.v = -1;	// ID of Victim 
	this.x = 0;
	this.y = 0;
	this.z = 0;

	this.assignStart();
}

Player.prototype = {
	respawn: function(){
		this.t = (this.t - 1) * -1;
		this.h = -1;
		this.assignStart();
	},

	assignStart: function(){
		if(this.t === 0){	// Ufo
			this.x = getRandInt(-15, -13);
			this.y = 1.5;
			this.z = getRandInt(-8, 8);
		}else{ // Bot
			this.x = getRandInt(25, 28);
			this.y = 1.8;
			this.z = getRandInt(-5, 5);
		}
	}
}

// Random integer, min included, max not included
function getRandInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

// Random float, min (inclusive) and max (exclusive)
function getRandNo(min, max) {
	return Math.random() * (max - min) + min;
}

module.exports = Player;