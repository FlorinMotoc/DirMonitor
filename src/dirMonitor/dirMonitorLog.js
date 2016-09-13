
import {fileConflicts} from "./main";

export var dirMonitorLog = function () {
    var self = this;

    // Vars

    this.watchedDirectory;
    this.UID;
    var fileConflicts1 = new fileConflicts();

    // Methods

    this.setDir = function (dir) {
        this.watchedDirectory = dir;
        fileConflicts1.setDir(dir);
    }
    this.setUID = function (uid) {
        this.UID = uid;
    }

    this.write = function ( path, type, action, stats ) {
        // var date = new Date().toLocaleString();
        // var path1 = path.replace(this.watchedDirectory+'/', '');
        // console.info([ date, path1, type, action, stats ]);

        // var $tbody = $('.monitor.'+this.UID+' .tBodyEvents');
        // var $tbody = $('.monitor[data-uid="'+this.UID+'"] .tBodyEvents');

        $('.monitor[data-uid="'+this.UID+'"] .tBodyEvents').append(
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
            fileConflicts1.checkIfConflict( path, action, this );
        }

    }
    
    this.writeToLogTable = function (msg) {
        console.info(msg);
        $('.monitor[data-uid="'+this.UID+'"] .tBodyLog').append(
            '<tr>' +
                '<th scope="row">' + new Date().toLocaleString() + '</th>' +
                '<td>' + msg + '</td>' +
            '</tr>'
        );
    }

}
