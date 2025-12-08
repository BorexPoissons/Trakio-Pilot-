/**
 * TRAKIO UI v4.5.0
 * Interface unifiée - Header, navigation, thème, user switcher
 */

const TrakioUI = {
    VERSION: '4.5.0',
    currentModule: null,
    theme: 'dark',
    currentUser: null,
    firebaseStatus: 'connecting',

    init() {
        this.detectCurrentModule();
        this.loadTheme();
        this.loadUser();
        this.injectStyles();
        this.injectHeader();
        this.checkPermissions();
        
        // Écouter les changements de connexion
        window.addEventListener('online', () => this.setFirebaseStatus('connected'));
        window.addEventListener('offline', () => this.setFirebaseStatus('offline'));
    },

    detectCurrentModule() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '') || 'index';
        const moduleMap = {
            'index': 'dashboard',
            'articles': 'articles',
            'clients': 'clients',
            'commandes': 'commandes',
            'myfish': 'myfish',
            'caisse': 'caisse',
            'tracabilite': 'tracabilite',
            'compta': 'compta',
            'shopify': 'shopify',
            'parametres': 'parametres',
            'cloud': 'cloud',
            'live': 'live',
            'whatsapp': 'whatsapp'
        };
        this.currentModule = moduleMap[filename] || 'dashboard';
    },

    checkPermissions() {
        if (this.currentModule === 'parametres') return; // Toujours accessible
        if (!TrakioPermissions.canAccess(this.currentModule)) {
            this.showAccessDenied();
        }
    },

    showAccessDenied() {
        document.body.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;background:var(--trakio-bg);color:var(--trakio-text);">
                <div style="font-size:80px;margin-bottom:20px;">🔒</div>
                <h1 style="margin-bottom:10px;">Accès refusé</h1>
                <p style="color:var(--trakio-text-muted);margin-bottom:30px;">Vous n'avez pas accès à ce module.</p>
                <a href="index.html" style="padding:12px 30px;background:var(--trakio-primary);color:white;border-radius:10px;text-decoration:none;font-weight:600;">← Retour au dashboard</a>
            </div>
        `;
    },

    loadTheme() {
        this.theme = localStorage.getItem('trakio_theme') || 'dark';
        this.applyTheme();
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = this.theme === 'dark' ? '☀️' : '🌙';
    },

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('trakio_theme', this.theme);
        this.applyTheme();
        this.showToast(this.theme === 'dark' ? '🌙 Mode sombre' : '☀️ Mode clair', 'info');
    },

    loadUser() {
        this.currentUser = TrakioUsers.getCurrentUser();
        if (!this.currentUser) {
            TrakioUsers.init();
            this.currentUser = TrakioUsers.getCurrentUser();
        }
    },

    updateUserDisplay() {
        const nameEl = document.getElementById('user-name-display');
        const avatarEl = document.getElementById('user-avatar');
        if (nameEl && this.currentUser) {
            nameEl.textContent = this.currentUser.name;
        }
        if (avatarEl && this.currentUser) {
            const roleColors = { admin: '#ef4444', manager: '#f59e0b', vendeur: '#10b981', viewer: '#6b7280' };
            avatarEl.style.background = roleColors[this.currentUser.role] || '#6b7280';
            avatarEl.textContent = (this.currentUser.name || 'U')[0].toUpperCase();
        }
    },

    setFirebaseStatus(status) {
        this.firebaseStatus = status;
        const dot = document.getElementById('firebase-dot');
        const text = document.getElementById('firebase-text');
        if (!dot || !text) return;

        const states = {
            connected: { color: '#10b981', text: 'Connecté', pulse: false },
            connecting: { color: '#f59e0b', text: 'Connexion...', pulse: true },
            syncing: { color: '#f59e0b', text: 'Sync...', pulse: true },
            offline: { color: '#ef4444', text: 'Hors ligne', pulse: false },
            error: { color: '#ef4444', text: 'Erreur', pulse: false }
        };

        const state = states[status] || states.offline;
        dot.style.background = state.color;
        dot.style.animation = state.pulse ? 'pulse 1.5s infinite' : 'none';
        text.textContent = state.text;
    },

    showToast(message, type = 'info') {
        const existing = document.querySelector('.trakio-toast');
        if (existing) existing.remove();

        const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
        const toast = document.createElement('div');
        toast.className = 'trakio-toast';
        toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: var(--trakio-bg-card); border: 1px solid var(--trakio-border);
            padding: 14px 24px; border-radius: 12px; z-index: 99999;
            animation: slideUp 0.3s ease; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            display: flex; align-items: center; gap: 10px; font-weight: 500;
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },

    getMenuItems() {
        const allItems = [
            { id: 'dashboard', name: 'Dashboard', icon: '📊', url: 'index.html' },
            { id: 'articles', name: 'Articles', icon: '📦', url: 'articles.html' },
            { id: 'clients', name: 'Clients', icon: '👥', url: 'clients.html' },
            { id: 'commandes', name: 'Commandes', icon: '📋', url: 'commandes.html' },
            { id: 'myfish', name: 'MyFish', icon: '🛒', url: 'myfish.html' },
            { id: 'caisse', name: 'Caisse', icon: '💵', url: 'caisse.html' },
            { id: 'separator', name: '', icon: '', url: '' },
            { id: 'tracabilite', name: 'Traçabilité', icon: '🏷️', url: 'tracabilite.html' },
            { id: 'compta', name: 'Compta', icon: '📒', url: 'compta.html' },
            { id: 'shopify', name: 'Shop', icon: '🛍️', url: 'shopify.html' },
            { id: 'live', name: 'Cours', icon: '📈', url: 'live.html' },
            { id: 'whatsapp', name: 'WhatsApp', icon: '💬', url: 'whatsapp.html' },
            { id: 'cloud', name: 'Cloud', icon: '☁️', url: 'cloud.html' }
        ];

        const myModules = TrakioPermissions.getMyModules();
        return allItems.filter(item => 
            item.id === 'separator' || myModules.includes(item.id)
        );
    },

    // ==================== USER SWITCHER ====================
    showUserSwitcher() {
        // Fermer si déjà ouvert
        const existing = document.getElementById('user-switcher-modal');
        if (existing) { existing.remove(); return; }

        const users = TrakioUsers.getAll().filter(u => u.active !== false);
        const currentId = this.currentUser?.id;

        const roleLabels = { admin: 'Admin', manager: 'Manager', vendeur: 'Vendeur', viewer: 'Viewer' };
        const roleColors = { admin: '#ef4444', manager: '#f59e0b', vendeur: '#10b981', viewer: '#6b7280' };

        const modal = document.createElement('div');
        modal.id = 'user-switcher-modal';
        modal.className = 'user-switcher-overlay';
        modal.innerHTML = `
            <div class="user-switcher-modal">
                <div class="user-switcher-header">
                    <span>👥 Changer d'utilisateur</span>
                    <button class="user-switcher-close" onclick="TrakioUI.closeUserSwitcher()">×</button>
                </div>
                <div class="user-switcher-list">
                    ${users.map(u => `
                        <div class="user-switcher-item ${u.id === currentId ? 'active' : ''}" 
                             onclick="TrakioUI.switchUser('${u.id}')"
                             data-userid="${u.id}">
                            <div class="user-switcher-avatar" style="background:${roleColors[u.role] || '#6b7280'}">
                                ${(u.name || 'U')[0].toUpperCase()}
                            </div>
                            <div class="user-switcher-info">
                                <div class="user-switcher-name">${u.name}</div>
                                <div class="user-switcher-role">${roleLabels[u.role] || u.role}</div>
                            </div>
                            ${u.id === currentId ? '<span class="user-switcher-check">✓</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeUserSwitcher();
        });

        // Fermer avec Escape
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeUserSwitcher();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Animation d'entrée
        requestAnimationFrame(() => modal.classList.add('active'));
    },

    closeUserSwitcher() {
        const modal = document.getElementById('user-switcher-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 200);
        }
    },

    switchUser(userId) {
        console.log('Switching to user:', userId);
        
        // Mettre à jour l'utilisateur courant
        TrakioUsers.setCurrentUser(userId);
        
        // Recharger l'utilisateur localement
        this.currentUser = TrakioUsers.getCurrentUser();
        
        // Fermer le modal
        this.closeUserSwitcher();
        
        // Afficher confirmation
        this.showToast(`✅ Connecté en tant que ${this.currentUser?.name || 'Utilisateur'}`, 'success');
        
        // Recharger la page après un court délai pour appliquer les permissions
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },

    // ==================== STYLES ====================
    injectStyles() {
        if (document.getElementById('trakio-ui-styles')) return;

        const style = document.createElement('style');
        style.id = 'trakio-ui-styles';
        style.textContent = `
            :root, [data-theme="dark"] {
                --trakio-bg: #0f172a;
                --trakio-bg-card: #1e293b;
                --trakio-bg-input: #334155;
                --trakio-bg-hover: #475569;
                --trakio-text: #f1f5f9;
                --trakio-text-muted: #94a3b8;
                --trakio-border: #334155;
                --trakio-primary: #0ea5e9;
                --trakio-success: #10b981;
                --trakio-warning: #f59e0b;
                --trakio-error: #ef4444;
            }
            [data-theme="light"] {
                --trakio-bg: #f1f5f9;
                --trakio-bg-card: #ffffff;
                --trakio-bg-input: #e2e8f0;
                --trakio-bg-hover: #cbd5e1;
                --trakio-text: #1e293b;
                --trakio-text-muted: #64748b;
                --trakio-border: #cbd5e1;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--trakio-bg);
                color: var(--trakio-text);
                padding-top: 65px;
                min-height: 100vh;
            }

            /* Header */
            .trakio-header {
                position: fixed; top: 0; left: 0; right: 0; height: 65px;
                background: var(--trakio-bg-card);
                border-bottom: 1px solid var(--trakio-border);
                display: flex; align-items: center;
                padding: 0 20px; gap: 20px; z-index: 9000;
            }
            .trakio-brand {
                display: flex; align-items: center; gap: 10px;
                font-weight: 700; font-size: 18px; color: var(--trakio-text);
                text-decoration: none; flex-shrink: 0;
            }
            .trakio-brand-icon { font-size: 28px; }
            .trakio-version {
                font-size: 10px; background: var(--trakio-primary);
                padding: 2px 6px; border-radius: 4px; color: white;
            }

            /* Navigation */
            .trakio-nav {
                display: flex; gap: 5px; overflow-x: auto; flex: 1;
                scrollbar-width: none; -ms-overflow-style: none;
            }
            .trakio-nav::-webkit-scrollbar { display: none; }
            .trakio-nav-item {
                padding: 10px 16px; border-radius: 8px;
                color: var(--trakio-text-muted);
                text-decoration: none; font-size: 13px; font-weight: 500;
                white-space: nowrap; transition: all 0.2s;
                display: flex; align-items: center; gap: 6px;
            }
            .trakio-nav-item:hover { background: var(--trakio-bg-input); color: var(--trakio-text); }
            .trakio-nav-item.active { background: var(--trakio-primary); color: white; }
            .trakio-nav-separator { width: 1px; background: var(--trakio-border); margin: 5px 8px; }

            /* Right section */
            .trakio-header-right {
                display: flex; align-items: center; gap: 12px; flex-shrink: 0;
            }
            .trakio-status {
                display: flex; align-items: center; gap: 8px;
                padding: 6px 12px; background: var(--trakio-bg-input);
                border-radius: 20px; font-size: 12px;
            }
            #firebase-dot {
                width: 8px; height: 8px; border-radius: 50%;
                background: #f59e0b;
            }
            .trakio-theme-btn, .trakio-user-btn {
                background: var(--trakio-bg-input); border: none;
                border-radius: 10px; cursor: pointer;
                color: var(--trakio-text); transition: all 0.2s;
            }
            .trakio-theme-btn { width: 40px; height: 40px; font-size: 18px; }
            .trakio-theme-btn:hover { background: var(--trakio-bg-hover); }
            .trakio-user-btn {
                display: flex; align-items: center; gap: 10px;
                padding: 6px 12px 6px 6px;
            }
            .trakio-user-btn:hover { background: var(--trakio-bg-hover); }
            .trakio-user-avatar {
                width: 32px; height: 32px; border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
                color: white; font-weight: 700; font-size: 14px;
            }
            .trakio-user-name { font-size: 13px; font-weight: 500; }

            /* User Switcher Modal */
            .user-switcher-overlay {
                position: fixed; inset: 0;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(4px);
                display: flex; align-items: center; justify-content: center;
                z-index: 99998; opacity: 0;
                transition: opacity 0.2s;
            }
            .user-switcher-overlay.active { opacity: 1; }
            .user-switcher-modal {
                background: var(--trakio-bg-card);
                border: 1px solid var(--trakio-border);
                border-radius: 20px; width: 100%; max-width: 400px;
                max-height: 80vh; overflow: hidden;
                transform: scale(0.9); transition: transform 0.2s;
            }
            .user-switcher-overlay.active .user-switcher-modal { transform: scale(1); }
            .user-switcher-header {
                padding: 20px; border-bottom: 1px solid var(--trakio-border);
                display: flex; justify-content: space-between; align-items: center;
                font-weight: 600; font-size: 16px;
            }
            .user-switcher-close {
                width: 36px; height: 36px; border-radius: 50%;
                background: var(--trakio-bg-input); border: none;
                color: var(--trakio-text); cursor: pointer; font-size: 20px;
            }
            .user-switcher-close:hover { background: var(--trakio-bg-hover); }
            .user-switcher-list { padding: 10px; max-height: 400px; overflow-y: auto; }
            .user-switcher-item {
                display: flex; align-items: center; gap: 15px;
                padding: 14px 16px; border-radius: 12px;
                cursor: pointer; transition: all 0.2s; margin-bottom: 6px;
            }
            .user-switcher-item:hover { background: var(--trakio-bg-input); }
            .user-switcher-item.active {
                background: rgba(14, 165, 233, 0.15);
                border: 2px solid var(--trakio-primary);
            }
            .user-switcher-avatar {
                width: 45px; height: 45px; border-radius: 12px;
                display: flex; align-items: center; justify-content: center;
                color: white; font-weight: 700; font-size: 18px;
            }
            .user-switcher-info { flex: 1; }
            .user-switcher-name { font-weight: 600; font-size: 15px; }
            .user-switcher-role { font-size: 12px; color: var(--trakio-text-muted); margin-top: 2px; }
            .user-switcher-check { color: var(--trakio-primary); font-size: 20px; }

            /* Animations */
            @keyframes slideUp {
                from { opacity: 0; transform: translate(-50%, 20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* Responsive */
            @media (max-width: 900px) {
                .trakio-status { display: none; }
                .trakio-user-name { display: none; }
            }
            @media (max-width: 600px) {
                .trakio-brand span:not(.trakio-brand-icon) { display: none; }
                .trakio-nav-item span:first-child { display: none; }
            }
        `;
        document.head.appendChild(style);
    },

    // ==================== HEADER ====================
    injectHeader() {
        if (document.querySelector('.trakio-header')) return;

        const menuItems = this.getMenuItems();
        const roleColors = { admin: '#ef4444', manager: '#f59e0b', vendeur: '#10b981', viewer: '#6b7280' };

        const header = document.createElement('header');
        header.className = 'trakio-header';
        header.innerHTML = `
            <a href="index.html" class="trakio-brand">
                <span class="trakio-brand-icon">🐟</span>
                <span>TRAKIO</span>
                <span class="trakio-version">v${this.VERSION}</span>
            </a>
            <nav class="trakio-nav">
                ${menuItems.map(item => {
                    if (item.id === 'separator') return '<div class="trakio-nav-separator"></div>';
                    const isActive = item.id === this.currentModule;
                    return `<a href="${item.url}" class="trakio-nav-item ${isActive ? 'active' : ''}">
                        <span>${item.icon}</span>
                        <span>${item.name}</span>
                    </a>`;
                }).join('')}
            </nav>
            <div class="trakio-header-right">
                <div class="trakio-status">
                    <span id="firebase-dot"></span>
                    <span id="firebase-text">Connexion...</span>
                </div>
                <button class="trakio-theme-btn" id="theme-toggle" onclick="TrakioUI.toggleTheme()">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button class="trakio-user-btn" onclick="TrakioUI.showUserSwitcher()">
                    <div class="trakio-user-avatar" id="user-avatar" style="background:${roleColors[this.currentUser?.role] || '#6b7280'}">
                        ${(this.currentUser?.name || 'U')[0].toUpperCase()}
                    </div>
                    <span class="trakio-user-name" id="user-name-display">${this.currentUser?.name || 'Utilisateur'}</span>
                </button>
            </div>
        `;

        document.body.insertBefore(header, document.body.firstChild);

        // Paramètres link
        const nav = header.querySelector('.trakio-nav');
        if (TrakioPermissions.isAdmin()) {
            const settingsLink = document.createElement('a');
            settingsLink.href = 'parametres.html';
            settingsLink.className = `trakio-nav-item ${this.currentModule === 'parametres' ? 'active' : ''}`;
            settingsLink.innerHTML = '<span>⚙️</span><span>Paramètres</span>';
            nav.appendChild(settingsLink);
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => TrakioUI.init(), 100);
});
