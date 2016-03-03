function Player(id, type){
	this.id = id;	// Short ID #
	this.t = type;	// 0: UFO, 1: Bot

	if(type === 0){	// Ufo
		this.x = getRandInt(-9, 0);
		this.y = 1.5;
		this.z = (Math.random() < 0.5) ? -11 : 11;
	}else{ // Bot
		this.x = getRandInt(24, 28);
		this.y = 1.8;
		this.z = getRandInt(-5, 5);
	}
	this.a = 0;
}

Player.prototype = {

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