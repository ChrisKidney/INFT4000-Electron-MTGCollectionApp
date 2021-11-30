const {ipcRenderer} = require('electron')
const knex = require("knex")({
    client: "sqlite3",
    connection:{
        filename:"./wine.db"
    },
    useNullAsDefault: true
});

// Submit buttons
const searchButton = document.getElementById("searchButton");
const updateButton = document.getElementById("updateButton");

// Button event listeners
searchButton.addEventListener('click', searchWine);
updateButton.addEventListener('click', updateWine);

// Search Wine
function searchWine(){
	var pID = parseInt(document.getElementById("wine_id_search").value);
	ipcRenderer.send('item:search', pID) //call to index.js
}

// Update Wine - send to index.js
function updateWine(){
	let itemInfo = [];
	itemInfo.push(document.querySelector('#wine_id_found').value);
	itemInfo.push(document.querySelector('#name').value);
	itemInfo.push(document.querySelector('#category').value);
	itemInfo.push(document.querySelector('#type').value);
	itemInfo.push(document.querySelector('#year').value);
	itemInfo.push(document.querySelector('#winery').value);
	itemInfo.push(document.querySelector('#year_purchased').value);
	itemInfo.push(document.querySelector('#rating').value);

		
	ipcRenderer.send('item:update', itemInfo);
}

//Received from index.js
ipcRenderer.on('item:found', (event, rows) => {
	rows.forEach(function(row){
		document.getElementById('wine_id_found').value = row.wineId; 	
		document.getElementById('name').value = row.name; 
		document.getElementById('category').value = row.category; 
		changeType(row.category); // Fill type select with valid values
		document.getElementById('type').value = row.type; 
		document.getElementById('year').value = row.year; 
		document.getElementById('winery').value = row.winery; 
		document.getElementById('year_purchased').value = row.yearPurchased; 
		document.getElementById('rating').value = row.rating; 
	})
})

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



