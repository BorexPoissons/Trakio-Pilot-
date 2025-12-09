/**
 * TRAKIO Configuration Centralisée
 * Version: 4.5.0
 * Fichier: trakio-config.js (RACINE)
 */

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDummy-REPLACE-WITH-REAL-KEY",
    authDomain: "trakio-pilot-6e97a.firebaseapp.com",
    projectId: "trakio-pilot-6e97a",
    storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
    messagingSenderId: "256841216130",
    appId: "1:256841216130:web:4ea5a967ba39c120d8849b"
};

// ==========================================
// APPLICATION SETTINGS
// ==========================================
const TRAKIO_CONFIG = {
    version: "4.5.0",
    appName: "TRAKIO",
    company: "Borex Poissons",
    syncInterval: 300000,
    autoRefreshInterval: 30000,
    maxHistoryItems: 50,
    
    dropboxPaths: {
        root: "/TRAKIO",
        system: "/TRAKIO/System",
        version: "/TRAKIO/System/version.json",
        articles: "/TRAKIO/Articles",
        clients: "/TRAKIO/Clients",
        commandes: "/TRAKIO/Commandes",
        compta: "/TRAKIO/Compta",
        tracabilite: "/TRAKIO/Tracabilite"
    },
    
    firebaseCollections: {
        articles: "articles",
        clients: "clients",
        commandes: "commandes",
        compta: "compta",
        users: "settings/app/users",
        settings: "settings",
        activities: "activities",
        tracabilite: "tracabilite"
    },
    
    storageKeys: {
        articles: "trakio_articles",
        clients: "trakio_quickorder",
        commandes: "trakio_commandes",
        compta: "trakio_compta",
        currentUser: "trakio_current_user",
        users: "trakio_users",
        settings: "trakio_settings",
        theme: "trakio_theme",
        coursPoissons: "trakio_cours_poissons",
        tracabilite: "trakio_tracabilite",
        caisse: "trakio_caisse",
        shopify: "trakio_shopify"
    }
};

// ==========================================
// CONSTANTES MÉTIER SUISSE
// ==========================================
const SWISS_CONFIG = {
    tva: {
        standard: 8.1,
        reduit: 2.6,
        hebergement: 3.8
    },
    currency: {
        code: "CHF",
        symbol: "CHF",
        locale: "fr-CH",
        decimals: 2
    },
    rounding: 0.05
};

// ==========================================
// RÔLES ET PERMISSIONS
// ==========================================
const ROLES_CONFIG = {
    admin: {
        label: "Administrateur",
        color: "#ef4444",
        icon: "👑",
        permissions: ["all"],
        modules: ["all"]
    },
    manager: {
        label: "Manager",
        color: "#f59e0b",
        icon: "⭐",
        permissions: ["read", "write", "manage"],
        modules: ["dashboard", "articles", "clients", "commandes", "myfish", "caisse", "tracabilite", "compta", "cours", "shopify", "whatsapp"]
    },
    employee: {
        label: "Employé",
        color: "#22c55e",
        icon: "👤",
        permissions: ["read", "write"],
        modules: ["dashboard", "commandes", "myfish", "caisse", "tracabilite"]
    }
};

// ==========================================
// MODULES TRAKIO
// ==========================================
const MODULES_CONFIG = {
    dashboard: { name: "Dashboard", icon: "📊", file: "index.html", section: "ventes", roles: ["admin", "manager", "employee"] },
    myfish: { name: "MyFish B2C", icon: "🐟", file: "myfish.html", section: "ventes", roles: ["admin", "manager", "employee"] },
    commandes: { name: "Commandes PRO", icon: "📋", file: "commandes.html", section: "ventes", roles: ["admin", "manager", "employee"] },
    caisse: { name: "Caisse POS", icon: "💳", file: "caisse.html", section: "ventes", roles: ["admin", "manager", "employee"] },
    articles: { name: "Articles", icon: "📦", file: "articles.html", section: "donnees", roles: ["admin", "manager"] },
    clients: { name: "Clients", icon: "👥", file: "clients.html", section: "donnees", roles: ["admin", "manager"] },
    cours: { name: "Cours Poissons", icon: "💰", file: "live.html", section: "outils", roles: ["admin", "manager"] },
    tracabilite: { name: "Traçabilité", icon: "🏷️", file: "tracabilite.html", section: "outils", roles: ["admin", "manager", "employee"] },
    shopify: { name: "Shop Hub", icon: "🛒", file: "shopify.html", section: "outils", roles: ["admin", "manager"] },
    whatsapp: { name: "WhatsApp", icon: "💬", file: "whatsapp.html", section: "outils", roles: ["admin", "manager"] },
    compta: { name: "Comptabilité", icon: "🧾", file: "compta.html", section: "systeme", roles: ["admin", "manager"] },
    cloud: { name: "Cloud Sync", icon: "☁️", file: "cloud.html", section: "systeme", roles: ["admin"] },
    parametres: { name: "Paramètres", icon: "⚙️", file: "parametres.html", section: "systeme", roles: ["admin"] }
};

const SECTIONS_CONFIG = {
    ventes: { label: "🛒 VENTES", order: 1 },
    donnees: { label: "📁 DONNÉES", order: 2 },
    outils: { label: "🔧 OUTILS", order: 3 },
    systeme: { label: "⚙️ SYSTÈME", order: 4 }
};

const STORES_CONFIG = {
    livraison: { id: "livraison", name: "Livraison Pro", email: "livraison@borexpoissons.ch", icon: "🚚" },
    facture: { id: "facture", name: "Facture Pro", email: "facture@borexpoissons.ch", icon: "📄" },
    magasin: { id: "magasin", name: "Lightspeed Magasin", email: "magasin@borexpoissons.ch", icon: "🏪" },
    coinsins: { id: "coinsins", name: "Lightspeed Coinsins", email: "coinsins@borexpoissons.ch", icon: "🏠" }
};

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================
function swiss(value) {
    return Math.round(value / SWISS_CONFIG.rounding) * SWISS_CONFIG.rounding;
}

function formatCHF(value) {
    return new Intl.NumberFormat(SWISS_CONFIG.currency.locale, {
        style: 'currency',
        currency: SWISS_CONFIG.currency.code,
        minimumFractionDigits: SWISS_CONFIG.currency.decimals
    }).format(swiss(value));
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}

function generateId(prefix = '') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substr(2, 5);
    return prefix ? `${prefix}-${ts}-${rand}` : `${ts}-${rand}`;
}

function hasModuleAccess(moduleId, userRole) {
    if (userRole === 'admin') return true;
    const mod = MODULES_CONFIG[moduleId];
    return mod ? mod.roles.includes(userRole) : false;
}

function getCurrentUser() {
    const data = localStorage.getItem(TRAKIO_CONFIG.storageKeys.currentUser);
    return data ? JSON.parse(data) : null;
}

function saveToStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); return true; }
    catch (e) { console.error('Storage error:', e); return false; }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) { return defaultValue; }
}

function generateLotNumber(location = 'LC') {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `${location}-${y}${m}${d}-${seq}`;
}

function calculateTVA(montantHT, type = 'reduit') {
    const taux = SWISS_CONFIG.tva[type] || SWISS_CONFIG.tva.reduit;
    const tva = montantHT * (taux / 100);
    return { ht: swiss(montantHT), tva: swiss(tva), ttc: swiss(montantHT + tva), taux };
}

function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function showToast(message, type = 'info', duration = 3000) {
    document.querySelectorAll('.trakio-toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `trakio-toast trakio-toast-${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    toast.innerHTML = `<span style="margin-right:8px">${icons[type]}</span>${message}`;
    Object.assign(toast.style, {
        position: 'fixed', bottom: '20px', right: '20px', padding: '12px 20px',
        borderRadius: '8px', color: 'white', fontWeight: '500', zIndex: '10000',
        animation: 'toastSlideIn 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        backgroundColor: colors[type]
    });
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'toastSlideOut 0.3s ease'; setTimeout(() => toast.remove(), 300); }, duration);
}

if (!document.getElementById('trakio-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'trakio-toast-styles';
    style.textContent = `
        @keyframes toastSlideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes toastSlideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
}

console.log(`✅ TRAKIO Config v${TRAKIO_CONFIG.version} chargé`);
