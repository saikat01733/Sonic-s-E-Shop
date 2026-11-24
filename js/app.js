/**
 * Sonic's E-Shop - Core Application Logic
 * Khela Store Architecture & Dynamic UI Engine
 */

// Application State
let currentSelectedGameId = "efootball";
let selectedPackages = []; // Array of package objects
let currentPaymentMethod = "bKash";
let currentDevice = "Android";
let userWalletBalance = 0.00;
let appliedCoupon = null;

// Persistent Orders Storage (localStorage)
function getStoredOrders() {
    try {
        const raw = localStorage.getItem('sonic_orders');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveOrder(order) {
    const orders = getStoredOrders();
    orders.unshift(order);
    localStorage.setItem('sonic_orders', JSON.stringify(orders));
    return order;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderGameCatalogGrid();
    selectGame(currentSelectedGameId, false, false);
    renderOrders();
    initNoticeTicker();
    triggerFramerEntranceAnimations();
});

// ============================================================
// 1. THEME SWITCHING (DARK / LIGHT)
// ============================================================
function initTheme() {
    const saved = localStorage.getItem('sonic_theme') || 'dark';
    const icon = document.getElementById('themeIcon');
    if (saved === 'light') {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
        if (icon) {
            icon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zM7.05 18.01l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.02-.39-1.41 0z"/>';
        }
    } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
        if (icon) {
            icon.innerHTML = '<path d="M12.3 2a10 10 0 0 0 9.7 12.8 10 10 0 1 1-11.8-12.7c.7 0 1.4.1 2.1.2z"/>';
        }
    }
}

function toggleThemeMode() {
    const isLight = document.documentElement.classList.contains('light-theme');
    const icon = document.getElementById('themeIcon');
    if (isLight) {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('sonic_theme', 'dark');
        if (icon) {
            icon.innerHTML = '<path d="M12.3 2a10 10 0 0 0 9.7 12.8 10 10 0 1 1-11.8-12.7c.7 0 1.4.1 2.1.2z"/>';
        }
    } else {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
        localStorage.setItem('sonic_theme', 'light');
        if (icon) {
            icon.innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-12.37c-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.38.39-1.02 0-1.41zM7.05 18.01l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06c.39-.39.39-1.03 0-1.41s-1.02-.39-1.41 0z"/>';
        }
    }
}

// Notice Ticker
function initNoticeTicker() {
    const ticker = document.getElementById('announcementText');
    if (ticker) {
        ticker.innerHTML = `⚡ ডেলিভারি সময় ১-১০ মিনিট • ১০০% নিরাপদ টপ-আপ গ্যারান্টি • bKash ও Nagad পার্সোনাল সেন্ড মানি • যেকোনো সমস্যায় WhatsApp: 01733185830`;
    }
}

// ============================================================
// 2. KHELA STORE GAME CATALOG & CATEGORY FILTERING
// ============================================================
function renderGameCatalogGrid(filterCategory = 'all') {
    const grid = document.getElementById('gameCatalogGrid');
    if (!grid) return;

    let games = GAME_CATALOG;
    if (filterCategory !== 'all') {
        games = GAME_CATALOG.filter(g => g.category === filterCategory);
    }

    grid.innerHTML = games.map(game => `
        <div class="game-card ${game.id === currentSelectedGameId ? 'active' : ''}" onclick="selectGame('${game.id}', true)">
            <div class="game-card-poster">
                <img src="${game.poster}" alt="${game.name}" loading="lazy" onerror="this.src='banner.jpg'">
                <span class="game-card-badge" style="background: ${game.badge_color};">${game.badge}</span>
                
                <!-- Interactive Glassmorphic Details Overlay on Hover -->
                <div class="game-card-hover-overlay">
                    <div class="hover-overlay-top">
                        <span class="hover-badge" style="background: ${game.badge_color};">${game.badge}</span>
                        <span style="font-size: 10px; color: var(--success-green); font-weight: 700;">🟢 ১০০% নিরাপদ</span>
                    </div>
                    <div class="hover-details-list">
                        <div class="hover-detail-row">
                            <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            <span><strong>ডেলিভারি:</strong> ${game.delivery_time}</span>
                        </div>
                        <div class="hover-detail-row">
                            <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                            <span><strong>মেথড:</strong> ${game.product_type === 'login_purchase' ? 'Konami ID লগইন' : (game.id === 'roblox' ? 'রোব্লক্স ইউজারনেম' : 'সরাসরি Player UID')}</span>
                        </div>
                        <div class="hover-detail-row">
                            <svg viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 8.76 15.38 12 17 10.83 14.92 8H20v6z"/></svg>
                            <span><strong>প্যাকেজ:</strong> ${game.packages.length} টি ভ্যারিয়েন্ট</span>
                        </div>
                    </div>
                    <div class="hover-action-btn">
                        <span>টপ-আপ করতে ক্লিক করুন</span>
                        <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            </div>
            <div class="game-card-info">
                <span class="game-card-cat">${game.category_name}</span>
                <h4 class="game-card-title">${game.name}</h4>
                <div class="game-card-meta">
                    <span class="game-card-speed">⚡ ${game.delivery_time}</span>
                    <button class="game-card-btn">${game.id === currentSelectedGameId ? 'নির্বাচিত ✓' : 'টপ-আপ করুন'}</button>
                </div>
            </div>
        </div>
    `).join('');

    initMagneticCardTilt();
}

function filterCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    if (btn) {
        btn.classList.add('active');
        if (window.Motion) {
            window.Motion.animate(btn, { scale: [1, 0.92, 1.05, 1] }, { duration: 0.28, easing: window.Motion.spring({ stiffness: 220, damping: 15 }) });
        }
    }
    renderGameCatalogGrid(cat);
    if (window.Motion) {
        window.Motion.animate('#gameCatalogGrid .game-card', 
            { opacity: [0, 1], scale: [0.94, 1], y: [16, 0] }, 
            { delay: window.Motion.stagger(0.06), easing: window.Motion.spring({ stiffness: 140, damping: 15 }) }
        );
    }
}

// ============================================================
// 3. DYNAMIC GAME SELECTION & STEP RENDERING
// ============================================================
function selectGame(gameId, scrollToView = false, triggerAnimation = true) {
    const game = GAME_CATALOG.find(g => g.id === gameId);
    if (!game) return;

    currentSelectedGameId = gameId;
    selectedPackages = []; // Reset selected packages
    appliedCoupon = null;

    // Highlight game card in grid
    renderGameCatalogGrid();

    // Update Game Header Banner in Top-Up Container
    const titleEl = document.getElementById('selectedGameTitle');
    const badgeEl = document.getElementById('selectedGameBadge');
    const descEl = document.getElementById('selectedGameDesc');
    const trustEl = document.getElementById('selectedGameTrust');

    if (titleEl) titleEl.innerText = game.name;
    if (badgeEl) {
        badgeEl.innerText = game.badge;
        badgeEl.style.background = game.badge_color;
    }
    if (descEl) descEl.innerText = game.description;
    if (trustEl) trustEl.innerText = game.trust_tag;

    // Render Dynamic Step 1 Fields (UID vs Login)
    renderStep1Fields(game);

    // Render Dynamic Step 2 Packages
    renderStep2Packages(game);

    // Update Price
    updateTotalPrice();

    if (triggerAnimation && window.Motion) {
        const topUpBox = document.getElementById('gameTopUpSection');
        if (topUpBox) {
            window.Motion.animate(topUpBox, 
                { opacity: [0.75, 1], y: [14, 0] }, 
                { duration: 0.35, easing: window.Motion.spring({ stiffness: 150, damping: 16 }) }
            );
        }
        window.Motion.animate('#pkgGrid .pkg-card', 
            { opacity: [0, 1], scale: [0.95, 1], y: [12, 0] }, 
            { delay: window.Motion.stagger(0.035), easing: window.Motion.spring({ stiffness: 160, damping: 16 }) }
        );
    }

    if (scrollToView) {
        const topUpBox = document.getElementById('gameTopUpSection');
        if (topUpBox) {
            topUpBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Render Dynamic Step 1 Fields based on game.product_type
function renderStep1Fields(game) {
    const container = document.getElementById('dynamicStep1Container');
    if (!container) return;

    let html = '';

    // Security Reassurance
    html += `
        <div class="security-banner">
            <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            <span>${game.product_type === 'login_purchase' 
                ? 'আপনার কনমি আইডি তথ্য সম্পূর্ণ এনক্রিপ্টেড এবং কেবল এই অর্ডারের জন্য ব্যবহৃত হবে।' 
                : 'কোনো পাসওয়ার্ড প্রয়োজন নেই! শুধুমাত্র সঠিক Player ID / Username দিন।'}</span>
        </div>
    `;

    game.custom_fields.forEach(field => {
        if (field.type === 'device_selector') {
            html += `
                <div class="form-group">
                    <label>${field.label_bn || field.label}</label>
                    <input type="hidden" id="device" value="${currentDevice}">
                    <div class="device-selector-container">
                        ${field.options.map(opt => `
                            <div class="device-card ${opt.id === currentDevice ? 'active' : ''}" onclick="selectDevice(this, '${opt.id}')">
                                <div class="device-icon" style="color: ${opt.color};">
                                    ${opt.icon === 'android' 
                                        ? '<svg viewBox="0 0 24 24"><path d="M17.6 9.48l1.84-3.18c.16-.28.06-.64-.22-.8-.28-.16-.64-.06-.8.22l-1.87 3.24c-1.24-.54-2.62-.84-4.05-.84s-2.81.3-4.05.84L7.68 5.72c-.16-.28-.52-.38-.8-.22-.28.16-.38.52-.22.8l1.84 3.18C6.5 10.95 5.3 12.83 5 15h14c-.3-2.17-1.5-4.05-3.4-5.52zM9 13.25c-.69 0-1.25-.56-1.25-1.25S8.31 10.75 9 10.75s1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm6 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zM5 17h14v2H5z"/></svg>'
                                        : '<svg viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 5.09c.62-.75 1.04-1.79.93-2.83-.92.04-2.03.62-2.69 1.37-.58.67-1.1 1.74-.96 2.77 1.03.08 2.1-.51 2.72-1.31z"/></svg>'
                                    }
                                </div>
                                <div class="device-info">
                                    <span class="device-name">${opt.name}</span>
                                    <span class="device-sub">${opt.sub}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="form-group">
                    <label>${field.label_bn || field.label} ${field.required ? '<span style="color: var(--accent-red)">*</span>' : ''}</label>
                    <input type="${field.type}" id="${field.id}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

function selectDevice(el, deviceName) {
    currentDevice = deviceName;
    const hidden = document.getElementById('device');
    if (hidden) hidden.value = deviceName;
    document.querySelectorAll('.device-card').forEach(c => c.classList.remove('active'));
    if (el) el.classList.add('active');
}

// Render Dynamic Step 2 Packages
function renderStep2Packages(game) {
    const grid = document.getElementById('pkgGrid');
    if (!grid) return;

    grid.innerHTML = game.packages.map(pkg => `
        <div class="pkg-card ${!pkg.stock ? 'out-of-stock' : ''} ${selectedPackages.some(p => p.id === pkg.id) ? 'active' : ''}" 
             onclick="${pkg.stock ? `togglePackageCard(this, '${pkg.id}', '${pkg.name}', ${pkg.price})` : `showGlassAlert('Out of Stock', 'এই প্যাকেজটি বর্তমানে স্টকে নেই!')`}">
            <div>
                <div class="pkg-header-row">
                    <span class="pkg-icon">${pkg.icon || '🪙'}</span>
                    ${pkg.badge ? `<span class="pkg-badge-pill">${pkg.badge}</span>` : ''}
                </div>
                <div class="pkg-name">${pkg.name}</div>
                <div class="pkg-price">${pkg.price ? '৳' + pkg.price : '৳***'}</div>
            </div>
            <div class="pkg-stock" style="color: ${pkg.stock ? 'var(--success-green)' : '#ef4444'}">
                ${pkg.stock ? '🟢 In Stock' : '🔴 Out of Stock'}
            </div>
        </div>
    `).join('');
}

// Toggle Package Selection
function togglePackageCard(el, id, name, price) {
    el.classList.add('soft-press');
    setTimeout(() => el.classList.remove('soft-press'), 300);

    if (window.Motion) {
        window.Motion.animate(el, 
            { scale: [1, 0.93, 1.05, 1] }, 
            { duration: 0.32, easing: window.Motion.spring({ stiffness: 260, damping: 15 }) }
        );
    }

    const index = selectedPackages.findIndex(p => p.id === id);
    if (index > -1) {
        selectedPackages.splice(index, 1);
        el.classList.remove('active');
    } else {
        selectedPackages.push({ id, name, price });
        el.classList.add('active');
    }

    updateTotalPrice();
}

// Update Total Price Display
function updateTotalPrice() {
    let subtotal = selectedPackages.reduce((sum, p) => sum + p.price, 0);
    let total = subtotal;

    if (appliedCoupon && appliedCoupon.discount) {
        total = Math.max(0, total - appliedCoupon.discount);
    }

    const display = document.getElementById('totalDisplay');
    if (display) {
        display.innerHTML = `মোট মূল্য: <span>৳${total}</span> ${appliedCoupon ? `<small style="color: var(--success-green); font-size: 11px;">(কুপন ছাড় ৳${appliedCoupon.discount})</small>` : ''}`;
    }

    const countDisplay = document.getElementById('selectedPkgCount');
    if (countDisplay) {
        countDisplay.innerText = `${selectedPackages.length} টি প্যাকেজ সিলেক্টেড`;
    }
}

// Filter Packages Live Search (Inside Step 2 on Home tab)
function filterPackagesLive(query) {
    const q = (query || '').toLowerCase().trim();
    const cards = document.querySelectorAll('#pkgGrid .pkg-card');
    cards.forEach(card => {
        const name = card.querySelector('.pkg-name')?.innerText.toLowerCase() || '';
        const price = card.querySelector('.pkg-price')?.innerText.toLowerCase() || '';
        if (!q || name.includes(q) || price.includes(q)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterPackages() {
    const input = document.getElementById('pkgSearchInput');
    handleGlobalSearch(input ? input.value : '');
}

// ============================================================
// 4. KHELA STORE GLOBAL LIVE SEARCH & AUTO-SUGGEST
// ============================================================
function handleGlobalSearch(rawQuery) {
    const dropdown = document.getElementById('searchResultsDropdown');
    const clearBtn = document.getElementById('searchClearBtn');
    if (!dropdown) return;

    const query = (rawQuery || '').trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

    // Also filter step 2 package cards if currently viewing
    filterPackagesLive(query);

    if (!query) {
        // Show Popular Searches / Quick Suggestions
        dropdown.innerHTML = `
            <div class="search-dropdown-header">
                <span>🔥 জনপ্রিয় গেম ও প্যাকেজ</span>
            </div>
            <div class="search-suggestions-grid">
                ${GAME_CATALOG.map(g => `
                    <div class="search-quick-game" onclick="selectGameFromSearch('${g.id}')">
                        <img src="${g.poster}" alt="${g.name}">
                        <div>
                            <div class="quick-game-name">${g.name}</div>
                            <div class="quick-game-badge" style="color: ${g.badge_color};">${g.badge} • ⚡ ${g.delivery_time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="search-tags-label">দ্রুত সার্চ করুন:</div>
            <div class="search-tags-row">
                <span class="search-tag" onclick="quickFillSearch('PUBG')">PUBG Mobile</span>
                <span class="search-tag" onclick="quickFillSearch('eFootball')">eFootball</span>
                <span class="search-tag" onclick="quickFillSearch('Roblox')">Roblox</span>
                <span class="search-tag" onclick="quickFillSearch('660 UC')">660 UC</span>
                <span class="search-tag" onclick="quickFillSearch('300 Coins')">300 Coins</span>
            </div>
        `;
        dropdown.classList.add('active');
        return;
    }

    // 1. Search Matching Games
    const matchedGames = GAME_CATALOG.filter(g => 
        g.name.toLowerCase().includes(query) ||
        (g.name_bn && g.name_bn.toLowerCase().includes(query)) ||
        g.category.toLowerCase().includes(query) ||
        g.category_name.toLowerCase().includes(query) ||
        (g.description && g.description.toLowerCase().includes(query))
    );

    // 2. Search Matching Packages across all games
    const matchedPackages = [];
    GAME_CATALOG.forEach(game => {
        game.packages.forEach(pkg => {
            const pkgName = pkg.name.toLowerCase();
            const gameName = game.name.toLowerCase();
            const combined = `${pkgName} ${gameName}`;
            if (pkgName.includes(query) || combined.includes(query) || (pkg.price && String(pkg.price).includes(query))) {
                matchedPackages.push({ game, pkg });
            }
        });
    });

    if (matchedGames.length === 0 && matchedPackages.length === 0) {
        dropdown.innerHTML = `
            <div class="search-empty-state">
                <div class="search-empty-icon">🔍</div>
                <div class="search-empty-title">কোনো ফলাফল পাওয়া যায়নি</div>
                <div class="search-empty-desc">"${escapeHtml(rawQuery)}" দিয়ে কোনো গেম বা প্যাকেজ পাওয়া যায়নি।</div>
                <div class="search-tags-label">জনপ্রিয় সার্চ:</div>
                <div class="search-tags-row">
                    <span class="search-tag" onclick="quickFillSearch('PUBG')">PUBG Mobile</span>
                    <span class="search-tag" onclick="quickFillSearch('eFootball')">eFootball</span>
                    <span class="search-tag" onclick="quickFillSearch('Roblox')">Roblox</span>
                </div>
            </div>
        `;
        dropdown.classList.add('active');
        return;
    }

    let html = '';

    // Render Matching Games
    if (matchedGames.length > 0) {
        html += `
            <div class="search-dropdown-header">
                <span>🎮 গেমসমূহ (${matchedGames.length})</span>
            </div>
            <div class="search-items-list">
                ${matchedGames.map(game => `
                    <div class="search-result-item" onclick="selectGameFromSearch('${game.id}')">
                        <img src="${game.poster}" class="search-result-thumb" alt="${game.name}">
                        <div class="search-result-info">
                            <div class="search-result-title">${highlightMatch(game.name, query)}</div>
                            <div class="search-result-meta">
                                <span class="search-result-badge" style="background: ${game.badge_color};">${game.badge}</span>
                                <span class="search-result-speed">⚡ ${game.delivery_time}</span>
                            </div>
                        </div>
                        <button class="search-action-btn" onclick="event.stopPropagation(); selectGameFromSearch('${game.id}')">টপ-আপ করুন</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Render Matching Packages
    if (matchedPackages.length > 0) {
        html += `
            <div class="search-dropdown-header" style="${matchedGames.length > 0 ? 'margin-top: 10px; border-top: 1px solid var(--glass-border); padding-top: 8px;' : ''}">
                <span>📦 প্যাকেজসমূহ (${matchedPackages.length})</span>
            </div>
            <div class="search-items-list">
                ${matchedPackages.slice(0, 8).map(({ game, pkg }) => `
                    <div class="search-result-item" onclick="selectPackageFromSearch('${game.id}', '${pkg.id}', '${pkg.name}', ${pkg.price || 0})">
                        <div class="search-pkg-icon">${pkg.icon || '🪙'}</div>
                        <div class="search-result-info">
                            <div class="search-result-title">${highlightMatch(pkg.name, query)} <span class="search-pkg-game-badge">• ${game.name}</span></div>
                            <div class="search-result-meta">
                                <span class="search-result-price">${pkg.price ? '৳' + pkg.price : '৳***'}</span>
                                <span class="search-result-stock" style="color: ${pkg.stock ? 'var(--success-green)' : '#ef4444'}">${pkg.stock ? '🟢 In Stock' : '🔴 Out of Stock'}</span>
                            </div>
                        </div>
                        <button class="search-action-btn" onclick="event.stopPropagation(); selectPackageFromSearch('${game.id}', '${pkg.id}', '${pkg.name}', ${pkg.price || 0})">${pkg.stock ? 'সিলেক্ট' : 'স্টক শেষ'}</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    dropdown.innerHTML = html;
    dropdown.classList.add('active');
}

function selectGameFromSearch(gameId) {
    switchTabDirect('tab-home');
    selectGame(gameId, true, true);
    closeGlobalSearch();
}

function selectPackageFromSearch(gameId, pkgId, pkgName, pkgPrice) {
    switchTabDirect('tab-home');
    selectGame(gameId, false, false);
    
    // Auto-select this package
    const pkgEl = document.querySelector(`#pkgGrid .pkg-card[onclick*="${pkgId}"]`);
    if (pkgEl) {
        togglePackageCard(pkgEl, pkgId, pkgName, pkgPrice);
    } else {
        selectedPackages = [{ id: pkgId, name: pkgName, price: pkgPrice }];
        updateTotalPrice();
        const game = GAME_CATALOG.find(g => g.id === gameId);
        if (game) renderStep2Packages(game);
    }
    
    closeGlobalSearch();
    const topUpSection = document.getElementById('gameTopUpSection');
    if (topUpSection) {
        topUpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function quickFillSearch(term) {
    const input = document.getElementById('pkgSearchInput');
    if (input) {
        input.value = term;
        input.focus();
        handleGlobalSearch(term);
    }
}

function clearGlobalSearch() {
    const input = document.getElementById('pkgSearchInput');
    if (input) {
        input.value = '';
        input.focus();
    }
    handleGlobalSearch('');
}

function closeGlobalSearch() {
    const dropdown = document.getElementById('searchResultsDropdown');
    if (dropdown) dropdown.classList.remove('active');
}

function highlightMatch(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeHtml(str) {
    return (str || '').replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
}

// ============================================================
// 4. PAYMENT METHODS & COPY HELPERS
// ============================================================
function selectPay(el, method) {
    currentPaymentMethod = method;
    document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
    if (el) {
        el.classList.add('active');
        if (window.Motion) {
            window.Motion.animate(el, 
                { scale: [1, 0.94, 1.04, 1] }, 
                { duration: 0.28, easing: window.Motion.spring({ stiffness: 240, damping: 15 }) }
            );
        }
    }

    const box = document.getElementById('payInstructionBox');
    const nameSpan = document.getElementById('payMethodName');
    const numSpan = document.getElementById('payNumber');

    if (box && nameSpan && numSpan) {
        box.style.display = 'flex';
        nameSpan.innerText = method;
        numSpan.innerText = "01733185830";
    }
}

function copyNumber() {
    const num = "01733185830";
    executeClipboardCopy(num);
    showGlassToast("নম্বর কপি হয়েছে!", `পার্সোনাল সেন্ড মানি নম্বর (${num}) ক্লিপবোর্ডে কপি করা হয়েছে!`, { icon: '📋', duration: 3000 });
}

function copyPromoCode(code) {
    copyAndApplyPromoCode(null, code);
}

// ============================================================
// 5. CHECKOUT & ORDER CREATION (KHELA STORE ORDER ENGINE)
// ============================================================
function orderNow() {
    if (selectedPackages.length === 0) {
        showGlassAlert("প্যাকেজ নির্বাচন করুন", "অনুগ্রহ করে কমপক্ষে একটি প্যাকেজ সিলেক্ট করুন!");
        return;
    }

    const game = GAME_CATALOG.find(g => g.id === currentSelectedGameId);
    if (!game) return;

    // Validate dynamic fields
    const collectedData = {};
    for (const field of game.custom_fields) {
        if (field.type === 'device_selector') {
            collectedData[field.id] = currentDevice;
        } else {
            const input = document.getElementById(field.id);
            const val = input ? input.value.trim() : '';
            if (field.required && !val) {
                showGlassAlert("তথ্য প্রয়োজন", `অনুগ্রহ করে '${field.label_bn || field.label}' পূরণ করুন!`);
                if (input) input.focus();
                return;
            }
            collectedData[field.id] = val;
        }
    }

    const lastDigitInput = document.getElementById('lastDigit');
    const lastDigits = lastDigitInput ? lastDigitInput.value.trim() : '';
    if (!lastDigits) {
        showGlassAlert("পেমেন্ট তথ্য", `অনুগ্রহ করে আপনার ${currentPaymentMethod} একাউন্টের শেষ ৪ ডিজিট অথবা TrxID দিন!`);
        if (lastDigitInput) lastDigitInput.focus();
        return;
    }

    // Launch Delivery Truck Animation
    const btn = document.getElementById('truckOrderBtn');
    if (btn) btn.classList.add('animating');

    setTimeout(() => {
        const orderId = 'SONIC-' + Math.floor(100000 + Math.random() * 900000);
        const subtotal = selectedPackages.reduce((s, p) => s + p.price, 0);
        const finalPrice = appliedCoupon ? Math.max(0, subtotal - appliedCoupon.discount) : subtotal;

        const orderObj = {
            id: orderId,
            gameId: game.id,
            gameName: game.name,
            packages: [...selectedPackages],
            totalAmount: finalPrice,
            paymentMethod: currentPaymentMethod,
            senderLastDigits: lastDigits,
            customData: collectedData,
            status: "Pending",
            date: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };

        saveOrder(orderObj);
        renderOrders();

        if (btn) btn.classList.remove('animating');

        // Reset selected inputs
        selectedPackages = [];
        updateTotalPrice();
        document.querySelectorAll('#pkgGrid .pkg-card').forEach(c => c.classList.remove('active'));
        if (lastDigitInput) lastDigitInput.value = '';

        // Show Invoice & Success Receipt
        viewInvoice(orderId);

        // Instant WhatsApp dispatch to Admin
        promptAdminWhatsAppDispatch(orderObj);

    }, 2200);
}

// Generate Instant WhatsApp Message to Admin
function promptAdminWhatsAppDispatch(order) {
    const pkgList = order.packages.map(p => p.name).join(', ');
    const msg = `⚡ *নতুন অর্ডার:* ${order.id}\n🎮 *গেম:* ${order.gameName}\n📦 *প্যাকেজ:* ${pkgList}\n💰 *মোট টাকা:* ৳${order.totalAmount}\n💳 *পেমেন্ট:* ${order.paymentMethod} (শেষ ৪ সংখ্যা: ${order.senderLastDigits})\n📱 *হোয়াটসঅ্যাপ:* ${order.customData.whatsapp || 'N/A'}`;
    const url = `https://wa.me/8801733185830?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}

// ============================================================
// 6. ORDER TRACKING & DIGITAL INVOICES
// ============================================================
function renderOrders() {
    const container = document.getElementById('ordersListContainer');
    if (!container) return;

    const orders = getStoredOrders();
    if (orders.length === 0) {
        container.innerHTML = `<div class="empty-orders">কোনো অর্ডার করা হয়নি!</div>`;
        return;
    }

    container.innerHTML = orders.map(ord => `
        <div class="order-card-item">
            <div class="order-card-header">
                <div>
                    <span class="order-id-badge">${ord.id}</span>
                    <span class="order-game-tag">${ord.gameName}</span>
                </div>
                <span class="order-status-badge status-${ord.status.toLowerCase()}">${ord.status === 'Pending' ? 'পেন্ডিং ⏳' : ord.status}</span>
            </div>
            <div class="order-card-body">
                <div><b>প্যাকেজ:</b> ${ord.packages.map(p => p.name).join(', ')}</div>
                <div><b>মূল্য:</b> ৳${ord.totalAmount} (${ord.paymentMethod})</div>
                <div class="order-date-text">📅 ${ord.date}</div>
            </div>
            <div class="order-card-actions">
                <button class="invoice-btn" onclick="viewInvoice('${ord.id}')">রসিদ / ইনভয়েস দেখুন</button>
            </div>
        </div>
    `).join('');
}

function viewInvoice(orderId) {
    const orders = getStoredOrders();
    const ord = orders.find(o => o.id === orderId);
    if (!ord) return;

    const modal = document.getElementById('invoiceModal');
    const content = document.getElementById('invoiceModalDetails') || document.getElementById('invoiceDetailsContent');
    if (!modal || !content) return;

    content.innerHTML = `
        <div class="receipt-box">
            <div class="receipt-header">
                <img src="logo.png" alt="Sonic Logo" style="height: 30px; margin: 0 auto 6px auto;" onerror="this.src='logo.jpg'">
                <h4>Sonic’s E-Shop Official Receipt</h4>
                <div class="receipt-order-id">Order ID: <b>${ord.id}</b></div>
                <div class="receipt-date">${ord.date}</div>
            </div>
            
            <div class="receipt-divider"></div>

            <div class="receipt-row">
                <span>গেম:</span>
                <b>${ord.gameName}</b>
            </div>
            <div class="receipt-row">
                <span>প্যাকেজ:</span>
                <b>${ord.packages.map(p => p.name).join(', ')}</b>
            </div>
            <div class="receipt-row">
                <span>পেমেন্ট মেথড:</span>
                <b>${ord.paymentMethod} (শেষ ৪ সংখ্যা: ${ord.senderLastDigits})</b>
            </div>
            <div class="receipt-row">
                <span>স্ট্যাটাস:</span>
                <b style="color: var(--accent-red);">${ord.status} (১-১০ মিনিট প্রসেসিং)</b>
            </div>

            <div class="receipt-divider"></div>

            <div class="receipt-row receipt-total">
                <span>সর্বমোট পরিশোধিত:</span>
                <span style="color: var(--success-green); font-size: 17px; font-weight: 800;">৳${ord.totalAmount}</span>
            </div>

            <div class="receipt-footer">
                <p>যেকোনো সহায়তায় আমাদের সাথে যোগাযোগ করুন:</p>
                <a href="https://wa.me/8801733185830?text=I%20have%20an%20order%20issue%20with%20${ord.id}" target="_blank" class="whatsapp-support-pill">
                    💬 WhatsApp Support: 01733185830
                </a>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function toggleInvoiceModal() {
    const modal = document.getElementById('invoiceModal');
    if (modal) modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

// Live Order Lookup Search (Khela Store Track Order)
function lookupOrder() {
    const input = document.getElementById('orderSearchInput');
    const query = input ? input.value.trim().toUpperCase() : '';
    if (!query) {
        showGlassAlert("অর্ডার ট্র্যাকিং", "অনুগ্রহ করে Order ID লিখুন!");
        return;
    }

    const orders = getStoredOrders();
    const found = orders.find(o => o.id.toUpperCase() === query || (o.customData && o.customData.whatsapp && o.customData.whatsapp.includes(query)));

    if (found) {
        viewInvoice(found.id);
    } else {
        showGlassAlert("অর্ডার পাওয়া যায়নি", `Order ID '${query}' খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি লিখুন।`);
    }
}

// ============================================================
// 7. WALLET & COUPON ENGINE
// ============================================================
function applyCouponCode() {
    const input = document.getElementById('couponInput');
    const code = input ? input.value.trim().toUpperCase() : '';
    if (!code) {
        showGlassAlert("কুপন কোড", "অনুগ্রহ করে একটি কুপন কোড লিখুন!");
        return;
    }

    const validCoupons = {
        'SONIC10': { discount: 10, min: 100 },
        'EFOOTBALL': { discount: 20, min: 300 },
        'KHELA': { discount: 15, min: 200 }
    };

    if (validCoupons[code]) {
        appliedCoupon = { code, ...validCoupons[code] };
        showGlassToast("কুপন সফল!", `'${code}' কুপন সক্রিয় করা হয়েছে! আপনি ৳${appliedCoupon.discount} ছাড় পেয়েছেন।`, { icon: '🎉', duration: 3500 });
        updateTotalPrice();
    } else {
        showGlassAlert("অবৈধ কুপন", "এই কুপন কোডটি সঠিক নয় অথবা মেয়াদ শেষ!");
    }
}

// ============================================================
// 7.1 FLOATING GLASS TOAST & COUPON ONE-CLICK ENGINE
// ============================================================
let toastTimeout = null;
function showGlassToast(title, message, options = {}) {
    let toast = document.getElementById('glassToastContainer');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'glassToastContainer';
        toast.className = 'glass-toast-container';
        document.body.appendChild(toast);
    }

    const icon = options.icon || '🎟️';
    const actionHtml = options.actionText 
        ? `<button class="toast-action-btn" onclick="${options.actionClick}">${options.actionText}</button>` 
        : '';

    toast.innerHTML = `
        <div class="glass-toast-content">
            <div class="toast-icon">${icon}</div>
            <div class="toast-text-box">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            ${actionHtml}
            <button class="toast-close-btn" onclick="hideGlassToast()">&times;</button>
        </div>
        <div class="toast-progress-bar"></div>
    `;

    toast.classList.add('active');

    if (window.Motion) {
        window.Motion.animate(toast, 
            { opacity: [0, 1], y: [-20, 0], scale: [0.95, 1] }, 
            { duration: 0.35, easing: window.Motion.spring({ stiffness: 220, damping: 16 }) }
        );
    }

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        hideGlassToast();
    }, options.duration || 3500);
}

function hideGlassToast() {
    const toast = document.getElementById('glassToastContainer');
    if (!toast) return;
    if (window.Motion) {
        window.Motion.animate(toast, 
            { opacity: [1, 0], y: [0, -15], scale: [1, 0.95] }, 
            { duration: 0.25 }
        ).finished.then(() => toast.classList.remove('active'));
    } else {
        toast.classList.remove('active');
    }
}

function executeClipboardCopy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(() => {
            return fallbackClipboardCopy(text);
        });
    }
    return Promise.resolve(fallbackClipboardCopy(text));
}

function fallbackClipboardCopy(text) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
    } catch (e) {
        return false;
    }
}

function copyAndApplyPromoCode(btn, code, discount = 10, minSpend = 100) {
    executeClipboardCopy(code);

    // Auto-fill into the promo code input in checkout section
    const input = document.getElementById('couponInput');
    if (input) input.value = code;

    // Auto-apply into application state
    appliedCoupon = { code, discount, min: minSpend };
    updateTotalPrice();

    // Professional button visual transformation
    if (btn) {
        btn.classList.add('copied');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
            <svg class="copy-svg check-icon" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="btn-text">✓ কপি হয়েছে!</span>
        `;

        if (window.Motion) {
            window.Motion.animate(btn, { scale: [1, 0.92, 1.08, 1] }, { duration: 0.32, easing: window.Motion.spring({ stiffness: 260, damping: 15 }) });
        }

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHtml;
        }, 2500);
    }

    // Show floating non-intrusive glass toast notification
    showGlassToast(
        `কুপন '${code}' সফলভাবে কপি হয়েছে!`, 
        `৳${discount} ছাড় আপনার চেকআউট বক্সে স্বয়ংক্রিয়ভাবে বসানো হয়েছে।`, 
        {
            icon: '🎟️',
            actionText: 'হোম শপে যান →',
            actionClick: 'switchTabDirect("tab-home"); document.getElementById("gameTopUpSection")?.scrollIntoView({behavior: "smooth", block: "start"}); hideGlassToast();',
            duration: 4000
        }
    );
}

// ============================================================
// 8. NAVIGATION, MODALS & DIALOGS
// ============================================================
function switchTab(btn, tabId) {
    document.querySelectorAll('.dock-item').forEach(b => {
        b.classList.remove('active');
        b.classList.remove('magnify-pop');
    });
    if (btn) {
        btn.classList.add('active');
        btn.classList.add('magnify-pop');
        setTimeout(() => btn.classList.remove('magnify-pop'), 450);
    }

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active-tab');
        if (window.Motion) {
            window.Motion.animate(target, 
                { opacity: [0, 1], y: [18, 0], scale: [0.985, 1] }, 
                { duration: 0.35, easing: window.Motion.spring({ stiffness: 140, damping: 16 }) }
            );
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function switchTabDirect(tabId) {
    const dockBtn = document.getElementById('dock-' + tabId);
    switchTab(dockBtn, tabId);
    const overlay = document.getElementById('sideDrawerOverlay');
    if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
    }
}

function toggleSideDrawer() {
    const overlay = document.getElementById('sideDrawerOverlay');
    if (overlay) overlay.classList.toggle('active');
}

function toggleContactModal() {
    const modal = document.getElementById('contactModal');
    if (modal) modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

function showGlassAlert(title, message) {
    const overlay = document.getElementById('glassAlertOverlay') || document.getElementById('glassOverlay');
    const titleEl = document.getElementById('glassAlertTitle') || document.getElementById('glassTitle');
    const msgEl = document.getElementById('glassAlertMessage') || document.getElementById('glassMessage');

    if (overlay && titleEl && msgEl) {
        titleEl.innerText = title;
        msgEl.innerText = message;
        overlay.classList.add('active');
    } else {
        alert(`${title}: ${message}`);
    }
}

function hideGlassAlert() {
    const overlay = document.getElementById('glassAlertOverlay') || document.getElementById('glassOverlay');
    if (overlay) overlay.classList.remove('active');
}

function toggleLampLight() {
    const pullStr = document.getElementById('pullString');
    const lampCont = document.getElementById('lampContainer');
    if (pullStr) pullStr.classList.add('pulled');
    setTimeout(() => {
        if (pullStr) pullStr.classList.remove('pulled');
        if (lampCont) {
            lampCont.classList.toggle('light-on');
            lampCont.classList.toggle('lit');
        }
    }, 200);
}

function switchAuthMode(mode) {
    const emailSec = document.getElementById('emailAuthSection');
    const phoneSec = document.getElementById('phoneAuthSection');
    const emailBtn = document.getElementById('emailTabBtn');
    const phoneBtn = document.getElementById('phoneTabBtn');

    if (mode === 'email') {
        if (emailSec) emailSec.style.display = 'block';
        if (phoneSec) phoneSec.style.display = 'none';
        if (emailBtn) emailBtn.classList.add('active');
        if (phoneBtn) phoneBtn.classList.remove('active');
    } else {
        if (emailSec) emailSec.style.display = 'none';
        if (phoneSec) phoneSec.style.display = 'block';
        if (emailBtn) emailBtn.classList.remove('active');
        if (phoneBtn) phoneBtn.classList.add('active');
    }
}

function navigateToAuthTab() {
    switchTabDirect('tab-account');
}

// Global modal & search dropdown outside-click listener
window.addEventListener('click', function(event) {
    const contactModal = document.getElementById('contactModal');
    const invoiceModal = document.getElementById('invoiceModal');
    if (event.target === contactModal) { contactModal.style.display = 'none'; }
    if (event.target === invoiceModal) { invoiceModal.style.display = 'none'; }

    const searchBox = document.getElementById('globalSearchBox');
    if (searchBox && !searchBox.contains(event.target)) {
        closeGlobalSearch();
    }
});

// Escape key listener to close search dropdown & toast
window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeGlobalSearch();
        hideGlassToast();
    }
});

// Soft-press button micro-interaction
document.addEventListener('click', function(e) {
    const target = e.target.closest('button, .pkg-card, .pay-method, .dock-item, .social-btn, .contact-float-btn, .game-card, .cat-pill');
    if (target) {
        target.classList.add('soft-press');
        setTimeout(() => target.classList.remove('soft-press'), 300);
    }
});

// ============================================================
// 9. FRAMER MOTION ENGINE & 3D MAGNETIC INTERACTIONS
// ============================================================
function initMagneticCardTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.perspective = '1000px';

        card.onmousemove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;
        };

        card.onmouseleave = () => {
            if (window.Motion) {
                window.Motion.animate(card, 
                    { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)' }, 
                    { duration: 0.4, easing: window.Motion.spring({ stiffness: 180, damping: 16 }) }
                );
            } else {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            }
        };
    });
}

function triggerFramerEntranceAnimations() {
    if (window.Motion) {
        const { animate, stagger, spring } = window.Motion;

        // 1. Top Navbar entrance
        animate('.top-navbar', 
            { opacity: [0, 1], y: [-24, 0] }, 
            { duration: 0.55, easing: spring({ stiffness: 120, damping: 15 }) }
        );

        // 2. Announcement ticker entrance
        animate('.announcement-bar', 
            { opacity: [0, 1], y: [-10, 0] }, 
            { delay: 0.05, duration: 0.45, easing: spring({ stiffness: 120, damping: 15 }) }
        );

        // 3. Hero Banner entrance
        animate('.hero-banner-container', 
            { opacity: [0, 1], scale: [0.95, 1], y: [20, 0] }, 
            { delay: 0.08, duration: 0.6, easing: spring({ stiffness: 110, damping: 14 }) }
        );

        // 4. Trust Badges staggered cascade
        animate('.trust-badge-card', 
            { opacity: [0, 1], y: [18, 0], scale: [0.96, 1] }, 
            { delay: stagger(0.06, { start: 0.16 }), easing: spring({ stiffness: 130, damping: 15 }) }
        );

        // 5. Section Header & Category Pills
        animate('.section-head-box, .cat-pills-scroll', 
            { opacity: [0, 1], y: [16, 0] }, 
            { delay: 0.26, duration: 0.45, easing: spring({ stiffness: 120, damping: 15 }) }
        );

        // 6. Game Catalog Cards staggered entrance
        animate('#gameCatalogGrid .game-card', 
            { opacity: [0, 1], y: [28, 0], scale: [0.94, 1] }, 
            { delay: stagger(0.08, { start: 0.32 }), easing: spring({ stiffness: 120, damping: 15 }) }
        );

        // 7. Top-Up Purchase Section
        animate('#gameTopUpSection', 
            { opacity: [0, 1], y: [24, 0] }, 
            { delay: 0.5, duration: 0.5, easing: spring({ stiffness: 110, damping: 15 }) }
        );

        // 8. Bottom Navigation Dock
        animate('.bottom-dock', 
            { opacity: [0, 1], y: [30, 0] }, 
            { delay: 0.4, duration: 0.55, easing: spring({ stiffness: 120, damping: 15 }) }
        );
    }
    initMagneticCardTilt();
}
