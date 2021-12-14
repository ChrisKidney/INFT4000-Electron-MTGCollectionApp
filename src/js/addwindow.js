const electron = require('electron')
const {ipcRenderer} = electron
const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

function submitForm(e) {
  e.preventDefault();
  let itemInfo = [];
  itemInfo.push(document.querySelector('#name').value);
  itemInfo.push(document.querySelector('#text').value);
  itemInfo.push(document.querySelector('#cost').value);
  itemInfo.push(document.querySelector('#value').value);
  itemInfo.push(document.querySelector('#owned').value);
  itemInfo.push(document.querySelector('#img').value);

   ipcRenderer.send('item:add', itemInfo);//send to main.js
}