/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  TRAKIO SYNC v4.5.0 - Synchronisation Firebase + Offline      ║
 * ║  Queue offline + Temps réel + Cache local                     ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const TrakioSync = {
    VERSION: '4.5.0',
    
    // État
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    offlineQueue: [],
    listeners: [],
    
    // ═══════════════════════════════════════════════════════════
    // INITIALISATION
    // ═══════════════════════════════════════════════════════════
    
    init() {
        // Écouter les changements de connexion
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Charger la queue offline
        this.loadOfflineQueue();
        
        // Charger la dernière sync
        const lastSyncStr = localStorage.getItem('trakio_last_sync');
        if (lastSyncStr) {
            this.lastSync = new Date(lastSyncStr);
        }
        
        console.log(`🔄 TrakioSync v${this.VERSION} initialisé - ${this.isOnline ? 'En ligne' : 'Hors ligne'}`);
        
        // Traiter la queue si en ligne
        if (this.isOnline) {
            setTimeout(() => this.processOfflineQueue(), 2000);
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // GESTION CONNEXION
    // ═══════════════════════════════════════════════════════════
    
    handleOnline() {
        console.log('📡 Connexion rétablie');
        this.isOnline = true;
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
            TrakioUI.showToast('📡 Connexion rétablie', 'success');
        }
        
        this.processOfflineQueue();
    },
    
    handleOffline() {
        console.log('📡 Mode hors ligne');
        this.isOnline = false;
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('offline');
            TrakioUI.showToast('📡 Mode hors ligne activé', 'warning');
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // QUEUE OFFLINE
    // ═══════════════════════════════════════════════════════════
    
    loadOfflineQueue() {
        try {
            const stored = localStorage.getItem('trakio_offline_queue');
            this.offlineQueue = stored ? JSON.parse(stored) : [];
            if (this.offlineQueue.length > 0) {
                console.log(`📦 ${this.offlineQueue.length} opération(s) en attente`);
            }
        } catch (e) {
            this.offlineQueue = [];
        }
    },
    
    saveOfflineQueue() {
        localStorage.setItem('trakio_offline_queue', JSON.stringify(this.offlineQueue));
    },
    
    addToQueue(operation) {
        this.offlineQueue.push({
            ...operation,
            id: generateId('op'),
            timestamp: new Date().toISOString()
        });
        this.saveOfflineQueue();
        console.log(`📦 +1 opération en queue (total: ${this.offlineQueue.length})`);
    },
    
    async processOfflineQueue() {
        if (!this.isOnline || this.isSyncing || this.offlineQueue.length === 0) {
            return;
        }
        
        const db = getDb();
        if (!db) return;
        
        console.log(`🔄 Traitement de ${this.offlineQueue.length} opération(s)...`);
        this.isSyncing = true;
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
        }
        
        const failed = [];
        
        for (const op of this.offlineQueue) {
            try {
                switch (op.type) {
                    case 'set':
                        await db.collection(op.collection).doc(op.docId).set(op.data, { merge: true });
                        break;
                    case 'update':
                        await db.collection(op.collection).doc(op.docId).update(op.data);
                        break;
                    case 'delete':
                        await db.collection(op.collection).doc(op.docId).delete();
                        break;
                }
                console.log(`✅ Sync: ${op.type} ${op.collection}/${op.docId}`);
            } catch (e) {
                console.error(`❌ Échec sync:`, e);
                failed.push(op);
            }
        }
        
        this.offlineQueue = failed;
        this.saveOfflineQueue();
        this.isSyncing = false;
        this.lastSync = new Date();
        localStorage.setItem('trakio_last_sync', this.lastSync.toISOString());
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('connected');
            if (failed.length === 0) {
                TrakioUI.showToast('✅ Synchronisation terminée', 'success');
            } else {
                TrakioUI.showToast(`⚠️ ${failed.length} opération(s) en attente`, 'warning');
            }
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // API CRUD
    // ═══════════════════════════════════════════════════════════
    
    async save(collection, docId, data) {
        const id = docId || generateId(collection.substring(0, 3));
        const enrichedData = {
            ...data,
            id,
            updatedAt: new Date().toISOString(),
            updatedBy: TrakioUsers.getCurrentUser()?.id || 'unknown'
        };
        
        // Toujours sauvegarder en local d'abord
        this.saveLocal(collection, id, enrichedData);
        
        // Essayer Firebase si en ligne
        if (this.isOnline) {
            const db = getDb();
            if (db) {
                try {
                    await db.collection(collection).doc(id).set(enrichedData, { merge: true });
                    return { success: true, id, synced: true };
                } catch (e) {
                    console.warn('⚠️ Ajout à la queue offline');
                }
            }
        }
        
        // Ajouter à la queue
        this.addToQueue({ type: 'set', collection, docId: id, data: enrichedData });
        return { success: true, id, synced: false };
    },
    
    async delete(collection, docId) {
        // Supprimer en local
        this.deleteLocal(collection, docId);
        
        // Essayer Firebase
        if (this.isOnline) {
            const db = getDb();
            if (db) {
                try {
                    await db.collection(collection).doc(docId).delete();
                    return { success: true, synced: true };
                } catch (e) {
                    console.warn('⚠️ Suppression ajoutée à la queue');
                }
            }
        }
        
        this.addToQueue({ type: 'delete', collection, docId });
        return { success: true, synced: false };
    },
    
    async get(collection, docId) {
        // Essayer Firebase d'abord si en ligne
        if (this.isOnline) {
            const db = getDb();
            if (db) {
                try {
                    const doc = await db.collection(collection).doc(docId).get();
                    if (doc.exists) {
                        const data = { id: doc.id, ...doc.data() };
                        this.saveLocal(collection, docId, data);
                        return data;
                    }
                } catch (e) {
                    console.warn('⚠️ Lecture locale fallback');
                }
            }
        }
        
        return this.getLocal(collection, docId);
    },
    
    async getAll(collection, options = {}) {
        let results = [];
        
        // Essayer Firebase si en ligne
        if (this.isOnline) {
            const db = getDb();
            if (db) {
                try {
                    let query = db.collection(collection);
                    
                    if (options.orderBy) {
                        query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
                    }
                    if (options.limit) {
                        query = query.limit(options.limit);
                    }
                    if (options.where) {
                        query = query.where(options.where.field, options.where.op, options.where.value);
                    }
                    
                    const snapshot = await query.get();
                    results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    
                    // Cache local
                    this.saveAllLocal(collection, results);
                    return results;
                    
                } catch (e) {
                    console.warn('⚠️ Lecture Firebase échouée, fallback local');
                }
            }
        }
        
        return this.getAllLocal(collection);
    },
    
    // ═══════════════════════════════════════════════════════════
    // LISTENERS TEMPS RÉEL
    // ═══════════════════════════════════════════════════════════
    
    subscribe(collection, callback, options = {}) {
        const db = getDb();
        
        if (!db) {
            // Pas de Firebase, retourner les données locales
            callback(this.getAllLocal(collection));
            return () => {};
        }
        
        let query = db.collection(collection);
        
        if (options.orderBy) {
            query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'desc');
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        const unsubscribe = query.onSnapshot(
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                this.saveAllLocal(collection, data);
                callback(data, snapshot.docChanges());
            },
            (error) => {
                console.error(`❌ Erreur listener ${collection}:`, error);
                callback(this.getAllLocal(collection), []);
            }
        );
        
        this.listeners.push(unsubscribe);
        return unsubscribe;
    },
    
    unsubscribeAll() {
        this.listeners.forEach(unsub => {
            try { unsub(); } catch (e) {}
        });
        this.listeners = [];
    },
    
    // ═══════════════════════════════════════════════════════════
    // STOCKAGE LOCAL
    // ═══════════════════════════════════════════════════════════
    
    getStorageKey(collection, docId = null) {
        return docId ? `trakio_${collection}_${docId}` : `trakio_${collection}_all`;
    },
    
    saveLocal(collection, docId, data) {
        try {
            localStorage.setItem(this.getStorageKey(collection, docId), JSON.stringify(data));
            
            // Mettre à jour la liste
            const all = this.getAllLocal(collection);
            const index = all.findIndex(item => item.id === docId);
            if (index >= 0) {
                all[index] = data;
            } else {
                all.push(data);
            }
            localStorage.setItem(this.getStorageKey(collection), JSON.stringify(all));
        } catch (e) {
            console.error('Erreur sauvegarde locale:', e);
        }
    },
    
    saveAllLocal(collection, data) {
        try {
            localStorage.setItem(this.getStorageKey(collection), JSON.stringify(data));
            data.forEach(item => {
                if (item.id) {
                    localStorage.setItem(this.getStorageKey(collection, item.id), JSON.stringify(item));
                }
            });
        } catch (e) {
            console.error('Erreur sauvegarde locale:', e);
        }
    },
    
    getLocal(collection, docId) {
        try {
            const stored = localStorage.getItem(this.getStorageKey(collection, docId));
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    },
    
    getAllLocal(collection) {
        try {
            const stored = localStorage.getItem(this.getStorageKey(collection));
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    },
    
    deleteLocal(collection, docId) {
        try {
            localStorage.removeItem(this.getStorageKey(collection, docId));
            const all = this.getAllLocal(collection);
            const filtered = all.filter(item => item.id !== docId);
            localStorage.setItem(this.getStorageKey(collection), JSON.stringify(filtered));
        } catch (e) {
            console.error('Erreur suppression locale:', e);
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // UTILITAIRES
    // ═══════════════════════════════════════════════════════════
    
    async syncAll() {
        if (!this.isOnline) {
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.showToast('📡 Pas de connexion', 'warning');
            }
            return { success: false, reason: 'offline' };
        }
        
        await this.processOfflineQueue();
        return { success: true };
    },
    
    getStatus() {
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            lastSync: this.lastSync,
            pendingOperations: this.offlineQueue.length
        };
    },
    
    clearCache() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('trakio_') && !k.includes('user') && !k.includes('theme'));
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`🗑️ ${keys.length} entrées de cache supprimées`);
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.showToast('🗑️ Cache vidé', 'success');
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// HELPERS COLLECTIONS
// ═══════════════════════════════════════════════════════════════

const DataStore = {
    // Articles
    articles: {
        collection: 'articles',
        getAll: (options) => TrakioSync.getAll('articles', options),
        get: (id) => TrakioSync.get('articles', id),
        save: (id, data) => TrakioSync.save('articles', id, data),
        delete: (id) => TrakioSync.delete('articles', id),
        subscribe: (callback, options) => TrakioSync.subscribe('articles', callback, options)
    },
    
    // Clients
    clients: {
        collection: 'clients',
        getAll: (options) => TrakioSync.getAll('clients', options),
        get: (id) => TrakioSync.get('clients', id),
        save: (id, data) => TrakioSync.save('clients', id, data),
        delete: (id) => TrakioSync.delete('clients', id),
        subscribe: (callback, options) => TrakioSync.subscribe('clients', callback, options)
    },
    
    // Commandes
    commandes: {
        collection: 'commandes',
        getAll: (options) => TrakioSync.getAll('commandes', options),
        get: (id) => TrakioSync.get('commandes', id),
        save: (id, data) => TrakioSync.save('commandes', id, data),
        delete: (id) => TrakioSync.delete('commandes', id),
        subscribe: (callback, options) => TrakioSync.subscribe('commandes', callback, options)
    },
    
    // Ventes (MyFish/Caisse)
    ventes: {
        collection: 'ventes',
        getAll: (options) => TrakioSync.getAll('ventes', options),
        get: (id) => TrakioSync.get('ventes', id),
        save: (id, data) => TrakioSync.save('ventes', id, data),
        delete: (id) => TrakioSync.delete('ventes', id),
        subscribe: (callback, options) => TrakioSync.subscribe('ventes', callback, options)
    },
    
    // Étiquettes
    etiquettes: {
        collection: 'etiquettes',
        getAll: (options) => TrakioSync.getAll('etiquettes', options),
        get: (id) => TrakioSync.get('etiquettes', id),
        save: (id, data) => TrakioSync.save('etiquettes', id, data),
        delete: (id) => TrakioSync.delete('etiquettes', id),
        subscribe: (callback, options) => TrakioSync.subscribe('etiquettes', callback, options)
    },
    
    // Comptabilité
    compta: {
        collection: 'compta',
        getAll: (options) => TrakioSync.getAll('compta', options),
        get: (id) => TrakioSync.get('compta', id),
        save: (id, data) => TrakioSync.save('compta', id, data),
        delete: (id) => TrakioSync.delete('compta', id),
        subscribe: (callback, options) => TrakioSync.subscribe('compta', callback, options)
    }
};

// ═══════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    TrakioSync.init();
});

window.addEventListener('beforeunload', () => {
    TrakioSync.unsubscribeAll();
});

// Exports
window.TrakioSync = TrakioSync;
window.DataStore = DataStore;

console.log(`🔄 TrakioSync v${TrakioSync.VERSION} chargé`);
