const electron = require('electron');
const {ipcRenderer} = electron;
const $ = require('jquery');

const cardDiv = document.getElementById('cardCollection');
const cardTotalValue = document.getElementById('cardTotalValue');
const cardTotalOwned = document.getElementById('cardTotalOwned');
const addBtn = document.getElementById('addBtn');
let ul = document.createElement('ul');
ul.setAttribute("class","card-text text-light list-group");

//catch add item
ipcRenderer.on('item:add', function(e,items) {
  let totalOwned = 0;
  let totalValue = 0;

  items.forEach((item, index) => {
    const li = document.createElement('li');
    let itemText= document.createTextNode(
      'Name: '+item.name+
      ' | Text: '+item.text+
      ' | Cost: '+item.cost+
      ' | Value: $'+item.value+
      ' | Amount Owned: '+item.owned
    );
    li.appendChild(itemText);
    li.setAttribute("class"," card-list card-text text-light list-group-item");
    li.setAttribute("tabindex", index);
    li.addEventListener('focus', e => {
      document.querySelector('#cardImg').setAttribute('src', item.img);
    });
    ul.appendChild(li);

    const btnLi = document.createElement('li');
    btnLi.setAttribute('class', 'mb-3')
    const editBtn = document.createElement('button');
    editBtn.setAttribute('value', item.id);
    editBtn.setAttribute('class', 'btn btn-warning m-1');
    editBtn.innerHTML = 'Edit';
    editBtn.addEventListener('click', (e) => {
      ipcRenderer.send('loadUpdateWindow', e.target.value);
    })
    btnLi.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('value', item.id);
    deleteBtn.setAttribute('class', 'btn btn-danger m-1');
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
      ipcRenderer.send('item:delete', e.target.value);
    })
    btnLi.appendChild(deleteBtn);
    ul.appendChild(btnLi);


    totalOwned += parseFloat(item.owned);
    totalValue += parseFloat(item.value * item.owned);
  })
  cardDiv.append(ul);
  cardTotalValue.innerText = '$' + totalValue.toFixed(2);
  cardTotalOwned.innerText = totalOwned;
});

//item clear
ipcRenderer.on('item:clear', function(){
  ul.innerHTML = '';
});

addBtn.addEventListener('click', (e)=>{
  ipcRenderer.send('loadAddWindow');
})