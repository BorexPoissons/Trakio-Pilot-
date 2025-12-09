/**
 * TRAKIO Sync - Synchronisation Firebase & Dropbox
 * Version: 4.5.0
 * Fichier: trakio-sync.js (RACINE)
 */

// ==========================================
// FIREBASE MANAGER
// ==========================================
class TrakioFirebase {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.isInitialized = false;
        this.listeners = [];
    }

    async init() {
        if (this.isInitialized) return true;

        try {
            // Check if Firebase scripts are loaded
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase SDK non chargé');
                return false;
            }

            // Initialize Firebase
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(FIREBASE_CONFIG);
            } else {
                this.app = firebase.apps[0];
            }

            this.db = firebase.firestore();
            this.auth = firebase.auth();

            // Enable offline persistence
            try {
                await this.db.enablePersistence({ synchronizeTabs: true });
            } catch (err) {
                if (err.code === 'failed-precondition') {
                    console.warn('Persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('Persistence not supported');
                }
            }

            this.isInitialized = true;
            console.log('✅ Firebase initialisé');
            return true;
        } catch (error) {
            console.error('❌ Erreur Firebase:', error);
            return false;
        }
    }

    // Get collection reference
    collection(name) {
        if (!this.db) return null;
        return this.db.collection(name);
    }

    // Real-time listener
    onSnapshot(collectionName, callback) {
        if (!this.db) return null;

        const unsubscribe = this.db.collection(collectionName)
            .orderBy('updatedAt', 'desc')
            .limit(100)
            .onSnapshot(
                snapshot => {
                    const data = [];
                    snapshot.forEach(doc => {
                        data.push({ id: doc.id, ...doc.data() });
                    });
                    callback(data, null);
                },
                error => {
                    callback(null, error);
                }
            );

        this.listeners.push(unsubscribe);
        return unsubscribe;
    }

    // Add document
    async add(collectionName, data) {
        if (!this.db) return null;

        const docData = {
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await this.db.collection(collectionName).add(docData);
        return docRef.id;
    }

    // Update document
    async update(collectionName, docId, data) {
        if (!this.db) return false;

        await this.db.collection(collectionName).doc(docId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    }

    // Set document (create or overwrite)
    async set(collectionName, docId, data, merge = true) {
        if (!this.db) return false;

        await this.db.collection(collectionName).doc(docId).set({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge });
        return true;
    }

    // Delete document
    async delete(collectionName, docId) {
        if (!this.db) return false;

        await this.db.collection(collectionName).doc(docId).delete();
        return true;
    }

    // Get all documents
    async getAll(collectionName) {
        if (!this.db) return [];

        const snapshot = await this.db.collection(collectionName).get();
        const data = [];
        snapshot.forEach(doc => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return data;
    }

    // Get single document
    async get(collectionName, docId) {
        if (!this.db) return null;

        const doc = await this.db.collection(collectionName).doc(docId).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    // Cleanup listeners
    cleanup() {
        this.listeners.forEach(unsub => unsub());
        this.listeners = [];
    }
}

// ==========================================
// DROPBOX MANAGER
// ==========================================
class TrakioDropbox {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.isConnected = false;
    }

    async init() {
        // Load tokens from storage
        this.accessToken = localStorage.getItem('dropbox_access_token');
        this.refreshToken = localStorage.getItem('dropbox_refresh_token');
        
        if (this.accessToken) {
            this.isConnected = await this.testConnection();
        }
        
        return this.isConnected;
    }

    async testConnection() {
        try {
            const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;

        try {
            // Note: In production, this should go through your backend
            console.log('🔄 Refreshing Dropbox token...');
            // Token refresh logic here
            return true;
        } catch {
            return false;
        }
    }

    async uploadFile(path, content) {
        if (!this.isConnected) return false;

        try {
            const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        path: path,
                        mode: 'overwrite',
                        autorename: false
                    }),
                    'Content-Type': 'application/octet-stream'
                },
                body: typeof content === 'string' ? content : JSON.stringify(content)
            });

            return response.ok;
        } catch (error) {
            console.error('Dropbox upload error:', error);
            return false;
        }
    }

    async downloadFile(path) {
        if (!this.isConnected) return null;

        try {
            const response = await fetch('https://content.dropboxapi.com/2/files/download', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Dropbox-API-Arg': JSON.stringify({ path })
                }
            });

            if (!response.ok) return null;
            return await response.text();
        } catch {
            return null;
        }
    }

    async fileExists(path) {
        if (!this.isConnected) return false;

        try {
            const response = await fetch('https://api.dropboxapi.com/2/files/get_metadata', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path })
            });

            return response.ok;
        } catch {
            return false;
        }
    }
}

// ==========================================
// SYNC MANAGER
// ==========================================
class TrakioSync {
    constructor() {
        this.firebase = new TrakioFirebase();
        this.dropbox = new TrakioDropbox();
        this.syncInterval = null;
        this.lastSync = null;
        this.isSyncing = false;
        this.callbacks = {
            onStatusChange: [],
            onDataChange: [],
            onError: []
        };
    }

    async init() {
        // Initialize Firebase
        const fbOk = await this.firebase.init();

        // Initialize Dropbox
        const dbxOk = await this.dropbox.init();

        // Start auto-sync
        this.startAutoSync();

        // Update UI
        this.updateStatus(fbOk || dbxOk ? 'online' : 'offline');

        console.log(`✅ TRAKIO Sync initialisé - Firebase: ${fbOk ? '✓' : '✗'}, Dropbox: ${dbxOk ? '✓' : '✗'}`);
        return fbOk || dbxOk;
    }

    // Register callbacks
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }

    // Emit event
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(data));
        }
    }

    // Update sync status
    updateStatus(status) {
        this.emit('onStatusChange', status);
        
        // Update UI if available
        if (typeof trakioUI !== 'undefined' && trakioUI.updateSyncStatus) {
            trakioUI.updateSyncStatus(status);
        }
    }

    // Start auto-sync interval
    startAutoSync() {
        if (this.syncInterval) clearInterval(this.syncInterval);

        this.syncInterval = setInterval(() => {
            this.syncAll();
        }, TRAKIO_CONFIG.syncInterval);

        // Initial sync
        setTimeout(() => this.syncAll(), 5000);
    }

    // Stop auto-sync
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Sync all data
    async syncAll() {
        if (this.isSyncing) return;

        this.isSyncing = true;
        this.updateStatus('syncing');

        try {
            // Sync each collection
            await this.syncCollection('articles', TRAKIO_CONFIG.storageKeys.articles);
            await this.syncCollection('clients', TRAKIO_CONFIG.storageKeys.clients);
            await this.syncCollection('commandes', TRAKIO_CONFIG.storageKeys.commandes);

            // Update version if admin
            const user = getCurrentUser();
            if (user?.role === 'admin') {
                await this.publishVersion();
            }

            this.lastSync = new Date();
            this.updateStatus('online');
            console.log('✅ Sync complète');
        } catch (error) {
            console.error('❌ Erreur sync:', error);
            this.updateStatus('offline');
            this.emit('onError', error);
        } finally {
            this.isSyncing = false;
        }
    }

    // Sync single collection
    async syncCollection(collectionName, storageKey) {
        try {
            // Get local data
            const localData = loadFromStorage(storageKey, []);

            // Get remote data from Firebase
            const remoteData = await this.firebase.getAll(collectionName);

            // Merge data (remote wins for conflicts based on updatedAt)
            const merged = this.mergeData(localData, remoteData);

            // Save merged data locally
            saveToStorage(storageKey, merged);

            // Backup to Dropbox if connected
            if (this.dropbox.isConnected) {
                const path = `${TRAKIO_CONFIG.dropboxPaths.root}/${collectionName}/data.json`;
                await this.dropbox.uploadFile(path, merged);
            }

            this.emit('onDataChange', { collection: collectionName, data: merged });
            return merged;
        } catch (error) {
            console.error(`Sync error for ${collectionName}:`, error);
            throw error;
        }
    }

    // Merge local and remote data
    mergeData(local, remote) {
        const localArray = Array.isArray(local) ? local : (local?.items || local?.clients || []);
        const remoteArray = Array.isArray(remote) ? remote : [];

        const merged = new Map();

        // Add local data
        localArray.forEach(item => {
            if (item.id) merged.set(item.id, item);
        });

        // Merge remote data (overwrites if newer)
        remoteArray.forEach(item => {
            if (!item.id) return;

            const existing = merged.get(item.id);
            if (!existing) {
                merged.set(item.id, item);
            } else {
                // Compare timestamps
                const localTime = new Date(existing.updatedAt || 0).getTime();
                const remoteTime = item.updatedAt?.toMillis?.() || new Date(item.updatedAt || 0).getTime();
                
                if (remoteTime > localTime) {
                    merged.set(item.id, item);
                }
            }
        });

        return Array.from(merged.values());
    }

    // Publish version for other users
    async publishVersion() {
        const versionData = {
            version: TRAKIO_CONFIG.version,
            publishedAt: new Date().toISOString(),
            publishedBy: getCurrentUser()?.name || 'System'
        };

        // Save to Firebase
        await this.firebase.set('settings', 'version', versionData);

        // Save to Dropbox
        if (this.dropbox.isConnected) {
            await this.dropbox.uploadFile(
                TRAKIO_CONFIG.dropboxPaths.version,
                JSON.stringify(versionData, null, 2)
            );
        }

        console.log('📤 Version publiée:', versionData);
    }

    // Check for updates
    async checkForUpdates() {
        try {
            const remoteVersion = await this.firebase.get('settings', 'version');
            if (remoteVersion && remoteVersion.version !== TRAKIO_CONFIG.version) {
                return remoteVersion;
            }
            return null;
        } catch {
            return null;
        }
    }

    // Manual save to cloud
    async saveToCloud(collectionName, data) {
        try {
            // Save to Firebase
            if (data.id) {
                await this.firebase.set(collectionName, data.id, data);
            } else {
                const id = await this.firebase.add(collectionName, data);
                data.id = id;
            }

            return data;
        } catch (error) {
            console.error('Save to cloud error:', error);
            throw error;
        }
    }

    // Delete from cloud
    async deleteFromCloud(collectionName, docId) {
        try {
            await this.firebase.delete(collectionName, docId);
            return true;
        } catch (error) {
            console.error('Delete from cloud error:', error);
            return false;
        }
    }

    // Subscribe to real-time updates
    subscribeToCollection(collectionName, callback) {
        return this.firebase.onSnapshot(collectionName, (data, error) => {
            if (error) {
                this.emit('onError', error);
                return;
            }
            callback(data);
        });
    }

    // Check if can sync
    canSync() {
        return this.firebase.isInitialized || this.dropbox.isConnected;
    }

    // Check if available
    isAvailable() {
        return navigator.onLine && this.canSync();
    }

    // Cleanup
    cleanup() {
        this.stopAutoSync();
        this.firebase.cleanup();
    }
}

// ==========================================
// GLOBAL INSTANCE
// ==========================================
let trakioSync;

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof TRAKIO_CONFIG !== 'undefined') {
        trakioSync = new TrakioSync();
        await trakioSync.init();
        
        // Make globally available
        window.trakioSync = trakioSync;
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (trakioSync) {
        trakioSync.cleanup();
    }
});

// Export
if (typeof window !== 'undefined') {
    window.TrakioSync = TrakioSync;
    window.TrakioFirebase = TrakioFirebase;
    window.TrakioDropbox = TrakioDropbox;
}

console.log('✅ TRAKIO Sync v' + (typeof TRAKIO_CONFIG !== 'undefined' ? TRAKIO_CONFIG.version : '4.5.0') + ' chargé');
