/**
 * ═══════════════════════════════════════════════════════════════
 * TRAKIO UI v4.4.0 - Header Unifié + Thème + Permissions
 * Fichier à placer à la RACINE du projet
 * ═══════════════════════════════════════════════════════════════
 */

const TrakioUI = {
    VERSION: '4.4.0',
    
    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════
    
    currentModule: null,
    theme: 'dark',
    currentUser: null,
    firebaseStatus: 'disconnected',
    
    // ═══════════════════════════════════════════════════════════
    // INITIALISATION
    // ═══════════════════════════════════════════════════════════
    
    init() {
        this.detectCurrentModule();
        this.loadTheme();
        this.loadUser();
        this.injectStyles();
        this.injectHeader();
        this.checkPermissions();
        
        // Appliquer le thème après injection
        setTimeout(() => this.applyTheme(), 10);
        
        console.log(`🐟 TRAKIO UI v${this.VERSION} initialisé`);
    },
    
    // ═══════════════════════════════════════════════════════════
    // DÉTECTION DU MODULE ACTUEL
    // ═══════════════════════════════════════════════════════════
    
    detectCurrentModule() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        // Utiliser TrakioConfig si disponible
        if (typeof TrakioConfig !== 'undefined' && TrakioConfig.MODULES) {
            const module = Object.values(TrakioConfig.MODULES).find(m => m.url === filename);
            this.currentModule = module ? module.id : 'dashboard';
        } else {
            // Fallback
            const moduleMap = {
                'index.html': 'dashboard',
                'articles.html': 'articles',
                'clients.html': 'clients',
                'commandes.html': 'commandes',
                'myfish.html': 'myfish',
                'caisse.html': 'caisse',
                'tracabilite.html': 'tracabilite',
                'compta.html': 'compta',
                'shopify.html': 'shopify',
                'live.html': 'live',
                'whatsapp.html': 'whatsapp',
                'cloud.html': 'cloud',
                'parametres.html': 'parametres'
            };
            this.currentModule = moduleMap[filename] || 'dashboard';
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // VÉRIFICATION DES PERMISSIONS
    // ═══════════════════════════════════════════════════════════
    
    checkPermissions() {
        if (typeof TrakioPermissions !== 'undefined') {
            const hasAccess = TrakioPermissions.canAccess(this.currentModule);
            
            if (!hasAccess && this.currentModule !== 'dashboard') {
                console.warn(`⛔ Accès refusé: ${this.currentModule}`);
                this.showAccessDenied();
                return false;
            }
        }
        return true;
    },
    
    showAccessDenied() {
        // Masquer le contenu de la page
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: var(--bg-body, #0f172a);
                color: var(--text, #f1f5f9);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 20px;
            ">
                <div style="font-size: 80px; margin-bottom: 20px;">🔒</div>
                <h1 style="font-size: 28px; margin-bottom: 10px;">Accès refusé</h1>
                <p style="color: #94a3b8; margin-bottom: 30px;">
                    Vous n'avez pas les permissions pour accéder à ce module.<br>
                    Contactez votre administrateur.
                </p>
                <a href="index.html" style="
                    padding: 12px 24px;
                    background: #0ea5e9;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                ">← Retour au Dashboard</a>
            </div>
        `;
    },
    
    // ═══════════════════════════════════════════════════════════
    // GESTION DU THÈME
    // ═══════════════════════════════════════════════════════════
    
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
    
    // ═══════════════════════════════════════════════════════════
    // GESTION UTILISATEUR
    // ═══════════════════════════════════════════════════════════
    
    loadUser() {
        if (typeof TrakioUsers !== 'undefined') {
            this.currentUser = TrakioUsers.getCurrentUser();
        } else {
            // Fallback
            try {
                const stored = localStorage.getItem('trakio_current_user');
                if (stored) {
                    this.currentUser = JSON.parse(stored);
                }
            } catch (e) {
                console.warn('Erreur lecture utilisateur:', e);
            }
        }
        
        // Défaut
        if (!this.currentUser) {
            this.currentUser = { id: 'pascal', name: 'Pascal', role: 'admin' };
        }
    },
    
    updateUserDisplay(user) {
        this.currentUser = user;
        
        const avatarEl = document.querySelector('.nav-user-avatar');
        const nameEl = document.querySelector('.nav-user-name');
        
        if (avatarEl) {
            avatarEl.textContent = user.name.charAt(0).toUpperCase();
        }
        if (nameEl) {
            nameEl.textContent = user.name;
        }
        
        // Rafraîchir le menu pour les nouvelles permissions
        this.refreshMenu();
    },
    
    // ═══════════════════════════════════════════════════════════
    // STATUT FIREBASE
    // ═══════════════════════════════════════════════════════════
    
    setFirebaseStatus(status) {
        this.firebaseStatus = status;
        
        const el = document.getElementById('firebase-status');
        if (!el) return;
        
        const dot = el.querySelector('.status-dot');
        const txt = el.querySelector('.status-text');
        
        if (dot) {
            dot.className = 'status-dot ' + status;
        }
        
        if (txt) {
            const labels = {
                'connected': 'Firebase',
                'syncing': 'Sync...',
                'disconnected': 'Déconnecté',
                'error': 'Erreur'
            };
            txt.textContent = labels[status] || status;
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // TOAST NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    
    showToast(message, type = 'info') {
        // Supprimer l'ancien toast
        const old = document.querySelector('.trakio-toast');
        if (old) old.remove();
        
        const toast = document.createElement('div');
        toast.className = `trakio-toast trakio-toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // ═══════════════════════════════════════════════════════════
    // OBTENIR LES MODULES À AFFICHER
    // ═══════════════════════════════════════════════════════════
    
    getVisibleModules() {
        // Liste complète des modules pour le menu
        const allModules = [
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
        ];
        
        // Si pas de système de permissions, tout afficher
        if (typeof TrakioPermissions === 'undefined') {
            return allModules;
        }
        
        // Filtrer selon les permissions
        const accessibleModules = TrakioPermissions.getMyModules();
        
        return allModules.filter(m => {
            if (m.separator) return true; // Garder les séparateurs
            return accessibleModules.includes(m.id);
        });
    },
    
    // ═══════════════════════════════════════════════════════════
    // RAFRAÎCHIR LE MENU
    // ═══════════════════════════════════════════════════════════
    
    refreshMenu() {
        const menuEl = document.querySelector('.nav-menu');
        if (!menuEl) return;
        
        const modules = this.getVisibleModules();
        
        menuEl.innerHTML = modules.map(m => {
            if (m.separator) {
                return '<div class="nav-separator"></div>';
            }
            return `
                <a href="${m.url}" class="nav-item ${this.currentModule === m.id ? 'active' : ''}">
                    <span>${m.icon}</span>
                    <span>${m.name}</span>
                </a>
            `;
        }).join('');
    },
    
    // ═══════════════════════════════════════════════════════════
    // INJECTION DES STYLES
    // ═══════════════════════════════════════════════════════════
    
    injectStyles() {
        if (document.getElementById('trakio-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'trakio-ui-styles';
        style.textContent = `
            /* ═══════════════════════════════════════════════════════
               VARIABLES CSS - THÈMES
            ═══════════════════════════════════════════════════════ */
            
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
                --primary-dark: #0284c7;
                --success: #10b981;
                --warning: #f59e0b;
                --error: #ef4444;
                --purple: #8b5cf6;
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
                --primary-dark: #0369a1;
            }
            
            /* ═══════════════════════════════════════════════════════
               BASE
            ═══════════════════════════════════════════════════════ */
            
            html, body {
                background: var(--bg-body) !important;
                color: var(--text) !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
                min-height: 100vh;
                transition: background 0.3s, color 0.3s;
            }
            
            body {
                padding-top: 65px !important;
            }
            
            /* ═══════════════════════════════════════════════════════
               HEADER
            ═══════════════════════════════════════════════════════ */
            
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
            }
            
            /* Brand */
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
            
            .nav-brand-icon {
                font-size: 26px;
            }
            
            .nav-brand-version {
                font-size: 10px;
                padding: 3px 8px;
                background: var(--bg-input);
                border-radius: 10px;
                color: var(--text-muted);
            }
            
            /* Menu */
            .nav-menu {
                display: flex;
                align-items: center;
                gap: 4px;
                overflow-x: auto;
                flex: 1;
                margin: 0 20px;
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
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);
            }
            
            .nav-separator {
                width: 1px;
                height: 24px;
                background: var(--border);
                margin: 0 8px;
                flex-shrink: 0;
            }
            
            /* Right section */
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
            
            .status-dot.error {
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
                padding: 6px 14px;
                background: var(--primary);
                border-radius: 20px;
                color: white;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .nav-user:hover {
                background: var(--primary-dark);
            }
            
            .nav-user-avatar {
                width: 26px;
                height: 26px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
            }
            
            /* ═══════════════════════════════════════════════════════
               TOAST NOTIFICATIONS
            ═══════════════════════════════════════════════════════ */
            
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
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                border: 1px solid var(--border);
                z-index: 999999;
                opacity: 0;
                transition: all 0.3s;
            }
            
            .trakio-toast.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            
            .trakio-toast-success {
                border-color: var(--success);
            }
            
            .trakio-toast-error {
                border-color: var(--error);
            }
            
            .trakio-toast-warning {
                border-color: var(--warning);
            }
            
            /* ═══════════════════════════════════════════════════════
               OVERRIDE STYLES POUR TOUS LES MODULES
            ═══════════════════════════════════════════════════════ */
            
            .card, .stat-card, .kpi-card, .module-card, .section, .panel, .box,
            .settings-card, .client-card, .article-card, .order-card {
                background: var(--bg-card) !important;
                border-color: var(--border) !important;
                color: var(--text) !important;
            }
            
            input, select, textarea {
                background: var(--bg-input) !important;
                color: var(--text) !important;
                border-color: var(--border) !important;
            }
            
            input::placeholder, textarea::placeholder {
                color: var(--text-muted) !important;
            }
            
            table {
                color: var(--text) !important;
            }
            
            th {
                background: var(--bg-input) !important;
                color: var(--text-muted) !important;
            }
            
            td {
                border-color: var(--border) !important;
            }
            
            h1, h2, h3, h4, h5, h6 {
                color: var(--text) !important;
            }
            
            .btn-primary {
                background: var(--primary) !important;
                color: white !important;
            }
            
            .btn-primary:hover {
                background: var(--primary-dark) !important;
            }
            
            /* ═══════════════════════════════════════════════════════
               RESPONSIVE
            ═══════════════════════════════════════════════════════ */
            
            @media (max-width: 1200px) {
                .nav-item span:last-child {
                    display: none;
                }
                .nav-item {
                    padding: 8px 10px;
                }
            }
            
            @media (max-width: 900px) {
                .nav-brand-version {
                    display: none;
                }
                .nav-status .status-text {
                    display: none;
                }
            }
            
            @media (max-width: 768px) {
                .trakio-header {
                    padding: 0 10px;
                }
                .nav-brand span:not(.nav-brand-icon) {
                    display: none;
                }
                .nav-user .nav-user-name {
                    display: none;
                }
                .nav-menu {
                    margin: 0 10px;
                }
            }
            
            @media (max-width: 480px) {
                .nav-menu {
                    display: none;
                }
                .nav-status {
                    display: none;
                }
            }
        `;
        
        document.head.insertBefore(style, document.head.firstChild);
    },
    
    // ═══════════════════════════════════════════════════════════
    // INJECTION DU HEADER
    // ═══════════════════════════════════════════════════════════
    
    injectHeader() {
        // Supprimer l'ancien header si présent
        const oldHeader = document.querySelector('.trakio-header');
        if (oldHeader) oldHeader.remove();
        
        // Obtenir les modules visibles
        const modules = this.getVisibleModules();
        
        // Créer le header
        const header = document.createElement('header');
        header.className = 'trakio-header';
        header.innerHTML = `
            <a href="index.html" class="nav-brand">
                <span class="nav-brand-icon">🐟</span>
                <span>TRAKIO</span>
                <span class="nav-brand-version">v${this.VERSION}</span>
            </a>
            
            <nav class="nav-menu">
                ${modules.map(m => {
                    if (m.separator) {
                        return '<div class="nav-separator"></div>';
                    }
                    return `
                        <a href="${m.url}" class="nav-item ${this.currentModule === m.id ? 'active' : ''}">
                            <span>${m.icon}</span>
                            <span>${m.name}</span>
                        </a>
                    `;
                }).join('')}
            </nav>
            
            <div class="nav-right">
                <div class="nav-status" id="firebase-status">
                    <span class="status-dot disconnected"></span>
                    <span class="status-text">Connexion...</span>
                </div>
                
                <button class="nav-btn" id="theme-toggle-btn" onclick="TrakioUI.toggleTheme()" title="${this.theme === 'dark' ? 'Mode jour' : 'Mode nuit'}">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>
                
                <div class="nav-user" onclick="TrakioUI.showUserMenu()">
                    <span class="nav-user-avatar">${this.currentUser?.name?.charAt(0).toUpperCase() || 'P'}</span>
                    <span class="nav-user-name">${this.currentUser?.name || 'Pascal'}</span>
                </div>
            </div>
        `;
        
        document.body.insertBefore(header, document.body.firstChild);
    },
    
    // ═══════════════════════════════════════════════════════════
    // MENU UTILISATEUR
    // ═══════════════════════════════════════════════════════════
    
    showUserMenu() {
        // Supprimer ancien menu
        const oldMenu = document.querySelector('.user-dropdown');
        if (oldMenu) {
            oldMenu.remove();
            return;
        }
        
        const userBtn = document.querySelector('.nav-user');
        if (!userBtn) return;
        
        const rect = userBtn.getBoundingClientRect();
        
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.style.cssText = `
            position: fixed;
            top: ${rect.bottom + 8}px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 8px 0;
            min-width: 200px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 999999;
        `;
        
        // Obtenir le rôle affiché
        const roleInfo = typeof TrakioConfig !== 'undefined' && TrakioConfig.ROLES
            ? TrakioConfig.ROLES[this.currentUser?.role]
            : null;
        
        dropdown.innerHTML = `
            <div style="padding: 12px 16px; border-bottom: 1px solid var(--border);">
                <div style="font-weight: 600; font-size: 14px;">${this.currentUser?.name || 'Pascal'}</div>
                <div style="font-size: 12px; color: var(--text-muted);">
                    ${roleInfo ? roleInfo.name : 'Administrateur'}
                </div>
            </div>
            <a href="parametres.html" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: var(--text); text-decoration: none; transition: background 0.2s;">
                <span>⚙️</span>
                <span>Paramètres</span>
            </a>
            <div style="border-top: 1px solid var(--border); margin-top: 4px; padding-top: 4px;">
                <a href="#" onclick="TrakioUI.showUserSwitcher(); return false;" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: var(--text); text-decoration: none; transition: background 0.2s;">
                    <span>👥</span>
                    <span>Changer d'utilisateur</span>
                </a>
            </div>
        `;
        
        document.body.appendChild(dropdown);
        
        // Fermer au clic ailleurs
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
                    dropdown.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    },
    
    // ═══════════════════════════════════════════════════════════
    // CHANGEMENT D'UTILISATEUR
    // ═══════════════════════════════════════════════════════════
    
    showUserSwitcher() {
        // Fermer le dropdown
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) dropdown.remove();
        
        // Obtenir la liste des utilisateurs
        let users = [];
        if (typeof TrakioUsers !== 'undefined') {
            users = TrakioUsers.getAll().filter(u => u.active);
        } else {
            users = [
                { id: 'pascal', name: 'Pascal', role: 'admin' },
                { id: 'celine', name: 'Céline', role: 'manager' },
                { id: 'hayat', name: 'Hayat', role: 'vendeur' }
            ];
        }
        
        // Créer la modal
        const modal = document.createElement('div');
        modal.className = 'user-switcher-modal';
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            backdrop-filter: blur(4px);
        `;
        
        const roleColors = {
            admin: '#ef4444',
            manager: '#f59e0b',
            vendeur: '#10b981',
            viewer: '#6b7280'
        };
        
        modal.innerHTML = `
            <div style="background: var(--bg-card); border-radius: 16px; padding: 24px; max-width: 400px; width: 90%; border: 1px solid var(--border);">
                <h3 style="margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
                    <span>👥</span>
                    <span>Changer d'utilisateur</span>
                </h3>
                
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${users.map(u => `
                        <button onclick="TrakioUI.switchUser('${u.id}')" style="
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            padding: 12px 16px;
                            background: ${this.currentUser?.id === u.id ? 'var(--bg-hover)' : 'var(--bg-input)'};
                            border: 1px solid ${this.currentUser?.id === u.id ? 'var(--primary)' : 'var(--border)'};
                            border-radius: 10px;
                            cursor: pointer;
                            color: var(--text);
                            transition: all 0.2s;
                            text-align: left;
                        ">
                            <div style="
                                width: 40px;
                                height: 40px;
                                background: ${roleColors[u.role] || '#6b7280'};
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: white;
                                font-weight: 700;
                                font-size: 16px;
                            ">${u.name.charAt(0)}</div>
                            <div style="flex: 1;">
                                <div style="font-weight: 600;">${u.name}</div>
                                <div style="font-size: 12px; color: var(--text-muted);">${u.role}</div>
                            </div>
                            ${this.currentUser?.id === u.id ? '<span style="color: var(--primary);">✓</span>' : ''}
                        </button>
                    `).join('')}
                </div>
                
                <button onclick="this.closest('.user-switcher-modal').remove()" style="
                    width: 100%;
                    padding: 12px;
                    margin-top: 16px;
                    background: var(--bg-input);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text);
                    cursor: pointer;
                    font-size: 14px;
                ">Annuler</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fermer au clic sur le fond
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },
    
    switchUser(userId) {
        // Fermer la modal
        const modal = document.querySelector('.user-switcher-modal');
        if (modal) modal.remove();
        
        if (typeof TrakioUsers !== 'undefined') {
            TrakioUsers.setCurrentUser(userId);
        } else {
            const user = { id: userId, name: userId.charAt(0).toUpperCase() + userId.slice(1) };
            localStorage.setItem('trakio_current_user', JSON.stringify(user));
        }
        
        // Recharger la page pour appliquer les nouvelles permissions
        window.location.reload();
    }
};

// ═══════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => TrakioUI.init());
} else {
    TrakioUI.init();
}

// Export global
window.TrakioUI = TrakioUI;

console.log(`🎨 TRAKIO UI v${TrakioUI.VERSION} chargé`);
