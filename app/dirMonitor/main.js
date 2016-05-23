
import { remote } from 'electron'; // native electron module
import { dirMonitors } from './dirMonitors';
var fs = require('fs');

var dialog = remote.dialog;

export var dirMonitorMain = new function () {
    var self = this;

    // don't do anything yet
    this.start = function () {
    }

    // the add new tab btn click
    $(function() {
        $('.addNewTab').on('click', function() {
            var numberOfTabs = $('#upTabs li').length;
            var $content = $('.template .monitor').clone();
            tabs.addBSTab("monitorTab"+numberOfTabs, "Monitor #" + numberOfTabs, $content);
        });
    });

    // On .btnClick Click... creates self.$btn, self.$monitor
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
                if ( whatBtn == 'clearLogs' ) { self.Click_Monitor_ClearLogs(); } // CLEAR LOGS
            }

        });
    });

    // method to show the Chose Directory Browse Dialog
    this.openBrowseDialog_ReturnPathOrFalse = function () {
        var dirChoser = dialog.showOpenDialog({ properties: [ 'openDirectory' ]});
        return ( dirChoser && dirChoser[0] ) ? dirChoser[0] : false ;
    }

    // Click Monitor Actions
    this.Click_Monitor_Start = function () {
        // Display File Browser Dialog, wait for the user to select one directory, continue after
        var dirPath = this.openBrowseDialog_ReturnPathOrFalse();
        if ( ! dirPath ) {
            console.info('no dir selected');
        } else { // a dir was selected
            this.$monitor.find('.selectedDir').html('Monitoring directory: ' + dirPath);
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
            this.Click_Monitor_ClearLogs(); // Remove all TRs from the Logs Table
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
        this.$monitor.find('.selectedDir').html('DirMonitor stopped. Select another directory and start again?');

        this.Click_Monitor_Clear(); // Remove all TRs from the Table
        this.Click_Monitor_ClearLogs(); // Remove all TRs from the Logs Table
    }
    this.Click_Monitor_Clear = function () {
        // Remove all TRs from the Table
        this.$monitor.find('.tBodyEvents').html('');
    }
    this.Click_Monitor_ClearLogs = function () {
        // Remove all TRs from the Logs Table
        this.$monitor.find('.tBodyLog').html('');
    }

}

export var fileConflicts = function() {
    var self = this;
    
    // Vars
    // this.conflictString = 'conflicted';
    this.conflictString = ' conflicted copy 2016-';
    this.replaceRegexString = /\s*\(.*?\)\s*/g;
    this.watchedDirectory;
    this.conflicts = [];

    // Methods

    this.setDir = function (dir) {
        this.watchedDirectory = dir;
    }
    
    this.checkIfConflict = function ( path, action, dirMonitorLogInstance ) {
        var path1 = path.replace( this.watchedDirectory + '/', '' );

        // if path1 contains the word "conflicted" AND if is new, ... then ... do something ...
        if ( action == 'add' && path1.search( this.conflictString ) != -1 ) {
            this.log = dirMonitorLogInstance.writeToLogTable.bind(dirMonitorLogInstance);

            // conflicted new file found, put it in queue, and wait for next file change of this file
            this.log('CONFLICTED FILE FOUND :: ' + path1);

            // extract the real (old) name of file, before conflict (removes all in parantheses: () )
            var path1ConflictedCopyGoodString = path1.replace( this.replaceRegexString , '');

            this.log('rename file :: ' + this.watchedDirectory + '/' + path1 + ' to :: ' + this.watchedDirectory + '/' + path1ConflictedCopyGoodString);
            fs.rename( this.watchedDirectory + '/' + path1 , this.watchedDirectory + '/' + path1ConflictedCopyGoodString, function(err) {
                if ( err ) {
                    // error
                    this.log('ERROR ON RENAME: ' + err);
                    var msg = '(ERROR ON RENAME)';
                } else {
                    // rename successfully
                    this.log('file renamed successfully');
                    var msg = '(renamed successfully)';
                }

                // Show Notification
                new Notification('Conflict: ' + msg, {
                    body: path1ConflictedCopyGoodString
                });
            }); // end rename

        } // end if
    } // end checkIfConflict()
}