const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');

const wineDiv = document.getElementById('wineCollection');
let ul = document.createElement('ul');
ul.setAttribute("class","card-text text-light list-group");

//catch add item
ipcRenderer.on('item:add', function(e,items) {
  items.forEach((item) => {
    const li = document.createElement('li');
    let itemText= document.createTextNode(
      "ID: "+item.wineId+
      " | Name: "+item.name+
      " | Category: "+item.category+
      ' | Type: '+item.type+
      ' | Year: '+item.year+
      ' | Winery: '+item.winery+
      ' | Year Purchased: '+item.yearPurchased+
      ' | Rating: '+item.rating
    );
    li.appendChild(itemText);
    li.setAttribute("class"," wine-list card-text text-light list-group-item");

    ul.appendChild(li);
  })
  
  wineDiv.append(ul);
});

//item clear
ipcRenderer.on('item:clear', function(){
  ul.innerHTML = '';
});