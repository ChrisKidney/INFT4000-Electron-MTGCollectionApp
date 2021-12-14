const {ipcRenderer} = require('electron')
const querystring = require('querystring');
const knex = require("knex")({
    client: "sqlite3",
    connection:{
        filename:"./card.db"
    },
    useNullAsDefault: true
});

searchCard();

// Submit buttons
const updateButton = document.getElementById("updateButton");

// Button event listeners
updateButton.addEventListener('click', updateWine);

// Search Wine
function searchCard(){
	let query = querystring.parse(global.location.search);
	let pID = JSON.parse(query['?id']);
	ipcRenderer.send('item:search', pID) //call to index.js
}

// Update Wine - send to index.js
function updateWine(){
	let itemInfo = [];
	itemInfo.push(document.querySelector('#id').value);
	itemInfo.push(document.querySelector('#name').value);
	itemInfo.push(document.querySelector('#text').value);
	itemInfo.push(document.querySelector('#cost').value);
	itemInfo.push(document.querySelector('#value').value);
	itemInfo.push(document.querySelector('#owned').value);
	itemInfo.push(document.querySelector('#img').value);

	ipcRenderer.send('item:update', itemInfo);
}

//Received from index.js
ipcRenderer.on('item:found', (event, rows) => {
	rows.forEach(function(row){
		document.getElementById('id').value = row.id; 	
		document.getElementById('name').value = row.name; 
		document.getElementById('text').value = row.text;
		document.getElementById('cost').value = row.cost; 
		document.getElementById('value').value = row.value; 
		document.getElementById('owned').value = row.owned; 
		document.getElementById('img').value = row.img; 
	})
})




