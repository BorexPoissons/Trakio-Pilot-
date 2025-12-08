/**
 * TRAKIO Config v4.3.0
 */
const TrakioConfig = {
    VERSION: '4.3.0',
    FIREBASE: {
        apiKey: "AIzaSyCdVQrjMtezIG3eBxsqO2ViDi_tRbY8hdE",
        authDomain: "trakio-pilot-6e97a.firebaseapp.com",
        projectId: "trakio-pilot-6e97a",
        storageBucket: "trakio-pilot-6e97a.firebasestorage.app",
        messagingSenderId: "665592646022",
        appId: "1:665592646022:web:xxxxx"
    }
};

let db = null;
function initFirebase() {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        try {
            firebase.initializeApp(TrakioConfig.FIREBASE);
            db = firebase.firestore();
            if (typeof TrakioUI !== 'undefined') TrakioUI.setFirebaseStatus('connected');
            console.log('🔥 Firebase OK');
            return true;
        } catch (e) { console.error('Firebase error:', e); return false; }
    }
    return false;
}
window.TrakioConfig = TrakioConfig;
window.initFirebase = initFirebase;
