
import { remote } from 'electron'; // native electron module
import { dirMonitors } from './dirMonitors';

window.$ = window.jQuery = require('jquery');

var dialog = remote.dialog;


export var dirMonitorMain = new function () {
    var thisClass = this;

    this.start = function () {
    }

    $(function() {
        // On Button Click, show the Chose Directory Dialog
        $('.container').on('click', '.btnClick', function () {
            var $btn = $(this);
            var what = $btn.data('what');
            if ( what == 'start' ) { // START
                // Display File Browser Dialog, wait for the user to select one directory, continue after
                var dirPath = thisClass.openBrowseDialog_ReturnPathOrFalse();
                if ( dirPath ) {

                    var dirMonitor2 = dirMonitors.createMonitor();
                    dirMonitor2.setDir( dirPath );
                    dirMonitor2.start();

                    var uid = dirMonitor2.getUID();
                    $btn.data('what', 'stop');
                    $btn.data('uid', uid);
                    $btn.text('Stop');
                } else {
                    console.info('no dir selected');
                }
            } else {
                // STOP
                var uid = $btn.data('uid');
                dirMonitors.stopMonitor(uid);
                $btn.data('what', 'start');
                $btn.data('uid', '');
                $btn.text('Start');
            }
        });
    });

    this.openBrowseDialog_ReturnPathOrFalse = function () {
        var dirChoser = dialog.showOpenDialog({ properties: [ 'openDirectory' ]});
        return ( dirChoser && dirChoser[0] ) ? dirChoser[0] : false ;
    }

}