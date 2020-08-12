const electron = require('electron');
const url = require('url');
const path = require ('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;
//Edit
//Listen for app to be ready
app.on('ready', function(){
    mainWindow = new BrowserWindow(
        {
            webPreferences:{
                nodeIntegration: true
            }
        }
    );
    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:'file',
        slashes: true
    }));

    //Quit App when Main window closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle create add window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width: 500,
        height: 200,
        title: 'Add Shopping List Item',
        //Makes electron functions work on HTML pages
        webPreferences: {
            nodeIntegration: true
        }
    });
    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol:'file',
        slashes: true
    }));
    //Garbage collection for optimization
    addWindow.on('close', function(){
        addWindow = null;
    });
    //No Menu on the add window
    addWindow.setMenu(null);
}

//Catch Added Item (item:add)
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});


//Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu:[
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+D' :
                'Ctrl+D',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' :
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

//Breaks the menu --Look into further
/*if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
};*/

//Add Developer tools item if not in procuction
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' :
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}