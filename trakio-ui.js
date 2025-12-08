/**
 * TRAKIO UI v4.3.0 - Header Unifié + Thème
 * Fichier à placer à la RACINE du projet
 */

const TrakioUI = {
    VERSION: '4.3.0',
    
    MODULES: [
        { id: 'dashboard', name: 'Dashboard', icon: '📊', url: 'index.html' },
        { id: 'articles', name: 'Articles', icon: '📦', url: 'articles.html' },
        { id: 'clients', name: 'Clients', icon: '👥', url: 'clients.html' },
        { id: 'commandes', name: 'Commandes', icon: '📋', url: 'commandes.html' },
        { id: 'myfish', name: 'MyFish', icon: '🛒', url: 'myfish.html' },
        { id: 'caisse', name: 'Caisse', icon: '💵', url: 'caisse.html' },
        { id: 'separator1', separator: true },
        { id: 'tracabilite', name: 'Traçabilité', icon: '🏷️', url: 'tracabilite.html' },
        { id: 'compta', name: 'Compta', icon: '📒', url: 'compta.html' },
        { id: 'shopify', name: 'Shop Hub', icon: '🛍️', url: 'shopify.html' },
        { id: 'parametres', name: 'Paramètres', icon: '⚙️', url: 'parametres.html' }
    ],

    currentModule: null,
    theme: 'dark',
    currentUser: null,

    init() {
        this.detectCurrentModule();
        this.loadTheme();
        this.loadUser();
        this.injectStyles();
        this.injectHeader();
        setTimeout(() => this.applyTheme(), 10);
        console.log(`🐟 TRAKIO UI v${this.VERSION} initialisé`);
    },

    detectCurrentModule() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        const module = this.MODULES.find(m => m.url === filename);
        this.currentModule = module ? module.id : 'dashboard';
    },

    loadTheme() {
        this.theme = localStorage.getItem('trakio_theme') || 'dark';
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.body.setAttribute('data-theme', this.theme);
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
            btn.title = this.theme === 'dark' ? 'Mode jour' : 'Mode nuit';
        }
    },

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('trakio_theme', this.theme);
        this.applyTheme();
        this.showToast(this.theme === 'dark' ? '🌙 Mode nuit' : '☀️ Mode jour');
    },

    showToast(msg) {
        const old = document.querySelector('.trakio-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'trakio-toast';
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.classList.add('show'), 10);
        setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2000);
    },

    loadUser() {
        const u = localStorage.getItem('trakio_current_user');
        if (u) { try { this.currentUser = JSON.parse(u); } catch(e) { this.currentUser = { name: u }; } }
        if (!this.currentUser) this.currentUser = { name: 'Pascal' };
    },

    setFirebaseStatus(status) {
        const el = document.getElementById('firebase-status');
        if (!el) return;
        const dot = el.querySelector('.status-dot');
        const txt = el.querySelector('.status-text');
        if (dot) dot.className = 'status-dot ' + status;
        if (txt) txt.textContent = status === 'connected' ? 'Firebase' : status === 'syncing' ? 'Sync...' : 'Déconnecté';
    },

    injectStyles() {
        if (document.getElementById('trakio-ui-styles')) return;
        const s = document.createElement('style');
        s.id = 'trakio-ui-styles';
        s.textContent = `
            :root, [data-theme="dark"] {
                --bg-body: #0f172a;
                --bg-header: #1e293b;
                --bg-card: #1e293b;
                --bg-input: #334155;
                --bg-hover: #475569;
                --border: #475569;
                --text: #f1f5f9;
                --text-muted: #94a3b8;
                --primary: #0ea5e9;
                --success: #10b981;
                --warning: #f59e0b;
                --error: #ef4444;
            }
            [data-theme="light"] {
                --bg-body: #f1f5f9;
                --bg-header: #ffffff;
                --bg-card: #ffffff;
                --bg-input: #e2e8f0;
                --bg-hover: #cbd5e1;
                --border: #cbd5e1;
                --text: #0f172a;
                --text-muted: #64748b;
                --primary: #0284c7;
            }
            html, body {
                background: var(--bg-body) !important;
                color: var(--text) !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0; padding: 0;
                min-height: 100vh;
                transition: background 0.3s, color 0.3s;
            }
            body { padding-top: 60px !important; }

            .trakio-header {
                position: fixed;
                top: 0; left: 0; right: 0;
                height: 60px;
                background: var(--bg-header);
                border-bottom: 1px solid var(--border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 99999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            .nav-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 700;
                font-size: 18px;
                color: var(--primary);
                text-decoration: none;
            }
            .nav-brand-icon { font-size: 26px; }
            .nav-brand-version {
                font-size: 10px;
                padding: 3px 8px;
                background: var(--bg-input);
                border-radius: 10px;
                color: var(--text-muted);
            }
            .nav-menu {
                display: flex;
                align-items: center;
                gap: 4px;
                overflow-x: auto;
                flex: 1;
                margin: 0 20px;
                scrollbar-width: none;
            }
            .nav-menu::-webkit-scrollbar { display: none; }
            .nav-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 14px;
                border-radius: 8px;
                color: var(--text-muted);
                text-decoration: none;
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
                transition: all 0.2s;
            }
            .nav-item:hover { background: var(--bg-hover); color: var(--text); }
            .nav-item.active {
                background: var(--primary);
                color: white;
                box-shadow: 0 2px 8px rgba(14,165,233,0.4);
            }
            .nav-separator {
                width: 1px; height: 24px;
                background: var(--border);
                margin: 0 8px;
            }
            .nav-right {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .nav-status {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: var(--bg-input);
                border-radius: 20px;
                font-size: 12px;
                color: var(--text-muted);
            }
            .status-dot {
                width: 8px; height: 8px;
                border-radius: 50%;
            }
            .status-dot.connected { background: var(--success); box-shadow: 0 0 8px var(--success); }
            .status-dot.syncing { background: var(--warning); animation: blink 1s infinite; }
            .status-dot.disconnected { background: var(--error); }
            @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
            .nav-btn {
                width: 38px; height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-input);
                border: 1px solid var(--border);
                border-radius: 10px;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.2s;
            }
            .nav-btn:hover { background: var(--bg-hover); border-color: var(--primary); }
            .nav-user {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                background: var(--primary);
                border-radius: 20px;
                color: white;
                font-size: 13px;
                font-weight: 600;
            }
            .nav-user-avatar {
                width: 26px; height: 26px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
            }
            .trakio-toast {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: var(--bg-card);
                color: var(--text);
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 14px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                border: 1px solid var(--border);
                z-index: 999999;
                opacity: 0;
                transition: all 0.3s;
            }
            .trakio-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }

            /* Forcer couleurs partout */
            .card, .stat-card, .kpi-card, .module-card, .section, .panel, .box {
                background: var(--bg-card) !important;
                border-color: var(--border) !important;
                color: var(--text) !important;
            }
            input, select, textarea {
                background: var(--bg-input) !important;
                color: var(--text) !important;
                border-color: var(--border) !important;
            }
            table { color: var(--text) !important; }
            th { background: var(--bg-input) !important; color: var(--text-muted) !important; }
            h1,h2,h3,h4,h5,h6 { color: var(--text) !important; }
            .btn-primary { background: var(--primary) !important; color: white !important; }

            @media (max-width: 1024px) {
                .nav-item span:not(:first-child) { display: none; }
            }
            @media (max-width: 768px) {
                .nav-brand span:not(.nav-brand-icon) { display: none; }
                .nav-status .status-text { display: none; }
                .nav-user span:not(.nav-user-avatar) { display: none; }
            }
            @media (max-width: 480px) {
                .nav-menu { display: none; }
            }
        `;
        document.head.insertBefore(s, document.head.firstChild);
    },

    injectHeader() {
        const old = document.querySelector('.trakio-header');
        if (old) old.remove();
        
        const h = document.createElement('header');
        h.className = 'trakio-header';
        h.innerHTML = `
            <a href="index.html" class="nav-brand">
                <span class="nav-brand-icon">🐟</span>
                <span>TRAKIO</span>
                <span class="nav-brand-version">v${this.VERSION}</span>
            </a>
            <nav class="nav-menu">
                ${this.MODULES.map(m => m.separator 
                    ? '<div class="nav-separator"></div>'
                    : `<a href="${m.url}" class="nav-item ${this.currentModule === m.id ? 'active' : ''}">
                        <span>${m.icon}</span><span>${m.name}</span>
                    </a>`
                ).join('')}
            </nav>
            <div class="nav-right">
                <div class="nav-status" id="firebase-status">
                    <span class="status-dot disconnected"></span>
                    <span class="status-text">Connexion...</span>
                </div>
                <button class="nav-btn" id="theme-toggle-btn" onclick="TrakioUI.toggleTheme()">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <div class="nav-user">
                    <span class="nav-user-avatar">${this.currentUser?.name?.charAt(0) || 'P'}</span>
                    <span>${this.currentUser?.name || 'Pascal'}</span>
                </div>
            </div>
        `;
        document.body.insertBefore(h, document.body.firstChild);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TrakioUI.init());
} else {
    TrakioUI.init();
}
window.TrakioUI = TrakioUI;
