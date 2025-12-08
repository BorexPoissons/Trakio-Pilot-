/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  TRAKIO UI v4.5.0 - Interface Unifiée                         ║
 * ║  Header + Menu + Thème + User Switcher + Toasts               ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const TrakioUI = {
    VERSION: '4.5.0',
    
    currentModule: null,
    theme: 'dark',
    currentUser: null,
    firebaseStatus: 'connecting',
    
    // ═══════════════════════════════════════════════════════════
    // INITIALISATION
    // ═══════════════════════════════════════════════════════════
    
    init() {
        this.detectCurrentModule();
        this.loadTheme();
        this.loadUser();
        this.injectStyles();
        this.injectHeader();
        
        // Vérifier les permissions
        if (!this.checkPermissions()) {
            return;
        }
        
        // Appliquer le thème
        setTimeout(() => this.applyTheme(), 10);
        
        console.log(`🎨 TrakioUI v${this.VERSION} initialisé - Module: ${this.currentModule}`);
    },
    
    // ═══════════════════════════════════════════════════════════
    // DÉTECTION MODULE
    // ═══════════════════════════════════════════════════════════
    
    detectCurrentModule() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const moduleMap = {
            'index.html': 'dashboard',
            '': 'dashboard',
            'articles.html': 'articles',
            'clients.html': 'clients',
            'commandes.html': 'commandes',
            'myfish.html': 'myfish',
            'caisse.html': 'caisse',
            'tracabilite.html': 'tracabilite',
            'compta.html': 'compta',
            'shopify.html': 'shopify',
            'parametres.html': 'parametres'
        };
        
        this.currentModule = moduleMap[filename] || 'dashboard';
    },
    
    // ═══════════════════════════════════════════════════════════
    // PERMISSIONS
    // ═══════════════════════════════════════════════════════════
    
    checkPermissions() {
        // Dashboard toujours accessible
        if (this.currentModule === 'dashboard') return true;
        
        if (typeof TrakioPermissions !== 'undefined') {
            const hasAccess = TrakioPermissions.canAccess(this.currentModule);
            
            if (!hasAccess) {
                console.warn(`⛔ Accès refusé: ${this.currentModule}`);
                this.showAccessDenied();
                return false;
            }
        }
        return true;
    },
    
    showAccessDenied() {
        document.body.innerHTML = `
            <div class="trakio-access-denied">
                <div class="trakio-access-denied-icon">🔒</div>
                <h1>Accès refusé</h1>
                <p>Vous n'avez pas les permissions pour accéder à ce module.</p>
                <a href="index.html" class="trakio-btn-primary">← Retour au Dashboard</a>
            </div>
        `;
        this.injectStyles();
    },
    
    // ═══════════════════════════════════════════════════════════
    // THÈME
    // ═══════════════════════════════════════════════════════════
    
    loadTheme() {
        this.theme = localStorage.getItem('trakio_theme') || 'dark';
    },
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.body.setAttribute('data-theme', this.theme);
        
        const btn = document.getElementById('trakio-theme-btn');
        if (btn) {
            btn.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';
            btn.title = this.theme === 'dark' ? 'Mode jour' : 'Mode nuit';
        }
    },
    
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('trakio_theme', this.theme);
        this.applyTheme();
        this.showToast(this.theme === 'dark' ? '🌙 Mode nuit' : '☀️ Mode jour', 'info');
    },
    
    // ═══════════════════════════════════════════════════════════
    // UTILISATEUR
    // ═══════════════════════════════════════════════════════════
    
    loadUser() {
        if (typeof TrakioUsers !== 'undefined') {
            this.currentUser = TrakioUsers.getCurrentUser();
        }
        
        if (!this.currentUser) {
            this.currentUser = { id: 'pascal', name: 'Pascal', role: 'admin' };
        }
    },
    
    updateUserDisplay() {
        this.loadUser();
        
        const nameEl = document.getElementById('trakio-user-name');
        const avatarEl = document.getElementById('trakio-user-avatar');
        
        if (nameEl) nameEl.textContent = this.currentUser.name;
        if (avatarEl) avatarEl.textContent = this.currentUser.name.charAt(0).toUpperCase();
    },
    
    // ═══════════════════════════════════════════════════════════
    // FIREBASE STATUS
    // ═══════════════════════════════════════════════════════════
    
    setFirebaseStatus(status) {
        this.firebaseStatus = status;
        
        const dot = document.getElementById('trakio-status-dot');
        const text = document.getElementById('trakio-status-text');
        
        if (dot) {
            dot.className = 'trakio-status-dot ' + status;
        }
        
        if (text) {
            const labels = {
                'connected': 'Connecté',
                'connecting': 'Connexion...',
                'syncing': 'Sync...',
                'offline': 'Hors ligne',
                'error': 'Erreur'
            };
            text.textContent = labels[status] || status;
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // TOAST NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    
    showToast(message, type = 'info') {
        const old = document.querySelector('.trakio-toast');
        if (old) old.remove();
        
        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        
        const toast = document.createElement('div');
        toast.className = `trakio-toast trakio-toast-${type}`;
        toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // ═══════════════════════════════════════════════════════════
    // MENU MODULES
    // ═══════════════════════════════════════════════════════════
    
    getMenuItems() {
        const allItems = [
            { id: 'dashboard', name: 'Dashboard', icon: '📊', url: 'index.html' },
            { id: 'articles', name: 'Articles', icon: '📦', url: 'articles.html' },
            { id: 'clients', name: 'Clients', icon: '👥', url: 'clients.html' },
            { id: 'commandes', name: 'Commandes', icon: '📋', url: 'commandes.html' },
            { id: 'myfish', name: 'MyFish', icon: '🛒', url: 'myfish.html' },
            { id: 'caisse', name: 'Caisse', icon: '💵', url: 'caisse.html' },
            { id: 'separator' },
            { id: 'tracabilite', name: 'Traçabilité', icon: '🏷️', url: 'tracabilite.html' },
            { id: 'compta', name: 'Compta', icon: '📒', url: 'compta.html' },
            { id: 'shopify', name: 'Shop Hub', icon: '🛍️', url: 'shopify.html' },
            { id: 'parametres', name: 'Paramètres', icon: '⚙️', url: 'parametres.html' }
        ];
        
        // Filtrer selon les permissions
        if (typeof TrakioPermissions !== 'undefined') {
            const accessibleModules = TrakioPermissions.getMyModules();
            return allItems.filter(item => {
                if (item.id === 'separator') return true;
                return accessibleModules.includes(item.id);
            });
        }
        
        return allItems;
    },
    
    // ═══════════════════════════════════════════════════════════
    // USER SWITCHER
    // ═══════════════════════════════════════════════════════════
    
    showUserSwitcher() {
        // Fermer si déjà ouvert
        const existing = document.getElementById('trakio-user-modal');
        if (existing) {
            existing.remove();
            return;
        }
        
        const users = typeof TrakioUsers !== 'undefined' ? TrakioUsers.getAll() : [];
        
        const roleColors = {
            admin: '#ef4444',
            manager: '#f59e0b',
            vendeur: '#10b981',
            viewer: '#6b7280'
        };
        
        const modal = document.createElement('div');
        modal.id = 'trakio-user-modal';
        modal.className = 'trakio-modal-overlay';
        modal.innerHTML = `
            <div class="trakio-modal">
                <div class="trakio-modal-header">
                    <h3>👥 Changer d'utilisateur</h3>
                    <button class="trakio-modal-close" onclick="TrakioUI.closeUserSwitcher()">×</button>
                </div>
                <div class="trakio-modal-body">
                    <div class="trakio-user-list">
                        ${users.filter(u => u.active !== false).map(u => `
                            <div class="trakio-user-item ${this.currentUser?.id === u.id ? 'active' : ''}" 
                                 onclick="TrakioUI.switchUser('${u.id}')">
                                <div class="trakio-user-avatar" style="background: ${roleColors[u.role] || '#6b7280'}">
                                    ${u.name.charAt(0).toUpperCase()}
                                </div>
                                <div class="trakio-user-info">
                                    <div class="trakio-user-name">${u.name}</div>
                                    <div class="trakio-user-role">${u.role}</div>
                                </div>
                                ${this.currentUser?.id === u.id ? '<span class="trakio-user-check">✓</span>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
        
        // Fermer au clic sur le fond
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeUserSwitcher();
        });
    },
    
    closeUserSwitcher() {
        const modal = document.getElementById('trakio-user-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 200);
        }
    },
    
    switchUser(userId) {
        if (typeof TrakioUsers !== 'undefined') {
            TrakioUsers.setCurrentUser(userId);
        }
        
        this.closeUserSwitcher();
        this.showToast('👤 Changement d\'utilisateur...', 'info');
        
        // Recharger la page pour appliquer les permissions
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },
    
    // ═══════════════════════════════════════════════════════════
    // INJECTION STYLES
    // ═══════════════════════════════════════════════════════════
    
    injectStyles() {
        if (document.getElementById('trakio-ui-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'trakio-ui-styles';
        style.textContent = `
            /* ═══════════════════════════════════════════════════════
               CSS VARIABLES
            ═══════════════════════════════════════════════════════ */
            
            :root, [data-theme="dark"] {
                --trakio-bg: #0f172a;
                --trakio-bg-card: #1e293b;
                --trakio-bg-input: #334155;
                --trakio-bg-hover: #475569;
                --trakio-border: #475569;
                --trakio-text: #f1f5f9;
                --trakio-text-muted: #94a3b8;
                --trakio-primary: #0ea5e9;
                --trakio-primary-dark: #0284c7;
                --trakio-success: #10b981;
                --trakio-warning: #f59e0b;
                --trakio-error: #ef4444;
                --trakio-purple: #8b5cf6;
            }
            
            [data-theme="light"] {
                --trakio-bg: #f1f5f9;
                --trakio-bg-card: #ffffff;
                --trakio-bg-input: #e2e8f0;
                --trakio-bg-hover: #cbd5e1;
                --trakio-border: #cbd5e1;
                --trakio-text: #0f172a;
                --trakio-text-muted: #64748b;
            }
            
            /* ═══════════════════════════════════════════════════════
               BASE
            ═══════════════════════════════════════════════════════ */
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            html, body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--trakio-bg) !important;
                color: var(--trakio-text) !important;
                min-height: 100vh;
            }
            
            body {
                padding-top: 70px !important;
            }
            
            /* ═══════════════════════════════════════════════════════
               HEADER
            ═══════════════════════════════════════════════════════ */
            
            .trakio-header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 65px;
                background: var(--trakio-bg-card);
                border-bottom: 1px solid var(--trakio-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 9999;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            .trakio-brand {
                display: flex;
                align-items: center;
                gap: 10px;
                text-decoration: none;
                color: var(--trakio-primary);
                font-weight: 700;
                font-size: 18px;
            }
            
            .trakio-brand-icon { font-size: 28px; }
            
            .trakio-brand-version {
                font-size: 10px;
                padding: 3px 8px;
                background: var(--trakio-bg-input);
                border-radius: 10px;
                color: var(--trakio-text-muted);
            }
            
            /* Menu Navigation */
            .trakio-nav {
                display: flex;
                align-items: center;
                gap: 4px;
                flex: 1;
                margin: 0 30px;
                overflow-x: auto;
                scrollbar-width: none;
            }
            
            .trakio-nav::-webkit-scrollbar { display: none; }
            
            .trakio-nav-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 10px 16px;
                border-radius: 10px;
                color: var(--trakio-text-muted);
                text-decoration: none;
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
                transition: all 0.2s;
            }
            
            .trakio-nav-item:hover {
                background: var(--trakio-bg-hover);
                color: var(--trakio-text);
            }
            
            .trakio-nav-item.active {
                background: var(--trakio-primary);
                color: white;
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);
            }
            
            .trakio-nav-separator {
                width: 1px;
                height: 24px;
                background: var(--trakio-border);
                margin: 0 8px;
            }
            
            /* Right Section */
            .trakio-header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .trakio-status {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 14px;
                background: var(--trakio-bg-input);
                border-radius: 20px;
                font-size: 12px;
            }
            
            .trakio-status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--trakio-text-muted);
            }
            
            .trakio-status-dot.connected { background: var(--trakio-success); box-shadow: 0 0 8px var(--trakio-success); }
            .trakio-status-dot.syncing { background: var(--trakio-warning); animation: pulse 1s infinite; }
            .trakio-status-dot.offline { background: var(--trakio-error); }
            .trakio-status-dot.connecting { background: var(--trakio-warning); animation: pulse 1s infinite; }
            
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            
            .trakio-btn-icon {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--trakio-bg-input);
                border: 1px solid var(--trakio-border);
                border-radius: 10px;
                cursor: pointer;
                font-size: 18px;
                transition: all 0.2s;
            }
            
            .trakio-btn-icon:hover {
                background: var(--trakio-bg-hover);
                border-color: var(--trakio-primary);
            }
            
            .trakio-user-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 16px;
                background: var(--trakio-primary);
                border-radius: 25px;
                color: white;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
                font-size: 14px;
                font-weight: 600;
            }
            
            .trakio-user-btn:hover {
                background: var(--trakio-primary-dark);
                transform: scale(1.02);
            }
            
            .trakio-user-btn-avatar {
                width: 28px;
                height: 28px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
            
            /* ═══════════════════════════════════════════════════════
               MODAL USER SWITCHER
            ═══════════════════════════════════════════════════════ */
            
            .trakio-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .trakio-modal-overlay.show { opacity: 1; }
            
            .trakio-modal {
                background: var(--trakio-bg-card);
                border-radius: 20px;
                width: 90%;
                max-width: 400px;
                border: 1px solid var(--trakio-border);
                transform: scale(0.9);
                transition: transform 0.2s;
            }
            
            .trakio-modal-overlay.show .trakio-modal {
                transform: scale(1);
            }
            
            .trakio-modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--trakio-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .trakio-modal-header h3 {
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .trakio-modal-close {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: var(--trakio-bg-input);
                border: none;
                color: var(--trakio-text);
                cursor: pointer;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .trakio-modal-body {
                padding: 20px;
            }
            
            .trakio-user-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .trakio-user-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: var(--trakio-bg-input);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
            }
            
            .trakio-user-item:hover {
                background: var(--trakio-bg-hover);
            }
            
            .trakio-user-item.active {
                border-color: var(--trakio-primary);
                background: rgba(14, 165, 233, 0.1);
            }
            
            .trakio-user-avatar {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 18px;
            }
            
            .trakio-user-info { flex: 1; }
            .trakio-user-name { font-weight: 600; font-size: 15px; }
            .trakio-user-role { font-size: 12px; color: var(--trakio-text-muted); text-transform: capitalize; }
            .trakio-user-check { color: var(--trakio-primary); font-size: 18px; }
            
            /* ═══════════════════════════════════════════════════════
               TOAST
            ═══════════════════════════════════════════════════════ */
            
            .trakio-toast {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%) translateY(100px);
                background: var(--trakio-bg-card);
                color: var(--trakio-text);
                padding: 14px 24px;
                border-radius: 12px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.3);
                border: 1px solid var(--trakio-border);
                z-index: 999999;
                opacity: 0;
                transition: all 0.3s;
            }
            
            .trakio-toast.show {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            
            .trakio-toast-success { border-color: var(--trakio-success); }
            .trakio-toast-error { border-color: var(--trakio-error); }
            .trakio-toast-warning { border-color: var(--trakio-warning); }
            
            /* ═══════════════════════════════════════════════════════
               ACCESS DENIED
            ═══════════════════════════════════════════════════════ */
            
            .trakio-access-denied {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
                padding: 40px;
            }
            
            .trakio-access-denied-icon {
                font-size: 80px;
                margin-bottom: 20px;
            }
            
            .trakio-access-denied h1 {
                font-size: 28px;
                margin-bottom: 10px;
            }
            
            .trakio-access-denied p {
                color: var(--trakio-text-muted);
                margin-bottom: 30px;
            }
            
            .trakio-btn-primary {
                padding: 14px 28px;
                background: var(--trakio-primary);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .trakio-btn-primary:hover {
                background: var(--trakio-primary-dark);
            }
            
            /* ═══════════════════════════════════════════════════════
               GLOBAL OVERRIDES
            ═══════════════════════════════════════════════════════ */
            
            .card, .stat-card, .kpi-card, .module-card, .settings-card {
                background: var(--trakio-bg-card) !important;
                border-color: var(--trakio-border) !important;
            }
            
            input, select, textarea {
                background: var(--trakio-bg-input) !important;
                color: var(--trakio-text) !important;
                border-color: var(--trakio-border) !important;
            }
            
            /* ═══════════════════════════════════════════════════════
               RESPONSIVE
            ═══════════════════════════════════════════════════════ */
            
            @media (max-width: 1200px) {
                .trakio-nav-item span:last-child { display: none; }
            }
            
            @media (max-width: 900px) {
                .trakio-brand-version { display: none; }
                .trakio-status span:last-child { display: none; }
            }
            
            @media (max-width: 768px) {
                .trakio-header { padding: 0 12px; }
                .trakio-brand span:not(.trakio-brand-icon) { display: none; }
                .trakio-nav { margin: 0 15px; }
                #trakio-user-name { display: none; }
            }
            
            @media (max-width: 600px) {
                .trakio-nav { display: none; }
            }
        `;
        
        document.head.insertBefore(style, document.head.firstChild);
    },
    
    // ═══════════════════════════════════════════════════════════
    // INJECTION HEADER
    // ═══════════════════════════════════════════════════════════
    
    injectHeader() {
        const old = document.querySelector('.trakio-header');
        if (old) old.remove();
        
        const menuItems = this.getMenuItems();
        
        const header = document.createElement('header');
        header.className = 'trakio-header';
        header.innerHTML = `
            <a href="index.html" class="trakio-brand">
                <span class="trakio-brand-icon">🐟</span>
                <span>TRAKIO</span>
                <span class="trakio-brand-version">v${this.VERSION}</span>
            </a>
            
            <nav class="trakio-nav">
                ${menuItems.map(item => {
                    if (item.id === 'separator') {
                        return '<div class="trakio-nav-separator"></div>';
                    }
                    return `
                        <a href="${item.url}" class="trakio-nav-item ${this.currentModule === item.id ? 'active' : ''}">
                            <span>${item.icon}</span>
                            <span>${item.name}</span>
                        </a>
                    `;
                }).join('')}
            </nav>
            
            <div class="trakio-header-right">
                <div class="trakio-status">
                    <span class="trakio-status-dot connecting" id="trakio-status-dot"></span>
                    <span id="trakio-status-text">Connexion...</span>
                </div>
                
                <button class="trakio-btn-icon" id="trakio-theme-btn" onclick="TrakioUI.toggleTheme()" title="Changer de thème">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>
                
                <button class="trakio-user-btn" onclick="TrakioUI.showUserSwitcher()">
                    <span class="trakio-user-btn-avatar" id="trakio-user-avatar">${this.currentUser?.name?.charAt(0).toUpperCase() || 'P'}</span>
                    <span id="trakio-user-name">${this.currentUser?.name || 'Pascal'}</span>
                </button>
            </div>
        `;
        
        document.body.insertBefore(header, document.body.firstChild);
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

window.TrakioUI = TrakioUI;

console.log(`🎨 TrakioUI v${TrakioUI.VERSION} chargé`);
