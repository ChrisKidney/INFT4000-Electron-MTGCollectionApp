const electron = require('electron')
const {ipcRenderer} = electron
const form = document.querySelector('form');
form.addEventListener('submit', submitForm);

function submitForm(e) {
  e.preventDefault();
  let itemInfo = [];
  itemInfo.push(document.querySelector('#name').value);
  itemInfo.push(document.querySelector('#category').value);
  itemInfo.push(document.querySelector('#type').value);
  itemInfo.push(document.querySelector('#year').value);
  itemInfo.push(document.querySelector('#winery').value);
  itemInfo.push(document.querySelector('#year_purchased').value);
  itemInfo.push(document.querySelector('#rating').value);

   ipcRenderer.send('item:add', itemInfo);//send to main.js
}

// Populate types dropdown based on category selected
function changeType(value) {
  let typesByCategory = {
    Red: ['Cabernet', 'Cabernet Sauvignon', 'Chardonnay', 'Malbec', 'Merlot', 'Sirah/Shiraz', 'Pinot Noir', 'Port', 'Red Blends', 'Other Red Varieties'],
    White: ['Riesling', 'Sauvignon Blanc', 'Verdelho', 'Semillon', 'Chardonnay', 'Pinot Gris/Pinot Grigio', 'White Blends', 'Other White Varieties'],
    Dessert: ['Eiswein (Ice Wine)', 'Sauternes', 'Dessert Blends', 'Other Dessert Varieties']
  }

  if (value.length == 0) {
    document.getElementById('type').innerHTML = '<option></option>';
    console.log('if' + value);
  }
  else {
    let typeOptions = '';
    for (category in typesByCategory[value]) {
      typeOptions += '<option>' + typesByCategory[value][category] + "</option>";
    }
    document.getElementById("type").innerHTML = typeOptions;
  }
}