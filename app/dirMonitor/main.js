
import { remote } from 'electron'; // native electron module

import { dirMonitor } from './dirMonitor';

var dialog = remote.dialog;

export var dirMonitorMain = new function () {
    var thisClass = this;

    this.start = function () {
        thisClass.onDocumentReady();
       
    }

    this.onDocumentReady = function () {
        document.addEventListener('DOMContentLoaded', function () {
            document.getElementById('btnClick').onclick = function() {thisClass.abc()};
        });
    }

    this.abc = function () {
        var dirChoser = dialog.showOpenDialog({ properties: [ 'openDirectory' ]});
        if (dirChoser[0]) {
            dirMonitor.setDir( dirChoser[0] );
            // dirMonitor.setIgnored(/\\/);
            dirMonitor.start();
        }
    }

}