const STORAGE_CART_KEY = 'yemlux_cart';

function getCart() {
    const raw = localStorage.getItem(STORAGE_CART_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw); } catch { return []; }
}

function setCart(cart) {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
}

function renderCart() {
    const cartList = document.getElementById('cartList');
    const totalPrice = document.getElementById('totalPrice');
    cartList.innerHTML = '';
    const cart = getCart();

    if (!cart.length) {
        cartList.innerHTML = '<p>Your cart is empty.</p>';
        totalPrice.textContent = '0';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;

        const lineTotal = product.price * item.qty;
        total += lineTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        const imageSrc = product.img && product.img.length > 0 ? product.img[0] : 'img/placeholder.jpg';
        cartItem.innerHTML = `
            <img src="${imageSrc}" alt="${product.name}" class="item-image" />
            <div class="item-info">
                <strong>${product.name}</strong><br>
                <div>Category: ${product.categogy} | Color: ${product.color}<br></div>
                <div>Price: ₦${product.price} | In stock: ${product.quantity}<br></div>
                <div>Subtotal: ₦<span class="item-total">${lineTotal}</span></div>
            </div>
            <div class="item-actions">
                <input type="number" min="1" max="${product.quantity}" value="${item.qty}" class="qty-input" />
                <button class="btn remove">Remove</button>
            </div>
        `;

        const qtyInput = cartItem.querySelector('.qty-input');
        const removeBtn = cartItem.querySelector('.remove');

        qtyInput.addEventListener('change', () => {
            let newQty = Number(qtyInput.value);
            if (!newQty || newQty < 1) newQty = 1;
            if (newQty > product.quantity) {
                newQty = product.quantity;
                alert('Cannot exceed available stock');
            }
            qtyInput.value = newQty;

            item.qty = newQty;
            setCart(cart);
            renderCart();
        });

        removeBtn.addEventListener('click', () => {
            const index = cart.findIndex(x => x.id === item.id);
            if (index > -1) cart.splice(index, 1);
            setCart(cart);
            renderCart();
        });

        cartList.appendChild(cartItem);
    });

    totalPrice.textContent = total;
}

function checkout() {
    const cart = getCart();
    if (!cart.length) return alert('Your cart is empty.');

    const orderItems = [];
    let total = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        const qty = Math.min(item.qty, product.quantity);
        if (qty <= 0) return;

        orderItems.push({ name: product.name, qty, price: product.price });
        total += qty * product.price;
    });

    if (!orderItems.length) return alert('No valid cart products to checkout.');

    const lines = ['Hello, I want to checkout with these items:'];
    orderItems.forEach(i => lines.push(`${i.name} x${i.qty} @ ₦${i.price}`));
    lines.push(`Total: ₦${total}`);

    const waUrl = `https://wa.me/2349035898185?text=${encodeURIComponent(lines.join('\n'))}`;

    localStorage.removeItem(STORAGE_CART_KEY);
    renderCart();
    window.location.href = waUrl;
}

if (document.readyState !== 'loading') {
    renderCart();
    document.getElementById('checkoutBtn').addEventListener('click', checkout);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        renderCart();
        document.getElementById('checkoutBtn').addEventListener('click', checkout);
    });
}
