pc.script.create('ufo', function (app) {
	// Creates a new UFO instance
	var Ufo = function (entity) {
		// UFO parts
		this.entity		= entity;
		this.controller = null;

		// Physics vars
		this.TIME_MULT	= 1;				// Time multiplier (for slo-mo)
		this.MAX_SPEED	= 0.08;				// Maximum speed
		this.ACCEL		= 0.001;			// Acceleration
		this.quatNow 	= new pc.Quat();	// Current angle
		this.quatTrg 	= new pc.Quat();	// Target angle
		this.rotAlpha	= 0;
		this.prevAngle	= 0;
		this.timeDelta	= 0;
		this.velocity	= 0;
		this.moving		= false;
		// Communication with other entities
		this.victim		= null;
		// Status variables
		this.beamCoolDown	= 0;
        this.oldPos = null;
        this.newPos = null;
        this.posTimer = 0;
		// Components
		this.beamParticle = null;
	};

	Ufo.prototype = {
		// Called once after all resources are loaded and before the first update
		initialize: function () {
			this.quatNow 	= this.entity.getRotation();
			this.beamParticle = this.entity.findByName("BeamUp").particlesystem;
			this.entity.collision.on("triggerenter", this.onTriggerEnter.bind(this));
			this.entity.collision.on("triggerleave", this.onTriggerLeave.bind(this));
			
            this.newPos = this.entity.getPosition();
            this.oldPos = new pc.Vec3();
		},
		
		// Called every frame, dt is time in seconds since last update
		update: function (dt) {
			if(this.beamCoolDown > 0){
				this.beamCoolDown -= dt;
			}

            this.newPos = this.entity.getPosition();
            this.posTimer += dt;
            if(this.posTimer >= 0.02 && !this.newPos.equals(this.oldPos)){
                this.oldPos = this.newPos.clone();
                this.controller.receiverMoved();
                this.posTimer = 0;
            }
		},

		///////////////////////////////////// BEHAVIORS /////////////////////////////////////
		fireBeam: function(){
			if(this.beamCoolDown > 0) return false;

			if(this.victim !== null){
				this.victim.abduct();
			}
			this.beamParticle.reset();
			this.beamParticle.play();
			this.beamCoolDown = 2;
		},

		///////////////////////////////////// CONTROL LISTENERS /////////////////////////////////////
		// Connect to controller
		connect: function(controller){
			this.controller = controller;
		},

		// Ufo will move toward angle
		moveToAngle: function (yAngle, dt) {
			this.moving = true;
			if(yAngle !== this.prevAngle){
				this.rotAlpha = 0;
				this.timeDelta = 0;
				this.prevAngle = yAngle;
			}

			// Turn toward angle
			if(this.rotAlpha < 0.5){
				this.quatTrg.setFromAxisAngle(pc.Vec3.UP, yAngle);

				this.timeDelta += (dt * this.TIME_MULT);
				this.rotAlpha = 1 - Math.pow((1 - this.timeDelta), 3);
				this.entity.setRotation(this.quatNow.slerp(this.quatNow, this.quatTrg, this.rotAlpha));
			}

			this.velocity += this.ACCEL;
			this.velocity = Math.min(this.velocity, this.MAX_SPEED);
			this.entity.translateLocal(0, 0, this.velocity);
		},

		decelerate: function (dt) {
			this.moving = false;
			if(this.velocity === 0) return false;

			this.velocity -= this.ACCEL * 2;
			this.velocity = Math.max(this.velocity, 0);

			this.entity.translateLocal(0, 0, this.velocity);
		},

		btnA: function(){
			this.fireBeam();
		},

		btnB: function(){

		},

		reset: function(){
			this.prevAngle = 0;
			this.entity.setPosition(-15, 1.5, 0);
			// this.entity.rigidbody.teleport(0, 3, 0, 0, 0, 0);
		},

		///////////////////////////////////// EVENT LISTENERS /////////////////////////////////////
		onTriggerEnter: function(result){
			if (result.collision) {result.collision.fire("triggerenter", this.entity);}
			switch(result.getName()){
				case "Bot":
					this.victim = result.script.bot;
				break;
			}
		},

		onTriggerLeave: function(result){
			if (result.collision) {result.collision.fire("triggerleave", this.entity);}
			switch(result.getName()){
				case "Bot":
					this.victim = null;
				break;
			}
		}
	};

	return Ufo;
});

