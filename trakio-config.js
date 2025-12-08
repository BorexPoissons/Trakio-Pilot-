/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRAKIO Config v4.3.0 - Configuration Centralisée
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TrakioConfig = {
    VERSION: '4.3.0',
    APP_NAME: 'TRAKIO',
    
    // Firebase Configuration
    FIREBASE: {
        apiKey: "AIzaSyCdVQrjMtezIG3eBxsqO2ViDi_tRbY8hdE",
        authDomain: "trakio-pilot-6e97a.firebaseapp.com",
        projectId: "trakio-pilot-6e97a",
        storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
        messagingSenderId: "665592646022",
        appId: "1:665592646022:web:xxxxxxxxxxxxxx"
    },
    
    // Dropbox Configuration
    DROPBOX: {
        APP_KEY: 'votre_app_key',
        BASE_PATH: '/TRAKIO'
    },
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        THEME: 'trakio_theme',
        USER: 'trakio_current_user',
        USERS: 'trakio_users',
        QUICKORDER: 'trakio_quickorder',
        ARTICLES: 'trakio_articles',
        ORDERS: 'trakio_orders',
        DROPBOX: 'trakio_dropbox'
    },
    
    // Paramètres par défaut
    DEFAULTS: {
        TVA: 2.6,
        CURRENCY: 'CHF',
        LANGUAGE: 'fr-CH',
        TIMEZONE: 'Europe/Zurich'
    }
};

// Firebase Initialization
let db = null;

function initFirebase() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        try {
            firebase.initializeApp(TrakioConfig.FIREBASE);
            db = firebase.firestore();
            console.log('🔥 Firebase initialisé');
            
            // Mettre à jour le statut UI
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('connected');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('disconnected');
            }
            return false;
        }
    }
    return false;
}

// Export
window.TrakioConfig = TrakioConfig;
window.initFirebase = initFirebase;
