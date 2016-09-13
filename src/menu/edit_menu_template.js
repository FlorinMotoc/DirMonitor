const BrowserWindow = require('electron').BrowserWindow;

export var editMenuTemplate = {
    label: 'Edit',
    submenu: [
        { label: "New Window", accelerator: "CmdOrCtrl+N", selector: "newWindow:", click: function() {
            // var focusedWindow = BrowserWindow.getFocusedWindow();
            // focusedWindow.webContents.send('newWindow');
            console.log('newWindow');
        } },
        { type: "separator" },
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
        { type: "separator" },
        { label: 'About', role: 'about' },
    ]
};
