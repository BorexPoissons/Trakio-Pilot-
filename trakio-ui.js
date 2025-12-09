/**
 * TRAKIO UI - Header Unifié
 * Version: 4.5.0
 * Fichier: trakio-ui.js (RACINE)
 * Injecte le header navigation sur tous les modules
 */

// ==========================================
// HEADER INJECTION
// ==========================================
class TrakioUI {
    constructor() {
        this.currentUser = null;
        this.theme = 'dark';
        this.syncStatus = 'online';
        this.currentModule = this.detectCurrentModule();
    }

    detectCurrentModule() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        for (const [key, mod] of Object.entries(MODULES_CONFIG)) {
            if (mod.file === filename) return key;
        }
        return 'dashboard';
    }

    init() {
        this.loadUser();
        this.loadTheme();
        this.injectStyles();
        this.injectHeader();
        this.setupEventListeners();
        console.log(`✅ TRAKIO UI v${TRAKIO_CONFIG.version} initialisé - Module: ${this.currentModule}`);
    }

    loadUser() {
        this.currentUser = getCurrentUser();
    }

    loadTheme() {
        this.theme = localStorage.getItem(TRAKIO_CONFIG.storageKeys.theme) || 'dark';
        document.body.classList.toggle('light-theme', this.theme === 'light');
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(TRAKIO_CONFIG.storageKeys.theme, this.theme);
        document.body.classList.toggle('light-theme', this.theme === 'light');
    }

    injectStyles() {
        if (document.getElementById('trakio-ui-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'trakio-ui-styles';
        styles.textContent = `
            :root {
                --trakio-bg-primary: #0f172a;
                --trakio-bg-secondary: #1e293b;
                --trakio-bg-tertiary: #334155;
                --trakio-text-primary: #f8fafc;
                --trakio-text-secondary: #94a3b8;
                --trakio-text-muted: #64748b;
                --trakio-accent-blue: #3b82f6;
                --trakio-accent-green: #22c55e;
                --trakio-accent-yellow: #f59e0b;
                --trakio-accent-red: #ef4444;
                --trakio-accent-purple: #8b5cf6;
                --trakio-border: #475569;
            }

            body.light-theme {
                --trakio-bg-primary: #f8fafc;
                --trakio-bg-secondary: #e2e8f0;
                --trakio-bg-tertiary: #cbd5e1;
                --trakio-text-primary: #0f172a;
                --trakio-text-secondary: #475569;
                --trakio-text-muted: #64748b;
                --trakio-border: #94a3b8;
            }

            .trakio-header {
                background: linear-gradient(135deg, var(--trakio-bg-secondary) 0%, var(--trakio-bg-tertiary) 100%);
                padding: 10px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--trakio-border);
                position: sticky;
                top: 0;
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .trakio-header-left {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .trakio-logo {
                display: flex;
                align-items: center;
                gap: 10px;
                text-decoration: none;
                color: var(--trakio-text-primary);
                font-weight: 700;
                font-size: 1.3rem;
            }

            .trakio-logo:hover {
                color: var(--trakio-accent-blue);
            }

            .trakio-logo-icon {
                font-size: 1.5rem;
            }

            .trakio-version {
                background: var(--trakio-accent-purple);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 600;
            }

            .trakio-nav {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .trakio-nav-item {
                padding: 8px 14px;
                border-radius: 8px;
                text-decoration: none;
                color: var(--trakio-text-secondary);
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
                white-space: nowrap;
            }

            .trakio-nav-item:hover {
                background: var(--trakio-bg-tertiary);
                color: var(--trakio-text-primary);
            }

            .trakio-nav-item.active {
                background: var(--trakio-accent-blue);
                color: white;
            }

            .trakio-nav-separator {
                width: 1px;
                height: 24px;
                background: var(--trakio-border);
                margin: 0 8px;
            }

            .trakio-header-right {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .trakio-sync-status {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: var(--trakio-bg-tertiary);
                border-radius: 20px;
                font-size: 0.8rem;
                color: var(--trakio-text-secondary);
            }

            .trakio-sync-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: var(--trakio-accent-green);
            }

            .trakio-sync-dot.offline { background: var(--trakio-accent-red); }
            .trakio-sync-dot.syncing { background: var(--trakio-accent-yellow); animation: trakioPulse 1s infinite; }

            @keyframes trakioPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .trakio-theme-toggle {
                background: var(--trakio-bg-tertiary);
                border: none;
                padding: 8px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.1rem;
                transition: all 0.2s;
            }

            .trakio-theme-toggle:hover {
                background: var(--trakio-accent-blue);
            }

            .trakio-user-btn {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 6px 12px 6px 6px;
                background: var(--trakio-bg-tertiary);
                border: 1px solid var(--trakio-border);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .trakio-user-btn:hover {
                border-color: var(--trakio-accent-blue);
            }

            .trakio-user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.85rem;
                color: white;
            }

            .trakio-user-info {
                text-align: left;
            }

            .trakio-user-name {
                font-weight: 500;
                font-size: 0.9rem;
                color: var(--trakio-text-primary);
            }

            .trakio-user-role {
                font-size: 0.75rem;
                color: var(--trakio-text-muted);
            }

            /* Mobile Menu */
            .trakio-mobile-toggle {
                display: none;
                background: var(--trakio-bg-tertiary);
                border: none;
                padding: 10px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.2rem;
            }

            @media (max-width: 1024px) {
                .trakio-nav {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--trakio-bg-secondary);
                    flex-direction: column;
                    padding: 16px;
                    border-bottom: 1px solid var(--trakio-border);
                    gap: 8px;
                }

                .trakio-nav.open {
                    display: flex;
                }

                .trakio-nav-item {
                    width: 100%;
                    justify-content: flex-start;
                }

                .trakio-nav-separator {
                    display: none;
                }

                .trakio-mobile-toggle {
                    display: block;
                }

                .trakio-user-info {
                    display: none;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    injectHeader() {
        // Remove existing header if any
        const existing = document.querySelector('.trakio-header');
        if (existing) existing.remove();

        const header = document.createElement('header');
        header.className = 'trakio-header';
        header.innerHTML = this.generateHeaderHTML();

        // Insert at the beginning of body
        document.body.insertBefore(header, document.body.firstChild);
    }

    generateHeaderHTML() {
        const user = this.currentUser || { name: 'Invité', initials: '?', role: 'employee', color: '#64748b' };
        const roleConfig = ROLES_CONFIG[user.role] || ROLES_CONFIG.employee;

        // Build navigation based on user permissions
        let navHTML = '';
        const sections = {};

        for (const [key, mod] of Object.entries(MODULES_CONFIG)) {
            if (!hasModuleAccess(key, user.role)) continue;
            if (!sections[mod.section]) sections[mod.section] = [];
            sections[mod.section].push({ key, ...mod });
        }

        // Quick access modules
        const quickModules = ['myfish', 'commandes', 'caisse', 'articles', 'clients'];
        for (const key of quickModules) {
            const mod = MODULES_CONFIG[key];
            if (mod && hasModuleAccess(key, user.role)) {
                const isActive = this.currentModule === key;
                navHTML += `<a href="${mod.file}" class="trakio-nav-item${isActive ? ' active' : ''}">${mod.icon} ${mod.name}</a>`;
            }
        }

        navHTML += '<div class="trakio-nav-separator"></div>';

        // Tools & System
        const toolModules = ['tracabilite', 'cours', 'shopify', 'compta', 'parametres'];
        for (const key of toolModules) {
            const mod = MODULES_CONFIG[key];
            if (mod && hasModuleAccess(key, user.role)) {
                const isActive = this.currentModule === key;
                navHTML += `<a href="${mod.file}" class="trakio-nav-item${isActive ? ' active' : ''}">${mod.icon}</a>`;
            }
        }

        return `
            <div class="trakio-header-left">
                <button class="trakio-mobile-toggle" onclick="trakioUI.toggleMobileNav()">☰</button>
                <a href="index.html" class="trakio-logo">
                    <span class="trakio-logo-icon">🐟</span>
                    <span>TRAKIO</span>
                    <span class="trakio-version">v${TRAKIO_CONFIG.version}</span>
                </a>
                <nav class="trakio-nav" id="trakioNav">
                    ${navHTML}
                </nav>
            </div>
            <div class="trakio-header-right">
                <div class="trakio-sync-status">
                    <span class="trakio-sync-dot ${this.syncStatus}"></span>
                    <span id="trakioSyncText">${this.getSyncText()}</span>
                </div>
                <button class="trakio-theme-toggle" onclick="trakioUI.toggleTheme()" title="Changer thème">
                    ${this.theme === 'dark' ? '☀️' : '🌙'}
                </button>
                <button class="trakio-user-btn" onclick="trakioUI.showUserMenu()">
                    <div class="trakio-user-avatar" style="background: ${user.color || roleConfig.color}">
                        ${user.initials || user.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="trakio-user-info">
                        <div class="trakio-user-name">${user.name}</div>
                        <div class="trakio-user-role">${roleConfig.icon} ${roleConfig.label}</div>
                    </div>
                </button>
            </div>
        `;
    }

    getSyncText() {
        const texts = { online: 'En ligne', offline: 'Hors ligne', syncing: 'Sync...' };
        return texts[this.syncStatus] || 'En ligne';
    }

    toggleMobileNav() {
        const nav = document.getElementById('trakioNav');
        if (nav) nav.classList.toggle('open');
    }

    showUserMenu() {
        // TODO: Implement user dropdown menu
        if (this.currentUser?.role === 'admin') {
            window.location.href = 'parametres.html';
        } else {
            showToast(`Connecté: ${this.currentUser?.name || 'Invité'}`, 'info');
        }
    }

    updateSyncStatus(status) {
        this.syncStatus = status;
        const dot = document.querySelector('.trakio-sync-dot');
        const text = document.getElementById('trakioSyncText');
        if (dot) {
            dot.className = `trakio-sync-dot ${status}`;
        }
        if (text) {
            text.textContent = this.getSyncText();
        }
    }

    setupEventListeners() {
        // Close mobile nav on outside click
        document.addEventListener('click', (e) => {
            const nav = document.getElementById('trakioNav');
            const toggle = document.querySelector('.trakio-mobile-toggle');
            if (nav && nav.classList.contains('open') && 
                !nav.contains(e.target) && 
                !toggle.contains(e.target)) {
                nav.classList.remove('open');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt + number for quick navigation
            if (e.altKey && e.key >= '1' && e.key <= '9') {
                const quickLinks = document.querySelectorAll('.trakio-nav-item');
                const index = parseInt(e.key) - 1;
                if (quickLinks[index]) {
                    e.preventDefault();
                    quickLinks[index].click();
                }
            }
        });
    }
}

// ==========================================
// AUTO-INIT
// ==========================================
let trakioUI;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for config to load
    if (typeof TRAKIO_CONFIG !== 'undefined') {
        trakioUI = new TrakioUI();
        trakioUI.init();
    } else {
        console.warn('⚠️ TRAKIO Config non chargé - Header non injecté');
    }
});

// Export for manual use
if (typeof window !== 'undefined') {
    window.TrakioUI = TrakioUI;
}
