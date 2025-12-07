/**
 * TRAKIO Synchronisation Centralisée
 * Version: 1.0.0
 */

const TrakioSync = {
    
    async getAll(collection, options = {}) {
        try {
            if (!db) {
                console.warn('⚠️ Firebase non initialisé, lecture localStorage');
                return this.getFromLocalStorage(collection);
            }
            
            let query = db.collection(collection);
            
            if (options.where) {
                options.where.forEach(w => {
                    query = query.where(w.field, w.op, w.value);
                });
            }
            
            if (options.orderBy) {
                query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
            }
            
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            const snapshot = await query.get();
            const data = [];
            
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            this.saveToLocalStorage(collection, data);
            
            console.log(`📥 ${collection}: ${data.length} documents chargés`);
            return data;
            
        } catch (error) {
            console.error(`❌ Erreur lecture ${collection}:`, error);
            return this.getFromLocalStorage(collection);
        }
    },
    
    async getOne(collection, docId) {
        try {
            if (!db) {
                const all = this.getFromLocalStorage(collection);
                return all.find(d => d.id === docId) || null;
            }
            
            const doc = await db.collection(collection).doc(docId).get();
            
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
            
        } catch (error) {
            console.error(`❌ Erreur lecture ${collection}/${docId}:`, error);
            return null;
        }
    },
    
    async save(collection, docId, data) {
        data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        data.updatedBy = TRAKIO_STATE.currentUser || 'unknown';
        
        if (!data.createdAt) {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        
        try {
            if (!TRAKIO_STATE.firebaseConnected) {
                return this.saveOffline(collection, docId, data);
            }
            
            if (!db) throw new Error('Firebase non initialisé');
            
            let ref;
            if (docId) {
                ref = db.collection(collection).doc(docId);
                await ref.set(data, { merge: true });
            } else {
                ref = await db.collection(collection).add(data);
                docId = ref.id;
            }
            
            this.updateLocalCache(collection, docId, data);
            
            console.log(`💾 ${collection}/${docId} sauvegardé`);
            return docId;
            
        } catch (error) {
            console.error(`❌ Erreur sauvegarde ${collection}:`, error);
            return this.saveOffline(collection, docId, data);
        }
    },
    
    saveOffline(collection, docId, data) {
        docId = docId || generateId();
        
        data.updatedAt = Date.now();
        if (!data.createdAt) data.createdAt = Date.now();
        
        addToOfflineQueue({
            type: 'set',
            collection,
            docId,
            data
        });
        
        this.updateLocalCache(collection, docId, data);
        
        showNotification('Sauvegardé localement (sync en attente)', 'warning');
        return docId;
    },
    
    async delete(collection, docId) {
        try {
            if (!TRAKIO_STATE.firebaseConnected) {
                addToOfflineQueue({ type: 'delete', collection, docId });
                this.removeFromLocalCache(collection, docId);
                showNotification('Supprimé localement (sync en attente)', 'warning');
                return true;
            }
            
            if (!db) throw new Error('Firebase non initialisé');
            
            await db.collection(collection).doc(docId).delete();
            this.removeFromLocalCache(collection, docId);
            
            console.log(`🗑️ ${collection}/${docId} supprimé`);
            return true;
            
        } catch (error) {
            console.error(`❌ Erreur suppression ${collection}/${docId}:`, error);
            return false;
        }
    },
    
    async update(collection, docId, updates) {
        updates.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        updates.updatedBy = TRAKIO_STATE.currentUser || 'unknown';
        
        try {
            if (!TRAKIO_STATE.firebaseConnected) {
                addToOfflineQueue({ type: 'update', collection, docId, data: updates });
                this.updateLocalCache(collection, docId, updates, true);
                return true;
            }
            
            if (!db) throw new Error('Firebase non initialisé');
            
            await db.collection(collection).doc(docId).update(updates);
            this.updateLocalCache(collection, docId, updates, true);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Erreur update ${collection}/${docId}:`, error);
            return false;
        }
    },
    
    listen(collection, callback, options = {}) {
        if (!db) {
            console.warn('⚠️ Firebase non initialisé');
            callback(this.getFromLocalStorage(collection), []);
            return () => {};
        }
        
        let query = db.collection(collection);
        
        if (options.where) {
            options.where.forEach(w => {
                query = query.where(w.field, w.op, w.value);
            });
        }
        
        if (options.orderBy) {
            query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
        }
        
        if (options.limit) {
            query = query.limit(options.limit);
        }
        
        const unsubscribe = query.onSnapshot(
            { includeMetadataChanges: false },
            (snapshot) => {
                const data = [];
                const changes = [];
                
                snapshot.forEach(doc => {
                    data.push({ id: doc.id, ...doc.data() });
                });
                
                snapshot.docChanges().forEach(change => {
                    changes.push({
                        type: change.type,
                        doc: { id: change.doc.id, ...change.doc.data() }
                    });
                });
                
                this.saveToLocalStorage(collection, data);
                callback(data, changes);
            },
            (error) => {
                console.error(`❌ Erreur listener ${collection}:`, error);
                callback(this.getFromLocalStorage(collection), []);
            }
        );
        
        TRAKIO_STATE.listeners.push({ collection, unsubscribe });
        console.log(`👂 Écoute temps réel: ${collection}`);
        return unsubscribe;
    },
    
    listenOne(collection, docId, callback) {
        if (!db) {
            console.warn('⚠️ Firebase non initialisé');
            return () => {};
        }
        
        const unsubscribe = db.collection(collection).doc(docId).onSnapshot(
            (doc) => {
                if (doc.exists) {
                    callback({ id: doc.id, ...doc.data() });
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error(`❌ Erreur listener ${collection}/${docId}:`, error);
                callback(null);
            }
        );
        
        TRAKIO_STATE.listeners.push({ collection, docId, unsubscribe });
        return unsubscribe;
    },
    
    stopAllListeners() {
        TRAKIO_STATE.listeners.forEach(l => {
            if (l.unsubscribe) l.unsubscribe();
        });
        TRAKIO_STATE.listeners = [];
        console.log('🔇 Toutes les écoutes arrêtées');
    },
    
    getStorageKey(collection) {
        const keyMap = {
            [TRAKIO.COLLECTIONS.ARTICLES]: TRAKIO.STORAGE_KEYS.ARTICLES,
            [TRAKIO.COLLECTIONS.CLIENTS]: TRAKIO.STORAGE_KEYS.CLIENTS,
            [TRAKIO.COLLECTIONS.COMMANDES]: TRAKIO.STORAGE_KEYS.COMMANDES,
            [TRAKIO.COLLECTIONS.MYFISH]: TRAKIO.STORAGE_KEYS.MYFISH,
            [TRAKIO.COLLECTIONS.CAISSE]: TRAKIO.STORAGE_KEYS.CAISSE,
            [TRAKIO.COLLECTIONS.COURS_POISSONS]: TRAKIO.STORAGE_KEYS.COURS,
            [TRAKIO.COLLECTIONS.TRACABILITE]: TRAKIO.STORAGE_KEYS.TRACABILITE,
            [TRAKIO.COLLECTIONS.COMPTA]: TRAKIO.STORAGE_KEYS.COMPTA,
            [TRAKIO.COLLECTIONS.SETTINGS]: TRAKIO.STORAGE_KEYS.SETTINGS
        };
        return keyMap[collection] || `trakio_${collection}`;
    },
    
    saveToLocalStorage(collection, data) {
        try {
            const key = this.getStorageKey(collection);
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(TRAKIO.STORAGE_KEYS.LAST_SYNC, Date.now().toString());
        } catch (e) {
            console.warn('⚠️ Erreur sauvegarde localStorage:', e);
        }
    },
    
    getFromLocalStorage(collection) {
        try {
            const key = this.getStorageKey(collection);
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },
    
    updateLocalCache(collection, docId, data, partial = false) {
        const all = this.getFromLocalStorage(collection);
        const index = all.findIndex(d => d.id === docId);
        
        if (index >= 0) {
            if (partial) {
                all[index] = { ...all[index], ...data };
            } else {
                all[index] = { id: docId, ...data };
            }
        } else {
            all.push({ id: docId, ...data });
        }
        
        this.saveToLocalStorage(collection, all);
    },
    
    removeFromLocalCache(collection, docId) {
        const all = this.getFromLocalStorage(collection);
        const filtered = all.filter(d => d.id !== docId);
        this.saveToLocalStorage(collection, filtered);
    },
    
    async syncAll() {
        if (TRAKIO_STATE.syncInProgress) {
            console.log('⏳ Sync déjà en cours...');
            return;
        }
        
        TRAKIO_STATE.syncInProgress = true;
        
        if (typeof updateConnectionStatus === 'function') {
            updateConnectionStatus('syncing');
        }
        
        console.log('🔄 Synchronisation complète...');
        
        try {
            await processOfflineQueue();
            
            const collections = Object.values(TRAKIO.COLLECTIONS);
            
            for (const collection of collections) {
                try {
                    await this.getAll(collection);
                } catch (e) {
                    console.warn(`⚠️ Impossible de sync ${collection}`);
                }
            }
            
            TRAKIO_STATE.lastSync = new Date();
            localStorage.setItem(TRAKIO.STORAGE_KEYS.LAST_SYNC, TRAKIO_STATE.lastSync.getTime().toString());
            
            console.log('✅ Synchronisation terminée');
            showNotification('Synchronisation terminée', 'success');
            
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error);
            showNotification('Erreur de synchronisation', 'error');
        } finally {
            TRAKIO_STATE.syncInProgress = false;
            
            if (typeof updateConnectionStatus === 'function') {
                updateConnectionStatus();
            }
        }
    },
    
    async batch(operations) {
        if (!db) {
            operations.forEach(op => addToOfflineQueue(op));
            return;
        }
        
        const batch = db.batch();
        
        operations.forEach(op => {
            const ref = db.collection(op.collection).doc(op.docId || generateId());
            
            switch (op.type) {
                case 'set':
                    batch.set(ref, {
                        ...op.data,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedBy: TRAKIO_STATE.currentUser
                    }, { merge: true });
                    break;
                case 'update':
                    batch.update(ref, {
                        ...op.data,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    break;
                case 'delete':
                    batch.delete(ref);
                    break;
            }
        });
        
        try {
            await batch.commit();
            console.log(`✅ Batch de ${operations.length} opérations exécuté`);
        } catch (error) {
            console.error('❌ Erreur batch:', error);
            operations.forEach(op => addToOfflineQueue(op));
        }
    }
};

const Articles = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.ARTICLES, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.ARTICLES, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.ARTICLES, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.ARTICLES, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.ARTICLES, cb, opts)
};

const Clients = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.CLIENTS, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.CLIENTS, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.CLIENTS, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.CLIENTS, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.CLIENTS, cb, opts)
};

const Commandes = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.COMMANDES, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.COMMANDES, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.COMMANDES, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.COMMANDES, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.COMMANDES, cb, opts)
};

const MyFishOrders = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.MYFISH, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.MYFISH, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.MYFISH, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.MYFISH, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.MYFISH, cb, opts)
};

const CaisseTransactions = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.CAISSE, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.CAISSE, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.CAISSE, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.CAISSE, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.CAISSE, cb, opts)
};

const CoursPoissons = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.COURS_POISSONS, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.COURS_POISSONS, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.COURS_POISSONS, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.COURS_POISSONS, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.COURS_POISSONS, cb, opts)
};

const Tracabilite = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.TRACABILITE, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.TRACABILITE, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.TRACABILITE, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.TRACABILITE, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.TRACABILITE, cb, opts)
};

const Compta = {
    getAll: (opts) => TrakioSync.getAll(TRAKIO.COLLECTIONS.COMPTA, opts),
    get: (id) => TrakioSync.getOne(TRAKIO.COLLECTIONS.COMPTA, id),
    save: (id, data) => TrakioSync.save(TRAKIO.COLLECTIONS.COMPTA, id, data),
    delete: (id) => TrakioSync.delete(TRAKIO.COLLECTIONS.COMPTA, id),
    listen: (cb, opts) => TrakioSync.listen(TRAKIO.COLLECTIONS.COMPTA, cb, opts)
};

console.log('🔄 TRAKIO Sync v1.0.0 chargé');
