
import { remote } from 'electron'; // native electron module
import { dirMonitors } from './dirMonitors';


var dialog = remote.dialog;


export var dirMonitorMain = new function () {
    var self = this;

    this.start = function () {
    }

    $(function() {
        $('.addNewTab').on('click', function() {
            var numberOfTabs = $('#upTabs li').length;
            var $content = $('.template .monitor').clone();
            tabs.addBSTab("monitorTab"+numberOfTabs, "Tab title", $content);
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

export var fileConflicts = new function() {
    var self = this;


    this.checkIfConflict = function ( dir, path, action ) {
        var path1 = path.replace( dir + '/', '' );

        //TODO: if path1 contains the word "conflicted" then ... do something ...
        if ( path1.search('conflicted') != -1 ) {
            this.conflictedFileFound( path1 );
        }
    }
    
    this.conflictedFileFound = function (path1) {
        console.info('CONFLICTED FILE FOUND :: ' + path1);
    }
}