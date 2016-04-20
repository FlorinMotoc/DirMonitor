
export var dirMonitorLog = function () {
    var self = this;

    // Vars

    this.watchedDirectory;

    // Methods

    this.setDir = function (dir) {
        this.watchedDirectory = dir;
    }

    this.write = function ( path, type, action, stats ) {
        var path1 = path.replace(this.watchedDirectory+'/', '');
        console.info([ path1, type, action, stats ]);
    }

}
