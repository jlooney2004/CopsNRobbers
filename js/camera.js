pc.script.create('camera', function (app) {
    // Creates a new Camera instance
    var Camera = function (entity) {
        this.entity = entity;
        this.difference = new pc.Vec3(0, 8, 6);
    };

    Camera.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.focus = app.root.findByName("UFO");
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            // this.entity.setPosition(this.focus.getPosition().add(this.difference));
            this.entity.lookAt(this.focus.getPosition());
        }
    };

    return Camera;
});