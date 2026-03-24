const STORAGE_CART_KEY = "yemlux_cart";

function getCart() {
    const raw = localStorage.getItem(STORAGE_CART_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function setCart(cart) {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, qty) {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    qty = Number(qty);
    if (qty <= 0) {
        alert("Input quantity must be positive");
        return;
    }
    if (qty > prod.quantity) {
        alert("Cannot add more than available stock");
        return;
    }

    const cart = getCart();
    const item = cart.find((c) => c.id === productId);
    if (item) {
        const newQty = item.qty + qty;
        if (newQty > prod.quantity) {
            alert("Total requested quantity exceeds stock");
            return;
        }
        item.qty = newQty;
    } else {
        cart.push({ id: productId, qty });
    }
    setCart(cart);
    alert("Added to cart");
}

function buildWhatsApp(orderItems) {
    const lines = ["Hello, I want to place an order:"];
    orderItems.forEach((i) =>
        lines.push(`${i.name} (x${i.qty}) at ₦${i.price} each`),
    );
    const total = orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);
    lines.push(`Total: ₦${total}`);
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/2349035898185?text=${text}`;
}

function renderProductCard(prod, container) {
    const outOfStock = !prod.enabled || prod.quantity === 0;
    const card = document.createElement("div");
    card.className = "product-card" + (outOfStock ? " out-of-stock" : "");

    card.innerHTML = `
        <img src="${prod.img[0]}" alt="${prod.name}" style="width:100%; height:200px; object-fit:cover; border-radius:8px 8px 0 0;" />
        <h3><a class="product-detail-link" href="product.html?id=${encodeURIComponent(prod.id)}">${prod.name}</a></h3>
        <div class="meta">Color: ${prod.color}</div>
        <div class="meta">Price: ₦${prod.price}</div>
        <div class="meta">Available: ${prod.quantity}</div>
        <div class="quantity-control">
            <label>Qty:</label>
            <input type="number" min="1" max="${prod.quantity}" value="1" ${outOfStock ? "disabled" : ""} />
        </div>
        <div class="actions">
            <button class="add-btn" ${outOfStock ? "disabled" : ""}>Add to Cart</button>
            <button class="order-btn" ${outOfStock ? "disabled" : ""}>Order Now</button>
        </div>
    `;

    const quantityInput = card.querySelector("input");
    const addBtn = card.querySelector(".add-btn");
    const orderBtn = card.querySelector(".order-btn");

    addBtn.addEventListener("click", () => {
        const qty = Number(quantityInput.value);
        if (isNaN(qty) || qty < 1) return alert("Enter a valid quantity");
        if (qty > prod.quantity)
            return alert("Cannot add more than available stock");
        addToCart(prod.id, qty);
    });

    orderBtn.addEventListener("click", () => {
        const qty = Number(quantityInput.value);
        if (isNaN(qty) || qty < 1) return alert("Enter a valid quantity");
        if (qty > prod.quantity)
            return alert("Cannot order more than available stock");
        const url = buildWhatsApp([
            { id: prod.id, name: prod.name, qty, price: prod.price },
        ]);
        window.location.href = url;
    });

    container.appendChild(card);
}

function renderTrending(filtered) {
    const trending = filtered.filter((p) => p.trending);
    const trendingContainer = document.getElementById("trendingContainer");
    trendingContainer.innerHTML = "";
    if (trending.length === 0) {
        trendingContainer.textContent = "No trending products at the moment.";
        return;
    }
    trending.forEach((p) => renderProductCard(p, trendingContainer));
}

function renderAll(filtered) {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";
    if (filtered.length === 0) {
        container.textContent = "No products found.";
        return;
    }
    filtered.forEach((p) => renderProductCard(p, container));
}

function normalize(str) {
    if (!str) return "";
    return str.toString().toLowerCase();
}

function applyFilters() {
    const searchValue = normalize(document.getElementById("searchInput").value);
    const selectedCategory = document.querySelector("#filterButtons .active")
        .dataset.cat;

    let filtered = products.slice();

    if (selectedCategory !== "all") {
        filtered = filtered.filter(
            (p) => normalize(p.categogy) === normalize(selectedCategory),
        );
    }

    if (searchValue) {
        filtered = filtered.filter((p) => {
            const combined = `${p.name} ${p.description} ${p.color} ${p.categogy}`;
            return normalize(combined).includes(searchValue);
        });
    }

    renderTrending(filtered);
    renderAll(filtered);
}

function initProductPage() {
    const buttons = document.querySelectorAll("#filterButtons button");
    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            applyFilters();
        });
    });
    document
        .getElementById("searchInput")
        .addEventListener("input", applyFilters);
    applyFilters();
}

if (document.readyState !== "loading") {
    initProductPage();
} else {
    document.addEventListener("DOMContentLoaded", initProductPage);
}
