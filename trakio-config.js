/**
 * TRAKIO Config v4.5.0
 * Configuration centrale + Users + Permissions
 */

// ==================== CONFIG ====================
const TrakioConfig = {
    VERSION: '4.5.0',
    
    FIREBASE: {
        apiKey: "AIzaSyBoGescolWTpGdm0SZh-Wk7blu8RwL2n4I",
        authDomain: "trakio-pilot-6e97a.firebaseapp.com",
        projectId: "trakio-pilot-6e97a",
        storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
        messagingSenderId: "256841216130",
        appId: "1:256841216130:web:abc123def456"
    },
    
    COMPANY: {
        name: 'Borex Poissons',
        currency: 'CHF',
        tva: 2.6,
        locale: 'fr-CH'
    },
    
    MODULES: {
        dashboard: { name: 'Dashboard', icon: '📊', url: 'index.html' },
        articles: { name: 'Articles', icon: '📦', url: 'articles.html' },
        clients: { name: 'Clients', icon: '👥', url: 'clients.html' },
        commandes: { name: 'Commandes', icon: '📋', url: 'commandes.html' },
        myfish: { name: 'MyFish', icon: '🛒', url: 'myfish.html' },
        caisse: { name: 'Caisse', icon: '💵', url: 'caisse.html' },
        tracabilite: { name: 'Traçabilité', icon: '🏷️', url: 'tracabilite.html' },
        compta: { name: 'Compta', icon: '📒', url: 'compta.html' },
        shopify: { name: 'Shop Hub', icon: '🛍️', url: 'shopify.html' },
        parametres: { name: 'Paramètres', icon: '⚙️', url: 'parametres.html' }
    },
    
    ROLES: {
        admin: { 
            label: '👑 Admin', 
            color: '#ef4444', 
            allAccess: true,
            canImport: true,
            canExport: true,
            canManageUsers: true
        },
        manager: { 
            label: '📊 Manager', 
            color: '#f59e0b',
            defaultModules: ['dashboard', 'articles', 'clients', 'commandes', 'myfish', 'caisse', 'compta', 'tracabilite'],
            canImport: false,
            canExport: true,
            canManageUsers: false
        },
        vendeur: { 
            label: '🛒 Vendeur', 
            color: '#10b981',
            defaultModules: ['dashboard', 'myfish', 'caisse', 'clients', 'commandes'],
            canImport: false,
            canExport: false,
            canManageUsers: false
        },
        viewer: { 
            label: '👁️ Viewer', 
            color: '#6b7280',
            defaultModules: ['dashboard'],
            canImport: false,
            canExport: false,
            canManageUsers: false
        }
    }
};

// ==================== USERS ====================
const TrakioUsers = {
    STORAGE_KEY: 'trakio_users',
    CURRENT_KEY: 'trakio_current_user',
    
    DEFAULT_USERS: [
        { id: 'pascal', name: 'Pascal', role: 'admin', pin: '1234', active: true, modules: [] },
        { id: 'celine', name: 'Céline', role: 'manager', pin: '0000', active: true, modules: ['dashboard', 'articles', 'clients', 'commandes', 'myfish', 'caisse', 'compta', 'tracabilite'] },
        { id: 'hayat', name: 'Hayat', role: 'vendeur', pin: '0000', active: true, modules: ['dashboard', 'myfish', 'caisse', 'clients', 'commandes'] }
    ],
    
    init() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.DEFAULT_USERS));
        }
        if (!localStorage.getItem(this.CURRENT_KEY)) {
            localStorage.setItem(this.CURRENT_KEY, 'pascal');
        }
        return this.getAll();
    },
    
    getAll() {
        const users = localStorage.getItem(this.STORAGE_KEY);
        return users ? JSON.parse(users) : this.DEFAULT_USERS;
    },
    
    getById(id) {
        return this.getAll().find(u => u.id === id);
    },
    
    getCurrentUser() {
        const currentId = localStorage.getItem(this.CURRENT_KEY);
        return this.getById(currentId) || this.getById('pascal');
    },
    
    setCurrentUser(userId) {
        localStorage.setItem(this.CURRENT_KEY, userId);
    },
    
    create(userData) {
        const users = this.getAll();
        const id = 'user_' + Date.now();
        const role = userData.role || 'vendeur';
        const roleConfig = TrakioConfig.ROLES[role];
        
        const newUser = {
            id,
            name: userData.name,
            role,
            pin: userData.pin || '0000',
            email: userData.email || '',
            active: userData.active !== false,
            modules: userData.modules || roleConfig?.defaultModules || ['dashboard'],
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
        return newUser;
    },
    
    update(id, updates) {
        const users = this.getAll();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        
        // Protection Pascal
        if (id === 'pascal' && updates.role && updates.role !== 'admin') {
            updates.role = 'admin';
        }
        
        users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
        return users[index];
    },
    
    delete(id) {
        if (id === 'pascal') return false; // Protection
        const users = this.getAll().filter(u => u.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
        return true;
    },
    
    verifyPin(userId, pin) {
        const user = this.getById(userId);
        return user && user.pin === pin;
    },
    
    changePin(userId, newPin) {
        if (!/^\d{4}$/.test(newPin)) return false;
        return this.update(userId, { pin: newPin });
    }
};

// ==================== PERMISSIONS ====================
const TrakioPermissions = {
    hasAccess(userId, moduleId) {
        const user = TrakioUsers.getById(userId);
        if (!user) return false;
        
        const roleConfig = TrakioConfig.ROLES[user.role];
        if (roleConfig?.allAccess) return true;
        
        return (user.modules || []).includes(moduleId);
    },
    
    canAccess(moduleId) {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        
        const roleConfig = TrakioConfig.ROLES[user.role];
        if (roleConfig?.allAccess) return true;
        
        return (user.modules || []).includes(moduleId);
    },
    
    getAccessibleModules(userId) {
        const user = TrakioUsers.getById(userId);
        if (!user) return [];
        
        const roleConfig = TrakioConfig.ROLES[user.role];
        if (roleConfig?.allAccess) {
            return Object.keys(TrakioConfig.MODULES);
        }
        
        return user.modules || [];
    },
    
    getMyModules() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return ['dashboard'];
        
        const roleConfig = TrakioConfig.ROLES[user.role];
        if (roleConfig?.allAccess) {
            return Object.keys(TrakioConfig.MODULES);
        }
        
        return user.modules || ['dashboard'];
    },
    
    setUserModules(userId, modules) {
        return TrakioUsers.update(userId, { modules });
    },
    
    canImport() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        const roleConfig = TrakioConfig.ROLES[user.role];
        return roleConfig?.canImport || roleConfig?.allAccess || false;
    },
    
    canExport() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        const roleConfig = TrakioConfig.ROLES[user.role];
        return roleConfig?.canExport || roleConfig?.allAccess || false;
    },
    
    canManageUsers() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        const roleConfig = TrakioConfig.ROLES[user.role];
        return roleConfig?.canManageUsers || roleConfig?.allAccess || false;
    },
    
    isAdmin() {
        const user = TrakioUsers.getCurrentUser();
        return user?.role === 'admin';
    }
};

// ==================== FIREBASE INIT ====================
let db = null;
let firebaseReady = false;

async function initFirebase() {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(TrakioConfig.FIREBASE);
        }
        db = firebase.firestore();
        
        // Activer persistence
        try {
            await db.enablePersistence({ synchronizeTabs: true });
        } catch (e) {
            console.log('Persistence déjà active ou non supportée');
        }
        
        firebaseReady = true;
        console.log('✅ Firebase initialisé');
        return db;
    } catch (e) {
        console.error('❌ Firebase error:', e);
        firebaseReady = false;
        return null;
    }
}

function getDb() { return db; }
function isFirebaseReady() { return firebaseReady; }

// ==================== UTILS ====================
function formatCHF(amount) {
    return new Intl.NumberFormat('fr-CH', { 
        style: 'currency', 
        currency: 'CHF' 
    }).format(amount || 0);
}

function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-CH');
}

function formatDateTime(date) {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-CH');
}

function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ==================== AUTO INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    TrakioUsers.init();
    setTimeout(initFirebase, 100);
});

console.log('🐟 TRAKIO Config v' + TrakioConfig.VERSION + ' loaded');
