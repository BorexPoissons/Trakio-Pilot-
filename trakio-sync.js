/**
 * TRAKIO Sync v4.3.0
 */
const TrakioSync = {
    VERSION: '4.3.0',
    isOnline: navigator.onLine,
    lastSync: null,

    init() {
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        console.log('🔄 TrakioSync initialisé');
    },

    handleOnline() {
        this.isOnline = true;
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('connected');
        }
    },

    handleOffline() {
        this.isOnline = false;
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('disconnected');
        }
    },

    async syncAll() {
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
        }
        
        // Simuler sync
        await new Promise(r => setTimeout(r, 1000));
        
        this.lastSync = new Date();
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('connected');
            TrakioUI.showToast('✅ Synchronisation terminée');
        }
        
        return { success: true };
    }
};

document.addEventListener('DOMContentLoaded', () => TrakioSync.init());
window.TrakioSync = TrakioSync;
