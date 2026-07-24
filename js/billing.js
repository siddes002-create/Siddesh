// =========================
// Retail Nanban Billing POS
// billing.js - PART 1
// =========================

let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];

// ---------------------
// Live Clock
// ---------------------
function updateClock() {
    const clock = document.getElementById("clock");
    if (!clock) return;

    const now = new Date();

    clock.innerHTML = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

setInterval(updateClock, 1000);
updateClock();


// ---------------------
// Barcode Scan
// ---------------------
function searchSKU(event){

    if(event.key !== "Enter") return;

    let code = document.getElementById("sku").value.trim();

    if(code.length < 6){
        alert("Invalid Barcode");
        return;
    }

    let styleNo = code.slice(0,5);
    let sizeCode = code.slice(5);

    let sizeMap = {
        "1":"S",
        "2":"M",
        "3":"L",
        "4":"XL",
        "5":"XXL"
    };

    let selectedSize = sizeMap[sizeCode];

    let product = products.find(p => p.styleNo === styleNo);

    if(!product){
        alert("Product Not Found");
        return;
    }

    if(product.sizes[selectedSize] <= 0){

        alert(selectedSize + " Size Out Of Stock");

        document.getElementById("sku").value="";
        document.getElementById("sku").focus();

        return;
    }

    // Fill Product Details
    document.getElementById("pname").value = product.name;
    document.getElementById("price").value = product.price;
    document.getElementById("size").value = selectedSize;

    showProductPreview(product);

    addItem();

    document.getElementById("sku").value="";
    document.getElementById("sku").focus();
}


// ---------------------
// Product Preview Card
// ---------------------
function showProductPreview(product){

    const box = document.getElementById("productPreview");

    if(!box) return;

    box.innerHTML = `
        <div class="preview-card">

            <img src="${product.image}" class="preview-img">

            <div class="preview-info">

                <h3>${product.name}</h3>

                <p>Style : ${product.styleNo}</p>

                <p>Price : ₹${product.price}</p>

                <p>Stock : ${product.stock}</p>

            </div>

        </div>
    `;
}// ---------------------
// Add Item
// ---------------------
function addItem(){

    let p = document.getElementById("pname").value;
    let q = parseInt(document.getElementById("qty").value) || 1;
    let r = parseFloat(document.getElementById("price").value) || 0;
    let s = document.getElementById("size").value;

    if(!p || r <= 0){
        alert("Enter Product");
        return;
    }

    let item = cart.find(x => x.name === p && x.size === s);

    if(item){

        item.qty += q;

    }else{

        cart.push({
            name: p,
            size: s,
            qty: q,
            price: r
        });

    }

    renderCart();

    document.getElementById("pname").value = "";
    document.getElementById("price").value = "";
    document.getElementById("qty").value = 1;
}


// ---------------------
// Increase Qty
// ---------------------
function increase(index){

    cart[index].qty++;

    renderCart();

}


// ---------------------
// Decrease Qty
// ---------------------
function decrease(index){

    if(cart[index].qty > 1){

        cart[index].qty--;

    }

    renderCart();

}


// ---------------------
// Delete Item
// ---------------------
function del(index){

    cart.splice(index,1);

    renderCart();

}


// ---------------------
// Render Cart
// ---------------------
function renderCart(){

    let tbody = document.getElementById("cart");

    tbody.innerHTML = "";

    let subtotal = 0;

    cart.forEach((item,index)=>{

        let total = item.qty * item.price;

        subtotal += total;

        tbody.innerHTML += `
        <tr>

            <td>${item.name}</td>

            <td>${item.size}</td>

            <td>

                <button onclick="decrease(${index})">-</button>

                <span style="padding:0 10px;font-weight:bold">
                    ${item.qty}
                </span>

                <button onclick="increase(${index})">+</button>

            </td>

            <td>₹${item.price}</td>

            <td>₹${total}</td>

            <td>

                <button
                onclick="del(${index})"
                style="background:red">

                🗑

                </button>

            </td>

        </tr>
        `;

    });

    document.getElementById("sub").innerText = "₹" + subtotal;
    document.getElementById("grand").innerText = "₹" + subtotal;

}// ---------------------
// Save Bill
// ---------------------
function saveBill(){

    if(cart.length === 0){

        alert("Cart is Empty");

        return;

    }

    let orders =
    JSON.parse(localStorage.getItem("orders")) || [];

    let billNo =
    "RN" + String(orders.length + 1).padStart(6,"0");

    let order = {

        billNo: billNo,

        customer:
        document.getElementById("custName").value,

        phone:
        document.getElementById("custPhone").value,

        payment:
        document.getElementById("payment").value,

        status:"Pending",

        orderDate:
        new Date().toISOString(),

        items:[...cart]

    };

    orders.push(order);

    localStorage.setItem(
        "orders",
        JSON.stringify(orders)
    );

    updateStock();

    alert("✅ Bill Saved Successfully\n\nBill No : " + billNo);

    clearBilling();

}


// ---------------------
// Update Stock
// ---------------------
function updateStock(){

    let products =
    JSON.parse(localStorage.getItem("products")) || [];

    cart.forEach(item=>{

        let product =
        products.find(p=>p.name===item.name);

        if(product){

            if(product.sizes &&
               product.sizes[item.size] != null){

                product.sizes[item.size] -= item.qty;

                if(product.sizes[item.size] < 0){

                    product.sizes[item.size] = 0;

                }

                product.stock =

                    (product.sizes.S || 0)+
                    (product.sizes.M || 0)+
                    (product.sizes.L || 0)+
                    (product.sizes.XL || 0)+
                    (product.sizes.XXL || 0);

            }

        }

    });

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

}


// ---------------------
// Clear Billing
// ---------------------
function clearBilling(){

    cart = [];

    renderCart();

    document.getElementById("custName").value="";

    document.getElementById("custPhone").value="";

    document.getElementById("sku").value="";

    document.getElementById("pname").value="";

    document.getElementById("price").value="";

    document.getElementById("qty").value=1;

    document.getElementById("size").selectedIndex=0;

    document.getElementById("previewName").innerText =
    "No Product";

    document.getElementById("previewStyle").innerText="-";

    document.getElementById("previewStock").innerText="0";

    document.getElementById("productImage").src =
    "https://via.placeholder.com/140x180?text=No+Image";

    document.getElementById("stockStatus").innerText =
    "No Stock";

    document.getElementById("stockStatus").style.background =
    "red";

    document.getElementById("sku").focus();

}// ---------------------
// Live Date & Time
// ---------------------
function updateDateTime() {
    const el = document.getElementById("liveTime");
    if (!el) return;

    const now = new Date();

    el.innerHTML = now.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

setInterval(updateDateTime, 1000);
updateDateTime();


// ---------------------
// Print Bill
// ---------------------
function printBill() {

    if (cart.length === 0) {
        alert("Cart is Empty");
        return;
    }

    let html = `
    <html>
    <head>
        <title>Retail Nanban Bill</title>

        <style>
        body{
            font-family:Arial;
            padding:20px;
        }

        h2{
            text-align:center;
        }

        table{
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
        }

        th,td{
            border:1px solid #000;
            padding:8px;
            text-align:center;
        }

        </style>
    </head>

    <body>

    <h2>Retail Nanban</h2>

    <p><b>Date :</b> ${new Date().toLocaleString()}</p>

    <table>

    <tr>

    <th>Product</th>

    <th>Size</th>

    <th>Qty</th>

    <th>Price</th>

    <th>Total</th>

    </tr>
    `;

    let grand = 0;

    cart.forEach(item => {

        let total = item.qty * item.price;

        grand += total;

        html += `
        <tr>

        <td>${item.name}</td>

        <td>${item.size}</td>

        <td>${item.qty}</td>

        <td>${item.price}</td>

        <td>${total}</td>

        </tr>
        `;
    });

    html += `
    </table>

    <h2>Total : ₹${grand}</h2>

    </body>

    </html>
    `;

    let win = window.open("", "_blank");

    win.document.write(html);

    win.document.close();

    win.print();

}


// ---------------------
// Keyboard Shortcuts
// ---------------------
document.addEventListener("keydown", function(e){

    if(e.key==="F2"){

        e.preventDefault();

        saveBill();

    }

    if(e.key==="F4"){

        e.preventDefault();

        printBill();

    }

    if(e.key==="Escape"){

        clearBilling();

    }

});


// ---------------------
// Auto Focus
// ---------------------
window.onload = function(){

    updateClock();

    updateDateTime();

    document.getElementById("sku").focus();

};


// ---------------------
// Barcode Enter Event
// ---------------------
document.getElementById("sku")
.addEventListener("keydown", searchSKU);
