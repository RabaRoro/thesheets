// Expanded Futuristic Product Database
const products = [
  {
    id: 1,
    name: "Cyber Lacer 2099",
    category: "Footwear",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
    description: "Self-lacing adaptive sneakers with customizable RGB soles and micro-tension motors. Adapts to your gait in real-time.",
    specs: ["Carbon-fiber weave", "Bluetooth 5.3", "48hr Battery", "Auto-tensioning"]
  },
  {
    id: 2,
    name: "Neuron Link V2",
    category: "Wearables",
    price: 499.00,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    description: "Direct-to-cortex audio interface. Experience sound without the need for traditional acoustic drivers.",
    specs: ["Zero latency", "Brainwave sync", "Titanium band", "Noise nullification"]
  },
  {
    id: 3,
    name: "Holo-HUD Smart Glasses",
    category: "Eyewear",
    price: 189.50,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800",
    description: "Augmented reality heads-up display. Project your digital life directly onto your retinas.",
    specs: ["4K Micro-OLED", "Gestural control", "UV400 Protection", "12hr Battery"]
  },
  {
    id: 4,
    name: "Quantum Deck Mini",
    category: "Cyberdecks",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800",
    description: "Portable hacking and coding deck. Features a split mechanical keyboard and holographic projection screen.",
    specs: ["16-Core Q-CPU", "Haptic keys", "Holo-emitter", "Military-grade encryption"]
  },
  {
    id: 5,
    name: "Exo-Gauntlet Pro",
    category: "Augmentations",
    price: 1250.00,
    image: "https://images.unsplash.com/photo-1614729939124-03290b0409fe?auto=format&fit=crop&q=80&w=800",
    description: "Pneumatic strength-enhancing arm brace. Increases lifting capacity by 400%.",
    specs: ["Hydraulic micro-pistons", "Neural interface", "Carbon-steel plating", "100kg lift assist"]
  },
  {
    id: 6,
    name: "Plasma Arc Lighter",
    category: "Accessories",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=800",
    description: "Windproof, butane-free dual plasma arc lighter with a transparent cyberpunk casing.",
    specs: ["USB-C Rechargeable", "Transparent shell", "Waterproof", "LED charge indicator"]
  }
];

let cart = JSON.parse(localStorage.getItem("geek_cart")) || [];

// UI toggles
function toggleCart() {
  document.getElementById("cart-slider").classList.toggle("translate-x-full");
  document.getElementById("cart-overlay").classList.toggle("hidden");
}

function updateCartUI() {
  localStorage.setItem("geek_cart", JSON.stringify(cart));
  
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach(b => b.textContent = totalCount);

  const cartContainer = document.getElementById("cart-items");
  if (cartContainer) {
    if (cart.length === 0) {
      cartContainer.innerHTML = `<p class="text-gray-500 font-mono text-center mt-10">SYS.MSG: CART IS EMPTY</p>`;
    } else {
      cartContainer.innerHTML = cart.map(item => `
        <div class="flex gap-4 p-3 border border-gray-800 bg-gray-900 rounded">
          <img src="${item.image}" class="w-16 h-16 object-cover border border-cyan-500/30" />
          <div class="flex-1">
            <h4 class="text-white font-bold text-sm truncate">${item.name}</h4>
            <p class="text-cyan-400 font-mono text-xs">$${item.price.toFixed(2)}</p>
            <div class="flex items-center gap-2 mt-2">
              <button onclick="changeQty(${item.id}, -1)" class="w-6 h-6 bg-gray-800 text-white hover:bg-cyan-500 hover:text-black">-</button>
              <span class="text-xs font-mono text-white">${item.quantity}</span>
              <button onclick="changeQty(${item.id}, 1)" class="w-6 h-6 bg-gray-800 text-white hover:bg-cyan-500 hover:text-black">+</button>
            </div>
          </div>
          <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-400">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      `).join("");
    }
  }

  const totalEl = document.getElementById("cart-total");
  if (totalEl) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalEl.textContent = `$${total.toFixed(2)}`;
  }
}

function addToCart(productId, qty = 1) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.quantity += qty;
  else cart.push({ ...product, quantity: qty });
  
  updateCartUI();
  toggleCart();
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.id !== productId);
    updateCartUI();
  }
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  updateCartUI();
}

// Render Grids
function renderGrid(targetId, limit = null) {
  const grid = document.getElementById(targetId);
  if (!grid) return;
  const items = limit ? products.slice(0, limit) : products;

  grid.innerHTML = items.map(p => `
    <div class="border border-gray-800 bg-gray-950/50 hover:border-cyan-500/50 transition-colors group flex flex-col relative overflow-hidden">
      <div class="absolute top-2 left-2 z-10 bg-black/80 border border-cyan-500/50 px-2 py-1 text-[10px] text-cyan-400 font-mono uppercase">${p.category}</div>
      <a href="product.html?id=${p.id}" class="h-48 overflow-hidden block">
        <img src="${p.image}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 mix-blend-luminosity hover:mix-blend-normal" />
      </a>
      <div class="p-4 flex flex-col flex-1 border-t border-gray-800">
        <a href="product.html?id=${p.id}" class="text-lg font-bold text-white hover:text-cyan-400 uppercase tracking-wider">${p.name}</a>
        <p class="text-cyan-500 font-mono text-lg mt-2 mb-4">$${p.price.toFixed(2)}</p>
        <button onclick="addToCart(${p.id})" class="mt-auto w-full border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-black font-mono text-xs py-2 uppercase tracking-widest transition-colors">
          Init [Add to Cart]
        </button>
      </div>
    </div>
  `).join("");
}

// Load Single Product Page
function loadProductPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  const product = products.find(p => p.id === productId);

  if (!product) {
    document.getElementById('product-container').innerHTML = '<p class="text-red-500 font-mono text-center">ERR: PRODUCT_NOT_FOUND</p>';
    return;
  }

  document.getElementById('p-image').src = product.image;
  document.getElementById('p-category').textContent = product.category;
  document.getElementById('p-name').textContent = product.name;
  document.getElementById('p-price').textContent = `$${product.price.toFixed(2)}`;
  document.getElementById('p-desc').textContent = product.description;
  
  document.getElementById('p-specs').innerHTML = product.specs.map(spec => 
    `<li class="text-gray-400 font-mono text-sm before:content-['>'] before:text-cyan-500 before:mr-2">${spec}</li>`
  ).join("");

  document.getElementById('p-add').onclick = () => {
    const qty = parseInt(document.getElementById('p-qty').value) || 1;
    addToCart(product.id, qty);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  renderGrid("product-grid");
  renderGrid("featured-grid", 3);
  if(window.location.pathname.includes('product.html')) loadProductPage();
  updateCartUI();
});