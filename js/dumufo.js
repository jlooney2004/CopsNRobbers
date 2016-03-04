pc.script.create('dumufo', function (app) {
	// Creates a new UFO instance
	var Dumufo = function (entity) {
		// UFO parts
		this.entity		= entity;
		
		// Components
		this.beamParticle = null;

		// Tween variables
		this.animVars	= {x: 0, y: 5, z: 0, i: 0};
		this.twTransl	= new TWEEN.Tween(this.animVars).easing(Ez.Lin.None);
		this.twRotate	= new TWEEN.Tween(this.animVars).easing(Ez.Sin.O);
		this.quatNow 	= new pc.Quat();	// Current angle
		this.quatTrg 	= new pc.Quat();	// Target angle
		this.prevAngle	= 0;
	};

	Dumufo.prototype = {
		initialize: function(){
			this.quatNow 	= this.entity.getRotation();
			this.beamParticle = this.entity.findByName("BeamUp").particlesystem;
			this.entity.collision.on("triggerenter", this.onTriggerEnter.bind(this));
			this.entity.collision.on("triggerleave", this.onTriggerLeave.bind(this));
		},

		update: function(dt){
			this.entity.setPosition(this.animVars.x, this.animVars.y, this.animVars.z);
			this.entity.setRotation(this.quatNow.slerp(this.quatNow, this.quatTrg, this.animVars.i));
		},

		///////////////////////////////////// CONTROL LISTENERS /////////////////////////////////////
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

		fireBeam: function(){
			this.beamParticle.reset();
			this.beamParticle.play();
		},

		///////////////////////////////////// EVENT LISTENERS /////////////////////////////////////
		onTriggerEnter: function(result){
			if (result.collision) {result.collision.fire("triggerenter", this.entity);}
		},

		onTriggerLeave: function(result){
			if (result.collision) {result.collision.fire("triggerleave", this.entity);}
		}
	};

	return Dumufo;
});

