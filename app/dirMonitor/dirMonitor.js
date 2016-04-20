
var chokidar = require('chokidar');


export var dirMonitor = function () {
    var self = this;

    // Vars

    this.watchedDirectory;
    // this.regexIgnored = /\\/; // default is :: /[\/\\]\./
    this.regexIgnored = /[\/\\]\./;
    this.watcher; // chokidar instance
    // Something to use when events are received.
    this.log = console.log.bind(console);


    // Functions

    this.setDir = function (dir) {
        this.watchedDirectory = dir;
    }
    this.setIgnored = function (regexIgnored) {
        this.regexIgnored = regexIgnored;
    }

    this.start = function () {
        // Initialize watcher.
        this.watcher = chokidar.watch(this.watchedDirectory, {
            ignored: this.regexIgnored,
            persistent: true
        });

        this.watcherStart(function() {
            self.WatchDirs();
            self.WatchFiles();
            self.WatchMore();
        });

    }

    this.watcherStart = function (onReady) {
        this.watcher
            .on('error', error => this.log(`Watcher error: ${error}`))
            .on('ready', () => {
                this.log('Initial scan complete. Ready for changes');
                onReady();
            })
        // .on('raw', (event, path, details) => {
        //     this.log('Raw event info:', event, path, details);
        // });
    }

    // Add event listeners.

    this.WatchFiles = function () {
        console.info('watch files in: ' + this.watchedDirectory);
        this.watcher
            .on('add', path => this.log(`File ${path} has been added`))
            .on('change', path => this.log(`File ${path} has been changed`))
            .on('unlink', path => this.log(`File ${path} has been removed`));
    }

    this.WatchDirs = function () {
        console.info('watch dirs in: ' + this.watchedDirectory);
        this.watcher
            .on('addDir', path => this.log(`Directory ${path} has been added`))
            .on('unlinkDir', path => this.log(`Directory ${path} has been removed`));
    }

    this.WatchMore = function () {
        /*
         this.watcher
         .on('error', error => this.log(`Watcher error: ${error}`))
         .on('ready', () => this.log('Initial scan complete. Ready for changes'))
         .on('raw', (event, path, details) => {
         this.log('Raw event info:', event, path, details);
         });
         */

        // 'add', 'addDir' and 'change' events also receive stat() results as second
        // argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
        this.watcher.on('change', (path, stats) => {
            if (stats) console.log(`File ${path} changed size to ${stats.size}`);
        });
    }

    this.stopWatching = function () {
        // Stop watching.
        console.info('STOP watching dir: ' + this.watchedDirectory);
        this.watcher.close();
    }

    this.getUID = function () {
        if ( ! this.uid ) {
            this.uid = Math.random().toString(36).substring(2);
        }
        return this.uid;
    }

}
