/**
 * TRAKIO Configuration v5.0.0
 * Configuration Firebase et utilitaires globaux
 * Ce fichier doit être chargé en premier par tous les modules
 */

// ============ VERSION ============
const TRAKIO_VERSION = '5.0.0';
const TRAKIO_VERSION_DATE = '2025-12-09';

// ============ FIREBASE CONFIG ============
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD8WPESTVJ9mMLHCSvnhv0xiUvbgT6lPLA",
    authDomain: "trakio-pilot-6e97a.firebaseapp.com",
    projectId: "trakio-pilot-6e97a",
    storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
    messagingSenderId: "256841216130",
    appId: "1:256841216130:web:4ea5a967ba39c120d8849b"
};

// ============ INITIALIZE FIREBASE ============
let trakioDb = null;
let trakioFirebaseReady = false;

function initTrakioFirebase() {
    return new Promise((resolve) => {
        // Vérifier si Firebase SDK est chargé
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ TRAKIO: Firebase SDK non chargé - Mode local activé');
            trakioFirebaseReady = false;
            resolve(false);
            return;
        }
        
        try {
            if (!firebase.apps || !firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            trakioDb = firebase.firestore();
            
            // Enable offline persistence
            trakioDb.enablePersistence({ synchronizeTabs: true })
                .then(() => {
                    console.log('✅ TRAKIO Firebase: Persistence enabled');
                })
                .catch(err => {
                    if (err.code === 'failed-precondition') {
                        console.log('⚠️ TRAKIO Firebase: Multiple tabs open');
                    } else if (err.code === 'unimplemented') {
                        console.log('⚠️ TRAKIO Firebase: Persistence not available');
                    }
                });
            
            trakioFirebaseReady = true;
            console.log('✅ TRAKIO Firebase: Initialized (App ID: 1:256841216130:web:4ea5a967ba39c120d8849b)');
            resolve(true);
        } catch (error) {
            console.warn('⚠️ TRAKIO Firebase: Init error - Mode local activé', error.message);
            trakioFirebaseReady = false;
            resolve(false);
        }
    });
}

// ============ ROLES CONFIGURATION ============
const TRAKIO_ROLES = {
    admin: {
        label: 'Admin',
        badge: '👑',
        color: '#ef4444',
        permissions: ['all']
    },
    manager: {
        label: 'Manager',
        badge: '⭐',
        color: '#f59e0b',
        permissions: ['articles', 'clients', 'commandes', 'myfish', 'caisse', 'live', 'tracabilite', 'shopify', 'compta', 'whatsapp']
    },
    employee: {
        label: 'Employé',
        badge: '👤',
        color: '#10b981',
        permissions: ['commandes', 'myfish', 'caisse', 'tracabilite']
    }
};

// ============ DEFAULT USERS ============
const TRAKIO_DEFAULT_USERS = [
    {
        id: 'admin_pascal',
        name: 'Pascal Admin',
        pin: '1277',
        role: 'admin',
        avatar: 'PA',
        color: '#ef4444',
        active: true
    },
    {
        id: 'manager_celine',
        name: 'Céline',
        pin: '1277',
        role: 'manager',
        avatar: 'CE',
        color: '#f59e0b',
        active: true
    },
    {
        id: 'employee_hayat',
        name: 'Hayat',
        pin: '1260',
        role: 'employee',
        avatar: 'HA',
        color: '#10b981',
        active: true
    }
];

// ============ STORAGE KEYS ============
const TRAKIO_STORAGE = {
    USERS: 'trakio_users',
    CURRENT_USER: 'trakio_current_user',
    ARTICLES: 'trakio_articles',
    CLIENTS: 'trakio_quickorder',
    COMMANDES: 'trakio_commandes',
    MYFISH: 'trakio_myfish',
    CAISSE: 'trakio_caisse',
    SETTINGS: 'trakio_settings'
};

// ============ STORAGE HELPERS ============
const TrakioStorage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Storage get error:', e);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
};

// ============ USER MANAGEMENT ============
const TrakioAuth = {
    getUsers() {
        const stored = TrakioStorage.get(TRAKIO_STORAGE.USERS);
        if (stored && stored.length > 0) {
            return stored;
        }
        // Initialize with default users
        TrakioStorage.set(TRAKIO_STORAGE.USERS, TRAKIO_DEFAULT_USERS);
        return TRAKIO_DEFAULT_USERS;
    },
    
    getCurrentUser() {
        return TrakioStorage.get(TRAKIO_STORAGE.CURRENT_USER);
    },
    
    setCurrentUser(user) {
        return TrakioStorage.set(TRAKIO_STORAGE.CURRENT_USER, user);
    },
    
    logout() {
        TrakioStorage.remove(TRAKIO_STORAGE.CURRENT_USER);
    },
    
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },
    
    hasPermission(module) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const role = TRAKIO_ROLES[user.role];
        if (!role) return false;
        
        return role.permissions.includes('all') || role.permissions.includes(module);
    },
    
    requireLogin() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// ============ UTILITY FUNCTIONS ============
const TrakioUtils = {
    // Swiss rounding (5 centimes)
    swiss(amount) {
        return (Math.round(amount * 20) / 20).toFixed(2);
    },
    
    // Format currency
    formatCHF(amount) {
        return this.swiss(amount) + ' CHF';
    },
    
    // Format date
    formatDate(date, options = {}) {
        const d = date instanceof Date ? date : new Date(date);
        const defaultOptions = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        };
        return d.toLocaleDateString('fr-CH', { ...defaultOptions, ...options });
    },
    
    // Format time
    formatTime(date) {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString('fr-CH', { hour: '2-digit', minute: '2-digit' });
    },
    
    // Format datetime
    formatDateTime(date) {
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    },
    
    // Generate unique ID
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Deep clone object
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
};

// ============ DATA ACCESS ============
const TrakioData = {
    // Articles
    getArticles() {
        return TrakioStorage.get(TRAKIO_STORAGE.ARTICLES, []);
    },
    
    setArticles(articles) {
        return TrakioStorage.set(TRAKIO_STORAGE.ARTICLES, articles);
    },
    
    // Clients
    getClients() {
        return TrakioStorage.get(TRAKIO_STORAGE.CLIENTS, []);
    },
    
    setClients(clients) {
        return TrakioStorage.set(TRAKIO_STORAGE.CLIENTS, clients);
    },
    
    // Commandes
    getCommandes() {
        return TrakioStorage.get(TRAKIO_STORAGE.COMMANDES, []);
    },
    
    setCommandes(commandes) {
        return TrakioStorage.set(TRAKIO_STORAGE.COMMANDES, commandes);
    },
    
    addCommande(commande) {
        const commandes = this.getCommandes();
        commande.id = commande.id || TrakioUtils.generateId('CMD');
        commande.date = commande.date || new Date().toISOString();
        commandes.push(commande);
        this.setCommandes(commandes);
        return commande;
    },
    
    // MyFish
    getMyfish() {
        return TrakioStorage.get(TRAKIO_STORAGE.MYFISH, []);
    },
    
    setMyfish(myfish) {
        return TrakioStorage.set(TRAKIO_STORAGE.MYFISH, myfish);
    }
};

// ============ FIREBASE SYNC ============
const TrakioSync = {
    async syncToFirebase(collection, data) {
        if (!trakioFirebaseReady || !trakioDb) {
            console.warn('Firebase not ready');
            return false;
        }
        
        try {
            const batch = trakioDb.batch();
            const collectionRef = trakioDb.collection(collection);
            
            // Clear existing
            const existing = await collectionRef.get();
            existing.forEach(doc => batch.delete(doc.ref));
            
            // Add new
            data.forEach(item => {
                const docRef = collectionRef.doc(item.id || TrakioUtils.generateId());
                batch.set(docRef, { ...item, updatedAt: new Date().toISOString() });
            });
            
            await batch.commit();
            console.log(`✅ Synced ${data.length} items to ${collection}`);
            return true;
        } catch (error) {
            console.error('Sync error:', error);
            return false;
        }
    },
    
    async fetchFromFirebase(collection) {
        if (!trakioFirebaseReady || !trakioDb) {
            console.warn('Firebase not ready');
            return null;
        }
        
        try {
            const snapshot = await trakioDb.collection(collection).get();
            const data = [];
            snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
            console.log(`✅ Fetched ${data.length} items from ${collection}`);
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            return null;
        }
    }
};

// ============ AUTO-INIT ============
// Attendre que le DOM soit prêt avant d'initialiser Firebase
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof firebase !== 'undefined') {
            initTrakioFirebase();
        }
    });
} else {
    // DOM déjà prêt
    if (typeof firebase !== 'undefined') {
        initTrakioFirebase();
    }
}

console.log(`🐟 TRAKIO Config v${TRAKIO_VERSION} loaded`);
