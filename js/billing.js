// =======================================
// Retail Nanban POS
// billing.js - Part 1
// =======================================

// --------------------
// Global Variables
// --------------------

let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];


// --------------------
// Live Clock
// --------------------

function updateClock(){

    const clock=document.getElementById("clock");

    if(!clock) return;

    clock.innerText=new Date().toLocaleTimeString("en-IN");
}

setInterval(updateClock,1000);
updateClock();


// --------------------
// Live Date Time
// --------------------

function updateDateTime(){

    const live=document.getElementById("liveTime");

    if(!live) return;

    live.innerText=new Date().toLocaleString("en-IN",{
        day:"2-digit",
        month:"short",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"
    });

}

setInterval(updateDateTime,1000);
updateDateTime();


// --------------------
// Barcode Search
// --------------------

function searchSKU(event){

    if(event.key !== "Enter") return;

    const barcode = document.getElementById("sku").value.trim().toUpperCase();

    if(barcode.length !== 6){
        return;
    }

    const styleNo = barcode.substring(0,5);
    const sizeCode = barcode.substring(5);

    const sizeMap = {
        "1":"S",
        "2":"M",
        "3":"L",
        "4":"XL",
        "5":"XXL"
    };

    const selectedSize = sizeMap[sizeCode];

    const product = products.find(p => p.styleNo === styleNo);

    if(!product){
        alert("Product Not Found");
        document.getElementById("sku").value = "";
        return;
    }

    if(product.sizes[selectedSize] <= 0){
        alert(selectedSize + " Size Out Of Stock");
        document.getElementById("sku").value = "";
        return;
    }

    addItem(product, selectedSize);

}

    document.getElementById("size").value=selectedSize;

    document.getElementById("qty").value=1;

   // Auto Add To Cart
addItem();

// Ready for Next Scan
document.getElementById("sku").value="";
document.getElementById("qty").value=1;
document.getElementById("sku").focus();

}


// --------------------
// Barcode Event
// --------------------

document
.getElementById("sku")
.addEventListener("keydown",searchSKU);

// =======================================
// Add Item
// =======================================

function addItem(product, size){

    const existing = cart.find(item =>
        item.styleNo === product.styleNo &&
        item.size === size
    );

    if(existing){

        existing.qty++;

    }else{

        cart.push({
            styleNo: product.styleNo,
            name: product.name,
            image: product.image,
            size: size,
            qty: 1,
            price: Number(product.price)
        });

    }

    renderCart();

    document.getElementById("sku").value = "";
    document.getElementById("qty").value = 1;
    document.getElementById("size").value = size;
    document.getElementById("sku").focus();

}

// =======================================
// Increase Quantity
// =======================================

function increase(index){

    cart[index].qty++;

    renderCart();

}


// =======================================
// Decrease Quantity
// =======================================

function decrease(index){

    if(cart[index].qty > 1){

        cart[index].qty--;

    }

    renderCart();

}


// =======================================
// Delete Item
// =======================================

function del(index){

    if(confirm("Remove this item?")){

        cart.splice(index,1);

        renderCart();

    }

}

// =======================================
// Render Cart
// =======================================

function renderCart(){

    const cartBox = document.getElementById("cart");

    cartBox.innerHTML = "";

    let subtotal = 0;
    let totalQty = 0;

    if(cart.length === 0){

        cartBox.innerHTML = `
            <div class="empty-cart">
                🛒 Cart is Empty
            </div>
        `;

        document.getElementById("items").innerText = "0";
        document.getElementById("sub").innerText = "₹0";
        document.getElementById("grand").innerText = "₹0";

        return;
    }

    cart.forEach((item,index)=>{

        const total = item.qty * item.price;

        subtotal += total;
        totalQty += item.qty;

        cartBox.innerHTML += `

        <div class="cart-item">

            <div class="cart-left">

                <h3>${item.name}</h3>

                <p>Style : ${item.styleNo}</p>

                <p>Size : <b>${item.size}</b></p>

                <p>Price : ₹${item.price}</p>

                <div class="qty-box">

                    <button onclick="decrease(${index})">−</button>

                    <span>${item.qty}</span>

                    <button onclick="increase(${index})">+</button>

                </div>

            </div>

            <div class="cart-right">

                <div class="cart-price">

                    ₹${total}

                </div>

                <button
                    class="delete-btn"
                    onclick="del(${index})">

                    🗑 Delete

                </button>

            </div>

        </div>

        `;

    });

    document.getElementById("items").innerText = totalQty;

    document.getElementById("sub").innerText = "₹" + subtotal;

    document.getElementById("grand").innerText = "₹" + subtotal;

}

// =======================================
// Save Bill
// =======================================

function saveBill(){

    if(cart.length===0){

        alert("Cart is Empty");

        return;

    }

    const orders=JSON.parse(localStorage.getItem("orders")) || [];

    const billNo="RN"+String(orders.length+1).padStart(6,"0");

    const order={

        billNo:billNo,

        customer:document.getElementById("custName").value.trim(),

        phone:document.getElementById("custPhone").value.trim(),

        payment:document.getElementById("payment").value,

        date:new Date().toLocaleString("en-IN"),

        items:[...cart],

        grandTotal:cart.reduce((sum,item)=>sum+(item.qty*item.price),0)

    };

    orders.push(order);

    localStorage.setItem("orders",JSON.stringify(orders));

    updateStock();

    alert("✅ Bill Saved\n\nBill No : "+billNo);

    clearBilling();

}


// =======================================
// Update Product Stock
// =======================================

function updateStock(){

    let productList=JSON.parse(localStorage.getItem("products")) || [];

    cart.forEach(item=>{

        let product=productList.find(p=>p.styleNo===item.styleNo);

        if(product && product.sizes){

            product.sizes[item.size]-=item.qty;

            if(product.sizes[item.size]<0){

                product.sizes[item.size]=0;

            }

            product.stock=

                (product.sizes.S||0)+
                (product.sizes.M||0)+
                (product.sizes.L||0)+
                (product.sizes.XL||0)+
                (product.sizes.XXL||0);

        }

    });

    localStorage.setItem("products",JSON.stringify(productList));

    products=productList;

}


// =======================================
// Clear Billing Screen
// =======================================

function clearBilling(){

    cart = [];

    renderCart();

    document.getElementById("custName").value = "";
    document.getElementById("custPhone").value = "";

    document.getElementById("sku").value = "";
    document.getElementById("qty").value = 1;
    document.getElementById("size").selectedIndex = 0;

    document.getElementById("sku").focus();

}

// =======================================
// Print Bill
// =======================================

function printBill(){

    if(cart.length===0){

        alert("Cart is Empty");

        return;

    }

    let grandTotal=0;

    let rows="";

    cart.forEach(item=>{

        const total=item.qty*item.price;

        grandTotal+=total;

        rows+=`
        <tr>
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${item.qty}</td>
            <td>₹${item.price}</td>
            <td>₹${total}</td>
        </tr>
        `;

    });

    const customer=document.getElementById("custName").value || "Walk-in Customer";
    const phone=document.getElementById("custPhone").value || "-";

    const html=`

    <html>

    <head>

    <title>Retail Nanban Invoice</title>

    <style>

    body{
        font-family:Arial,sans-serif;
        padding:20px;
    }

    h2,h3{
        text-align:center;
        margin:5px;
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

    .total{
        text-align:right;
        font-size:22px;
        font-weight:bold;
        margin-top:20px;
    }

    </style>

    </head>

    <body>

    <h2>Retail Nanban</h2>

    <h3>Sales Invoice</h3>

    <p><b>Date :</b> ${new Date().toLocaleString("en-IN")}</p>

    <p><b>Customer :</b> ${customer}</p>

    <p><b>Phone :</b> ${phone}</p>

    <table>

    <tr>

        <th>Product</th>
        <th>Size</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Total</th>

    </tr>

    ${rows}

    </table>

    <div class="total">

    Grand Total : ₹${grandTotal}

    </div>

    <br>

    <center>

    Thank You ❤️ Visit Again

    </center>

    </body>

    </html>
    `;

    const win=window.open("","","width=800,height=700");

    win.document.write(html);

    win.document.close();

    win.focus();

    win.print();

}


// =======================================
// Keyboard Shortcuts
// =======================================

document.addEventListener("keydown",function(e){

    if(e.key==="F2"){

        e.preventDefault();

        saveBill();

    }

    if(e.key==="F4"){

        e.preventDefault();

        printBill();

    }

    if(e.key==="Escape"){

        e.preventDefault();

        clearBilling();

    }

});


// =======================================
// Initial Load
// =======================================

window.onload=function(){

    updateClock();

    updateDateTime();

    renderCart();

    document.getElementById("sku").focus();

};


