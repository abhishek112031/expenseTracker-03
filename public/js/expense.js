
function userExpenseData(event) {
event.preventDefault();
const token = localStorage.getItem('token');

const expenses = {
    amount: document.getElementById('amount').value,
    description: document.getElementById('description').value,
    category: document.getElementById('category').value
}

axios.post('http://localhost:3000/expenses', expenses, { headers: { "Authorization": token } })
    .then(response => {
        // console.log(response.data)
        showExpenseOnscreen(response.data);
    })
}




function showExpenseOnscreen(item) {
document.getElementById('amount').value = "";
document.getElementById('description').value = "";
document.getElementById('category').value = "";




    let child=`<li id=${item.id} class="mt-2 border border-warning rounded bg-light">${item.amount}---${item.description}--${item.category}<button class="btn btn-outline-danger ms-5" onclick=deleteExpense('${item.id}')>Delete</button></li>`
    // item_element.innerText=item;
    

    document.getElementById('list').innerHTML+=child;
}

window.addEventListener('DOMContentLoaded', () => {
const token = localStorage.getItem('token');
axios.get('http://localhost:3000/user/all-expenses', { headers: { "Authorization": token } })
    .then(response => {
       
        DisplayList(response.data, list_element, rows, current_page);
        SetupPagination(response.data, pagination_element, rows); 
     


    })
    .catch(err => {

        document.body.innerHTML += `<h5 class="text-center">1st ON REFRESH:something went wrong::ref${err}</h5>`
    })
});

function deleteExpense(expId) {
const token = localStorage.getItem('token');
if (confirm(`Are you sure to delete this Expense?`) === true) {
    async function deleted() {
        try {
            let res = await axios.delete(`http://localhost:3000/user/expenses/delete/${expId}`, { headers: { "Authorization": token } })
            removeFromScreen(expId);
        }
        catch (err) {
            document.body.innerHTML += `<h3 class="text-center">1st ON delete:something went wrong::ref${err}</h3>`

        }

    }
    deleted();


}

}

function removeFromScreen(expId) {
const parent = document.getElementById("list");
const child = document.getElementById(expId);
if (child) {
    parent.removeChild(child);

}
}
//razor pay functionality:-->>
document.getElementById('rzp-button1').onclick = async function (e) {

try {

    const token = localStorage.getItem('token');

    const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });

    console.log("response---->>>", response)

    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id,
        //on successful payment this handeller function will be called:--->>
        "handler": async function (response) {

             await axios.post('http://localhost:3000/purchase/updateTransactionStatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            },{ headers: { "Authorization": token } });
            console.log("postresp--->>>", postresp)


            alert('you are a Premium user Now!!')
        }


    }

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function (response) {
        console.log(response);
        alert('something went wrong!')
    })
}
catch (err) {
    console.log(err.response.data.message);
    document.body.innerHTML += `<h5 class="text-center text-danger">Error:${err.response.data.message}</h5>`
}





}

// async function noOfRows(event){
//     event.preventDefault();
//     let rows=document.getElementById('nor').value;


// }

//pagination:
const list_element = document.getElementById('list');
const pagination_element = document.getElementById('pagination');

let current_page = 1;
let rows = parseInt(prompt("enter row per page"))

function DisplayList (items, wrapper, rows_per_page, page) {
wrapper.innerHTML = "";
page--;

let start = rows_per_page * page;//starting index
let end = start + rows_per_page;//ending index+1
let paginatedItems = items.slice(start, end);//list 0f items per page

for (let i = 0; i < paginatedItems.length; i++) {
    let item = paginatedItems[i];//each item
    showExpenseOnscreen(item)

    

    //<div class="item">item</div>//item=each item
    // let child =`<li id=${item.id}>${item.amount}---${item.description}---${item.category}</li>`
    // item_element.innerText=item;
    

    // wrapper.appendChild(child);
    // wrapper.innerHTML+=child;
}
}

function SetupPagination (items, wrapper, rows_per_page) {
wrapper.innerHTML = "";

let page_count = Math.ceil(items.length / rows_per_page);//no of page/buttons
for (let i = 1; i < page_count + 1; i++) {
    let btn = PaginationButton(i, items);
    wrapper.appendChild(btn);
}
}

function PaginationButton (page, items) {
let button = document.createElement('button');
button.innerText = page;//ex-1,2,3,4...

if (current_page == page) button.classList.add('active');

button.addEventListener('click', async function () {
    const token = localStorage.getItem('token');
    const resp=await axios.get('http://localhost:3000/user/all-expenses', { headers: { "Authorization": token } })
    current_page = page;
    DisplayList(resp.data, list_element, rows, current_page);

    let current_btn = document.querySelector('.pagenumbers button.active');
    current_btn.classList.remove('active');

    button.classList.add('active');
});

return button;
}


