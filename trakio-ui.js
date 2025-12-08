/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRAKIO UI v4.3.0 - Interface Utilisateur Partagée
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier gère:
 * - Header de navigation unifié sur tous les modules
 * - Thème jour/nuit (sauvegardé en localStorage)
 * - Statut de connexion Firebase
 * - Utilisateur connecté
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TrakioUI = {
    VERSION: '4.3.0',
    
    // Configuration des modules
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
        { id: 'live', name: 'Live', icon: '📡', url: 'live.html', separator: true },
        { id: 'whatsapp', name: 'WhatsApp', icon: '💬', url: 'whatsapp.html' },
        { id: 'cloud', name: 'Cloud', icon: '☁️', url: 'cloud.html' }
    ],

    // État
    currentModule: null,
    theme: 'dark',
    currentUser: null,
    firebaseStatus: 'disconnected',

    /**
     * Initialisation
     */
    init() {
        // Détecter le module actuel
        this.detectCurrentModule();
        
        // Charger le thème
        this.loadTheme();
        
        // Charger l'utilisateur
        this.loadUser();
        
        // Injecter les styles CSS
        this.injectStyles();
        
        // Injecter le header
        this.injectHeader();
        
        // Écouter les changements de thème système
        this.watchSystemTheme();
        
        console.log(`🐟 TRAKIO UI v${this.VERSION} initialisé - Module: ${this.currentModule}`);
    },

    /**
     * Détecter le module actuel basé sur l'URL
     */
    detectCurrentModule() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const module = this.MODULES.find(m => m.url === filename);
        this.currentModule = module ? module.id : 'dashboard';
    },

    /**
     * Charger le thème depuis localStorage
     */
    loadTheme() {
        const saved = localStorage.getItem('trakio_theme');
        this.theme = saved || 'dark';
        this.applyTheme();
    },

    /**
     * Appliquer le thème
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${this.theme}`);
        
        // Mettre à jour l'icône du bouton
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
     * Charger l'utilisateur connecté
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
    },

    /**
     * Mettre à jour le statut Firebase
     */
    setFirebaseStatus(status) {
        this.firebaseStatus = status;
        const indicator = document.getElementById('firebase-status');
        if (indicator) {
            indicator.className = `nav-status ${status}`;
            indicator.innerHTML = status === 'connected' 
                ? '<span class="status-dot connected"></span> Firebase'
                : status === 'syncing'
                ? '<span class="status-dot syncing"></span> Sync...'
                : '<span class="status-dot disconnected"></span> Hors ligne';
        }
    },

    /**
     * Injecter les styles CSS pour le header et les thèmes
     */
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'trakio-ui-styles';
        style.textContent = `
            /* ═══════════════════════════════════════════════════════════════
               THÈME SOMBRE (par défaut)
            ═══════════════════════════════════════════════════════════════ */
            :root, [data-theme="dark"] {
                --bg-body: #0f172a;
                --bg-header: #1e293b;
                --bg-card: #1e293b;
                --bg-input: #334155;
                --bg-hover: #334155;
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
                --bg-hover: #e2e8f0;
                --border: #cbd5e1;
                --text: #0f172a;
                --text-muted: #64748b;
                --primary: #0284c7;
                --primary-dark: #0369a1;
            }

            body {
                background: var(--bg-body);
                color: var(--text);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                padding-top: 60px; /* Espace pour le header fixe */
                min-height: 100vh;
                transition: background 0.3s, color 0.3s;
            }

            /* ═══════════════════════════════════════════════════════════════
               HEADER NAVIGATION
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
                z-index: 9999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
            }

            .nav-brand:hover {
                opacity: 0.9;
            }

            .nav-brand-icon {
                font-size: 24px;
            }

            .nav-brand-version {
                font-size: 11px;
                padding: 2px 8px;
                background: var(--bg-input);
                border-radius: 10px;
                color: var(--text-muted);
                font-weight: 500;
            }

            .nav-menu {
                display: flex;
                align-items: center;
                gap: 4px;
                overflow-x: auto;
                max-width: 60%;
                scrollbar-width: none;
            }

            .nav-menu::-webkit-scrollbar {
                display: none;
            }

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

            .nav-item:hover {
                background: var(--bg-hover);
                color: var(--text);
            }

            .nav-item.active {
                background: var(--primary);
                color: white;
            }

            .nav-item-icon {
                font-size: 16px;
            }

            .nav-separator {
                width: 1px;
                height: 24px;
                background: var(--border);
                margin: 0 8px;
            }

            .nav-right {
                display: flex;
                align-items: center;
                gap: 12px;
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
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }

            .status-dot.connected {
                background: var(--success);
                box-shadow: 0 0 8px var(--success);
            }

            .status-dot.syncing {
                background: var(--warning);
                animation: pulse 1s infinite;
            }

            .status-dot.disconnected {
                background: var(--error);
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .nav-btn {
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-input);
                border: 1px solid var(--border);
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
            }

            .nav-btn:hover {
                background: var(--bg-hover);
                border-color: var(--primary);
            }

            .nav-user {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 12px;
                background: var(--primary);
                border-radius: 20px;
                color: white;
                font-size: 13px;
                font-weight: 500;
            }

            .nav-user-avatar {
                width: 24px;
                height: 24px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }

            /* ═══════════════════════════════════════════════════════════════
               MOBILE RESPONSIVE
            ═══════════════════════════════════════════════════════════════ */
            @media (max-width: 1024px) {
                .nav-item span:not(.nav-item-icon) {
                    display: none;
                }
                
                .nav-item {
                    padding: 8px 10px;
                }
            }

            @media (max-width: 768px) {
                .trakio-header {
                    padding: 0 10px;
                }
                
                .nav-brand-version {
                    display: none;
                }
                
                .nav-menu {
                    max-width: 50%;
                }
                
                .nav-status span:not(.status-dot) {
                    display: none;
                }
                
                .nav-user span {
                    display: none;
                }
            }

            @media (max-width: 480px) {
                .nav-menu {
                    display: none;
                }
                
                .nav-brand span:not(.nav-brand-icon) {
                    display: none;
                }
            }

            /* ═══════════════════════════════════════════════════════════════
               UTILITAIRES
            ═══════════════════════════════════════════════════════════════ */
            .card, .stat-card, .form-container, .table-container, .import-panel {
                background: var(--bg-card) !important;
                border-color: var(--border) !important;
                transition: background 0.3s, border-color 0.3s;
            }

            input, select, textarea {
                background: var(--bg-input) !important;
                color: var(--text) !important;
                border-color: var(--border) !important;
                transition: background 0.3s, color 0.3s, border-color 0.3s;
            }

            .btn-secondary, .back-btn {
                background: var(--bg-input) !important;
                color: var(--text) !important;
                border-color: var(--border) !important;
            }

            /* Masquer les anciens headers des modules */
            .header:not(.trakio-header),
            .module-header {
                display: none !important;
            }
        `;
        
        // Injecter en premier pour priorité
        document.head.insertBefore(style, document.head.firstChild);
    },

    /**
     * Injecter le header de navigation
     */
    injectHeader() {
        // Créer le header
        const header = document.createElement('header');
        header.className = 'trakio-header';
        header.innerHTML = `
            <!-- Brand -->
            <a href="index.html" class="nav-brand">
                <span class="nav-brand-icon">🐟</span>
                <span>TRAKIO</span>
                <span class="nav-brand-version">v${this.VERSION}</span>
            </a>

            <!-- Navigation -->
            <nav class="nav-menu">
                ${this.MODULES.map(m => `
                    ${m.separator ? '<div class="nav-separator"></div>' : ''}
                    <a href="${m.url}" class="nav-item ${this.currentModule === m.id ? 'active' : ''}">
                        <span class="nav-item-icon">${m.icon}</span>
                        <span>${m.name}</span>
                    </a>
                `).join('')}
            </nav>

            <!-- Right section -->
            <div class="nav-right">
                <!-- Firebase Status -->
                <div class="nav-status" id="firebase-status">
                    <span class="status-dot disconnected"></span>
                    <span>Connexion...</span>
                </div>

                <!-- Theme Toggle -->
                <button class="nav-btn" id="theme-toggle-btn" onclick="TrakioUI.toggleTheme()" title="Changer de thème">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>

                <!-- User -->
                <div class="nav-user">
                    <span class="nav-user-avatar">${this.currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    <span>${this.currentUser?.name || 'Utilisateur'}</span>
                </div>
            </div>
        `;

        // Insérer au début du body
        document.body.insertBefore(header, document.body.firstChild);
    }
};

// Initialisation automatique au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    TrakioUI.init();
});

// Export pour utilisation externe
window.TrakioUI = TrakioUI;
