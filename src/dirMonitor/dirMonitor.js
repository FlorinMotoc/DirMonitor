
var chokidar = require('chokidar');
import { dirMonitorLog } from './dirMonitorLog';

export var dirMonitor = function () {
    var self = this;

    // Vars

    this.watchedDirectory;
    // this.regexIgnored = /\\/; // default is :: /[\/\\]\./ // don't work
    // this.regexIgnored = /[\/\\]\./; // ignore .dotfiles and .dotdirectories
    this.regexIgnored = /\*/; // ingore all that contains a `*` in it
    this.watcher; // chokidar instance

    // Something to use when events are received.
    // this.log = console.log.bind(console);
    var mlog = new dirMonitorLog();
    this.log = mlog.writeToLogTable.bind(mlog);


    // Functions

    this.setDir = function (dir) {
        this.watchedDirectory = dir;
        mlog.setDir(dir);
    }
    this.setIgnored = function (regexIgnored) {
        this.regexIgnored = regexIgnored;
    }

    this.start = function () {
        // Initialize watcher.
        this.watcher = chokidar.watch(this.watchedDirectory, {
            // ignored: this.regexIgnored, // if you comment it, it will not ignore anything
            persistent: true, // it works with this, I think is needed

            // usePolling: true, // if false, it gives EMFILE errors
            // ignoreInitial: true,
            // useFsEvents: true,
            // alwaysStat: false
        });

        AjaxIndicator.start('Please wait... scanning files...');
        this.watcherStart(function() {
            AjaxIndicator.stop()
            self.WatchDirs();
            self.WatchFiles();
            self.WatchMore();
        });

    }

    this.watcherStart = function (onReady) {
        this.watcher
            // .on('error', error => this.log(`Watcher error: ${error}`))
            .on('error', (error) => {
                this.log(`Watcher error: ${error}`);
                if (typeof self.isError == 'undefined') { AjaxIndicator.stop(); self.isError = 1; /*show this only once*/ }
            })
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
        this.log('watch files in: ' + this.watchedDirectory);
        this.watcher
            // .on('add', path => this.log(`File ${path} has been added`))
            // .on('change', path => this.log(`File ${path} has been changed`))
            // .on('unlink', path => this.log(`File ${path} has been removed`));
            .on('change', (path, stats) => mlog.write( `${path}`, 'file', 'change', stats ))
            .on('unlink', path => mlog.write( `${path}`, 'file', 'unlink' ))
            .on('add', (path, stats) => mlog.write( `${path}`, 'file', 'add', stats ))
    }

    this.WatchDirs = function () {
        this.log('watch dirs in: ' + this.watchedDirectory);
        this.watcher
            // .on('addDir', path => this.log(`Directory ${path} has been added`))
            // .on('unlinkDir', path => this.log(`Directory ${path} has been removed`));
            .on('unlinkDir', path => mlog.write( `${path}`, 'dir', 'unlink' ))
            .on('addDir', (path, stats) => mlog.write( `${path}`, 'dir', 'add', stats ))
    }

    this.WatchMore = function () {
        /*
         this.watcher
         // .on('error', error => this.log(`Watcher error: ${error}`))
         // .on('ready', () => this.log('Initial scan complete. Ready for changes'))
         .on('raw', (event, path, details) => {
             this.log('Raw event info:', event, path, details);
         });
         */

        // 'add', 'addDir' and 'change' events also receive stat() results as second
        // argument when available: http://nodejs.org/api/fs.html#fs_class_fs_stats
        // this.watcher.on('change', (path, stats) => {
            // console.info(stats);
            // if (stats) console.log(`File ${path} changed size to ${stats.size}`);
        // });
    }

    this.stopWatching = function () {
        // Stop watching.
        this.log('STOP watching dir: ' + this.watchedDirectory);
        this.watcher.close();
    }

    this.getUID = function () {
        if ( ! this.uid ) {
            this.uid = Math.random().toString(36).substring(2);
            mlog.setUID(this.uid);
        }
        return this.uid;
    }

}
