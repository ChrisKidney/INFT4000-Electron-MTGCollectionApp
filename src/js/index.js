//imports
const Settings = require('./settings.js');
const os = require('os');
const username = os.userInfo().username;
const fs = require('fs');
const { 
    app, 
    BrowserWindow, 
    Menu, 
    ipcMain 
} = require('electron');

let knex = require("knex")({
    client: "sqlite3",
    connection:{
        filename:"./card.db"
    },
    useNullAsDefault: true
});

//Variables for windows
let mainWindow;
let addWindow;
let updateWindow;

//Create the settings class
const settings = new Settings({
  configName: 'user-preferences', //data file in app system folder
  defaults: {
    windowBounds: { width: 1600, height: 900 }
  }
});

//CREATE WINDOWS

//Main Window
function createWindow() {
  let { width, height } = settings.get('windowBounds');
  mainWindow = new BrowserWindow( {
    width: width,
    height: height,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadFile('./html/mainwindow.html');

  // Load the user's theme on initial window creation
  mainWindow.webContents.on('did-finish-load', function () {
    if(settings.get('theme')) {
      let themeCss = settings.get('theme');
      mainWindow.webContents.insertCSS(themeCss);
    }
    else {
      darkTheme();
      let themeCss = settings.get('theme');
      mainWindow.webContents.insertCSS(themeCss);
    }
    readDB();
  });

  mainWindow.on('closed', function() {
    app.quit();
  })

  mainWindow.on('resize', () => { //handler for resize event - the BrowserWindow class extends EventEmitter
    let { width, height } = mainWindow.getBounds();//getBounds gets object with dimensions
    settings.set('windowBounds', { width, height });//save dimensions
    });

  let menu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(menu);
}

//Add Window
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 650,
    height: 650,
    title: 'Add Item',
	autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    },
  })

	addWindow.loadFile('./html/addwindow.html');

  // Load the user's theme on initial window creation
  addWindow.webContents.on('did-finish-load', function () {
    let themeCss = settings.get('theme');
    addWindow.webContents.insertCSS(themeCss);
  });

	readDB()
	addWindow.on('close', function() {
		addWindow = null;
	})
}

//Update Window
function createUpdateWindow(id){
  updateWindow = new BrowserWindow({
    width: 650,
    height: 650,
	autoHideMenuBar: true,
    title: 'Update Card',
    webPreferences: {
      nodeIntegration: true
    },
  })

  updateWindow.loadFile('./html/updateWindow.html', {query: {'id': id}});

  // Load the user's theme on initial window creation
  updateWindow.webContents.on('did-finish-load', function () {
    let themeCss = settings.get('theme');
    updateWindow.webContents.insertCSS(themeCss);
  });

  updateWindow.on('close', function() {
    updateWindow = null;
  })

}

//CRUD METHODS

//Create item
ipcMain.on('item:add', function(e, itemInfo) {
  knex("cards").insert({
	  name: itemInfo[0],
	  text: itemInfo[1],
	  cost: itemInfo[2],
    value: itemInfo[3],
    owned: itemInfo[4],
    img: itemInfo[5],
	  })
  .catch(err =>{
    console.log(err)
  })
  .then(() =>{
    readDB();
  });

  addWindow.close();
});

//Read item list
function readDB()
{
  clearWindow()
  let result = 
    knex
    .select("id","name","text","cost","value","owned","img")
    .from("cards")
    .catch(err =>{
      console.log(err)
    });

  result.then(function(rows){
      mainWindow.webContents.send('item:add', rows);
  })
}

//Search for item to update
ipcMain.on('item:search', function(e,id)
{
  let result = 
    knex
    .select("id","name","text","cost","value","owned","img")
    .from("cards")
    .where('id',id)
    .catch(err =>{
      console.log(err)
      updateWindow.webContents.send('item:not-found');
    });

  result.then(function(rows){
    updateWindow.webContents.send('item:found',rows);
  });
})

//Update item
ipcMain.on('item:update', function(e,itemInfo)
{  
  let id = itemInfo[0]
  
  knex("cards").where({id: id}).update({
        name: itemInfo[1],
        text: itemInfo[2],
        cost: itemInfo[3],
        value: itemInfo[4],
        owned: itemInfo[5],
        img: itemInfo[6],
	  })
  .catch(err =>{
    console.log(err)
  })
  .then(() =>{
	  readDB();
  });

	updateWindow.close();
	console.log(id +": Updated"); 
});


//Delete item
ipcMain.on('item:delete', function(e, id){
  knex('cards').where({"id" : id}).del()
  .catch(err =>{
    console.log(err)
  })
  .then(() =>{
    console.log(id +": Deleted");
	readDB();
  })
});

ipcMain.on('loadUpdateWindow', function(e, args){
  let id = args[0];
  createUpdateWindow(id);
})

ipcMain.on('loadAddWindow', function(e){
  createAddWindow();
})

//Clear window
function clearWindow()
{
  console.log(app.getPath('userData'));
    mainWindow.webContents.send('item:clear');
}

// Themes
function darkTheme()
{
  let themeCss;

  try {
    themeCss = fs.readFileSync('css/dark.css', 'utf-8');
  }
  catch (err) {
    console.log('Error: ' + err.message);
  }

  settings.set('theme', themeCss);
  mainWindow.webContents.insertCSS(themeCss);
}

function lightTheme(){
  let themeCss ;

  try {
    themeCss = fs.readFileSync('css/light.css', 'utf-8');
  }
  catch (err) {
    console.log('Error: ' + err.message);
  }

  settings.set('theme', themeCss);
  mainWindow.webContents.insertCSS(themeCss);
}

//Menu Template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Create',
        accelerator:'CmdOrCtrl + Return',
        click() {createAddWindow()}
      },
	    {
        label: 'Quit',
        accelerator:'CmdOrCtrl + q',
        click(){app.quit()}
      }
    ]
  },
  {
    label: 'Themes',
    submenu: [
      {
        label: 'Dark Theme',
        click() {darkTheme()}
      },
      {
        label: 'Light Theme',
        click() {lightTheme()}
      }
    ]
  },
  {
    label: 'Username: ' + username
  }
];

app.on('ready', createWindow)

module.exports = {
  createUpdateWindow: createUpdateWindow
}