/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRAKIO UI v4.3.0 - Interface Utilisateur Unifiée
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Header de navigation unifié sur TOUS les modules
 * Thème jour/nuit avec icône dédiée
 * Statut Firebase en temps réel
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TrakioUI = {
    VERSION: '4.3.0',
    
    // Configuration des modules - COMPLET
    MODULES: [
        { id: 'dashboard', name: 'Dashboard', icon: '📊', url: 'index.html' },
        { id: 'articles', name: 'Articles', icon: '📦', url: 'articles.html' },
        { id: 'clients', name: 'Clients', icon: '👥', url: 'clients.html' },
        { id: 'commandes', name: 'Commandes', icon: '📋', url: 'commandes.html' },
        { id: 'myfish', name: 'MyFish', icon: '🛒', url: 'myfish.html' },
        { id: 'caisse', name: 'Caisse', icon: '💵', url: 'caisse.html' },
        { id: 'tracabilite', name: 'Traçabilité', icon: '🏷️', url: 'tracabilite.html' },
        { id: 'compta', name: 'Compta', icon: '📒', url: 'compta.html' },
        { id: 'shopify', name: 'Shop Hub', icon: '🛍️', url: 'shopify.html' },
        { id: 'separator1', separator: true },
        { id: 'live', name: 'Live', icon: '📡', url: 'live.html' },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', url: 'whatsapp.html' },
        { id: 'cloud', name: 'Cloud', icon: '☁️', url: 'cloud.html' },
        { id: 'parametres', name: 'Paramètres', icon: '⚙️', url: 'parametres.html' }
    ],

    // État
    currentModule: null,
    theme: 'dark',
    currentUser: null,
    firebaseStatus: 'disconnected',

    /**
     * Initialisation automatique
     */
    init() {
        this.detectCurrentModule();
        this.loadTheme();
        this.loadUser();
        this.injectStyles();
        this.injectHeader();
        this.watchSystemTheme();
        
        // Appliquer le thème après injection
        setTimeout(() => this.applyTheme(), 10);
        
        console.log(`🐟 TRAKIO UI v${this.VERSION} - Module: ${this.currentModule} - Thème: ${this.theme}`);
    },

    /**
     * Détecter le module actuel
     */
    detectCurrentModule() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const module = this.MODULES.find(m => m.url === filename);
        this.currentModule = module ? module.id : 'dashboard';
    },

    /**
     * Charger le thème
     */
    loadTheme() {
        const saved = localStorage.getItem('trakio_theme');
        this.theme = saved || 'dark';
    },

    /**
     * Appliquer le thème à tout le document
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.body.setAttribute('data-theme', this.theme);
        
        // Mettre à jour l'icône
        const btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
            btn.title = this.theme === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit';
        }
    },

    /**
     * Basculer le thème
     */
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('trakio_theme', this.theme);
        this.applyTheme();
        
        // Notification
        this.showToast(this.theme === 'dark' ? '🌙 Mode nuit activé' : '☀️ Mode jour activé');
    },

    /**
     * Toast notification
     */
    showToast(message) {
        const existing = document.querySelector('.trakio-toast');
        if (existing) existing.remove();
        
        const toast = document.createElement('div');
        toast.className = 'trakio-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    },

    /**
     * Écouter les changements de thème système
     */
    watchSystemTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('trakio_theme')) {
                    this.theme = e.matches ? 'dark' : 'light';
                    this.applyTheme();
                }
            });
        }
    },

    /**
     * Charger l'utilisateur
     */
    loadUser() {
        const user = localStorage.getItem('trakio_current_user');
        if (user) {
            try {
                this.currentUser = JSON.parse(user);
            } catch(e) {
                this.currentUser = { name: user };
            }
        }
        if (!this.currentUser) {
            this.currentUser = { name: 'Pascal' };
        }
    },

    /**
     * Mettre à jour le statut Firebase
     */
    setFirebaseStatus(status) {
        this.firebaseStatus = status;
        const indicator = document.getElementById('firebase-status');
        if (indicator) {
            indicator.className = `nav-status ${status}`;
            const dot = indicator.querySelector('.status-dot');
            const text = indicator.querySelector('.status-text');
            
            if (dot) dot.className = `status-dot ${status}`;
            if (text) {
                text.textContent = status === 'connected' ? 'Firebase' 
                    : status === 'syncing' ? 'Sync...' 
                    : 'Hors ligne';
            }
        }
    },

    /**
     * Injecter les styles CSS
     */
    injectStyles() {
        if (document.getElementById('trakio-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'trakio-ui-styles';
        style.textContent = `
            /* ═══════════════════════════════════════════════════════════════
               THÈME SOMBRE (défaut) - Couleurs Dashboard
            ═══════════════════════════════════════════════════════════════ */
            :root,
            [data-theme="dark"] {
                --bg-body: #0f172a;
                --bg-header: #1e293b;
                --bg-card: #1e293b;
                --bg-input: #334155;
                --bg-hover: #3b4a63;
                --border: #475569;
                --text: #f1f5f9;
                --text-muted: #94a3b8;
                --primary: #0ea5e9;
                --primary-dark: #0284c7;
                --success: #10b981;
                --warning: #f59e0b;
                --error: #ef4444;
                --purple: #8b5cf6;
            }

            /* ═══════════════════════════════════════════════════════════════
               THÈME CLAIR
            ═══════════════════════════════════════════════════════════════ */
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
                --primary-dark: #0369a1;
            }

            /* ═══════════════════════════════════════════════════════════════
               RESET & BASE - Forcer les couleurs partout
            ═══════════════════════════════════════════════════════════════ */
            html, body {
                background: var(--bg-body) !important;
                color: var(--text) !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
                margin: 0;
                padding: 0;
                min-height: 100vh;
                transition: background 0.3s ease, color 0.3s ease;
            }

            body {
                padding-top: 60px !important;
            }

            /* ═══════════════════════════════════════════════════════════════
               HEADER NAVIGATION - Style Dashboard
            ═══════════════════════════════════════════════════════════════ */
            .trakio-header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: var(--bg-header);
                border-bottom: 1px solid var(--border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 99999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                transition: background 0.3s, border-color 0.3s;
            }

            .nav-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 700;
                font-size: 18px;
                color: var(--primary);
                text-decoration: none;
                flex-shrink: 0;
            }

            .nav-brand:hover { opacity: 0.9; }
            .nav-brand-icon { font-size: 26px; }

            .nav-brand-version {
                font-size: 10px;
                padding: 3px 8px;
                background: var(--bg-input);
                border-radius: 10px;
                color: var(--text-muted);
                font-weight: 500;
            }

            .nav-menu {
                display: flex;
                align-items: center;
                gap: 2px;
                overflow-x: auto;
                flex: 1;
                max-width: 65%;
                margin: 0 20px;
                padding: 4px 0;
                scrollbar-width: none;
            }

            .nav-menu::-webkit-scrollbar { display: none; }

            .nav-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 8px;
                color: var(--text-muted);
                text-decoration: none;
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
                transition: all 0.2s ease;
                border: 1px solid transparent;
            }

            .nav-item:hover {
                background: var(--bg-hover);
                color: var(--text);
            }

            .nav-item.active {
                background: var(--primary);
                color: white;
                border-color: var(--primary);
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);
            }

            .nav-item-icon { font-size: 15px; }

            .nav-separator {
                width: 1px;
                height: 24px;
                background: var(--border);
                margin: 0 6px;
                flex-shrink: 0;
            }

            .nav-right {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-shrink: 0;
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
                border: 1px solid var(--border);
            }

            .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .status-dot.connected {
                background: var(--success);
                box-shadow: 0 0 8px var(--success);
            }

            .status-dot.syncing {
                background: var(--warning);
                animation: blink 1s infinite;
            }

            .status-dot.disconnected {
                background: var(--error);
            }

            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }

            .nav-btn {
                width: 38px;
                height: 38px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-input);
                border: 1px solid var(--border);
                border-radius: 10px;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.2s ease;
                color: var(--text);
            }

            .nav-btn:hover {
                background: var(--bg-hover);
                border-color: var(--primary);
                transform: scale(1.05);
            }

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
                width: 26px;
                height: 26px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                font-weight: 700;
            }

            /* ═══════════════════════════════════════════════════════════════
               TOAST
            ═══════════════════════════════════════════════════════════════ */
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
                font-weight: 500;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                border: 1px solid var(--border);
                z-index: 999999;
                opacity: 0;
                transition: all 0.3s ease;
            }

            .trakio-toast.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }

            /* ═══════════════════════════════════════════════════════════════
               FORCER LES COULEURS PARTOUT
            ═══════════════════════════════════════════════════════════════ */
            .main-container, .dashboard, .content, main, section, article {
                background: transparent !important;
            }

            .card, .stat-card, .form-container, .table-container, .panel, .box,
            .section, .kpi-card, .module-card, .alert-item, .filters {
                background: var(--bg-card) !important;
                border-color: var(--border) !important;
                color: var(--text) !important;
            }

            input, select, textarea, .form-control {
                background: var(--bg-input) !important;
                color: var(--text) !important;
                border-color: var(--border) !important;
            }

            input::placeholder, textarea::placeholder {
                color: var(--text-muted) !important;
            }

            table { color: var(--text) !important; }
            th { background: var(--bg-input) !important; color: var(--text-muted) !important; }
            td { border-color: var(--border) !important; }
            tr:hover td { background: var(--bg-hover) !important; }

            h1, h2, h3, h4, h5, h6, .title, .page-title, .section-title {
                color: var(--text) !important;
            }

            .text-muted, .subtitle, .page-subtitle, .stat-label, .kpi-label {
                color: var(--text-muted) !important;
            }

            .btn-primary { background: var(--primary) !important; color: white !important; }
            .btn-secondary {
                background: var(--bg-input) !important;
                color: var(--text) !important;
                border-color: var(--border) !important;
            }

            .tab-btn, .tabs-nav button {
                background: var(--bg-input) !important;
                color: var(--text-muted) !important;
                border-color: var(--border) !important;
            }

            .tab-btn.active, .tabs-nav button.active {
                background: var(--primary) !important;
                color: white !important;
            }

            /* Stats colorées */
            .stat-card.highlight-blue, .stat-card.highlight-cyan {
                border-left: 4px solid var(--primary) !important;
            }
            .stat-card.highlight-orange, .stat-card.highlight-warning {
                border-left: 4px solid var(--warning) !important;
            }
            .stat-card.highlight-green, .stat-card.highlight-success {
                border-left: 4px solid var(--success) !important;
            }

            /* ═══════════════════════════════════════════════════════════════
               RESPONSIVE
            ═══════════════════════════════════════════════════════════════ */
            @media (max-width: 1200px) {
                .nav-item span:not(.nav-item-icon) { display: none; }
                .nav-item { padding: 8px 10px; }
                .nav-menu { max-width: 55%; }
            }

            @media (max-width: 768px) {
                .trakio-header { padding: 0 12px; }
                .nav-brand span:not(.nav-brand-icon) { display: none; }
                .nav-menu { max-width: 45%; }
                .nav-status .status-text { display: none; }
                .nav-user span:not(.nav-user-avatar) { display: none; }
                .nav-user { padding: 6px; border-radius: 50%; }
            }

            @media (max-width: 480px) {
                body { padding-top: 55px !important; }
                .trakio-header { height: 55px; }
                .nav-menu { display: none; }
                .nav-btn { width: 34px; height: 34px; font-size: 16px; }
            }

            /* Scrollbar */
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: var(--bg-body); }
            ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
            ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
        `;
        
        document.head.insertBefore(style, document.head.firstChild);
    },

    /**
     * Injecter le header
     */
    injectHeader() {
        const existing = document.querySelector('.trakio-header');
        if (existing) existing.remove();
        
        const header = document.createElement('header');
        header.className = 'trakio-header';
        header.innerHTML = `
            <a href="index.html" class="nav-brand">
                <span class="nav-brand-icon">🐟</span>
                <span>TRAKIO</span>
                <span class="nav-brand-version">v${this.VERSION}</span>
            </a>

            <nav class="nav-menu">
                ${this.MODULES.map(m => {
                    if (m.separator) return '<div class="nav-separator"></div>';
                    return `<a href="${m.url}" class="nav-item ${this.currentModule === m.id ? 'active' : ''}">
                        <span class="nav-item-icon">${m.icon}</span>
                        <span>${m.name}</span>
                    </a>`;
                }).join('')}
            </nav>

            <div class="nav-right">
                <div class="nav-status" id="firebase-status">
                    <span class="status-dot disconnected"></span>
                    <span class="status-text">Connexion...</span>
                </div>

                <button class="nav-btn" id="theme-toggle-btn" onclick="TrakioUI.toggleTheme()" title="Changer de thème">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <div class="nav-user">
                    <span class="nav-user-avatar">${this.currentUser?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                    <span>${this.currentUser?.name || 'Pascal'}</span>
                </div>
            </div>
        `;

        document.body.insertBefore(header, document.body.firstChild);
    }
};

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TrakioUI.init());
} else {
    TrakioUI.init();
}

window.TrakioUI = TrakioUI;
