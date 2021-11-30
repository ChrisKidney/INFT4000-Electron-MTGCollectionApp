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
        filename:"./wine.db"
    },
    useNullAsDefault: true
});

//Variables for windows
let mainWindow;
let addWindow;
let updateWindow;
let deleteWindow;

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
      regularTheme();
      let themeCss = settings.get('theme');
      mainWindow.webContents.insertCSS(themeCss);
    }
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
    width: 500,
    height: 500,
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
function createUpdateWindow(){
  updateWindow = new BrowserWindow({
    width: 500,
    height: 500,
	autoHideMenuBar: true,
    title: 'Update Wine',
    webPreferences: {
      nodeIntegration: true
    },
  })

  updateWindow.loadFile('./html/updateWindow.html');

  // Load the user's theme on initial window creation
  updateWindow.webContents.on('did-finish-load', function () {
    let themeCss = settings.get('theme');
    updateWindow.webContents.insertCSS(themeCss);
  });

  updateWindow.on('close', function() {
    updateWindow = null;
  })

}

//Delete Window
function createDeleteWindow(){
  deleteWindow = new BrowserWindow({
    width: 500,
    height: 500,
    title: 'Delete Item',
	autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    },
  })

  deleteWindow.loadFile('./html/deleteWindow.html');

  // Load the user's theme on initial window creation
  deleteWindow.webContents.on('did-finish-load', function () {
    let themeCss = settings.get('theme');
    deleteWindow.webContents.insertCSS(themeCss);
  });

  deleteWindow.on('close', function() {
    deleteWindow = null;
  })

}

//CRUD METHODS

//Create item
ipcMain.on('item:add', function(e, itemInfo) {
  knex("wines").insert({
	  name: itemInfo[0],
	  category: itemInfo[1],
	  type: itemInfo[2],
      year: itemInfo[3],
      winery: itemInfo[4],
      yearPurchased: itemInfo[5],
      rating: itemInfo[6],
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
    .select("wineId","name","category","type","year","winery","yearPurchased","rating")
    .from("wines")
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
    .select("wineId","name","category","type","year","winery","yearPurchased","rating")
    .from("wines")
    .where('wineId',id)
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
  
  knex("wines").where({wineId: id}).update({
        name: itemInfo[1],
        category: itemInfo[2],
        type: itemInfo[3],
        year: itemInfo[4],
        winery: itemInfo[5],
        yearPurchased: itemInfo[6],
        rating: itemInfo[7],
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
  knex('wines').where({"wineId" : id}).del()
  .catch(err =>{
    console.log(err)
  })
  .then(() =>{
    deleteWindow.close();  
    console.log(id +": Deleted");
	readDB();
  })
});

//Clear window
function clearWindow()
{
  console.log(app.getPath('userData'));
    mainWindow.webContents.send('item:clear');
}

// Themes
function regularTheme()
{
  let themeCss;

  try {
    themeCss = fs.readFileSync('css/regular.css', 'utf-8');
  }
  catch (err) {
    console.log('Error: ' + err.message);
  }

  settings.set('theme', themeCss);
  mainWindow.webContents.insertCSS(themeCss);
}

function halloweenTheme(){
  let themeCss ;

  try {
    themeCss = fs.readFileSync('css/halloween.css', 'utf-8');
  }
  catch (err) {
    console.log('Error: ' + err.message);
  }

  settings.set('theme', themeCss);
  mainWindow.webContents.insertCSS(themeCss);
}

function christmasTheme(){
  let themeCss;
  
  try {
    themeCss = fs.readFileSync('css/christmas.css', 'utf-8');
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
        label: 'Read',
        accelerator:'CmdOrCtrl + r',
        click(){readDB()}
      },
	  {
        label: 'Update',
        accelerator:'CmdOrCtrl + u',
        click(){createUpdateWindow()}
      },
	  {
        label: 'Delete',
        accelerator:'CmdOrCtrl + Delete',
        click(){createDeleteWindow()}
      },
	  {
        label: 'Clear',
        accelerator:'CmdOrCtrl + e',
        click(){clearWindow()}
      },
	  {
        label: 'Quit',
        accelerator:'CmdOrCtrl + q',
        click(){app.quit()}
      }
    ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Regular Theme',
        click() {regularTheme()}
      },
      {
        label: 'Halloween Theme',
        click() {halloweenTheme()}
      },
      {
        label: 'Christmas Theme',
        click(){christmasTheme()}
      }
    ]
  },
  {
    label: 'Username: ' + username
  }
];

app.on('ready', createWindow)
