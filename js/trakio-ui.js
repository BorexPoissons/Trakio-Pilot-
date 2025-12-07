/**
 * TRAKIO UI Centralisée
 * Version: 1.0.0
 */

const TrakioUI = {
    MODULES: [
        { id: 'dashboard', name: 'Dashboard', icon: '📊', href: 'index.html', section: 'main' },
        { id: 'articles', name: 'Articles', icon: '🐟', href: 'articles.html', section: 'main' },
        { id: 'clients', name: 'Clients', icon: '👥', href: 'clients.html', section: 'main' },
        { id: 'commandes', name: 'Commandes', icon: '📋', href: 'commandes.html', section: 'ventes' },
        { id: 'myfish', name: 'MyFish', icon: '🛒', href: 'myfish.html', section: 'ventes' },
        { id: 'caisse', name: 'Caisse', icon: '💵', href: 'caisse.html', section: 'ventes' },
        { id: 'tracabilite', name: 'Traçabilité', icon: '🏷️', href: 'tracabilite.html', section: 'outils' },
        { id: 'compta', name: 'Compta', icon: '🧾', href: 'compta.html', section: 'outils' }
    ],
    
    THEME: {
        primary: '#0ea5e9',
        primaryDark: '#0284c7',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        bgDark: '#0f172a',
        bgCard: '#1e293b',
        bgInput: '#334155',
        text: '#f1f5f9',
        textMuted: '#94a3b8',
        border: '#475569'
    }
};

function injectTrakioHeader(currentModule = 'dashboard') {
    const styles = `
        .trakio-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-bottom: 1px solid #475569;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .trakio-header-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .trakio-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            color: #f1f5f9;
        }
        .trakio-logo-icon { font-size: 28px; }
        .trakio-logo-text {
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .trakio-version {
            background: #334155;
            color: #94a3b8;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 4px;
            font-weight: 500;
        }
        .trakio-header-center {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .trakio-nav-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 8px;
            color: #94a3b8;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }
        .trakio-nav-btn:hover {
            background: #334155;
            color: #f1f5f9;
        }
        .trakio-nav-btn.active {
            background: #0ea5e9;
            color: white;
            border-color: #0284c7;
        }
        .trakio-nav-btn .nav-icon { font-size: 16px; }
        .trakio-header-right {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .trakio-status {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 6px 12px;
            background: #334155;
            border-radius: 8px;
            font-size: 12px;
        }
        .trakio-status-item {
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
        }
        .trakio-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        .trakio-status-dot.connected {
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
        }
        .trakio-status-dot.syncing {
            background: #f59e0b;
            animation: blink 0.5s infinite;
        }
        .trakio-status-dot.disconnected {
            background: #ef4444;
            box-shadow: 0 0 8px #ef4444;
            animation: none;
        }
        .trakio-status-dot.offline {
            background: #6b7280;
            animation: none;
        }
        .trakio-user {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: #334155;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.2s;
        }
        .trakio-user:hover { background: #475569; }
        .trakio-user-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #0ea5e9;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            color: white;
        }
        .trakio-user-name {
            font-size: 13px;
            color: #f1f5f9;
            font-weight: 500;
        }
        .trakio-menu-toggle {
            display: none;
            background: none;
            border: none;
            color: #f1f5f9;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
        }
        body.trakio-app {
            padding-top: 70px;
            background: #0f172a;
            color: #f1f5f9;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
            margin: 0;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        @media (max-width: 900px) {
            .trakio-header-center {
                display: none;
                position: absolute;
                top: 60px;
                left: 0;
                right: 0;
                background: #1e293b;
                flex-direction: column;
                padding: 15px;
                border-bottom: 1px solid #475569;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }
            .trakio-header-center.open { display: flex; }
            .trakio-menu-toggle { display: block; }
            .trakio-nav-btn {
                width: 100%;
                justify-content: flex-start;
                padding: 12px 15px;
            }
            .trakio-logo-text { font-size: 18px; }
            .trakio-version { display: none; }
        }
        @media (max-width: 600px) {
            .trakio-status { padding: 4px 8px; gap: 8px; }
            .trakio-status-item span:not(.trakio-status-dot) { display: none; }
            .trakio-user-name { display: none; }
        }
    `;
    
    if (!document.getElementById('trakio-header-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'trakio-header-styles';
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
    }
    
    const mainModules = TrakioUI.MODULES.filter(m => ['main', 'ventes'].includes(m.section));
    
    const headerHTML = `
        <header class="trakio-header" id="trakio-header">
            <div class="trakio-header-left">
                <a href="index.html" class="trakio-logo">
                    <span class="trakio-logo-icon">🐟</span>
                    <span class="trakio-logo-text">TRAKIO</span>
                </a>
                <span class="trakio-version">v${TRAKIO.VERSION}</span>
                <button class="trakio-menu-toggle" onclick="toggleTrakioMenu()">☰</button>
            </div>
            <nav class="trakio-header-center" id="trakio-nav">
                ${mainModules.map(m => `
                    <a href="${m.href}" class="trakio-nav-btn ${m.id === currentModule ? 'active' : ''}" data-module="${m.id}">
                        <span class="nav-icon">${m.icon}</span>
                        <span class="nav-text">${m.name}</span>
                    </a>
                `).join('')}
            </nav>
            <div class="trakio-header-right">
                <div class="trakio-status" id="trakio-status">
                    <div class="trakio-status-item" id="firebase-status">
                        <span class="trakio-status-dot disconnected" id="firebase-dot"></span>
                        <span id="firebase-text">Connexion...</span>
                    </div>
                </div>
                <div class="trakio-user" id="trakio-user" onclick="showUserMenu()">
                    <div class="trakio-user-avatar" id="user-avatar">?</div>
                    <span class="trakio-user-name" id="user-name">Non connecté</span>
                </div>
            </div>
        </header>
    `;
    
    document.body.classList.add('trakio-app');
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    updateUserDisplay();
    updateConnectionStatus();
}

function toggleTrakioMenu() {
    const nav = document.getElementById('trakio-nav');
    if (nav) nav.classList.toggle('open');
}

document.addEventListener('click', (e) => {
    const nav = document.getElementById('trakio-nav');
    const toggle = document.querySelector('.trakio-menu-toggle');
    if (nav && !nav.contains(e.target) && !toggle?.contains(e.target)) {
        nav.classList.remove('open');
    }
});

function updateConnectionStatus(status = null) {
    const dot = document.getElementById('firebase-dot');
    const text = document.getElementById('firebase-text');
    
    if (!dot || !text) return;
    
    if (!status) {
        if (!TRAKIO_STATE.isOnline) status = 'offline';
        else if (TRAKIO_STATE.syncInProgress) status = 'syncing';
        else if (TRAKIO_STATE.firebaseConnected) status = 'connected';
        else status = 'disconnected';
    }
    
    dot.classList.remove('connected', 'syncing', 'disconnected', 'offline');
    
    switch (status) {
        case 'connected':
            dot.classList.add('connected');
            text.textContent = 'Firebase';
            break;
        case 'syncing':
            dot.classList.add('syncing');
            text.textContent = 'Sync...';
            break;
        case 'disconnected':
            dot.classList.add('disconnected');
            text.textContent = 'Déconnecté';
            break;
        case 'offline':
            dot.classList.add('offline');
            text.textContent = 'Hors ligne';
            break;
    }
}

function updateUserDisplay() {
    const avatar = document.getElementById('user-avatar');
    const name = document.getElementById('user-name');
    
    if (!avatar || !name) return;
    
    const user = TRAKIO_STATE.currentUser;
    
    if (user) {
        avatar.textContent = user.charAt(0).toUpperCase();
        name.textContent = user;
        if (user === TRAKIO.ADMIN) {
            avatar.style.background = '#f59e0b';
        }
    } else {
        avatar.textContent = '?';
        name.textContent = 'Non connecté';
    }
}

function showUserMenu() {
    let modal = document.getElementById('user-menu-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'user-menu-modal';
        modal.style.cssText = 'position:fixed;top:70px;right:20px;background:#1e293b;border:1px solid #475569;border-radius:12px;padding:15px;min-width:200px;z-index:10001;box-shadow:0 8px 24px rgba(0,0,0,0.4);display:none;';
        
        modal.innerHTML = `
            <div style="margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid #475569;">
                <div style="font-weight:600;color:#f1f5f9;">Changer d'utilisateur</div>
            </div>
            <div id="user-list" style="display:flex;flex-direction:column;gap:8px;"></div>
            <div style="margin-top:15px;padding-top:15px;border-top:1px solid #475569;">
                <button onclick="logoutUser()" style="width:100%;padding:10px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:500;">🚪 Déconnexion</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const userList = document.getElementById('user-list');
        TRAKIO.USERS.forEach(user => {
            const btn = document.createElement('button');
            btn.style.cssText = 'padding:10px 15px;background:#334155;color:#f1f5f9;border:none;border-radius:8px;cursor:pointer;text-align:left;font-size:14px;display:flex;align-items:center;gap:10px;';
            btn.innerHTML = `<span style="width:32px;height:32px;border-radius:50%;background:${user === TRAKIO.ADMIN ? '#f59e0b' : '#0ea5e9'};display:flex;align-items:center;justify-content:center;font-weight:600;">${user.charAt(0)}</span><span>${user}${user === TRAKIO.ADMIN ? ' (Admin)' : ''}</span>`;
            btn.onclick = () => switchUser(user);
            userList.appendChild(btn);
        });
        
        document.addEventListener('click', (e) => {
            if (!modal.contains(e.target) && !document.getElementById('trakio-user')?.contains(e.target)) {
                modal.style.display = 'none';
            }
        });
    }
    
    modal.style.display = modal.style.display === 'none' ? 'block' : 'none';
}

function switchUser(user) {
    TRAKIO_STATE.currentUser = user;
    TRAKIO_STATE.isAdmin = (user === TRAKIO.ADMIN);
    localStorage.setItem(TRAKIO.STORAGE_KEYS.USER, user);
    
    updateUserDisplay();
    document.getElementById('user-menu-modal').style.display = 'none';
    
    showNotification(`Connecté en tant que ${user}`, 'success');
    console.log(`👤 Utilisateur: ${user} (Admin: ${TRAKIO_STATE.isAdmin})`);
}

function logoutUser() {
    TRAKIO_STATE.currentUser = null;
    TRAKIO_STATE.isAdmin = false;
    localStorage.removeItem(TRAKIO.STORAGE_KEYS.USER);
    
    updateUserDisplay();
    document.getElementById('user-menu-modal').style.display = 'none';
    
    showNotification('Déconnecté', 'info');
}

async function initTrakioApp(moduleId = 'dashboard') {
    console.log(`🚀 Initialisation TRAKIO ${moduleId}...`);
    
    injectTrakioHeader(moduleId);
    
    const firebaseOk = await initFirebase();
    
    if (firebaseOk) {
        console.log('✅ Firebase prêt');
        
        const lastSync = localStorage.getItem(TRAKIO.STORAGE_KEYS.LAST_SYNC);
        const syncAge = lastSync ? Date.now() - parseInt(lastSync) : Infinity;
        
        if (syncAge > 5 * 60 * 1000) {
            console.log('🔄 Sync initiale...');
            setTimeout(() => TrakioSync.syncAll(), 1000);
        }
    } else {
        console.warn('⚠️ Mode offline');
        showNotification('Mode hors ligne', 'warning');
    }
    
    if (!TRAKIO_STATE.currentUser) {
        setTimeout(showUserMenu, 500);
    }
    
    console.log('✅ TRAKIO initialisé');
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('👁️ Tab visible');
        updateConnectionStatus();
        if (TRAKIO_STATE.isOnline && !TRAKIO_STATE.firebaseConnected) {
            attemptReconnect();
        }
    }
});

console.log('🎨 TRAKIO UI v1.0.0 chargé');
