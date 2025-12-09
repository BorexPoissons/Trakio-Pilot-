/**
 * TRAKIO UI v5.0.0
 * Header unifié et composants UI partagés
 * Ce fichier injecte le header de navigation sur tous les modules
 */

// ============ NAVIGATION CONFIG ============
const TRAKIO_NAV = [
    { id: 'index', href: 'index.html', icon: '🏠', label: 'Dashboard', dividerAfter: true },
    { id: 'articles', href: 'articles.html', icon: '📦', label: 'Articles' },
    { id: 'clients', href: 'clients.html', icon: '👥', label: 'Clients' },
    { id: 'commandes', href: 'commandes.html', icon: '📋', label: 'Commandes' },
    { id: 'myfish', href: 'myfish.html', icon: '🐟', label: 'MyFish', dividerAfter: true },
    { id: 'caisse', href: 'caisse.html', icon: '💳', label: 'Caisse' },
    { id: 'live', href: 'live.html', icon: '📊', label: 'Cours' },
    { id: 'tracabilite', href: 'tracabilite.html', icon: '🏷️', label: 'Traçabilité', dividerAfter: true },
    { id: 'shopify', href: 'shopify.html', icon: '🛍️', label: 'Shop' },
    { id: 'compta', href: 'compta.html', icon: '💰', label: 'Compta' },
    { id: 'whatsapp', href: 'whatsapp.html', icon: '💬', label: 'WhatsApp' }
];

// ============ CSS STYLES ============
const TRAKIO_UI_STYLES = `
<style id="trakio-ui-styles">
    /* Import Font */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    :root {
        --trakio-bg-deep: #030712;
        --trakio-bg-primary: #0f172a;
        --trakio-bg-secondary: #1e293b;
        --trakio-bg-hover: #334155;
        --trakio-border: #334155;
        --trakio-text-primary: #f8fafc;
        --trakio-text-secondary: #94a3b8;
        --trakio-text-muted: #64748b;
        --trakio-accent-cyan: #06b6d4;
        --trakio-accent-teal: #14b8a6;
        --trakio-success: #10b981;
        --trakio-warning: #f59e0b;
        --trakio-danger: #ef4444;
        --trakio-gradient: linear-gradient(135deg, #06b6d4 0%, #14b8a6 50%, #10b981 100%);
    }

    body {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
        background: var(--trakio-bg-primary) !important;
        color: var(--trakio-text-primary) !important;
        margin: 0;
        padding: 0;
        padding-top: 70px;
    }

    /* Top Navigation */
    .trakio-nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: var(--trakio-bg-secondary);
        border-bottom: 1px solid var(--trakio-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        z-index: 10000;
    }

    .trakio-nav-left {
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .trakio-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: inherit;
    }

    .trakio-brand-logo {
        width: 40px;
        height: 40px;
        background: var(--trakio-gradient);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
    }

    .trakio-brand-title {
        font-size: 22px;
        font-weight: 800;
        background: var(--trakio-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .trakio-brand-version {
        font-size: 10px;
        padding: 2px 8px;
        background: rgba(6, 182, 212, 0.2);
        border-radius: 6px;
        color: var(--trakio-accent-cyan);
        font-weight: 600;
    }

    .trakio-menu-toggle {
        display: none;
        background: none;
        border: none;
        color: var(--trakio-text-primary);
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
    }

    .trakio-nav-menu {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .trakio-nav-link {
        padding: 8px 14px;
        border-radius: 8px;
        color: var(--trakio-text-secondary);
        text-decoration: none;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
    }

    .trakio-nav-link:hover {
        background: var(--trakio-bg-hover);
        color: var(--trakio-text-primary);
    }

    .trakio-nav-link.active {
        background: var(--trakio-accent-cyan);
        color: white;
    }

    .trakio-nav-divider {
        width: 1px;
        height: 24px;
        background: var(--trakio-border);
        margin: 0 8px;
    }

    .trakio-nav-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .trakio-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: var(--trakio-bg-hover);
        border-radius: 8px;
        font-size: 12px;
    }

    .trakio-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
    }

    .trakio-status-dot.online { background: var(--trakio-success); box-shadow: 0 0 8px var(--trakio-success); }
    .trakio-status-dot.offline { background: var(--trakio-danger); }
    .trakio-status-dot.syncing { background: var(--trakio-warning); animation: trakio-pulse 1.5s infinite; }

    @keyframes trakio-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    .trakio-user {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 12px;
        background: var(--trakio-bg-hover);
        border-radius: 10px;
        cursor: pointer;
    }

    .trakio-user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
        color: white;
    }

    .trakio-user-info {
        text-align: left;
    }

    .trakio-user-name {
        font-weight: 600;
        font-size: 13px;
    }

    .trakio-user-role {
        font-size: 10px;
        color: var(--trakio-text-muted);
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .trakio-role-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }

    .trakio-logout {
        padding: 8px 14px;
        background: transparent;
        border: 1px solid var(--trakio-border);
        border-radius: 8px;
        color: var(--trakio-text-secondary);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
    }

    .trakio-logout:hover {
        background: var(--trakio-danger);
        border-color: var(--trakio-danger);
        color: white;
    }

    /* Toast */
    .trakio-toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .trakio-toast {
        padding: 14px 20px;
        background: var(--trakio-bg-secondary);
        border: 1px solid var(--trakio-border);
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: trakio-toast-in 0.3s ease-out;
        min-width: 280px;
    }

    .trakio-toast.success { border-left: 4px solid var(--trakio-success); }
    .trakio-toast.error { border-left: 4px solid var(--trakio-danger); }
    .trakio-toast.warning { border-left: 4px solid var(--trakio-warning); }

    @keyframes trakio-toast-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    /* Responsive */
    @media (max-width: 1200px) {
        .trakio-nav-menu {
            display: none;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--trakio-bg-secondary);
            border-bottom: 1px solid var(--trakio-border);
            padding: 15px;
            flex-direction: column;
            align-items: stretch;
        }

        .trakio-nav-menu.open {
            display: flex;
        }

        .trakio-nav-link {
            padding: 12px 16px;
        }

        .trakio-nav-divider {
            height: 1px;
            width: 100%;
            margin: 8px 0;
        }

        .trakio-menu-toggle {
            display: block;
        }
    }

    @media (max-width: 768px) {
        .trakio-status { display: none; }
        .trakio-user-info { display: none; }
        .trakio-brand-title { font-size: 18px; }
        .trakio-brand-version { display: none; }
    }
</style>
`;

// ============ HEADER HTML GENERATOR ============
function generateTrakioHeader(currentPage = '') {
    const user = TrakioAuth ? TrakioAuth.getCurrentUser() : null;
    const roleConfig = user && TRAKIO_ROLES ? TRAKIO_ROLES[user.role] : null;

    const navLinks = TRAKIO_NAV.map(item => {
        const isActive = currentPage === item.id || 
            (currentPage === '' && item.id === 'index') ||
            window.location.pathname.includes(item.href);
        
        let html = `<a href="${item.href}" class="trakio-nav-link${isActive ? ' active' : ''}">
            <span>${item.icon}</span>
            <span>${item.label}</span>
        </a>`;
        
        if (item.dividerAfter) {
            html += '<div class="trakio-nav-divider"></div>';
        }
        
        return html;
    }).join('');

    return `
    <nav class="trakio-nav" id="trakioNav">
        <div class="trakio-nav-left">
            <a href="index.html" class="trakio-brand">
                <div class="trakio-brand-logo">🐟</div>
                <span class="trakio-brand-title">TRAKIO</span>
                <span class="trakio-brand-version">v${typeof TRAKIO_VERSION !== 'undefined' ? TRAKIO_VERSION : '5.0.0'}</span>
            </a>
            
            <button class="trakio-menu-toggle" id="trakioMenuToggle">☰</button>
            
            <div class="trakio-nav-menu" id="trakioNavMenu">
                ${navLinks}
            </div>
        </div>
        
        <div class="trakio-nav-right">
            <div class="trakio-status">
                <div class="trakio-status-dot" id="trakioStatusDot"></div>
                <span id="trakioStatusText">Connexion...</span>
            </div>
            
            ${user ? `
            <div class="trakio-user" id="trakioUser">
                <div class="trakio-user-avatar" style="background: ${user.color || '#0ea5e9'}">${user.avatar || 'U'}</div>
                <div class="trakio-user-info">
                    <div class="trakio-user-name">${user.name}</div>
                    <div class="trakio-user-role">
                        <span class="trakio-role-dot" style="background: ${roleConfig ? roleConfig.color : '#10b981'}"></span>
                        <span>${roleConfig ? roleConfig.label : 'User'}</span>
                    </div>
                </div>
            </div>
            
            <button class="trakio-logout" id="trakioLogout">Déconnexion</button>
            ` : `
            <a href="index.html" class="trakio-logout">Connexion</a>
            `}
        </div>
    </nav>
    
    <div class="trakio-toast-container" id="trakioToastContainer"></div>
    `;
}

// ============ INJECT HEADER ============
function injectTrakioHeader(currentPage = '') {
    // Check if user is logged in (except for index.html)
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                        window.location.pathname === '/' ||
                        window.location.pathname.endsWith('/');
    
    if (!isIndexPage && typeof TrakioAuth !== 'undefined' && !TrakioAuth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
    // Inject styles
    if (!document.getElementById('trakio-ui-styles')) {
        document.head.insertAdjacentHTML('beforeend', TRAKIO_UI_STYLES);
    }
    
    // Skip header injection for index.html (it has its own)
    if (isIndexPage) {
        return;
    }
    
    // Inject header at beginning of body
    if (!document.getElementById('trakioNav')) {
        document.body.insertAdjacentHTML('afterbegin', generateTrakioHeader(currentPage));
        
        // Initialize event listeners
        initTrakioNavEvents();
        
        // Update Firebase status
        updateTrakioStatus();
    }
}

// ============ EVENT LISTENERS ============
function initTrakioNavEvents() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('trakioMenuToggle');
    const navMenu = document.getElementById('trakioNavMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('trakioLogout');
    if (logoutBtn && typeof TrakioAuth !== 'undefined') {
        logoutBtn.addEventListener('click', () => {
            TrakioAuth.logout();
            window.location.href = 'index.html';
        });
    }
}

// ============ STATUS UPDATE ============
function updateTrakioStatus() {
    const statusDot = document.getElementById('trakioStatusDot');
    const statusText = document.getElementById('trakioStatusText');
    
    if (!statusDot || !statusText) return;
    
    if (typeof trakioFirebaseReady !== 'undefined' && trakioFirebaseReady && typeof trakioDb !== 'undefined') {
        // Try to ping Firebase
        trakioDb.collection('_health').doc('ping').get()
            .then(() => {
                statusDot.className = 'trakio-status-dot online';
                statusText.textContent = 'Connecté';
            })
            .catch(() => {
                statusDot.className = 'trakio-status-dot offline';
                statusText.textContent = 'Hors ligne';
            });
    } else {
        statusDot.className = 'trakio-status-dot offline';
        statusText.textContent = 'Local';
    }
}

// ============ TOAST NOTIFICATIONS ============
function showTrakioToast(message, type = 'success') {
    let container = document.getElementById('trakioToastContainer');
    if (!container) {
        document.body.insertAdjacentHTML('beforeend', '<div class="trakio-toast-container" id="trakioToastContainer"></div>');
        container = document.getElementById('trakioToastContainer');
    }
    
    const toast = document.createElement('div');
    toast.className = `trakio-toast ${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'trakio-toast-in 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ AUTO-INIT ============
document.addEventListener('DOMContentLoaded', () => {
    // Detect current page from filename
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    
    injectTrakioHeader(filename || 'index');
    
    // Refresh status every 30 seconds
    setInterval(updateTrakioStatus, 30000);
});

console.log('🐟 TRAKIO UI loaded');
