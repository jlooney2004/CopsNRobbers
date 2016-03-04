pc.script.create('dumbot', function (app) {
	// Creates a new Bot instance
	var Dumbot = function (entity) {
		this.entity		= entity;
		this.itemCarry	= null;					// Will contain gadget

		// Tween variables
		this.animVars	= {x: 0, y: 5, z: 0, i: 0};
		this.twTransl	= new TWEEN.Tween(this.animVars).easing(Ez.Lin.None);
		this.twRotate	= new TWEEN.Tween(this.animVars).easing(Ez.Sin.O);
		this.quatNow 	= new pc.Quat();	// Current angle
		this.quatTrg 	= new pc.Quat();	// Target angle
		this.prevAngle	= 0;
	};

	Dumbot.prototype = {
		initialize: function(){
			this.quatNow 	= this.entity.getRotation();
			this.faceMaterial = this.entity.findByName("BotModel").model.model.meshInstances[1].material;
			this.entity.collision.on("triggerenter", this.onTriggerEnter.bind(this));
			this.entity.collision.on("triggerleave", this.onTriggerLeave.bind(this));
		},

		update: function(dt){
			this.entity.setPosition(this.animVars.x, this.animVars.y, this.animVars.z);
			this.entity.setRotation(this.quatNow.slerp(this.quatNow, this.quatTrg, this.animVars.i));
			this.entity.rigidbody.syncEntityToBody();
		},

		updateParams: function(userParams){
			this.twTransl.to({
				x: userParams.x,
				y: userParams.y,
				z: userParams.z
			}, 20).start();

			if(userParams.a !== this.prevAngle){
				this.animVars.i = 0;
				this.prevAngle = userParams.a;
				this.twRotate.to({i: 1}, 1000).start();
				this.quatTrg.setFromAxisAngle(pc.Vec3.UP, userParams.a);
			}
		},

		///////////////////////////////////// EVENT LISTENERS /////////////////////////////////////
		enterDanger: function(){
			this.faceMaterial.emissive = new pc.Vec3(1, 0, 0);
			this.faceMaterial.update();
		},

		exitDanger: function(){
			this.faceMaterial.emissive = new pc.Vec3(0, 0.56, 1);
			this.faceMaterial.update();
		},

		abduct: function(){
			// Drop item being carried
		},

		onTriggerEnter: function(result){
			switch(result.getName()){
				case "Ufo":
					this.enterDanger();
				break;
			}
		},

		onTriggerLeave: function(result){
			switch(result.getName()){
				case "Ufo":
					this.exitDanger();
				break;
			}
		}
	};

	return Dumbot;
});


