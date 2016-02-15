pc.script.create('rotate', function (app) {
    // Creates a new Rotate instance
    var Rotate = function (entity) {
        this.entity = entity;
    };

    Rotate.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            this.entity.rotate(0, 45*dt, 0);
        }
    };

    return Rotate;
});