/**
 * TRAKIO UI v4.5.0
 * Header unifié + Navigation + Toasts + User Switcher
 */

const TrakioUI = {
    currentUser: null,
    currentModule: '',
    
    // ==================== INIT ====================
    init(moduleId = 'dashboard') {
        this.currentModule = moduleId;
        this.currentUser = TrakioUsers.getCurrentUser();
        this.injectHeader();
        this.applyTheme();
        this.updateConnectionStatus();
        
        // Check connection every 30s
        setInterval(() => this.updateConnectionStatus(), 30000);
        
        console.log('🎨 TrakioUI initialized for:', moduleId);
    },
    
    // ==================== HEADER ====================
    injectHeader() {
        const header = document.createElement('header');
        header.className = 'trakio-header';
        header.innerHTML = this.buildHeaderHTML();
        
        document.body.insertBefore(header, document.body.firstChild);
        
        // Add header styles
        this.injectStyles();
    },
    
    buildHeaderHTML() {
        const user = this.currentUser || { name: 'User', role: 'viewer' };
        const initial = (user.name || 'U')[0].toUpperCase();
        const roleColors = {
            admin: '#ef4444',
            manager: '#f59e0b',
            vendeur: '#10b981',
            viewer: '#6b7280'
        };
        const avatarColor = roleColors[user.role] || '#6b7280';
        
        return `
            <div class="header-left">
                <a href="index.html" class="header-logo">
                    <span class="logo-icon">🐟</span>
                    <span class="logo-text">TRAKIO</span>
                    <span class="logo-version">v4.5</span>
                </a>
                <nav class="header-nav">
                    ${this.buildNavItems()}
                </nav>
            </div>
            <div class="header-right">
                <button class="header-btn theme-toggle" onclick="TrakioUI.toggleTheme()" title="Changer thème">
                    <span class="theme-icon">☀️</span>
                </button>
                <div class="connection-status" id="connection-status" title="Statut connexion">
                    <span class="status-dot"></span>
                </div>
                <button class="header-user" onclick="TrakioUI.openUserSwitcher()">
                    <div class="user-avatar" style="background:${avatarColor}">${initial}</div>
                    <span class="user-name">${user.name}</span>
                </button>
            </div>
            
            <!-- User Switcher Modal -->
            <div class="user-switcher-overlay" id="user-switcher">
                <div class="user-switcher-modal">
                    <div class="user-switcher-header">
                        <span>👥 Changer d'utilisateur</span>
                        <button class="user-switcher-close" onclick="TrakioUI.closeUserSwitcher()">×</button>
                    </div>
                    <div class="user-switcher-list">
                        ${this.buildUsersList()}
                    </div>
                </div>
            </div>
        `;
    },
    
    buildNavItems() {
        const modules = [
            { id: 'dashboard', name: 'Dashboard', icon: '📊', url: 'index.html' },
            { id: 'articles', name: 'Articles', icon: '📦', url: 'articles.html' },
            { id: 'clients', name: 'Clients', icon: '👥', url: 'clients.html' },
            { id: 'commandes', name: 'Commandes', icon: '📋', url: 'commandes.html' },
            { id: 'myfish', name: 'MyFish', icon: '🛒', url: 'myfish.html' },
            { id: 'caisse', name: 'Caisse', icon: '💵', url: 'caisse.html' },
            { id: 'tracabilite', name: 'Traçabilité', icon: '🏷️', url: 'tracabilite.html' },
            { id: 'compta', name: 'Compta', icon: '📒', url: 'compta.html' },
            { id: 'shopify', name: 'Shop', icon: '🛍️', url: 'shopify.html' },
            { id: 'parametres', name: 'Paramètres', icon: '⚙️', url: 'parametres.html', adminOnly: true }
        ];
        
        const accessibleModules = TrakioPermissions.getMyModules();
        const isAdmin = TrakioPermissions.isAdmin();
        
        return modules
            .filter(m => {
                // Admin-only modules
                if (m.adminOnly && !isAdmin) return false;
                // Check module access
                if (m.adminOnly) return true; // Admin can always see admin modules
                return accessibleModules.includes(m.id);
            })
            .map(m => `
                <a href="${m.url}" class="nav-item ${this.currentModule === m.id ? 'active' : ''}" data-module="${m.id}">
                    <span class="nav-icon">${m.icon}</span>
                    <span class="nav-label">${m.name}</span>
                </a>
            `).join('');
    },
    
    buildUsersList() {
        const users = TrakioUsers.getAll().filter(u => u.active !== false);
        const currentId = this.currentUser?.id;
        
        const roleLabels = {
            admin: 'Admin',
            manager: 'Manager', 
            vendeur: 'Vendeur',
            viewer: 'Viewer'
        };
        
        const roleColors = {
            admin: '#ef4444',
            manager: '#f59e0b',
            vendeur: '#10b981',
            viewer: '#6b7280'
        };
        
        return users.map(u => `
            <div class="user-switcher-item ${u.id === currentId ? 'active' : ''}" onclick="TrakioUI.switchUser('${u.id}')">
                <div class="user-avatar" style="background:${roleColors[u.role] || '#6b7280'}">
                    ${(u.name || 'U')[0].toUpperCase()}
                </div>
                <div class="user-info">
                    <div class="user-name">${u.name}</div>
                    <div class="user-role">${roleLabels[u.role] || u.role}</div>
                </div>
                ${u.id === currentId ? '<span class="user-check">✓</span>' : ''}
            </div>
        `).join('');
    },
    
    // ==================== USER SWITCHER ====================
    openUserSwitcher() {
        // Refresh users list
        document.querySelector('.user-switcher-list').innerHTML = this.buildUsersList();
        document.getElementById('user-switcher').classList.add('active');
    },
    
    closeUserSwitcher() {
        document.getElementById('user-switcher').classList.remove('active');
    },
    
    switchUser(userId) {
        console.log('Switching to user:', userId);
        
        // Update current user
        TrakioUsers.setCurrentUser(userId);
        
        // Reload user locally
        this.currentUser = TrakioUsers.getCurrentUser();
        
        // Close modal
        this.closeUserSwitcher();
        
        // Show confirmation
        this.showToast(`✅ Connecté en tant que ${this.currentUser?.name || 'Utilisateur'}`, 'success');
        
        // Reload page after 500ms to apply permissions
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },
    
    // ==================== THEME ====================
    applyTheme() {
        const theme = localStorage.getItem('trakio_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    },
    
    toggleTheme() {
        const current = localStorage.getItem('trakio_theme') || 'dark';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('trakio_theme', newTheme);
        this.applyTheme();
        this.showToast(newTheme === 'dark' ? '🌙 Mode sombre' : '☀️ Mode clair', 'info');
    },
    
    // ==================== CONNECTION STATUS ====================
    updateConnectionStatus() {
        const statusEl = document.getElementById('connection-status');
        if (!statusEl) return;
        
        const dot = statusEl.querySelector('.status-dot');
        
        if (navigator.onLine && typeof firebase !== 'undefined' && firebase.apps?.length) {
            dot.className = 'status-dot online';
            statusEl.title = 'Connecté à Firebase';
        } else if (navigator.onLine) {
            dot.className = 'status-dot connecting';
            statusEl.title = 'Connexion en cours...';
        } else {
            dot.className = 'status-dot offline';
            statusEl.title = 'Hors ligne';
        }
    },
    
    // ==================== TOASTS ====================
    showToast(message, type = 'info', duration = 3000) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    // ==================== STYLES ====================
    injectStyles() {
        if (document.getElementById('trakio-ui-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'trakio-ui-styles';
        styles.textContent = `
            :root {
                --trakio-primary: #0ea5e9;
                --trakio-primary-dark: #0284c7;
                --trakio-success: #10b981;
                --trakio-warning: #f59e0b;
                --trakio-error: #ef4444;
                --trakio-bg: #0f172a;
                --trakio-bg-card: #1e293b;
                --trakio-bg-input: #334155;
                --trakio-bg-hover: #475569;
                --trakio-text: #f1f5f9;
                --trakio-text-muted: #94a3b8;
                --trakio-border: #334155;
            }
            
            [data-theme="light"] {
                --trakio-bg: #f1f5f9;
                --trakio-bg-card: #ffffff;
                --trakio-bg-input: #e2e8f0;
                --trakio-bg-hover: #cbd5e1;
                --trakio-text: #0f172a;
                --trakio-text-muted: #64748b;
                --trakio-border: #cbd5e1;
            }
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--trakio-bg);
                color: var(--trakio-text);
                min-height: 100vh;
                padding-top: 60px;
            }
            
            /* Header */
            .trakio-header {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: var(--trakio-bg-card);
                border-bottom: 1px solid var(--trakio-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                z-index: 1000;
            }
            
            .header-left {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .header-logo {
                display: flex;
                align-items: center;
                gap: 8px;
                text-decoration: none;
                color: var(--trakio-text);
            }
            
            .logo-icon { font-size: 24px; }
            .logo-text { font-weight: 700; font-size: 18px; }
            .logo-version {
                font-size: 10px;
                background: var(--trakio-primary);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-weight: 600;
            }
            
            /* Navigation */
            .header-nav {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .nav-item {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                border-radius: 8px;
                text-decoration: none;
                color: var(--trakio-text-muted);
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s;
            }
            
            .nav-item:hover {
                background: var(--trakio-bg-input);
                color: var(--trakio-text);
            }
            
            .nav-item.active {
                background: var(--trakio-primary);
                color: white;
            }
            
            .nav-icon { font-size: 14px; }
            
            /* Header Right */
            .header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .header-btn {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                border: none;
                background: var(--trakio-bg-input);
                color: var(--trakio-text);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: all 0.2s;
            }
            
            .header-btn:hover {
                background: var(--trakio-bg-hover);
            }
            
            /* Connection Status */
            .connection-status {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                background: var(--trakio-bg-input);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: var(--trakio-text-muted);
            }
            
            .status-dot.online { background: var(--trakio-success); }
            .status-dot.connecting { background: var(--trakio-warning); animation: pulse 1.5s infinite; }
            .status-dot.offline { background: var(--trakio-error); }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* User Button */
            .header-user {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 12px 6px 6px;
                background: var(--trakio-bg-input);
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .header-user:hover {
                background: var(--trakio-bg-hover);
            }
            
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 14px;
            }
            
            .header-user .user-name {
                color: var(--trakio-text);
                font-weight: 500;
                font-size: 14px;
            }
            
            /* User Switcher Modal */
            .user-switcher-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }
            
            .user-switcher-overlay.active {
                display: flex;
            }
            
            .user-switcher-modal {
                background: var(--trakio-bg-card);
                border-radius: 20px;
                border: 1px solid var(--trakio-border);
                width: 90%;
                max-width: 400px;
                overflow: hidden;
            }
            
            .user-switcher-header {
                padding: 20px;
                border-bottom: 1px solid var(--trakio-border);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 600;
                font-size: 16px;
            }
            
            .user-switcher-close {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: none;
                background: var(--trakio-bg-input);
                color: var(--trakio-text);
                cursor: pointer;
                font-size: 18px;
            }
            
            .user-switcher-list {
                padding: 10px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .user-switcher-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                margin-bottom: 6px;
            }
            
            .user-switcher-item:hover {
                background: var(--trakio-bg-input);
            }
            
            .user-switcher-item.active {
                background: rgba(14, 165, 233, 0.15);
                border: 2px solid var(--trakio-primary);
            }
            
            .user-switcher-item .user-avatar {
                width: 45px;
                height: 45px;
                border-radius: 12px;
                font-size: 18px;
            }
            
            .user-switcher-item .user-info {
                flex: 1;
            }
            
            .user-switcher-item .user-name {
                font-weight: 600;
                font-size: 15px;
                color: var(--trakio-text);
            }
            
            .user-switcher-item .user-role {
                font-size: 12px;
                color: var(--trakio-text-muted);
                margin-top: 2px;
            }
            
            .user-check {
                color: var(--trakio-primary);
                font-size: 18px;
            }
            
            /* Toast Container */
            .toast-container {
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .toast {
                background: var(--trakio-bg-card);
                border: 1px solid var(--trakio-border);
                border-radius: 12px;
                padding: 14px 20px;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                transform: translateX(120%);
                transition: transform 0.3s ease;
                min-width: 280px;
            }
            
            .toast.show {
                transform: translateX(0);
            }
            
            .toast-success { border-left: 4px solid var(--trakio-success); }
            .toast-error { border-left: 4px solid var(--trakio-error); }
            .toast-warning { border-left: 4px solid var(--trakio-warning); }
            .toast-info { border-left: 4px solid var(--trakio-primary); }
            
            .toast-message {
                flex: 1;
                font-size: 14px;
            }
            
            .toast-close {
                background: none;
                border: none;
                color: var(--trakio-text-muted);
                cursor: pointer;
                font-size: 18px;
                padding: 0;
                line-height: 1;
            }
            
            /* Responsive */
            @media (max-width: 1200px) {
                .nav-label { display: none; }
                .nav-item { padding: 10px; }
            }
            
            @media (max-width: 768px) {
                .header-nav { display: none; }
                .logo-text, .logo-version { display: none; }
                .header-user .user-name { display: none; }
            }
        `;
        
        document.head.appendChild(styles);
    }
};

// Close user switcher on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        TrakioUI.closeUserSwitcher();
    }
});

// Close on click outside
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('user-switcher');
    if (overlay && e.target === overlay) {
        TrakioUI.closeUserSwitcher();
    }
});

console.log('🎨 TrakioUI v4.5.0 loaded');
