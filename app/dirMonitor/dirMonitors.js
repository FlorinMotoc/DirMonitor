
import { dirMonitor } from './dirMonitor';

export var dirMonitors = new function () {
    var self = this;

    this.monitors = [];

    this.createMonitor = function () {
        var dirMonitorTmp = new dirMonitor();
        var uid = dirMonitorTmp.getUID();
        this.monitors[uid] = dirMonitorTmp;

        return dirMonitorTmp;
    }

    this.stopMonitor = function ( uid ) {
        this.monitors[uid].stopWatching();
    }

}
