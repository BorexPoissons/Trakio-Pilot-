/**
 * ═══════════════════════════════════════════════════════════════
 * TRAKIO Sync v4.4.0 - Synchronisation Firebase & Offline
 * Fichier à placer à la RACINE du projet
 * ═══════════════════════════════════════════════════════════════
 */

const TrakioSync = {
    VERSION: '4.4.0',
    
    // ═══════════════════════════════════════════════════════════
    // ÉTAT
    // ═══════════════════════════════════════════════════════════
    
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
        
        console.log(`🔄 TRAKIO Sync v${this.VERSION} initialisé`);
        console.log(`📡 Statut: ${this.isOnline ? 'En ligne' : 'Hors ligne'}`);
        
        // Sync automatique si en ligne
        if (this.isOnline) {
            setTimeout(() => this.processOfflineQueue(), 2000);
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // GESTION DE LA CONNEXION
    // ═══════════════════════════════════════════════════════════
    
    handleOnline() {
        console.log('📡 Connexion rétablie');
        this.isOnline = true;
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
            TrakioUI.showToast('📡 Connexion rétablie', 'success');
        }
        
        // Traiter la queue offline
        this.processOfflineQueue();
    },
    
    handleOffline() {
        console.log('📡 Connexion perdue');
        this.isOnline = false;
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('disconnected');
            TrakioUI.showToast('📡 Mode hors ligne', 'warning');
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // QUEUE OFFLINE
    // ═══════════════════════════════════════════════════════════
    
    loadOfflineQueue() {
        try {
            const stored = localStorage.getItem('trakio_offline_queue');
            if (stored) {
                this.offlineQueue = JSON.parse(stored);
                console.log(`📦 ${this.offlineQueue.length} opération(s) en attente`);
            }
        } catch (e) {
            console.error('Erreur chargement queue offline:', e);
            this.offlineQueue = [];
        }
    },
    
    saveOfflineQueue() {
        try {
            localStorage.setItem('trakio_offline_queue', JSON.stringify(this.offlineQueue));
        } catch (e) {
            console.error('Erreur sauvegarde queue offline:', e);
        }
    },
    
    addToQueue(operation) {
        this.offlineQueue.push({
            ...operation,
            timestamp: new Date().toISOString(),
            id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        this.saveOfflineQueue();
        console.log(`📦 Opération ajoutée à la queue: ${operation.type}`);
    },
    
    async processOfflineQueue() {
        if (!this.isOnline || this.isSyncing || this.offlineQueue.length === 0) {
            return;
        }
        
        console.log(`🔄 Traitement de ${this.offlineQueue.length} opération(s)...`);
        this.isSyncing = true;
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
        }
        
        const db = typeof getDb === 'function' ? getDb() : window.db;
        if (!db) {
            console.warn('⚠️ Firebase non disponible');
            this.isSyncing = false;
            return;
        }
        
        const failed = [];
        
        for (const op of this.offlineQueue) {
            try {
                await this.executeOperation(db, op);
                console.log(`✅ Opération ${op.id} réussie`);
            } catch (e) {
                console.error(`❌ Opération ${op.id} échouée:`, e);
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
                TrakioUI.showToast(`⚠️ ${failed.length} opération(s) échouée(s)`, 'warning');
            }
        }
    },
    
    async executeOperation(db, operation) {
        const { type, collection, docId, data } = operation;
        
        switch (type) {
            case 'set':
                await db.collection(collection).doc(docId).set(data, { merge: true });
                break;
            case 'update':
                await db.collection(collection).doc(docId).update(data);
                break;
            case 'delete':
                await db.collection(collection).doc(docId).delete();
                break;
            case 'add':
                await db.collection(collection).add(data);
                break;
            default:
                throw new Error(`Type d'opération inconnu: ${type}`);
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // API PUBLIQUE - CRUD AVEC SYNC
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Sauvegarder un document (crée ou met à jour)
     */
    async save(collection, docId, data) {
        // Ajouter métadonnées
        const enrichedData = {
            ...data,
            updatedAt: new Date().toISOString(),
            updatedBy: this.getCurrentUserId()
        };
        
        // Sauvegarder en local d'abord
        this.saveLocal(collection, docId, enrichedData);
        
        // Essayer de sync vers Firebase
        if (this.isOnline) {
            try {
                const db = typeof getDb === 'function' ? getDb() : window.db;
                if (db) {
                    await db.collection(collection).doc(docId).set(enrichedData, { merge: true });
                    console.log(`✅ ${collection}/${docId} synchronisé`);
                    return { success: true, synced: true };
                }
            } catch (e) {
                console.warn(`⚠️ Sync échouée, ajout à la queue:`, e);
            }
        }
        
        // Ajouter à la queue offline
        this.addToQueue({
            type: 'set',
            collection,
            docId,
            data: enrichedData
        });
        
        return { success: true, synced: false };
    },
    
    /**
     * Supprimer un document
     */
    async delete(collection, docId) {
        // Supprimer en local
        this.deleteLocal(collection, docId);
        
        // Essayer de sync vers Firebase
        if (this.isOnline) {
            try {
                const db = typeof getDb === 'function' ? getDb() : window.db;
                if (db) {
                    await db.collection(collection).doc(docId).delete();
                    console.log(`✅ ${collection}/${docId} supprimé`);
                    return { success: true, synced: true };
                }
            } catch (e) {
                console.warn(`⚠️ Suppression sync échouée:`, e);
            }
        }
        
        // Ajouter à la queue offline
        this.addToQueue({
            type: 'delete',
            collection,
            docId
        });
        
        return { success: true, synced: false };
    },
    
    /**
     * Charger un document
     */
    async get(collection, docId) {
        // Essayer Firebase d'abord si en ligne
        if (this.isOnline) {
            try {
                const db = typeof getDb === 'function' ? getDb() : window.db;
                if (db) {
                    const doc = await db.collection(collection).doc(docId).get();
                    if (doc.exists) {
                        const data = { id: doc.id, ...doc.data() };
                        // Mettre en cache local
                        this.saveLocal(collection, docId, data);
                        return data;
                    }
                }
            } catch (e) {
                console.warn(`⚠️ Lecture Firebase échouée:`, e);
            }
        }
        
        // Fallback vers le local
        return this.getLocal(collection, docId);
    },
    
    /**
     * Charger tous les documents d'une collection
     */
    async getAll(collection) {
        // Essayer Firebase d'abord si en ligne
        if (this.isOnline) {
            try {
                const db = typeof getDb === 'function' ? getDb() : window.db;
                if (db) {
                    const snapshot = await db.collection(collection).get();
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    // Mettre en cache local
                    this.saveAllLocal(collection, data);
                    return data;
                }
            } catch (e) {
                console.warn(`⚠️ Lecture Firebase échouée:`, e);
            }
        }
        
        // Fallback vers le local
        return this.getAllLocal(collection);
    },
    
    // ═══════════════════════════════════════════════════════════
    // STOCKAGE LOCAL
    // ═══════════════════════════════════════════════════════════
    
    getStorageKey(collection, docId = null) {
        if (docId) {
            return `trakio_${collection}_${docId}`;
        }
        return `trakio_${collection}_all`;
    },
    
    saveLocal(collection, docId, data) {
        try {
            // Sauvegarder le document individuel
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
            
            // Sauvegarder aussi individuellement
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
            // Supprimer le document individuel
            localStorage.removeItem(this.getStorageKey(collection, docId));
            
            // Mettre à jour la liste
            const all = this.getAllLocal(collection);
            const filtered = all.filter(item => item.id !== docId);
            localStorage.setItem(this.getStorageKey(collection), JSON.stringify(filtered));
            
        } catch (e) {
            console.error('Erreur suppression locale:', e);
        }
    },
    
    // ═══════════════════════════════════════════════════════════
    // LISTENERS TEMPS RÉEL
    // ═══════════════════════════════════════════════════════════
    
    /**
     * Écouter les changements d'une collection en temps réel
     */
    subscribe(collection, callback) {
        const db = typeof getDb === 'function' ? getDb() : window.db;
        if (!db) {
            console.warn('⚠️ Firebase non disponible pour subscribe');
            // Retourner les données locales
            callback(this.getAllLocal(collection));
            return () => {};
        }
        
        const unsubscribe = db.collection(collection).onSnapshot(
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                // Mettre en cache local
                this.saveAllLocal(collection, data);
                callback(data);
            },
            (error) => {
                console.error(`❌ Erreur listener ${collection}:`, error);
                // Fallback vers le local
                callback(this.getAllLocal(collection));
            }
        );
        
        // Stocker pour cleanup
        this.listeners.push(unsubscribe);
        
        return unsubscribe;
    },
    
    /**
     * Désinscrire tous les listeners
     */
    unsubscribeAll() {
        this.listeners.forEach(unsub => {
            try { unsub(); } catch (e) {}
        });
        this.listeners = [];
    },
    
    // ═══════════════════════════════════════════════════════════
    // SYNC MANUELLE
    // ═══════════════════════════════════════════════════════════
    
    async syncAll() {
        if (!this.isOnline) {
            if (typeof TrakioUI !== 'undefined') {
                TrakioUI.showToast('📡 Pas de connexion', 'warning');
            }
            return { success: false, reason: 'offline' };
        }
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.setFirebaseStatus('syncing');
        }
        
        // Traiter la queue
        await this.processOfflineQueue();
        
        return { success: true };
    },
    
    // ═══════════════════════════════════════════════════════════
    // UTILITAIRES
    // ═══════════════════════════════════════════════════════════
    
    getCurrentUserId() {
        if (typeof TrakioUsers !== 'undefined') {
            const user = TrakioUsers.getCurrentUser();
            return user?.id || 'unknown';
        }
        return 'unknown';
    },
    
    /**
     * Obtenir le statut de synchronisation
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            isSyncing: this.isSyncing,
            lastSync: this.lastSync,
            pendingOperations: this.offlineQueue.length
        };
    },
    
    /**
     * Vider le cache local
     */
    clearCache() {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('trakio_'));
        keys.forEach(k => localStorage.removeItem(k));
        console.log(`🗑️ ${keys.length} entrées de cache supprimées`);
        
        if (typeof TrakioUI !== 'undefined') {
            TrakioUI.showToast('🗑️ Cache vidé', 'success');
        }
    }
};

// ═══════════════════════════════════════════════════════════════
// HELPERS POUR LES COLLECTIONS SPÉCIFIQUES
// ═══════════════════════════════════════════════════════════════

const Articles = {
    collection: 'articles',
    
    async getAll() {
        return TrakioSync.getAll(this.collection);
    },
    
    async get(id) {
        return TrakioSync.get(this.collection, id);
    },
    
    async save(id, data) {
        const docId = id || `art_${Date.now()}`;
        return TrakioSync.save(this.collection, docId, { ...data, id: docId });
    },
    
    async delete(id) {
        return TrakioSync.delete(this.collection, id);
    },
    
    subscribe(callback) {
        return TrakioSync.subscribe(this.collection, callback);
    }
};

const Clients = {
    collection: 'clients',
    
    async getAll() {
        return TrakioSync.getAll(this.collection);
    },
    
    async get(id) {
        return TrakioSync.get(this.collection, id);
    },
    
    async save(id, data) {
        const docId = id || `cli_${Date.now()}`;
        return TrakioSync.save(this.collection, docId, { ...data, id: docId });
    },
    
    async delete(id) {
        return TrakioSync.delete(this.collection, id);
    },
    
    subscribe(callback) {
        return TrakioSync.subscribe(this.collection, callback);
    }
};

const Commandes = {
    collection: 'commandes',
    
    async getAll() {
        return TrakioSync.getAll(this.collection);
    },
    
    async get(id) {
        return TrakioSync.get(this.collection, id);
    },
    
    async save(id, data) {
        const docId = id || `cmd_${Date.now()}`;
        return TrakioSync.save(this.collection, docId, { ...data, id: docId });
    },
    
    async delete(id) {
        return TrakioSync.delete(this.collection, id);
    },
    
    subscribe(callback) {
        return TrakioSync.subscribe(this.collection, callback);
    }
};

// ═══════════════════════════════════════════════════════════════
// INITIALISATION
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    TrakioSync.init();
});

// Cleanup à la fermeture
window.addEventListener('beforeunload', () => {
    TrakioSync.unsubscribeAll();
});

// ═══════════════════════════════════════════════════════════════
// EXPORTS GLOBAUX
// ═══════════════════════════════════════════════════════════════

window.TrakioSync = TrakioSync;
window.Articles = Articles;
window.Clients = Clients;
window.Commandes = Commandes;

console.log(`🔄 TRAKIO Sync v${TrakioSync.VERSION} chargé`);
