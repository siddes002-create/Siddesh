 let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];
 function searchSKU(event){

    if(event.key !== "Enter") return;

    let code = document.getElementById("sku").value.trim();

    let styleNo = code.slice(0,5);

    console.log("Products :", products);
    console.log("Style No :", styleNo);

    let sizeCode = code.slice(5);

    let sizeMap = {
        "1":"S",
        "2":"M",
        "3":"L",
        "4":"XL",
        "5":"XXL"
    };

    let product = products.find(p => p.styleNo === styleNo);

    if(!product){
        alert("Product Not Found");
        return;
    }

    document.getElementById("pname").value = product.name;
    document.getElementById("price").value = product.price;
    document.getElementById("size").value = sizeMap[sizeCode];
 let selectedSize = sizeMap[sizeCode];

if(product.sizes[selectedSize] <= 0){

    alert(selectedSize + " Size Out Of Stock");

    document.getElementById("sku").value = "";
    document.getElementById("sku").focus();

    return;

} 
  addItem();

document.getElementById("sku").value = "";

document.getElementById("sku").focus();
}
function addItem(){

let p=document.getElementById('pname').value;

let q=parseInt(document.getElementById('qty').value)||1;

let r=parseFloat(document.getElementById('price').value)||0;

let s=document.getElementById('size').value;

if(!p||r<=0){

alert("Enter product and price");

return;

}

let existingItem = cart.find(item =>
    item.name === p &&
    item.size === s
);

if(existingItem){

    existingItem.qty += q;

}else{

    cart.push({
        name:p,
        size:s,
        qty:q,
        price:r
    });

}

document.getElementById('pname').value="";
document.getElementById('price').value="";
document.getElementById('qty').value = 1;
document.getElementById('size').selectedIndex = 0; 

render();

}
function render(){
 let tb=document.getElementById('cart');
 tb.innerHTML="";
 let total=0;
 cart.forEach((i,n)=>{
   total+=i.qty*i.price;
   tb.innerHTML+=`<tr>
   <td>${i.name}</td>
   <td>${i.size}</td>
   <td>${i.qty}</td>
   <td>₹${i.price}</td>
   <td>₹${i.qty*i.price}</td>
   <td>
<button
onclick="del(${n})"
style="
background:red;
padding:8px 12px;
border-radius:6px;
">
🗑
</button>
</td>
   </tr>`;
 });
 document.getElementById("sub").innerText="₹"+total;
 document.getElementById("grand").innerText="₹"+total;
}
function del(i){cart.splice(i,1);render();}
function saveBill(){
 let orders=JSON.parse(localStorage.getItem("orders"))||[];
let billNo = "RN" + String(orders.length + 1).padStart(6,"0");
 orders.push({
  billNo: billNo,
   customer:document.getElementById("custName").value,
   phone:document.getElementById("custPhone").value,
   payment:document.getElementById("payment").value,
   status:"Pending",
   orderDate:new Date().toISOString(),
   items:cart
 });
 let products =
JSON.parse(localStorage.getItem("products")) || [];

cart.forEach(item => {

    let product = products.find(
        p => p.name === item.name
    );

    if(product){

        if(product.sizes && product.sizes[item.size] != null){

            product.sizes[item.size] -= item.qty;

            if(product.sizes[item.size] < 0){
                product.sizes[item.size] = 0;
            }

            product.stock =
                (product.sizes.S || 0) +
                (product.sizes.M || 0) +
                (product.sizes.L || 0) +
                (product.sizes.XL || 0) +
                (product.sizes.XXL || 0);

        }else{

            product.stock -= item.qty;

            if(product.stock < 0){
                product.stock = 0;
            }

        }

    }

});

localStorage.setItem(
    "products",
    JSON.stringify(products)
);
 localStorage.setItem("orders",JSON.stringify(orders));
 alert("Bill Saved Successfully");
 cart=[];render();
}
