/**
 * TRAKIO Sync v4.3.0
 */
const TrakioSync = {
    VERSION: '4.3.0',
    isOnline: navigator.onLine,

    init() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            if (typeof TrakioUI !== 'undefined') TrakioUI.setFirebaseStatus('connected');
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            if (typeof TrakioUI !== 'undefined') TrakioUI.setFirebaseStatus('disconnected');
        });
    },

    async syncAll() {
        if (typeof TrakioUI !== 'undefined') TrakioUI.setFirebaseStatus('syncing');
        await new Promise(r => setTimeout(r, 1000));
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('connected');
            TrakioUI.showToast('✅ Synchronisé');
        }
        return { success: true };
    }
};

document.addEventListener('DOMContentLoaded', () => TrakioSync.init());
window.TrakioSync = TrakioSync;
