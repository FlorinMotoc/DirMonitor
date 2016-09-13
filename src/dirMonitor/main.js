
import { remote } from 'electron'; // native electron module
import { dirMonitors } from './dirMonitors';
var fs = require('fs');

var dialog = remote.dialog;

export var dirMonitorMain = new function () {
    var self = this;

    // Vars
    this.conflictsArray = [];

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

    // Conflicts array stuffs...
    $(function() {

        // Remove
        $('.monitors').on('click', '.formTextToSearch .removeThis', function () {
            var $monitor = $(this).parents('.monitor:first');
            $(this).parents('.singleConflict').remove();
            self.createConflictsArray($monitor);
        });

        // Add
        $('.monitors').on('click', '.formTextToSearch .ftts_add', function () {
            var $monitor = $(this).parents('.monitor:first');
            $monitor.find('.formTextToSearch_div_tpl > div').clone().appendTo($monitor.find('.formTextToSearch .conflictArrays'));
        });

        // OK
        $('.monitors').on('click', '.formTextToSearch .ftts_ok', function () {
            var $monitor = $(this).parents('.monitor:first');
            self.createConflictsArray($monitor);
            swal("Good job!", "Now the Monitoring looks for the strings you specified!", "success");
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


    // Create conflicts array
    this.createConflictsArray = function ($monitor) {
        var conflictsArray = [];
        $monitor.find('.singleConflict').each( function( index, $element ) {
            var search = $($element).find('.textToFind').val();
            var replace = $($element).find('.textToReplace').val();
            if ( search.length ) { // if .textToFind have something in it
                conflictsArray.push( { search: search,  replace: replace } );
            }
        });
        // todo: Remove duplicates if any
        $monitor.data('conflictsArray', conflictsArray);
    }

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
        //formTextToSearch
        if ( action == 'add' ) {

            var newPath1 = false;
            var pathToCheck;

            // new style

            var conflictsArray = $('.monitor[data-uid="'+dirMonitorLogInstance.UID+'"]').data('conflictsArray');

            if ( typeof conflictsArray != 'undefined' && conflictsArray.length ) {

                $.each( conflictsArray, function( key, value ) {

                    pathToCheck = (newPath1 !== false) ? newPath1 : path1;

                    var search = value.search;
                    var replace = value.replace;

                    if ( pathToCheck.search( search ) != -1 ) { // this exists in path1 (filename)
                        self.log = dirMonitorLogInstance.writeToLogTable.bind(dirMonitorLogInstance);

                        // conflicted new file found, put it in queue, and wait for next file change of this file
                        self.log('CONFLICTED FILE FOUND :: ' + pathToCheck + ' with conflict : ' + search);

                        // extract the real (old) name of file, before conflict (removes all in parantheses: () )
                        var path1ConflictedCopyGoodString = pathToCheck.replace( search , replace);

                        // The old path filename was changed
                        newPath1 = path1ConflictedCopyGoodString;

                        self.log('rename file :: ' + path1 + ' to :: ' + path1ConflictedCopyGoodString + ' :: from dir :: ' + self.watchedDirectory);

                        // Rename
                        self.renameFile(
                            self.watchedDirectory + '/' + pathToCheck,
                            self.watchedDirectory + '/' + path1ConflictedCopyGoodString
                        );
                    }

                });

            }

            // end new style

            // Now check for RDS Style

            // RDS Style
            pathToCheck = (newPath1 !== false) ? newPath1 : path1;

            if ( pathToCheck.search( this.conflictString ) != -1 ) {
                self.log = dirMonitorLogInstance.writeToLogTable.bind(dirMonitorLogInstance);

                // conflicted new file found, put it in queue, and wait for next file change of this file
                self.log('CONFLICTED FILE FOUND :: ' + pathToCheck);

                // extract the real (old) name of file, before conflict (removes all in parantheses: () )
                var path1ConflictedCopyGoodString = pathToCheck.replace( self.replaceRegexString , '');

                self.log('rename file :: ' + pathToCheck + ' to :: ' + path1ConflictedCopyGoodString + ' :: from dir :: ' + self.watchedDirectory);

                // Rename
                self.renameFile(
                    self.watchedDirectory + '/' + pathToCheck,
                    self.watchedDirectory + '/' + path1ConflictedCopyGoodString
                );

            } // end if

            // END RDS Style

        } // end if action == add

    } // end checkIfConflict()

    this.renameFile = function ( oldPathFilename, newPathFilename ) {

        // important :: you need to declare this.log before)

        fs.rename( oldPathFilename , newPathFilename, function(err) {
            if ( err ) {
                // error
                self.log('ERROR ON RENAME: ' + err);
                var msg = '(ERROR ON RENAME)';
            } else {
                // rename successfully
                self.log('file renamed successfully');
                var msg = '(renamed successfully)';
            }

            // Show Notification
            new Notification('Conflict: ' + msg, {
                body: newPathFilename
            });
        }); // end rename

    }
}