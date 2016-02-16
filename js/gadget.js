pc.script.create('gadget', function (app) {
	// Creates a new Gadget instance
	var Gadget = function (entity) {
		this.entity = entity;
		// Tweens
		this.animVars	= {yPos: 1.5, yAngle: 0};
		this.twHover	= new TWEEN.Tween(this.animVars);
		this.twRotate	= new TWEEN.Tween(this.animVars);
		// Status
		this.captured 	= false;	// Captured or not
		this.holder		= null;		// Entity holding this gadget

		this.posStart	= new pc.Vec3(-26, 1.5, 0);
		this.posOnBot	= new pc.Vec3(0, 0.3, 0.3);
		this.posOnUfo	= new pc.Vec3(0, 0, 0);
		this.posTarget	= this.posStart;
	};

	Gadget.prototype = {
		// Called once after all resources are loaded and before the first update
		initialize: function () {
			this.startHoverAnim();
			this.entity.collision.on("triggerenter", this.touched.bind(this));
		},

		// Called every frame, dt is time in seconds since last update
		update: function (dt) {
			// console.log(this.twHover.isPlaying);
			this.entity.setLocalPosition(this.posTarget.x, this.animVars.yPos, this.posTarget.z);
			this.entity.setLocalEulerAngles(0, this.animVars.yAngle, 0);
		},

		startHoverAnim: function(){
			this.twHover.to({yPos: this.posTarget.y + 1}, 2000).easing(Ez.Sin.IO).repeat(Infinity).yoyo(true).start();
			this.twRotate.to({yAngle: 359}, 4000).easing(Ez.Lin.None).repeat(Infinity).start();
		},

		// Something has touched the gadget
		touched: function(result){
			if(this.captured) return false;

			if(result.getName() === "Bot1"){
				result.script.bot.pickup(this.entity);
			}
		},

		pickup: function(newHolder){
			console.log("Picked up");
			this.captured = true;
			this.holder = newHolder;
			this.animVars.yPos = this.entity.getPosition().y - this.holder.getPosition().y;
			this.entity.reparent(this.holder);
			this.posTarget = this.posOnBot;
			this.twHover.to({yPos: -0.3}, 250).easing(Ez.Pow2.O).repeat(0).start();
			this.twRotate.to({yAngle: 0}, 250).repeat(0).easing(Ez.Pow2.O).start();
		},

		drop: function(){
			this.entity.reparent(app.root.findByName("Root"));
			this.posTarget = this.holder.getPosition().clone();
			this.animVars.yPos = this.posTarget.y;
			this.startHoverAnim();
			this.holder = null;
			this.captured = false;
			console.log(this.entity.getPosition().toString());
		}
	};

	return Gadget;
});