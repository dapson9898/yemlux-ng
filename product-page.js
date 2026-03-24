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
        alert("Quantity must be positive");
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
            alert("Total exceeds stock");
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
    const lines = ["Hello, I want to order:"];
    orderItems.forEach((i) => lines.push(`${i.name} x${i.qty} @ ₦${i.price}`));
    const total = orderItems.reduce((acc, i) => acc + i.price * i.qty, 0);
    lines.push(`Total: ₦${total}`);
    const text = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/2349035898185?text=${text}`;
}

function grabQueryParam(key) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
}

function initSingleProduct() {
    const productId = grabQueryParam("id");
    if (!productId) {
        document.getElementById("productDetail").innerText =
            "Product ID is missing.";
        return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) {
        document.getElementById("productDetail").innerText =
            "Product not found.";
        return;
    }

    const outOfStock = !product.enabled || product.quantity === 0;
    const node = document.getElementById("productDetail");

    // Generate slideshow HTML
    let slideshowHTML = '<div class="slideshow-container">';
    slideshowHTML += '<div class="slideshow">';
    product.img.forEach((imgSrc, index) => {
        slideshowHTML += `<img src="${imgSrc}" class="slide ${index === 0 ? "active" : ""}" alt="${product.name} - Image ${index + 1}" />`;
    });
    slideshowHTML += "</div>";
    slideshowHTML += '<button class="prev">❮</button>';
    slideshowHTML += '<button class="next">❯</button>';
    slideshowHTML += '<div class="dots">';
    product.img.forEach((_, index) => {
        slideshowHTML += `<span class="dot ${index === 0 ? "active" : ""}" data-slide="${index}"></span>`;
    });
    slideshowHTML += "</div></div>";

    node.innerHTML = `
        <div class="product-detail-content">
            <div class="product-layout">
                <div class="product-images">
                    ${slideshowHTML}
                </div>
                <div class="product-info-section">
                    <h2>${product.name}</h2>
                    <div class="product-meta">
                        <span class="category">${product.categogy}</span>
                        <span class="color">${product.color}</span>
                        <span class="price">₦${product.price}</span>
                        <span class="stock">Available: ${product.quantity}</span>
                    </div>
                    <p class="description">${product.description}</p>
                    ${product.trending ? '<span class="trending-badge">Trending</span>' : ""}
                    ${outOfStock ? '<p class="out-of-stock-note">Out of Stock</p>' : ""}
                    <div class="quantity-control">
                        <label for="detailQty">Quantity</label>
                        <input id="detailQty" type="number" min="1" step="1" value="1" ${outOfStock ? "disabled" : ""} max="${product.quantity}" />
                    </div>
                    <div class="button-group">
                        <button class="btn-add" id="btnAdd" ${outOfStock ? "disabled" : ""}>Add to Cart</button>
                        <button class="btn-order" id="btnOrder" ${outOfStock ? "disabled" : ""}>Order Now</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize slideshow
    initSlideshow(product.img.length);

    if (!outOfStock) {
        const qtyField = document.getElementById("detailQty");
        document.getElementById("btnAdd").addEventListener("click", () => {
            const qty = Number(qtyField.value);
            if (!qty || qty < 1) return alert("Enter a valid quantity.");
            if (qty > product.quantity)
                return alert("Requested quantity exceeds stock.");
            addToCart(product.id, qty);
        });

        document.getElementById("btnOrder").addEventListener("click", () => {
            const qty = Number(qtyField.value);
            if (!qty || qty < 1) return alert("Enter a valid quantity.");
            if (qty > product.quantity)
                return alert("Requested quantity exceeds stock.");
            window.location.href = buildWhatsApp([
                {
                    id: product.id,
                    name: product.name,
                    qty,
                    price: product.price,
                },
            ]);
        });
    }
}

function initSlideshow(totalSlides) {
    let currentSlide = 0;
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");

    function showSlide(index) {
        slides.forEach((slide) => slide.classList.remove("active"));
        dots.forEach((dot) => dot.classList.remove("active"));
        slides[index].classList.add("active");
        dots[index].classList.add("active");
        currentSlide = index;
    }

    prevBtn.addEventListener("click", () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    });

    nextBtn.addEventListener("click", () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => showSlide(index));
    });
}

if (document.readyState !== "loading") {
    initSingleProduct();
} else {
    document.addEventListener("DOMContentLoaded", initSingleProduct);
}
