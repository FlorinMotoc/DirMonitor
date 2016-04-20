
import { remote } from 'electron'; // native electron module
import { dirMonitor } from './dirMonitor';

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
            if (what == 'start') { // START
                // Display File Browser Dialog, wait for the user to select one directory, continue after
                var dirPath = thisClass.openBrowseDialog_ReturnPathOrFalse();
                if ( dirPath ) {
                    dirMonitor.setDir( dirPath );
                    dirMonitor.start();
                } else {
                    console.info('no dir selected');
                }
            } else {
                // STOP
            }
        });
    });

    this.openBrowseDialog_ReturnPathOrFalse = function () {
        var dirChoser = dialog.showOpenDialog({ properties: [ 'openDirectory' ]});
        return ( dirChoser && dirChoser[0] ) ? dirChoser[0] : false ;
    }

}