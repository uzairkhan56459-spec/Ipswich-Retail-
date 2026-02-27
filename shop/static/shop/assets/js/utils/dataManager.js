// ========================================
// DATA MANAGER - Export/Import LocalStorage
// ========================================

const DataManager = {
    // Keys to export/import
    dataKeys: ['cart', 'wishlist', 'orders', 'users', 'currentUser', 'recentlyViewed'],

    // Export all data to JSON file
    exportData(filename = 'hg-store-data.json') {
        const data = {};
        
        this.dataKeys.forEach(key => {
            const value = Storage.get(key);
            if (value !== null) {
                data[key] = value;
            }
        });

        // Add metadata
        data._metadata = {
            exportedAt: new Date().toISOString(),
            version: '1.0',
            source: 'H&G Handmade Goods'
        };

        // Create and download file
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('Data exported successfully:', data);
        return data;
    },

    // Import data from JSON file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data
                    if (!data || typeof data !== 'object') {
                        throw new Error('Invalid data format');
                    }

                    // Import each key
                    let importedCount = 0;
                    this.dataKeys.forEach(key => {
                        if (data[key] !== undefined) {
                            Storage.set(key, data[key]);
                            importedCount++;
                        }
                    });

                    console.log(`Data imported successfully: ${importedCount} items`);
                    resolve({
                        success: true,
                        importedCount,
                        metadata: data._metadata
                    });

                } catch (error) {
                    console.error('Import error:', error);
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    // Export specific data (e.g., just cart or orders)
    exportSpecific(keys, filename) {
        const data = {};
        
        keys.forEach(key => {
            const value = Storage.get(key);
            if (value !== null) {
                data[key] = value;
            }
        });

        data._metadata = {
            exportedAt: new Date().toISOString(),
            keys: keys
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `hg-${keys.join('-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return data;
    },

    // Clear all stored data
    clearAllData() {
        this.dataKeys.forEach(key => {
            Storage.remove(key);
        });
        console.log('All data cleared');
    },

    // Get summary of stored data
    getDataSummary() {
        const summary = {};
        
        this.dataKeys.forEach(key => {
            const value = Storage.get(key);
            if (value !== null) {
                if (Array.isArray(value)) {
                    summary[key] = `${value.length} items`;
                } else if (typeof value === 'object') {
                    summary[key] = 'object';
                } else {
                    summary[key] = value;
                }
            } else {
                summary[key] = 'empty';
            }
        });

        return summary;
    },

    // Create file input for import
    createImportButton(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.id = 'dataImportInput';
        input.style.display = 'none';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await this.importData(file);
                    alert(`Data imported successfully! ${result.importedCount} items restored.`);
                    window.location.reload();
                } catch (error) {
                    alert('Failed to import data: ' + error.message);
                }
            }
        });

        container.appendChild(input);
        return input;
    },

    // Save current data snapshot to project (for development)
    saveSnapshot() {
        const data = {};
        
        this.dataKeys.forEach(key => {
            const value = Storage.get(key);
            if (value !== null) {
                data[key] = value;
            }
        });

        console.log('=== DATA SNAPSHOT ===');
        console.log('Copy this to assets/data/snapshot.json:');
        console.log(JSON.stringify(data, null, 2));
        console.log('=====================');

        return data;
    },

    // Load snapshot from project file
    async loadSnapshot(url = null) {
        try {
            // Use helper for GitHub Pages compatibility if no URL provided
            const snapshotUrl = url || Helpers.getDataPath('snapshot.json');
            const response = await fetch(snapshotUrl);
            if (!response.ok) throw new Error('Snapshot not found');
            
            const data = await response.json();
            
            this.dataKeys.forEach(key => {
                if (data[key] !== undefined) {
                    Storage.set(key, data[key]);
                }
            });

            console.log('Snapshot loaded successfully');
            return true;
        } catch (error) {
            console.log('No snapshot found or failed to load:', error.message);
            return false;
        }
    }
};

// Make DataManager available globally
if (typeof window !== 'undefined') {
    window.DataManager = DataManager;
}
