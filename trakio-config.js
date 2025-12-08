/**
 * ═══════════════════════════════════════════════════════════════
 * TRAKIO Config v4.4.0
 * Configuration Firebase + Système Utilisateurs & Permissions
 * ═══════════════════════════════════════════════════════════════
 */

const TrakioConfig = {
    VERSION: '4.4.0',
    
    // ═══════════════════════════════════════════════════════════
    // FIREBASE CONFIGURATION
    // ═══════════════════════════════════════════════════════════
    FIREBASE: {
        apiKey: "AIzaSyCdVQrjMtezIG3eBxsqO2ViDi_tRbY8hdE",
        authDomain: "trakio-pilot-6e97a.firebaseapp.com",
        projectId: "trakio-pilot-6e97a",
        storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
        messagingSenderId: "256841216130",
        appId: "1:256841216130:web:4ea5a967ba39c120d8849b"
    },
    
    // ═══════════════════════════════════════════════════════════
    // DÉFINITION DES MODULES
    // ═══════════════════════════════════════════════════════════
    MODULES: {
        dashboard:    { id: 'dashboard',    name: 'Dashboard',    icon: '📊', url: 'index.html',       category: 'main' },
        articles:     { id: 'articles',     name: 'Articles',     icon: '📦', url: 'articles.html',    category: 'main' },
        clients:      { id: 'clients',      name: 'Clients',      icon: '👥', url: 'clients.html',     category: 'main' },
        commandes:    { id: 'commandes',    name: 'Commandes',    icon: '📋', url: 'commandes.html',   category: 'sales' },
        myfish:       { id: 'myfish',       name: 'MyFish',       icon: '🛒', url: 'myfish.html',      category: 'sales' },
        caisse:       { id: 'caisse',       name: 'Caisse',       icon: '💵', url: 'caisse.html',      category: 'sales' },
        tracabilite:  { id: 'tracabilite',  name: 'Traçabilité',  icon: '🏷️', url: 'tracabilite.html', category: 'tools' },
        compta:       { id: 'compta',       name: 'Compta',       icon: '📒', url: 'compta.html',      category: 'admin' },
        shopify:      { id: 'shopify',      name: 'Shop Hub',     icon: '🛍️', url: 'shopify.html',     category: 'tools' },
        live:         { id: 'live',         name: 'Cours',        icon: '📈', url: 'live.html',        category: 'tools' },
        whatsapp:     { id: 'whatsapp',     name: 'WhatsApp',     icon: '💬', url: 'whatsapp.html',    category: 'tools' },
        cloud:        { id: 'cloud',        name: 'Cloud',        icon: '☁️', url: 'cloud.html',       category: 'admin' },
        parametres:   { id: 'parametres',   name: 'Paramètres',   icon: '⚙️', url: 'parametres.html',  category: 'admin' }
    },
    
    // ═══════════════════════════════════════════════════════════
    // DÉFINITION DES RÔLES
    // ═══════════════════════════════════════════════════════════
    ROLES: {
        admin: {
            id: 'admin',
            name: 'Administrateur',
            description: 'Accès complet à tous les modules',
            color: '#ef4444',
            allAccess: true
        },
        manager: {
            id: 'manager',
            name: 'Manager',
            description: 'Accès étendu sauf paramètres sensibles',
            color: '#f59e0b',
            allAccess: false,
            defaultModules: ['dashboard', 'articles', 'clients', 'commandes', 'myfish', 'caisse', 'tracabilite', 'compta']
        },
        vendeur: {
            id: 'vendeur',
            name: 'Vendeur',
            description: 'Accès aux ventes et clients',
            color: '#10b981',
            allAccess: false,
            defaultModules: ['dashboard', 'clients', 'commandes', 'myfish', 'caisse']
        },
        viewer: {
            id: 'viewer',
            name: 'Consultation',
            description: 'Lecture seule',
            color: '#6b7280',
            allAccess: false,
            defaultModules: ['dashboard']
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // UTILISATEURS PAR DÉFAUT
    // ═══════════════════════════════════════════════════════════
    DEFAULT_USERS: [
        {
            id: 'pascal',
            name: 'Pascal',
            role: 'admin',
            pin: '1234',
            email: '',
            active: true,
            modules: [],
            createdAt: '2024-01-01'
        },
        {
            id: 'celine',
            name: 'Céline',
            role: 'manager',
            pin: '0000',
            email: '',
            active: true,
            modules: ['dashboard', 'articles', 'clients', 'commandes', 'myfish', 'caisse', 'tracabilite'],
            createdAt: '2024-01-01'
        },
        {
            id: 'hayat',
            name: 'Hayat',
            role: 'vendeur',
            pin: '0000',
            email: '',
            active: true,
            modules: ['dashboard', 'clients', 'commandes', 'myfish', 'caisse'],
            createdAt: '2024-01-01'
        }
    ]
};

// ═══════════════════════════════════════════════════════════════
// FIREBASE - INITIALISATION
// ═══════════════════════════════════════════════════════════════

let db = null;
let firebaseReady = false;

function initFirebase() {
    if (firebaseReady && db) {
        return true;
    }
    
    if (typeof firebase === 'undefined') {
        console.warn('⚠️ Firebase SDK non chargé');
        return false;
    }
    
    if (firebase.apps.length > 0) {
        db = firebase.firestore();
        firebaseReady = true;
        updateFirebaseStatus('connected');
        console.log('🔥 Firebase déjà initialisé');
        return true;
    }
    
    try {
        firebase.initializeApp(TrakioConfig.FIREBASE);
        db = firebase.firestore();
        
        // Configuration Firestore
        db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
        
        // Activer la persistence offline
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => console.log('📦 Persistence Firestore activée'))
            .catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Persistence: plusieurs onglets ouverts');
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ Persistence: navigateur non supporté');
                }
            });
        
        firebaseReady = true;
        updateFirebaseStatus('connected');
        console.log('🔥 Firebase initialisé avec succès');
        console.log('📍 Projet:', TrakioConfig.FIREBASE.projectId);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur Firebase:', error);
        updateFirebaseStatus('disconnected');
        return false;
    }
}

function updateFirebaseStatus(status) {
    if (typeof TrakioUI !== 'undefined' && TrakioUI.setFirebaseStatus) {
        TrakioUI.setFirebaseStatus(status);
    }
}

function getDb() {
    if (!db) initFirebase();
    return db;
}

// ═══════════════════════════════════════════════════════════════
// SYSTÈME UTILISATEURS
// ═══════════════════════════════════════════════════════════════

const TrakioUsers = {
    STORAGE_KEY: 'trakio_users',
    CURRENT_USER_KEY: 'trakio_current_user',
    
    /**
     * Charger tous les utilisateurs
     */
    getAll() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Erreur lecture utilisateurs:', e);
        }
        
        // Initialiser avec les utilisateurs par défaut
        this.saveAll(TrakioConfig.DEFAULT_USERS);
        return TrakioConfig.DEFAULT_USERS;
    },
    
    /**
     * Sauvegarder tous les utilisateurs
     */
    saveAll(users) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
            
            // Sync vers Firebase si disponible
            this.syncToFirebase(users);
            
            return true;
        } catch (e) {
            console.error('Erreur sauvegarde utilisateurs:', e);
            return false;
        }
    },
    
    /**
     * Synchroniser vers Firebase
     */
    async syncToFirebase(users) {
        const database = getDb();
        if (!database) return;
        
        try {
            await database.collection('settings').doc('users').set({
                users: users,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('👥 Utilisateurs synchronisés vers Firebase');
        } catch (e) {
            console.warn('Sync Firebase utilisateurs:', e);
        }
    },
    
    /**
     * Charger depuis Firebase
     */
    async loadFromFirebase() {
        const database = getDb();
        if (!database) return null;
        
        try {
            const doc = await database.collection('settings').doc('users').get();
            if (doc.exists) {
                const data = doc.data();
                if (data.users && data.users.length > 0) {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data.users));
                    console.log('👥 Utilisateurs chargés depuis Firebase');
                    return data.users;
                }
            }
        } catch (e) {
            console.warn('Lecture Firebase utilisateurs:', e);
        }
        return null;
    },
    
    /**
     * Obtenir un utilisateur par ID
     */
    getById(id) {
        const users = this.getAll();
        return users.find(u => u.id === id) || null;
    },
    
    /**
     * Obtenir un utilisateur par nom
     */
    getByName(name) {
        const users = this.getAll();
        return users.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
    },
    
    /**
     * Créer un nouvel utilisateur
     */
    create(userData) {
        const users = this.getAll();
        
        // Générer un ID unique
        const id = userData.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        
        const newUser = {
            id: id,
            name: userData.name,
            role: userData.role || 'vendeur',
            pin: userData.pin || '0000',
            email: userData.email || '',
            active: true,
            modules: userData.modules || TrakioConfig.ROLES[userData.role]?.defaultModules || [],
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        users.push(newUser);
        this.saveAll(users);
        
        return newUser;
    },
    
    /**
     * Mettre à jour un utilisateur
     */
    update(id, updates) {
        const users = this.getAll();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) return null;
        
        // Fusionner les mises à jour
        users[index] = { ...users[index], ...updates };
        this.saveAll(users);
        
        return users[index];
    },
    
    /**
     * Supprimer un utilisateur
     */
    delete(id) {
        // Protection: ne pas supprimer l'admin principal
        if (id === 'pascal') {
            console.warn('⚠️ Impossible de supprimer l\'administrateur principal');
            return false;
        }
        
        const users = this.getAll();
        const filtered = users.filter(u => u.id !== id);
        
        if (filtered.length === users.length) return false;
        
        this.saveAll(filtered);
        return true;
    },
    
    /**
     * Vérifier le PIN d'un utilisateur
     */
    verifyPin(userId, pin) {
        const user = this.getById(userId);
        if (!user) return false;
        return user.pin === pin;
    },
    
    /**
     * Changer le PIN d'un utilisateur
     */
    changePin(userId, newPin) {
        if (!/^\d{4}$/.test(newPin)) {
            console.error('Le PIN doit être composé de 4 chiffres');
            return false;
        }
        return this.update(userId, { pin: newPin }) !== null;
    },
    
    /**
     * Obtenir l'utilisateur actuellement connecté
     */
    getCurrentUser() {
        try {
            const stored = localStorage.getItem(this.CURRENT_USER_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Recharger les données fraîches
                const fresh = this.getById(parsed.id);
                if (fresh) return fresh;
            }
        } catch (e) {
            console.error('Erreur lecture utilisateur courant:', e);
        }
        
        // Retourner Pascal par défaut
        return this.getById('pascal') || TrakioConfig.DEFAULT_USERS[0];
    },
    
    /**
     * Définir l'utilisateur connecté
     */
    setCurrentUser(userId) {
        const user = this.getById(userId);
        if (!user) return false;
        
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
        
        // Notifier l'UI
        if (typeof TrakioUI !== 'undefined' && TrakioUI.updateUserDisplay) {
            TrakioUI.updateUserDisplay(user);
        }
        
        return true;
    },
    
    /**
     * Déconnecter l'utilisateur
     */
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
        window.location.href = 'index.html';
    }
};

// ═══════════════════════════════════════════════════════════════
// SYSTÈME DE PERMISSIONS
// ═══════════════════════════════════════════════════════════════

const TrakioPermissions = {
    
    /**
     * Vérifier si un utilisateur a accès à un module
     */
    hasAccess(userId, moduleId) {
        const user = TrakioUsers.getById(userId);
        if (!user || !user.active) return false;
        
        const role = TrakioConfig.ROLES[user.role];
        if (!role) return false;
        
        // Admin = accès total
        if (role.allAccess) return true;
        
        // Vérifier les modules autorisés
        return user.modules.includes(moduleId);
    },
    
    /**
     * Vérifier l'accès pour l'utilisateur courant
     */
    canAccess(moduleId) {
        const currentUser = TrakioUsers.getCurrentUser();
        return this.hasAccess(currentUser.id, moduleId);
    },
    
    /**
     * Obtenir la liste des modules accessibles pour un utilisateur
     */
    getAccessibleModules(userId) {
        const user = TrakioUsers.getById(userId);
        if (!user || !user.active) return [];
        
        const role = TrakioConfig.ROLES[user.role];
        if (!role) return [];
        
        // Admin = tous les modules
        if (role.allAccess) {
            return Object.keys(TrakioConfig.MODULES);
        }
        
        return user.modules || [];
    },
    
    /**
     * Modules accessibles pour l'utilisateur courant
     */
    getMyModules() {
        const currentUser = TrakioUsers.getCurrentUser();
        return this.getAccessibleModules(currentUser.id);
    },
    
    /**
     * Mettre à jour les modules d'un utilisateur
     */
    setUserModules(userId, modules) {
        // Protection: l'admin garde toujours tous les accès
        const user = TrakioUsers.getById(userId);
        if (user && user.role === 'admin') {
            console.warn('⚠️ Les permissions admin ne peuvent pas être modifiées');
            return false;
        }
        
        return TrakioUsers.update(userId, { modules: modules }) !== null;
    },
    
    /**
     * Ajouter un module à un utilisateur
     */
    grantAccess(userId, moduleId) {
        const user = TrakioUsers.getById(userId);
        if (!user) return false;
        
        const modules = [...(user.modules || [])];
        if (!modules.includes(moduleId)) {
            modules.push(moduleId);
            return this.setUserModules(userId, modules);
        }
        return true;
    },
    
    /**
     * Retirer un module à un utilisateur
     */
    revokeAccess(userId, moduleId) {
        const user = TrakioUsers.getById(userId);
        if (!user) return false;
        
        const modules = (user.modules || []).filter(m => m !== moduleId);
        return this.setUserModules(userId, modules);
    },
    
    /**
     * Vérifier l'accès à la page actuelle et rediriger si non autorisé
     */
    checkCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        // Trouver le module correspondant
        const module = Object.values(TrakioConfig.MODULES).find(m => m.url === filename);
        
        if (!module) return true; // Page non référencée = autorisée
        
        if (!this.canAccess(module.id)) {
            console.warn(`⛔ Accès refusé au module: ${module.name}`);
            
            // Rediriger vers le dashboard si possible, sinon afficher une erreur
            if (module.id !== 'dashboard' && this.canAccess('dashboard')) {
                alert(`Vous n'avez pas accès au module "${module.name}".`);
                window.location.href = 'index.html';
            }
            return false;
        }
        
        return true;
    }
};

// ═══════════════════════════════════════════════════════════════
// EXPORTS GLOBAUX
// ═══════════════════════════════════════════════════════════════

window.TrakioConfig = TrakioConfig;
window.TrakioUsers = TrakioUsers;
window.TrakioPermissions = TrakioPermissions;
window.initFirebase = initFirebase;
window.getDb = getDb;
window.db = null; // Sera défini après init

// ═══════════════════════════════════════════════════════════════
// INITIALISATION AUTOMATIQUE
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser Firebase
    setTimeout(() => {
        if (initFirebase()) {
            window.db = db;
            
            // Charger les utilisateurs depuis Firebase si disponible
            TrakioUsers.loadFromFirebase().then(users => {
                if (users) {
                    console.log('👥 Utilisateurs Firebase chargés:', users.length);
                }
            });
        }
    }, 100);
});

console.log(`⚙️ TRAKIO Config v${TrakioConfig.VERSION} chargé`);
