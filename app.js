// REPLACE with your NEW deployment URL ending in /exec
const API_URL = "https://script.google.com/macros/s/AKfycbxUUKYCpl8n57sAfQd2pM8hcQq04gaQq0fzz2rA2WeYMBlGMbxN8ffUX0jIiFinReUoMQ/exec";

let productsList = [];
let cart = JSON.parse(localStorage.getItem('ecom_cart')) || [];

// --- CART LOGIC ---
function saveCart() {
  localStorage.setItem('ecom_cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const countEls = document.querySelectorAll('.cart-count');
  const totalEls = document.querySelectorAll('.cart-total');
  const itemsEl = document.getElementById('cart-items');
  const checkoutBtn = document.getElementById('checkout-btn');

  let totalQty = 0;
  let totalPrice = 0;
  
  if (itemsEl) itemsEl.innerHTML = '';

  if (cart.length === 0) {
    if (itemsEl) itemsEl.innerHTML = '<p class="text-gray-400 text-center mt-10 font-inter">Your cart is empty.</p>';
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    cart.forEach((item, index) => {
      totalQty += item.qty;
      totalPrice += item.price * item.qty;
      
      if (itemsEl) {
        itemsEl.innerHTML += `
          <div class="flex justify-between items-center border-b border-gray-700 py-4 font-inter">
            <div>
              <h4 class="font-bold text-sm text-white">${item.name}</h4>
              ${item.isPreorder ? '<span class="text-xs text-yellow-500 font-bold">Pre-Order</span>' : ''}
              <p class="text-sm text-gray-400">$${item.price.toFixed(2)} x ${item.qty}</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="changeQty(${index}, -1)" class="w-7 h-7 bg-gray-700 text-white rounded flex items-center justify-center font-bold hover:bg-gray-600">-</button>
              <span class="text-white w-4 text-center">${item.qty}</span>
              <button onclick="changeQty(${index}, 1)" class="w-7 h-7 bg-gray-700 text-white rounded flex items-center justify-center font-bold hover:bg-gray-600">+</button>
              <button onclick="removeItem(${index})" class="text-red-500 ml-2 hover:text-red-400 font-bold material-symbols-outlined">delete</button>
            </div>
          </div>
        `;
      }
    });
  }

  countEls.forEach(el => el.innerText = totalQty);
  totalEls.forEach(el => el.innerText = totalPrice.toFixed(2));
}

function addToCart(productId) {
  const prod = productsList.find(p => p.id == productId);
  if (!prod) return;

  const isPreorder = prod.stock <= 0;
  const existing = cart.find(item => item.id == productId);

  if (!isPreorder && existing && existing.qty + 1 > prod.stock) {
    alert(`Cannot add more. Only ${prod.stock} items available in stock.`);
    return;
  }

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: prod.id,
      name: prod.name,
      price: parseFloat(prod.price),
      stock: prod.stock,
      qty: 1,
      isPreorder: isPreorder
    });
  }

  saveCart();
  toggleCart();
}

function changeQty(index, delta) {
  const item = cart[index];
  if (delta > 0 && !item.isPreorder && item.qty + 1 > item.stock) {
    alert(`Maximum stock reached (${item.stock} available).`);
    return;
  }
  item.qty += delta;
  if (item.qty <= 0) cart.splice(index, 1);
  saveCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}

// --- UI TOGGLES ---
function toggleCart() {
  const slider = document.getElementById('cart-slider');
  const overlay = document.getElementById('cart-overlay');
  if (slider.classList.contains('translate-x-full')) {
    slider.classList.remove('translate-x-full');
    if(overlay) overlay.classList.remove('hidden');
  } else {
    slider.classList.add('translate-x-full');
    if(overlay) overlay.classList.add('hidden');
  }
}

// --- DATA FETCHING WITH CORS FIX ---
async function fetchProducts() {
  const grid = document.getElementById('product-grid');
  const singleProductContainer = document.getElementById('single-product-container');
  
  try {
    const res = await fetch(API_URL, {
      method: 'GET',
      redirect: 'follow'
    });
    
    const data = await res.json();
    
    if (data.success) {
      productsList = data.products || [];
      
      if (grid) renderProductGrid(grid);
      if (singleProductContainer) renderSingleProduct(singleProductContainer);
    } else {
      console.error("API Error:", data.error);
    }
  } catch (err) {
    console.error("Failed to load products:", err);
    if (grid) grid.innerHTML = '<p class="text-red-500 col-span-full text-center">Failed to load products. Check the console for errors.</p>';
  }
}

function renderProductGrid(grid) {
  grid.innerHTML = '';
  productsList.forEach(p => {
    const isAvailable = p.stock > 0;
    grid.innerHTML += `
      <div class="bg-surface rounded-xl overflow-hidden shadow-lg border border-gray-800 flex flex-col group">
        <a href="product.html?id=${p.id}" class="relative block overflow-hidden">
          <img src="${p.image || 'https://via.placeholder.com/300'}" alt="${p.name}" class="w-full h-56 object-cover transform group-hover:scale-105 transition duration-500">
          ${!isAvailable ? '<span class="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">Pre-Order</span>' : ''}
        </a>
        <div class="p-5 flex flex-col flex-grow">
          <a href="product.html?id=${p.id}"><h3 class="font-display text-lg font-bold text-white mb-2 hover:text-primary transition">${p.name}</h3></a>
          <p class="font-inter text-gray-400 text-sm flex-grow">High-quality geek gear.</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-primary font-bold text-xl">$${p.price.toFixed(2)}</span>
            <button onclick="addToCart('${p.id}')" class="bg-primary hover:bg-emerald-400 text-surface p-2 rounded-full transition">
              <span class="material-symbols-outlined">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function renderSingleProduct(container) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const p = productsList.find(item => item.id == productId);
  
  if (!p) {
    container.innerHTML = `<h2 class="text-white text-2xl">Product not found.</h2>`;
    return;
  }
  
  const isAvailable = p.stock > 0;
  
  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <img src="${p.image || 'https://via.placeholder.com/500'}" alt="${p.name}" class="w-full rounded-xl shadow-lg border border-gray-800">
      </div>
      <div class="flex flex-col justify-center">
        <h1 class="font-display text-4xl font-bold text-white mb-4">${p.name}</h1>
        <p class="text-3xl text-primary font-bold mb-6">$${p.price.toFixed(2)}</p>
        <p class="text-gray-400 font-inter mb-6">Exclusive merchandise for true geeks. Premium materials, durable build, and striking aesthetics designed to stand out.</p>
        
        <div class="mb-8">
          <span class="font-inter font-semibold ${isAvailable ? 'text-green-500' : 'text-yellow-500'}">
            ${isAvailable ? `<span class="material-symbols-outlined align-middle mr-1">check_circle</span> In Stock (${p.stock} available)` : `<span class="material-symbols-outlined align-middle mr-1">schedule</span> Out of Stock - Pre-order available`}
          </span>
        </div>
        
        <button onclick="addToCart('${p.id}')" class="w-full bg-primary hover:bg-emerald-400 text-surface py-4 rounded-lg font-bold text-lg transition flex justify-center items-center gap-2">
          <span class="material-symbols-outlined">shopping_bag</span>
          ${isAvailable ? 'Add to Cart' : 'Pre-Order Now'}
        </button>
      </div>
    </div>
  `;
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
  fetchProducts();
});
