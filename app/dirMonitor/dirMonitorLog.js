
import {dirMonitorMain, fileConflicts} from "./main";

export var dirMonitorLog = function () {
    var self = this;

    // Vars

    this.watchedDirectory;
    this.UID;

    // Methods

    this.setDir = function (dir) {
        this.watchedDirectory = dir;
    }
    this.setUID = function (uid) {
        this.UID = uid;
    }

    this.write = function ( path, type, action, stats ) {
        // var date = new Date().toLocaleString();
        // var path1 = path.replace(this.watchedDirectory+'/', '');
        // console.info([ date, path1, type, action, stats ]);

        // var $tbody = $('.monitor.'+this.UID+' .tableHere');
        // var $tbody = $('.monitor[data-uid="'+this.UID+'"] .tableHere');

        $('.monitor[data-uid="'+this.UID+'"] .tableHere').append(
        '<tr>' +
            '<th scope="row">' + new Date().toLocaleString() + '</th>' +
            '<td>' + type + '</td>' +
            '<td>' + action + '</td>' +
            '<td>' + path.replace(this.watchedDirectory+'/', '') + '</td>' +
            // '<td>stats</td>' +
        '</tr>'
        );

        // Check for File Conflicts
        if (type == 'file') {
            fileConflicts.checkIfConflict( this.watchedDirectory, path, action );
        }

    }

}
