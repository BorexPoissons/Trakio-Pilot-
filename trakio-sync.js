/**
 * TRAKIO Sync v4.5.0
 * Firebase Sync + DataStore + Offline Queue
 */

// ==================== SYNC STATUS ====================
const TrakioSync = {
    isOnline: navigator.onLine,
    lastSync: null,
    pendingOperations: [],
    listeners: [],
    
    init() {
        // Monitor online status
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processPendingOperations();
            this.notifyListeners('online');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyListeners('offline');
        });
        
        // Load pending operations from localStorage
        const pending = localStorage.getItem('trakio_pending_ops');
        if (pending) {
            this.pendingOperations = JSON.parse(pending);
        }
        
        console.log('🔄 TrakioSync initialized');
    },
    
    getStatus() {
        return {
            isOnline: this.isOnline,
            lastSync: this.lastSync,
            pendingOperations: this.pendingOperations.length
        };
    },
    
    addListener(callback) {
        this.listeners.push(callback);
    },
    
    notifyListeners(event) {
        this.listeners.forEach(cb => cb(event, this.getStatus()));
    },
    
    // Add operation to queue
    queueOperation(collection, operation, id, data) {
        this.pendingOperations.push({
            collection,
            operation,
            id,
            data,
            timestamp: Date.now()
        });
        localStorage.setItem('trakio_pending_ops', JSON.stringify(this.pendingOperations));
    },
    
    // Process pending operations when online
    async processPendingOperations() {
        if (!this.isOnline || !isFirebaseReady()) return;
        
        const ops = [...this.pendingOperations];
        this.pendingOperations = [];
        
        for (const op of ops) {
            try {
                const db = getDb();
                if (!db) continue;
                
                if (op.operation === 'save') {
                    await db.collection(op.collection).doc(op.id).set(op.data, { merge: true });
                } else if (op.operation === 'delete') {
                    await db.collection(op.collection).doc(op.id).delete();
                }
            } catch (e) {
                console.error('Sync error:', e);
                this.pendingOperations.push(op); // Re-queue on failure
            }
        }
        
        localStorage.setItem('trakio_pending_ops', JSON.stringify(this.pendingOperations));
        this.lastSync = new Date().toISOString();
        this.notifyListeners('synced');
    },
    
    // Force sync all collections
    async syncAll() {
        if (!isFirebaseReady()) {
            console.log('Firebase not ready');
            return;
        }
        
        await this.processPendingOperations();
        this.lastSync = new Date().toISOString();
        return true;
    }
};

// ==================== DATA STORE ====================
const DataStore = {
    // Generic collection handler factory
    createCollection(name, localKey) {
        return {
            name,
            localKey,
            
            // Get all items
            getAll() {
                const data = localStorage.getItem(localKey);
                return data ? JSON.parse(data) : [];
            },
            
            // Get by ID
            getById(id) {
                return this.getAll().find(item => item.id === id);
            },
            
            // Save (create or update)
            async save(id, data) {
                const items = this.getAll();
                const now = new Date().toISOString();
                
                if (id) {
                    // Update existing
                    const index = items.findIndex(item => item.id === id);
                    if (index !== -1) {
                        items[index] = { ...items[index], ...data, updatedAt: now };
                    } else {
                        // ID provided but not found, create new
                        items.push({ ...data, id, createdAt: now, updatedAt: now });
                    }
                } else {
                    // Create new
                    id = generateId(name.slice(0, 3) + '_');
                    items.push({ ...data, id, createdAt: now, updatedAt: now });
                }
                
                // Save to localStorage
                localStorage.setItem(localKey, JSON.stringify(items));
                
                // Queue for Firebase sync
                if (TrakioSync.isOnline && isFirebaseReady()) {
                    try {
                        const db = getDb();
                        if (db) {
                            await db.collection(name).doc(id).set({ ...data, updatedAt: now }, { merge: true });
                        }
                    } catch (e) {
                        TrakioSync.queueOperation(name, 'save', id, data);
                    }
                } else {
                    TrakioSync.queueOperation(name, 'save', id, data);
                }
                
                return id;
            },
            
            // Delete
            async delete(id) {
                let items = this.getAll();
                items = items.filter(item => item.id !== id);
                localStorage.setItem(localKey, JSON.stringify(items));
                
                // Queue for Firebase sync
                if (TrakioSync.isOnline && isFirebaseReady()) {
                    try {
                        const db = getDb();
                        if (db) {
                            await db.collection(name).doc(id).delete();
                        }
                    } catch (e) {
                        TrakioSync.queueOperation(name, 'delete', id, null);
                    }
                } else {
                    TrakioSync.queueOperation(name, 'delete', id, null);
                }
                
                return true;
            },
            
            // Search
            search(query, fields = ['name']) {
                const items = this.getAll();
                const q = query.toLowerCase();
                return items.filter(item => 
                    fields.some(field => 
                        (item[field] || '').toLowerCase().includes(q)
                    )
                );
            },
            
            // Filter
            filter(predicate) {
                return this.getAll().filter(predicate);
            },
            
            // Count
            count() {
                return this.getAll().length;
            },
            
            // Clear all
            clear() {
                localStorage.setItem(localKey, '[]');
            },
            
            // Import (replace or merge)
            import(data, mode = 'merge') {
                if (mode === 'replace') {
                    localStorage.setItem(localKey, JSON.stringify(data));
                } else {
                    const existing = this.getAll();
                    const merged = [...existing];
                    
                    data.forEach(item => {
                        const index = merged.findIndex(e => e.id === item.id);
                        if (index !== -1) {
                            merged[index] = { ...merged[index], ...item };
                        } else {
                            merged.push(item);
                        }
                    });
                    
                    localStorage.setItem(localKey, JSON.stringify(merged));
                }
            },
            
            // Export
            export() {
                return this.getAll();
            },
            
            // Listen to Firebase changes (real-time)
            listen(callback) {
                if (!isFirebaseReady()) return null;
                
                const db = getDb();
                if (!db) return null;
                
                return db.collection(name).onSnapshot(snapshot => {
                    const items = [];
                    snapshot.forEach(doc => {
                        items.push({ id: doc.id, ...doc.data() });
                    });
                    callback(items);
                });
            }
        };
    },
    
    // Pre-defined collections
    articles: null,
    clients: null,
    commandes: null,
    ventes: null,
    etiquettes: null,
    
    init() {
        this.articles = this.createCollection('articles', 'trakio_articles_list');
        this.clients = this.createCollection('clients', 'trakio_clients_list');
        this.commandes = this.createCollection('commandes', 'trakio_commandes_list');
        this.ventes = this.createCollection('ventes', 'trakio_ventes_list');
        this.etiquettes = this.createCollection('etiquettes', 'trakio_etiquettes_list');
        
        console.log('📦 DataStore initialized');
    }
};

// ==================== FIREBASE PULL ====================
async function pullFromFirebase(collection, localKey) {
    if (!isFirebaseReady()) return false;
    
    try {
        const db = getDb();
        if (!db) return false;
        
        const snapshot = await db.collection(collection).get();
        const items = [];
        snapshot.forEach(doc => {
            items.push({ id: doc.id, ...doc.data() });
        });
        
        // Merge with local data
        const local = JSON.parse(localStorage.getItem(localKey) || '[]');
        const merged = [...local];
        
        items.forEach(item => {
            const index = merged.findIndex(e => e.id === item.id);
            if (index !== -1) {
                // Keep newer version
                if (new Date(item.updatedAt) > new Date(merged[index].updatedAt || 0)) {
                    merged[index] = item;
                }
            } else {
                merged.push(item);
            }
        });
        
        localStorage.setItem(localKey, JSON.stringify(merged));
        return true;
    } catch (e) {
        console.error('Pull error:', e);
        return false;
    }
}

// ==================== FIREBASE PUSH ====================
async function pushToFirebase(collection, localKey) {
    if (!isFirebaseReady()) return false;
    
    try {
        const db = getDb();
        if (!db) return false;
        
        const items = JSON.parse(localStorage.getItem(localKey) || '[]');
        const batch = db.batch();
        
        items.forEach(item => {
            const ref = db.collection(collection).doc(item.id);
            batch.set(ref, item, { merge: true });
        });
        
        await batch.commit();
        return true;
    } catch (e) {
        console.error('Push error:', e);
        return false;
    }
}

// ==================== AUTO INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    TrakioSync.init();
    DataStore.init();
});

console.log('🔄 TrakioSync v4.5.0 loaded');
