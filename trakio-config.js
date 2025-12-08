/**
 * TRAKIO Config v4.3.0
 */
const TrakioConfig = {
    VERSION: '4.3.0',
    APP_NAME: 'TRAKIO',
    
    FIREBASE: {
        apiKey: "AIzaSyCdVQrjMtezIG3eBxsqO2ViDi_tRbY8hdE",
        authDomain: "trakio-pilot-6e97a.firebaseapp.com",
        projectId: "trakio-pilot-6e97a",
        storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
        messagingSenderId: "665592646022",
        appId: "1:665592646022:web:xxxxx"
    },
    
    STORAGE_KEYS: {
        THEME: 'trakio_theme',
        USER: 'trakio_current_user',
        ARTICLES: 'trakio_articles',
        CLIENTS: 'trakio_quickorder',
        ORDERS: 'trakio_orders'
    }
};

let db = null;

function initFirebase() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        try {
            firebase.initializeApp(TrakioConfig.FIREBASE);
            db = firebase.firestore();
            console.log('🔥 Firebase initialisé');
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('connected');
            }
            return true;
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            return false;
        }
    }
    return false;
}

window.TrakioConfig = TrakioConfig;
window.initFirebase = initFirebase;
