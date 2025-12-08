/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TRAKIO Sync v4.3.0 - Synchronisation Firebase & Dropbox
 * ═══════════════════════════════════════════════════════════════════════════
 */

const TrakioSync = {
    VERSION: '4.3.0',
    isOnline: navigator.onLine,
    syncQueue: [],
    lastSync: null,

    /**
     * Initialisation
     */
    init() {
        // Écouter les changements de connexion
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Charger la queue de sync
        this.loadSyncQueue();
        
        console.log('🔄 TrakioSync initialisé');
    },

    /**
     * Gestion connexion
     */
    handleOnline() {
        this.isOnline = true;
        console.log('🟢 Connexion rétablie');
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
        }
        this.processSyncQueue();
    },

    handleOffline() {
        this.isOnline = false;
        console.log('🔴 Hors ligne');
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('disconnected');
        }
    },

    /**
     * Sauvegarder vers Firebase
     */
    async saveToFirebase(collection, data, docId = null) {
        if (!this.isOnline || !db) {
            this.addToSyncQueue({ action: 'save', collection, data, docId });
            return { success: false, offline: true };
        }

        try {
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('syncing');
            }

            if (docId) {
                await db.collection(collection).doc(docId).set(data, { merge: true });
            } else {
                await db.collection(collection).add(data);
            }

            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('connected');
            }

            this.lastSync = new Date();
            return { success: true };
        } catch (error) {
            console.error('❌ Erreur Firebase save:', error);
            this.addToSyncQueue({ action: 'save', collection, data, docId });
            return { success: false, error };
        }
    },

    /**
     * Charger depuis Firebase
     */
    async loadFromFirebase(collection, docId = null) {
        if (!this.isOnline || !db) {
            return { success: false, offline: true };
        }

        try {
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('syncing');
            }

            let result;
            if (docId) {
                const doc = await db.collection(collection).doc(docId).get();
                result = doc.exists ? { id: doc.id, ...doc.data() } : null;
            } else {
                const snapshot = await db.collection(collection).get();
                result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }

            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('connected');
            }

            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Erreur Firebase load:', error);
            return { success: false, error };
        }
    },

    /**
     * Gestion queue hors ligne
     */
    addToSyncQueue(item) {
        item.timestamp = new Date().toISOString();
        this.syncQueue.push(item);
        this.saveSyncQueue();
        console.log('📥 Ajouté à la queue de sync:', item);
    },

    saveSyncQueue() {
        localStorage.setItem('trakio_sync_queue', JSON.stringify(this.syncQueue));
    },

    loadSyncQueue() {
        try {
            const saved = localStorage.getItem('trakio_sync_queue');
            this.syncQueue = saved ? JSON.parse(saved) : [];
        } catch (e) {
            this.syncQueue = [];
        }
    },

    async processSyncQueue() {
        if (this.syncQueue.length === 0) {
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.setFirebaseStatus('connected');
            }
            return;
        }

        console.log(`🔄 Traitement de ${this.syncQueue.length} éléments en queue...`);
        
        const queue = [...this.syncQueue];
        this.syncQueue = [];
        
        for (const item of queue) {
            if (item.action === 'save') {
                const result = await this.saveToFirebase(item.collection, item.data, item.docId);
                if (!result.success && !result.offline) {
                    this.syncQueue.push(item);
                }
            }
        }
        
        this.saveSyncQueue();
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('connected');
        }
    },

    /**
     * Synchronisation complète
     */
    async syncAll() {
        console.log('🔄 Synchronisation complète...');
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
        }

        // Traiter la queue
        await this.processSyncQueue();

        // Synchroniser les données principales
        const collections = ['articles', 'clients', 'orders'];
        
        for (const col of collections) {
            const localKey = `trakio_${col}`;
            const localData = localStorage.getItem(localKey);
            
            if (localData) {
                try {
                    await this.saveToFirebase(col, { data: JSON.parse(localData) }, 'main');
                } catch (e) {
                    console.error(`Erreur sync ${col}:`, e);
                }
            }
        }

        this.lastSync = new Date();
        console.log('✅ Synchronisation terminée');

        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('connected');
        }

        return { success: true, timestamp: this.lastSync };
    }
};

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    TrakioSync.init();
});

// Export
window.TrakioSync = TrakioSync;
