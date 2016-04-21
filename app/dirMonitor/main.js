
import { remote } from 'electron'; // native electron module
import { dirMonitors } from './dirMonitors';


var dialog = remote.dialog;


export var dirMonitorMain = new function () {
    var thisClass = this;

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
            var $btn = $(this);
            var $monitor = $btn.parents('.monitor:first');
            var what = $monitor.data('what');
            if ( what == 'start' ) { // START
                // Display File Browser Dialog, wait for the user to select one directory, continue after
                var dirPath = thisClass.openBrowseDialog_ReturnPathOrFalse();
                if ( dirPath ) { // a dir was selected

                    // create a new monitor for this dir
                    var dirMonitor2 = dirMonitors.createMonitor();
                    dirMonitor2.setDir( dirPath );
                    dirMonitor2.start();

                    // get this monitor's UID
                    var uid = dirMonitor2.getUID();
                    // set the this instance's button text to Stop, and also additional infos like UID
                    $btn.text("Click to Stop this directory's monitoring");
                    $monitor.data('what', 'stop').attr('data-what', 'stop');
                    $monitor.data('uid', uid).attr('data-uid', uid);
                } else {
                    console.info('no dir selected');
                }
            } else {
                // STOP
                // Get this monitor's UID and stop monitoring instance
                var uid = $monitor.data('uid');
                dirMonitors.stopMonitor(uid);
                // Set this html instance to default / stopped state
                $monitor.data('what', 'start').attr('data-what', 'start');
                $monitor.data('uid', '').attr('data-uid', '');
                $btn.text('Click and Chose a Directory to Monitor');
            }
        });
    });

    this.openBrowseDialog_ReturnPathOrFalse = function () {
        var dirChoser = dialog.showOpenDialog({ properties: [ 'openDirectory' ]});
        return ( dirChoser && dirChoser[0] ) ? dirChoser[0] : false ;
    }

}