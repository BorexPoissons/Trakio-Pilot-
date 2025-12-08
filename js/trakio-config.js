/**
 * TRAKIO Configuration Centralisée
 * Version: 1.0.0
 */

const TRAKIO = {
    VERSION: '4.3.0',
    APP_NAME: 'TRAKIO',
    COMPANY: 'Borex Poissons',
    
    COLLECTIONS: {
        ARTICLES: 'articles',
        CLIENTS: 'clients',
        COMMANDES: 'commandes',
        MYFISH: 'myfish_orders',
        CAISSE: 'caisse_transactions',
        CAISSE_CONFIG: 'caisse_config',
        COURS_POISSONS: 'cours_poissons',
        TRACABILITE: 'tracabilite',
        COMPTA: 'compta',
        SETTINGS: 'settings',
        USERS: 'users',
        SYNC_LOG: 'sync_log'
    },
    
    STORAGE_KEYS: {
        ARTICLES: 'trakio_articles',
        CLIENTS: 'trakio_clients',
        COMMANDES: 'trakio_commandes',
        MYFISH: 'trakio_myfish',
        CAISSE: 'trakio_caisse',
        COURS: 'trakio_cours',
        TRACABILITE: 'trakio_tracabilite',
        COMPTA: 'trakio_compta',
        SETTINGS: 'trakio_settings',
        USER: 'trakio_user',
        OFFLINE_QUEUE: 'trakio_offline_queue',
        LAST_SYNC: 'trakio_last_sync'
    },
    
    TVA: {
        ALIMENTAIRE: 2.6,
        STANDARD: 8.1
    },
    
    swiss: function(amount) {
        return Math.round(amount * 20) / 20;
    },
    
    USERS: ['Pascal', 'Céline', 'Hayat'],
    ADMIN: 'Pascal'
};

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCdVQrjMtezIG3eBxsqO2ViDi_tRbY8hdE",
    authDomain: "trakio-pilot-6e97a.firebaseapp.com",
    projectId: "trakio-pilot-6e97a",
    storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
    messagingSenderId: "256841216130",
    appId: "1:256841216130:web:4ea5a967ba39c120d8849b",
    measurementId: "G-MZFC1GD1ZN"
};

const TRAKIO_STATE = {
    isOnline: navigator.onLine,
    firebaseConnected: false,
    lastSync: null,
    currentUser: localStorage.getItem(TRAKIO.STORAGE_KEYS.USER) || null,
    isAdmin: false,
    syncInProgress: false,
    offlineQueue: [],
    listeners: [],
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 3000
};

let db = null;
let firebaseApp = null;

async function initFirebase() {
    try {
        if (firebaseApp && db) {
            console.log('🔥 Firebase déjà initialisé');
            return true;
        }
        
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK non chargé');
            return false;
        }
        
        if (!firebase.apps.length) {
            firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        } else {
            firebaseApp = firebase.apps[0];
        }
        
        db = firebase.firestore();
        
        try {
            await db.enablePersistence({ synchronizeTabs: true });
            console.log('💾 Persistance Firestore activée');
        } catch (err) {
            if (err.code === 'failed-precondition') {
                console.warn('⚠️ Persistance: plusieurs onglets ouverts');
            } else if (err.code === 'unimplemented') {
                console.warn('⚠️ Persistance non supportée');
            }
        }
        
        setupFirestoreConnectionMonitor();
        
        console.log('✅ Firebase initialisé avec succès');
        TRAKIO_STATE.firebaseConnected = true;
        
        if (typeof updateConnectionStatus === 'function') {
            updateConnectionStatus();
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur initialisation Firebase:', error);
        TRAKIO_STATE.firebaseConnected = false;
        return false;
    }
}

function setupFirestoreConnectionMonitor() {
    if (!db) return;
    
    db.collection(TRAKIO.COLLECTIONS.SETTINGS).doc('_heartbeat')
        .onSnapshot(
            { includeMetadataChanges: true },
            (snapshot) => {
                const wasConnected = TRAKIO_STATE.firebaseConnected;
                TRAKIO_STATE.firebaseConnected = !snapshot.metadata.fromCache;
                
                if (TRAKIO_STATE.firebaseConnected !== wasConnected) {
                    console.log(TRAKIO_STATE.firebaseConnected 
                        ? '🟢 Firebase connecté' 
                        : '🟡 Firebase mode cache');
                    
                    if (typeof updateConnectionStatus === 'function') {
                        updateConnectionStatus();
                    }
                    
                    if (TRAKIO_STATE.firebaseConnected && !wasConnected) {
                        processOfflineQueue();
                    }
                }
            },
            (error) => {
                console.error('❌ Erreur connexion Firestore:', error);
                TRAKIO_STATE.firebaseConnected = false;
                if (typeof updateConnectionStatus === 'function') {
                    updateConnectionStatus();
                }
            }
        );
}

window.addEventListener('online', () => {
    console.log('🌐 Connexion internet rétablie');
    TRAKIO_STATE.isOnline = true;
    if (!TRAKIO_STATE.firebaseConnected) {
        attemptReconnect();
    }
    if (typeof updateConnectionStatus === 'function') {
        updateConnectionStatus();
    }
});

window.addEventListener('offline', () => {
    console.log('📴 Connexion internet perdue');
    TRAKIO_STATE.isOnline = false;
    TRAKIO_STATE.firebaseConnected = false;
    if (typeof updateConnectionStatus === 'function') {
        updateConnectionStatus();
    }
});

async function attemptReconnect() {
    if (TRAKIO_STATE.reconnectAttempts >= TRAKIO_STATE.maxReconnectAttempts) {
        console.warn('⚠️ Max tentatives reconnexion atteint');
        return;
    }
    
    TRAKIO_STATE.reconnectAttempts++;
    console.log(`🔄 Tentative reconnexion ${TRAKIO_STATE.reconnectAttempts}/${TRAKIO_STATE.maxReconnectAttempts}...`);
    
    const success = await initFirebase();
    
    if (success) {
        TRAKIO_STATE.reconnectAttempts = 0;
        console.log('✅ Reconnexion réussie');
        processOfflineQueue();
    } else {
        setTimeout(attemptReconnect, TRAKIO_STATE.reconnectDelay);
    }
}

function loadOfflineQueue() {
    try {
        const queue = localStorage.getItem(TRAKIO.STORAGE_KEYS.OFFLINE_QUEUE);
        TRAKIO_STATE.offlineQueue = queue ? JSON.parse(queue) : [];
    } catch (e) {
        TRAKIO_STATE.offlineQueue = [];
    }
}

function saveOfflineQueue() {
    localStorage.setItem(TRAKIO.STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(TRAKIO_STATE.offlineQueue));
}

function addToOfflineQueue(action) {
    action.timestamp = Date.now();
    action.id = `${action.timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    TRAKIO_STATE.offlineQueue.push(action);
    saveOfflineQueue();
    console.log('📥 Action ajoutée à la queue offline:', action.type);
}

async function processOfflineQueue() {
    if (!TRAKIO_STATE.firebaseConnected || TRAKIO_STATE.offlineQueue.length === 0) {
        return;
    }
    
    console.log(`📤 Traitement de ${TRAKIO_STATE.offlineQueue.length} actions en queue...`);
    
    const queue = [...TRAKIO_STATE.offlineQueue];
    TRAKIO_STATE.offlineQueue = [];
    
    for (const action of queue) {
        try {
            await executeQueuedAction(action);
            console.log(`✅ Action traitée: ${action.type}`);
        } catch (error) {
            console.error(`❌ Erreur action ${action.type}:`, error);
            TRAKIO_STATE.offlineQueue.push(action);
        }
    }
    
    saveOfflineQueue();
    
    if (TRAKIO_STATE.offlineQueue.length === 0) {
        console.log('✅ Queue offline vidée');
        showNotification('Synchronisation terminée', 'success');
    }
}

async function executeQueuedAction(action) {
    if (!db) throw new Error('Firebase non initialisé');
    
    const ref = db.collection(action.collection).doc(action.docId);
    
    switch (action.type) {
        case 'set':
            await ref.set(action.data, { merge: true });
            break;
        case 'update':
            await ref.update(action.data);
            break;
        case 'delete':
            await ref.delete();
            break;
        default:
            throw new Error(`Type d'action inconnu: ${action.type}`);
    }
}

loadOfflineQueue();

function formatDate(date, format = 'short') {
    const d = new Date(date);
    const options = format === 'short' 
        ? { day: '2-digit', month: '2-digit', year: 'numeric' }
        : { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString('fr-CH', options);
}

function formatCHF(amount) {
    return TRAKIO.swiss(amount).toFixed(2) + ' CHF';
}

function generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
}

function showNotification(message, type = 'info', duration = 3000) {
    let container = document.getElementById('trakio-notifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'trakio-notifications';
        container.style.cssText = 'position:fixed;top:70px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }
    
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    
    const notification = document.createElement('div');
    notification.style.cssText = `background:${colors[type]||colors.info};color:white;padding:12px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.3);display:flex;align-items:center;gap:10px;font-family:system-ui;font-size:14px;cursor:pointer;`;
    notification.innerHTML = `<span>${icons[type]||icons.info}</span><span>${message}</span>`;
    notification.onclick = () => notification.remove();
    
    container.appendChild(notification);
    
    setTimeout(() => notification.remove(), duration);
}

console.log(`🐟 TRAKIO Config v${TRAKIO.VERSION} chargé`);
