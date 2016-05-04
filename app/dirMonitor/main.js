
import { remote } from 'electron'; // native electron module
import { dirMonitors } from './dirMonitors';
var fs = require('fs');

var dialog = remote.dialog;


export var dirMonitorMain = new function () {
    var self = this;

    this.start = function () {
    }

    $(function() {
        $('.addNewTab').on('click', function() {
            var numberOfTabs = $('#upTabs li').length;
            var $content = $('.template .monitor').clone();
            tabs.addBSTab("monitorTab"+numberOfTabs, "Monitor #" + numberOfTabs, $content);
        });
    });

    $(function() {
        // On Button Click, show the Chose Directory Dialog
        $('.monitors').on('click', '.btnClick', function () {
            self.$btn = $(this);
            self.$monitor = self.$btn.parents('.monitor:first');
            var what = self.$monitor.data('what');
            var whatBtn = self.$btn.data('what');

            if ( ! whatBtn ) { // Main btn pressed
                if ( what == 'start' ) { self.Click_Monitor_Start(); } // START
                if ( what == 'stop' ) { self.Click_Monitor_Stop(); } // STOP
            } else { // Secondary btn pressed
                if ( whatBtn == 'clear' ) { self.Click_Monitor_Clear(); } // CLEAR
            }

        });
    });

    this.openBrowseDialog_ReturnPathOrFalse = function () {
        var dirChoser = dialog.showOpenDialog({ properties: [ 'openDirectory' ]});
        return ( dirChoser && dirChoser[0] ) ? dirChoser[0] : false ;
    }

    this.Click_Monitor_Start = function () {
        // Display File Browser Dialog, wait for the user to select one directory, continue after
        var dirPath = this.openBrowseDialog_ReturnPathOrFalse();
        if ( ! dirPath ) {
            console.info('no dir selected');
        } else { // a dir was selected
            // create a new monitor for this dir
            var dirMonitor2 = dirMonitors.createMonitor();
            dirMonitor2.setDir( dirPath );
            dirMonitor2.start();

            // get this monitor's UID
            var uid = dirMonitor2.getUID();
            // set the this instance's button text to Stop, and also additional infos like UID
            this.$btn.text("Click to Stop this directory's monitoring");
            this.$monitor.data('what', 'stop').attr('data-what', 'stop');
            this.$monitor.data('uid', uid).attr('data-uid', uid);

            this.Click_Monitor_Clear(); // Remove all TRs from the Table
        }
    }
    this.Click_Monitor_Stop = function () {
        // Get this monitor's UID and stop monitoring instance
        var uid = this.$monitor.data('uid');
        dirMonitors.stopMonitor(uid);
        // Set this html instance to default / stopped state
        this.$monitor.data('what', 'start').attr('data-what', 'start');
        this.$monitor.data('uid', '').attr('data-uid', '');
        this.$btn.text('Click and Chose a Directory to Monitor');

        this.Click_Monitor_Clear(); // Remove all TRs from the Table
    }
    this.Click_Monitor_Clear = function () {
        // Remove all TRs from the Table
        this.$monitor.find('.tableHere').html('');
    }

}

export var fileConflicts = function() {
    var self = this;
    
    // Vars
    // this.conflictString = ' conflicted copy ';
    this.conflictString = 'conflicted';
    this.watchedDirectory;
    this.conflicts = [];

    // Methods

    this.setDir = function (dir) {
        this.watchedDirectory = dir;
    }
    
    this.checkIfConflict = function ( path, action ) {
        var path1 = path.replace( this.watchedDirectory + '/', '' );


        // if path1 contains the word "conflicted" AND if is new, ... then ... do something ...
        if ( action == 'add' && path1.search( this.conflictString ) != -1 ) {
            // conflicted new file found, put it in queue, and wait for next file change of this file
            this.conflicts.push(path1);
            console.info('CONFLICTED FILE FOUND :: ' + path1 + ' :: in dir :: ' + this.watchedDirectory + ' :: ADD TO ARRAY');
            console.info(this.conflicts);
        }

        // search in this.conflicts
        if ( action == 'change' ) {
            // do a foreach of all found conflicts
            this.conflicts.forEach(function(path1ConflictedCopy) {
                // extract the real (old) name of file, before conflict (removes all in parantheses: () )
                // var path1ConflictedCopy = "workspace (dasdsa) (Florin-Motoc-iMac.local's conflicted copy 2016-04-15).xml";
                var path1ConflictedCopyGoodString = path1ConflictedCopy.replace(/\s*\(.*?\)\s*/g, '');
                console.info('each: ', path1ConflictedCopy, path1ConflictedCopyGoodString, path1);
                // if this change is for the same file as this conflicted file, process the logic (remove and rename)
                if ( path1 == path1ConflictedCopyGoodString ) {
                    // this is is
                    //todo: remove the old file (path1) and rename the new file (path1ConflictedCopy) to old file name (path1)

                    //todo: remove the old file (path1)
                    // console.info('remove file :: ' + self.watchedDirectory + '/' + path1);
                    // fs.unlink( self.watchedDirectory + '/' + path1 , function(err) {
                    //     if ( err ) return console.info('ERROR ON UNLINK: ' + err);
                    //     console.info('file deleted successfully');
                    // });

                    //todo: rename the new file (path1ConflictedCopy) to old file name (path1)
                    console.info('rename file :: ' + self.watchedDirectory + '/' + path1ConflictedCopy + ' to :: ' + self.watchedDirectory + '/' + path1);
                    fs.rename( self.watchedDirectory + '/' + path1ConflictedCopy , self.watchedDirectory + '/' + path1, function(err) {
                        if ( err ) return console.info('ERROR ON RENAME: ' + err);
                        console.info('file renamed successfully');
                    });

                    //todo: now remove this conflict to not process it again
                    delete self.conflicts[ self.conflicts.indexOf(path1ConflictedCopy) ];


                }
            });

        }

    }
}