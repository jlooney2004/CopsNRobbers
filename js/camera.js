pc.script.create('camera', function (app) {
	// Creates a new Camera instance
	var Camera = function (entity) {
		this.entity = entity;
		this.status = "disconnected";
		this.focus = null;

		this.vecTarget = new pc.Vec3();
		this.vecActual = new pc.Vec3();
		this.vecLerp = new pc.Vec3();
	};

	Camera.prototype = {
		// Called once after all resources are loaded and before the first update
		initialize: function () {
			this.vecActual = this.entity.getPosition();
		},
		
		postUpdate: function(dt){
			if(this.focus === null){return false;}
			this.vecTarget = this.focus.getPosition();
			this.vecTarget.x /= 1.3;
			this.vecTarget.y = 10;
			this.vecTarget.z = (this.vecTarget.z + 10) / 1.3;
			this.vecActual.lerp(this.vecActual, this.vecTarget, dt);
			this.entity.setPosition(this.vecActual);
			// this.entity.setPosition(this.focus.getPosition().x / 1.3, 10, (this.focus.getPosition().z + 10) / 1.3);
			this.entity.lookAt(this.focus.getPosition());
		},

		// Focus on player
		connect: function(focus){
			this.status = "connected";
			this.focus = focus;
			this.vecTarget = focus.getPosition();
			this.vecTarget.y =  10;
		},

		// Focus on stage
		disconnect: function(focus){
			this.status = "disconnected";
			this.focus = null;
		}
	};

	return Camera;
});