/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  TRAKIO CONFIG v4.5.0 - Configuration Centrale                ║
 * ║  Firebase + Users + Permissions + Modules                     ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const TRAKIO_VERSION = '4.5.0';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION FIREBASE
// ═══════════════════════════════════════════════════════════════

const TrakioConfig = {
    VERSION: TRAKIO_VERSION,
    
    FIREBASE: {
        apiKey: "AIzaSyCdVQrjMtezIG3eBxsqO2ViDi_tRbY8hdE",
        authDomain: "trakio-pilot-6e97a.firebaseapp.com",
        projectId: "trakio-pilot-6e97a",
        storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
        messagingSenderId: "256841216130",
        appId: "1:256841216130:web:4ea5a967ba39c120d8849b"
    },
    
    COMPANY: {
        name: 'Borex Poissons',
        currency: 'CHF',
        tva: 2.6,
        locale: 'fr-CH'
    },
    
    // Définition des modules
    MODULES: {
        dashboard:    { id: 'dashboard',    name: 'Dashboard',    icon: '📊', url: 'index.html',        category: 'main' },
        articles:     { id: 'articles',     name: 'Articles',     icon: '📦', url: 'articles.html',     category: 'main' },
        clients:      { id: 'clients',      name: 'Clients',      icon: '👥', url: 'clients.html',      category: 'main' },
        commandes:    { id: 'commandes',    name: 'Commandes',    icon: '📋', url: 'commandes.html',    category: 'sales' },
        myfish:       { id: 'myfish',       name: 'MyFish',       icon: '🛒', url: 'myfish.html',       category: 'sales' },
        caisse:       { id: 'caisse',       name: 'Caisse',       icon: '💵', url: 'caisse.html',       category: 'sales' },
        tracabilite:  { id: 'tracabilite',  name: 'Traçabilité',  icon: '🏷️', url: 'tracabilite.html',  category: 'tools' },
        compta:       { id: 'compta',       name: 'Compta',       icon: '📒', url: 'compta.html',       category: 'admin' },
        shopify:      { id: 'shopify',      name: 'Shop Hub',     icon: '🛍️', url: 'shopify.html',      category: 'tools' },
        parametres:   { id: 'parametres',   name: 'Paramètres',   icon: '⚙️', url: 'parametres.html',   category: 'admin' }
    },
    
    // Définition des rôles
    ROLES: {
        admin: {
            name: 'Administrateur',
            color: '#ef4444',
            allAccess: true,
            canImport: true,
            canExport: true,
            canManageUsers: true
        },
        manager: {
            name: 'Manager',
            color: '#f59e0b',
            allAccess: false,
            canImport: false,
            canExport: true,
            canManageUsers: false,
            defaultModules: ['dashboard', 'articles', 'clients', 'commandes', 'myfish', 'caisse', 'tracabilite', 'compta']
        },
        vendeur: {
            name: 'Vendeur',
            color: '#10b981',
            allAccess: false,
            canImport: false,
            canExport: false,
            canManageUsers: false,
            defaultModules: ['dashboard', 'clients', 'commandes', 'myfish', 'caisse']
        },
        viewer: {
            name: 'Consultation',
            color: '#6b7280',
            allAccess: false,
            canImport: false,
            canExport: false,
            canManageUsers: false,
            defaultModules: ['dashboard']
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// GESTION DES UTILISATEURS
// ═══════════════════════════════════════════════════════════════

const TrakioUsers = {
    STORAGE_KEY: 'trakio_users',
    CURRENT_KEY: 'trakio_current_user',
    
    // Utilisateurs par défaut
    DEFAULT_USERS: [
        { id: 'pascal', name: 'Pascal', role: 'admin', pin: '1234', email: '', active: true, modules: [] },
        { id: 'celine', name: 'Céline', role: 'manager', pin: '0000', email: '', active: true, modules: ['dashboard', 'articles', 'clients', 'commandes', 'myfish', 'caisse', 'tracabilite', 'compta'] },
        { id: 'hayat', name: 'Hayat', role: 'vendeur', pin: '0000', email: '', active: true, modules: ['dashboard', 'clients', 'commandes', 'myfish', 'caisse'] }
    ],
    
    // Initialiser les utilisateurs
    init() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            this.saveAll(this.DEFAULT_USERS);
        }
        
        // S'assurer qu'il y a un utilisateur courant
        if (!this.getCurrentUser()) {
            this.setCurrentUser('pascal');
        }
    },
    
    // Obtenir tous les utilisateurs
    getAll() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : this.DEFAULT_USERS;
        } catch (e) {
            console.error('Erreur lecture utilisateurs:', e);
            return this.DEFAULT_USERS;
        }
    },
    
    // Sauvegarder tous les utilisateurs
    saveAll(users) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
            return true;
        } catch (e) {
            console.error('Erreur sauvegarde utilisateurs:', e);
            return false;
        }
    },
    
    // Obtenir un utilisateur par ID
    getById(id) {
        const users = this.getAll();
        return users.find(u => u.id === id) || null;
    },
    
    // Créer un nouvel utilisateur
    create(userData) {
        const users = this.getAll();
        const id = 'user_' + Date.now();
        const role = TrakioConfig.ROLES[userData.role];
        
        const newUser = {
            id,
            name: userData.name || 'Nouvel utilisateur',
            role: userData.role || 'vendeur',
            pin: userData.pin || '0000',
            email: userData.email || '',
            active: true,
            modules: userData.modules || (role ? role.defaultModules || [] : []),
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveAll(users);
        
        console.log('✅ Utilisateur créé:', newUser.name);
        return newUser;
    },
    
    // Mettre à jour un utilisateur
    update(id, updates) {
        const users = this.getAll();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) {
            console.error('Utilisateur non trouvé:', id);
            return null;
        }
        
        // Protéger Pascal
        if (id === 'pascal' && updates.role && updates.role !== 'admin') {
            console.warn('⚠️ Impossible de changer le rôle de Pascal');
            delete updates.role;
        }
        
        users[index] = { ...users[index], ...updates, updatedAt: new Date().toISOString() };
        this.saveAll(users);
        
        // Mettre à jour l'utilisateur courant si c'est lui
        const current = this.getCurrentUser();
        if (current && current.id === id) {
            localStorage.setItem(this.CURRENT_KEY, JSON.stringify(users[index]));
        }
        
        console.log('✅ Utilisateur mis à jour:', users[index].name);
        return users[index];
    },
    
    // Supprimer un utilisateur
    delete(id) {
        if (id === 'pascal') {
            console.warn('⚠️ Impossible de supprimer Pascal');
            return false;
        }
        
        const users = this.getAll();
        const filtered = users.filter(u => u.id !== id);
        
        if (filtered.length === users.length) {
            return false;
        }
        
        this.saveAll(filtered);
        
        // Si c'était l'utilisateur courant, passer à Pascal
        const current = this.getCurrentUser();
        if (current && current.id === id) {
            this.setCurrentUser('pascal');
        }
        
        console.log('✅ Utilisateur supprimé:', id);
        return true;
    },
    
    // Obtenir l'utilisateur courant
    getCurrentUser() {
        try {
            const stored = localStorage.getItem(this.CURRENT_KEY);
            if (stored) {
                const user = JSON.parse(stored);
                // Rafraîchir depuis la liste pour avoir les données à jour
                return this.getById(user.id) || user;
            }
            return null;
        } catch (e) {
            return null;
        }
    },
    
    // Définir l'utilisateur courant
    setCurrentUser(userId) {
        const user = this.getById(userId);
        if (user) {
            localStorage.setItem(this.CURRENT_KEY, JSON.stringify(user));
            console.log('👤 Utilisateur actif:', user.name);
            return user;
        }
        return null;
    },
    
    // Vérifier le PIN
    verifyPin(userId, pin) {
        const user = this.getById(userId);
        return user && user.pin === pin;
    },
    
    // Changer le PIN
    changePin(userId, newPin) {
        if (!/^\d{4}$/.test(newPin)) {
            console.error('PIN invalide (4 chiffres requis)');
            return false;
        }
        return this.update(userId, { pin: newPin }) !== null;
    }
};

// ═══════════════════════════════════════════════════════════════
// GESTION DES PERMISSIONS
// ═══════════════════════════════════════════════════════════════

const TrakioPermissions = {
    
    // Vérifier si un utilisateur a accès à un module
    hasAccess(userId, moduleId) {
        const user = TrakioUsers.getById(userId);
        if (!user) return false;
        
        const role = TrakioConfig.ROLES[user.role];
        if (!role) return false;
        
        // Admin a accès à tout
        if (role.allAccess) return true;
        
        // Vérifier les modules de l'utilisateur
        return user.modules && user.modules.includes(moduleId);
    },
    
    // Vérifier si l'utilisateur courant a accès
    canAccess(moduleId) {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        return this.hasAccess(user.id, moduleId);
    },
    
    // Obtenir les modules accessibles d'un utilisateur
    getAccessibleModules(userId) {
        const user = TrakioUsers.getById(userId);
        if (!user) return [];
        
        const role = TrakioConfig.ROLES[user.role];
        if (!role) return [];
        
        if (role.allAccess) {
            return Object.keys(TrakioConfig.MODULES);
        }
        
        return user.modules || [];
    },
    
    // Obtenir les modules de l'utilisateur courant
    getMyModules() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return ['dashboard'];
        return this.getAccessibleModules(user.id);
    },
    
    // Définir les modules d'un utilisateur
    setUserModules(userId, modules) {
        return TrakioUsers.update(userId, { modules });
    },
    
    // Vérifier si l'utilisateur peut importer
    canImport() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        const role = TrakioConfig.ROLES[user.role];
        return role && role.canImport === true;
    },
    
    // Vérifier si l'utilisateur peut exporter
    canExport() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        const role = TrakioConfig.ROLES[user.role];
        return role && role.canExport === true;
    },
    
    // Vérifier si l'utilisateur peut gérer les utilisateurs
    canManageUsers() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        const role = TrakioConfig.ROLES[user.role];
        return role && role.canManageUsers === true;
    },
    
    // Vérifier si l'utilisateur est admin
    isAdmin() {
        const user = TrakioUsers.getCurrentUser();
        if (!user) return false;
        return user.role === 'admin';
    }
};

// ═══════════════════════════════════════════════════════════════
// INITIALISATION FIREBASE
// ═══════════════════════════════════════════════════════════════

let db = null;
let firebaseReady = false;

function initFirebase() {
    return new Promise((resolve, reject) => {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase SDK non chargé');
                resolve(false);
                return;
            }
            
            // Initialiser si pas déjà fait
            if (!firebase.apps.length) {
                firebase.initializeApp(TrakioConfig.FIREBASE);
            }
            
            db = firebase.firestore();
            
            // Activer la persistence offline
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => console.log('💾 Persistence offline activée'))
                .catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.warn('⚠️ Persistence: plusieurs onglets ouverts');
                    } else if (err.code === 'unimplemented') {
                        console.warn('⚠️ Persistence non supportée');
                    }
                });
            
            // Test de connexion
            db.collection('_ping').doc('test').get()
                .then(() => {
                    firebaseReady = true;
                    console.log('🟢 Firebase connecté');
                    if (typeof TrakioUI !== 'undefined') {
                        TrakioUI.setFirebaseStatus('connected');
                    }
                    resolve(true);
                })
                .catch(err => {
                    console.warn('🟡 Firebase en mode offline:', err.message);
                    firebaseReady = true;
                    if (typeof TrakioUI !== 'undefined') {
                        TrakioUI.setFirebaseStatus('offline');
                    }
                    resolve(true);
                });
                
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            reject(error);
        }
    });
}

function getDb() {
    return db;
}

function isFirebaseReady() {
    return firebaseReady;
}

// ═══════════════════════════════════════════════════════════════
// UTILITAIRES GLOBAUX
// ═══════════════════════════════════════════════════════════════

function formatCHF(amount) {
    return new Intl.NumberFormat('fr-CH', {
        style: 'currency',
        currency: 'CHF'
    }).format(amount || 0);
}

function formatDate(date, options = {}) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...options
    });
}

function formatDateTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('fr-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ═══════════════════════════════════════════════════════════════
// INITIALISATION AU CHARGEMENT
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les utilisateurs
    TrakioUsers.init();
    
    // Initialiser Firebase avec délai
    setTimeout(() => {
        initFirebase().then(success => {
            if (success) {
                console.log(`🐟 TRAKIO v${TRAKIO_VERSION} prêt`);
            }
        });
    }, 100);
});

// Exports globaux
window.TrakioConfig = TrakioConfig;
window.TrakioUsers = TrakioUsers;
window.TrakioPermissions = TrakioPermissions;
window.getDb = getDb;
window.isFirebaseReady = isFirebaseReady;
window.formatCHF = formatCHF;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.generateId = generateId;
window.TRAKIO_VERSION = TRAKIO_VERSION;

console.log(`⚙️ TRAKIO Config v${TRAKIO_VERSION} chargé`);
