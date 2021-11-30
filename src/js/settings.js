//Note: the main process has direct access to the app module but the renderer uses remote

const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Settings {
  constructor(opts) {
    const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    this.path = path.join(userDataPath, opts.configName + '.json');
    this.data = parseDataFile(this.path, opts.defaults);
  }
  
  get(key) {   // GET property of data object
    return this.data[key];
  }
    
  set(key, val) { // SET property of data object
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath, defaults) {
  // get JSON string using fs.readFileSync - parse into Javascript object
  try {
    return JSON.parse(fs.readFileSync(filePath));
  } 
  catch(error) {
    return defaults;
  }
}


module.exports = Settings;//expose class