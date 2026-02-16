// IndexedDBManager - Handles all IndexedDB operations
// Drop-in replacement for DatabaseManager with identical API

class IndexedDBManager {
	constructor(dbFileName, storageManager) {
		this.dbFileName = dbFileName; // Not used, kept for API compatibility
		this.storageManager = storageManager;
		this.db = null;
		this.dbName = 'BibleAppDB';
		this.dbVersion = 1;
		this.storeCache = new Set(); // Track which object stores exist
	}

	isAvailable() {
		// IndexedDB is available in all modern browsers
		return !!(window.indexedDB);
	}

	async verifyDatabaseHasData(versionCode = null) {
		if (!this.db) {
			return false;
		}

		try {
			if (!versionCode) {
				// Check if ANY version exists
				const storeNames = Array.from(this.db.objectStoreNames);
				const versionStores = storeNames.filter(name => name.endsWith('_books'));
				return versionStores.length > 0;
			} else {
				// Check specific version
				const storeName = `${versionCode}_books`;
				if (!this.db.objectStoreNames.contains(storeName)) {
					return false;
				}

				const tx = this.db.transaction(storeName, 'readonly');
				const store = tx.objectStore(storeName);
				const count = await this._promisifyRequest(store.count());
				return count > 0;
			}
		} catch (error) {
			console.log(`Database verification failed: ${error.message}`);
			return false;
		}
	}

	async getAvailableVersions() {
		if (!this.db) {
			return [];
		}

		try {
			const storeNames = Array.from(this.db.objectStoreNames);
			const versions = storeNames
				.filter(name => name.endsWith('_books'))
				.map(name => name.replace('_books', ''));

			// console.log('Available IndexedDB versions:', versions.join(' '));
			return versions;
		} catch (error) {
			console.error('Error getting available versions:', error);
			return [];
		}
	}

	async open() {
		return new Promise((resolve, reject) => {
			// First, detect the current version
			const detectRequest = indexedDB.open(this.dbName);

			detectRequest.onsuccess = () => {
				const currentVersion = detectRequest.result.version;
				detectRequest.result.close();

				// Now open with the correct version
				const request = indexedDB.open(this.dbName, currentVersion);

				request.onerror = () => {
					console.error('Error opening IndexedDB:', request.error);
					reject(request.error);
				};

				request.onsuccess = () => {
					this.db = request.result;
					this.dbVersion = currentVersion;  // Track current version

					// Populate store cache
					this.storeCache.clear();
					for (let i = 0; i < this.db.objectStoreNames.length; i++) {
						this.storeCache.add(this.db.objectStoreNames[i]);
					}

					resolve(true);
				};

				request.onupgradeneeded = (event) => {
					// Shouldn't happen when opening with current version
					this.db = event.target.result;
				};
			};

			detectRequest.onerror = () => {
				// Database doesn't exist yet, create it at version 1
				const request = indexedDB.open(this.dbName, 1);

				request.onerror = () => {
					console.error('Error opening IndexedDB:', request.error);
					reject(request.error);
				};

				request.onsuccess = () => {
					this.db = request.result;
					this.dbVersion = 1;

					this.storeCache.clear();
					for (let i = 0; i < this.db.objectStoreNames.length; i++) {
						this.storeCache.add(this.db.objectStoreNames[i]);
					}

					resolve(true);
				};

				request.onupgradeneeded = (event) => {
					this.db = event.target.result;
				};
			};
		});
	}

	// Helper to convert IDBRequest to Promise
	_promisifyRequest(request) {
		return new Promise((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	parseCSV(text) {
		// Reuse exact same CSV parser from DatabaseManager
		const rows = [];
		let currentRow = [];
		let currentField = '';
		let inQuotes = false;

		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			const nextChar = text[i + 1];

			if (char === '"') {
				if (inQuotes && nextChar === '"') {
					currentField += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === ',' && !inQuotes) {
				currentRow.push(currentField);
				currentField = '';
			} else if ((char === '\n' || char === '\r') && !inQuotes) {
				if (currentField || currentRow.length > 0) {
					currentRow.push(currentField);
					rows.push(currentRow);
					currentRow = [];
					currentField = '';
				}
				if (char === '\r' && nextChar === '\n') {
					i++;
				}
			} else {
				currentField += char;
			}
		}

		if (currentField || currentRow.length > 0) {
			currentRow.push(currentField);
			rows.push(currentRow);
		}

		return rows;
	}

	async loadBooks(versionCode) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		const storeName = `${versionCode}_books`;

		if (!this.db.objectStoreNames.contains(storeName)) {
			throw new Error(`Store ${storeName} does not exist`);
		}

		try {
			const tx = this.db.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const request = store.getAll();
			const books = await this._promisifyRequest(request);

			// Sort by id to match SQL ORDER BY
			books.sort((a, b) => a.id - b.id);

			// Transform to match DatabaseManager format
			return books.map(book => ({
				id: book.id,
				name: book.name,
				abbreviation: book.abbreviation,
				chapters: book.chapters,
				source: 'db'
			}));
		} catch (error) {
			console.error('Error loading books:', error);
			throw error;
		}
	}

	async loadChapter(bookId, chapterNum, tableVerses) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (!this.db.objectStoreNames.contains(tableVerses)) {
			throw new Error(`Store ${tableVerses} does not exist`);
		}

		try {
			const tx = this.db.transaction(tableVerses, 'readonly');
			const store = tx.objectStore(tableVerses);

			// Get all verses and filter in memory
			// (More efficient than cursor for small datasets)
			const allVerses = await this._promisifyRequest(store.getAll());

			const verses = allVerses.filter(v => 
				v.book_id === bookId && v.chapter === chapterNum
			);

			if (verses.length === 0) {
				throw new Error('No verses found');
			}

			// Sort by verse number
			verses.sort((a, b) => a.verse - b.verse);

			// Return in SQL-like ResultSet format to match DatabaseManager API
			return {
				rows: {
					length: verses.length,
					item: (i) => verses[i]
				}
			};
		} catch (error) {
			console.error('Error loading chapter:', error);
			throw error;
		}
	}

	async loadVerse(bookId, chapterNum, verseNum, tableVerses) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (!this.db.objectStoreNames.contains(tableVerses)) {
			throw new Error(`Store ${tableVerses} does not exist`);
		}

		try {
			const tx = this.db.transaction(tableVerses, 'readonly');
			const store = tx.objectStore(tableVerses);

			const allVerses = await this._promisifyRequest(store.getAll());

			const verse = allVerses.find(v => 
				v.book_id === bookId && 
				v.chapter === chapterNum && 
				v.verse === verseNum
			);

			if (!verse) {
				throw new Error('Verse not found');
			}

			return verse;
		} catch (error) {
			console.error('Error loading verse:', error);
			throw error;
		}
	}

	async search(searchTerm, tableVerses, tableBooks, limit = 100) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (!this.db.objectStoreNames.contains(tableVerses) || 
		    !this.db.objectStoreNames.contains(tableBooks)) {
			throw new Error('Required stores do not exist');
		}

		try {
			// Load books first for abbreviation lookup
			const booksTx = this.db.transaction(tableBooks, 'readonly');
			const booksStore = booksTx.objectStore(tableBooks);
			const books = await this._promisifyRequest(booksStore.getAll());

			// Create book lookup map
			const bookMap = {};
			books.forEach(book => {
				bookMap[book.id] = book;
			});

			// Load and search verses
			const versesTx = this.db.transaction(tableVerses, 'readonly');
			const versesStore = versesTx.objectStore(tableVerses);
			const allVerses = await this._promisifyRequest(versesStore.getAll());

			// Case-insensitive search
			const searchLower = searchTerm.toLowerCase();
			const results = allVerses
				.filter(verse => verse.text.toLowerCase().includes(searchLower))
				.slice(0, limit)
				.map(verse => ({
					abbreviation: bookMap[verse.book_id]?.abbreviation || '',
					chapter: verse.chapter,
					verse: verse.verse,
					text: verse.text
				}));

			// Return in SQL-like ResultSet format
			return {
				rows: {
					length: results.length,
					item: (i) => results[i]
				}
			};
		} catch (error) {
			console.error('Error searching:', error);
			throw error;
		}
	}

	async createTablesForVersion(versionCode) {
		// IndexedDB doesn't allow creating stores on an open database
		// We need to close, increment version, and reopen

		const booksStore = `${versionCode}_books`;
		const versesStore = `${versionCode}_verses`;

		// Check if stores already exist
		if (this.storeCache.has(booksStore) && this.storeCache.has(versesStore)) {
			// console.log(`Stores for ${versionCode} already exist`);
			return;
		}

		// Close current connection
		if (this.db) {
			this.db.close();
		}

		// Increment version and create new stores
		this.dbVersion++;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.dbVersion);

			request.onerror = () => {
				console.error('Error creating tables:', request.error);
				reject(request.error);
			};

			request.onsuccess = () => {
				this.db = request.result;

				// Update cache
				this.storeCache.add(booksStore);
				this.storeCache.add(versesStore);

				// console.log(`${versionCode}_books and ${versionCode}_verses stores created`);
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = event.target.result;

				// Create books store if it doesn't exist
				if (!db.objectStoreNames.contains(booksStore)) {
					const bookStore = db.createObjectStore(booksStore, { keyPath: 'id' });
					bookStore.createIndex('name', 'name', { unique: true });
					bookStore.createIndex('abbreviation', 'abbreviation', { unique: true });
				}

				// Create verses store if it doesn't exist
				if (!db.objectStoreNames.contains(versesStore)) {
					const verseStore = db.createObjectStore(versesStore, { keyPath: 'id', autoIncrement: true });
					verseStore.createIndex('book_id', 'book_id', { unique: false });
					verseStore.createIndex('chapter', 'chapter', { unique: false });
					verseStore.createIndex('verse', 'verse', { unique: false });
					// Compound index for faster chapter queries
					verseStore.createIndex('book_chapter', ['book_id', 'chapter'], { unique: false });
				}
			};
		});
	}

	async insertBooksForVersion(versionCode, rows) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		const storeName = `${versionCode}_books`;

		try {
			const tx = this.db.transaction(storeName, 'readwrite');
			const store = tx.objectStore(storeName);

			// Insert all books
			for (const row of rows) {
				const book = {
					id: parseInt(row[0]),
					name: row[1],
					abbreviation: row[2],
					chapters: parseInt(row[3])
				};
				store.add(book);
			}

			// Wait for transaction to complete
			await new Promise((resolve, reject) => {
				tx.oncomplete = resolve;
				tx.onerror = () => reject(tx.error);
			});

			// console.log(`All books inserted for ${versionCode}`);
		} catch (error) {
			console.error('Error inserting books:', error);
			throw error;
		}
	}

	async insertVersesForVersion(versionCode, rows, progressCallback) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		const storeName = `${versionCode}_verses`;
		const batchSize = 1000; // IndexedDB handles larger batches well
		const totalBatches = Math.ceil(rows.length / batchSize);

		try {
			for (let i = 0; i < totalBatches; i++) {
				const start = i * batchSize;
				const end = Math.min(start + batchSize, rows.length);
				const batch = rows.slice(start, end);

				const tx = this.db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);

				// Insert batch
				for (const row of batch) {
					const verse = {
						// id auto-increments
						book_id: parseInt(row[1]),
						chapter: parseInt(row[2]),
						verse: parseInt(row[3]),
						text: row[4]
					};
					store.add(verse);
				}

				// Wait for transaction to complete
				await new Promise((resolve, reject) => {
					tx.oncomplete = resolve;
					tx.onerror = () => reject(tx.error);
				});

				// Report progress
				const percentage = Math.round(((i + 1) / totalBatches) * 100);
				if (progressCallback) {
					progressCallback(`Importing verses... ${percentage}%`, percentage);
				}
			}

			// console.log(`All verses inserted for ${versionCode}`);
		} catch (error) {
			console.error('Error inserting verses:', error);
			throw error;
		}
	}

	async deleteVersion(abbreviation) {
		if (!this.db) {
			throw new Error('Database not open');
		}

		const booksStore = `${abbreviation}_books`;
		const versesStore = `${abbreviation}_verses`;

		try {
			// Close current connection
			this.db.close();

			// Increment version to trigger upgrade
			this.dbVersion++;

			await new Promise((resolve, reject) => {
				const request = indexedDB.open(this.dbName, this.dbVersion);

				request.onerror = () => reject(request.error);

				request.onsuccess = () => {
					this.db = request.result;

					// Update cache
					this.storeCache.delete(booksStore);
					this.storeCache.delete(versesStore);

					resolve();
				};

				request.onupgradeneeded = (event) => {
					const db = event.target.result;

					// Delete stores if they exist
					if (db.objectStoreNames.contains(booksStore)) {
						db.deleteObjectStore(booksStore);
					}
					if (db.objectStoreNames.contains(versesStore)) {
						db.deleteObjectStore(versesStore);
					}
				};
			});

			// console.log(`Deleted stores for ${abbreviation}`);
		} catch (error) {
			console.error(`Error deleting version ${abbreviation}:`, error);
			throw error;
		}
	}

	async search(searchTerm, tableVerses, tableBooks, limit = 100, offset = 0) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (!this.db.objectStoreNames.contains(tableVerses) || 
			!this.db.objectStoreNames.contains(tableBooks)) {
			throw new Error('Required stores do not exist');
		}

		try {
			// Load books first for abbreviation lookup
			const booksTx = this.db.transaction(tableBooks, 'readonly');
			const booksStore = booksTx.objectStore(tableBooks);
			const books = await this._promisifyRequest(booksStore.getAll());

			// Create book lookup map
			const bookMap = {};
			books.forEach(book => {
				bookMap[book.id] = book;
			});

			// Load and search verses
			const versesTx = this.db.transaction(tableVerses, 'readonly');
			const versesStore = versesTx.objectStore(tableVerses);
			const allVerses = await this._promisifyRequest(versesStore.getAll());

			// Case-insensitive search
			const searchLower = searchTerm.toLowerCase();
			const matchingVerses = allVerses
				.filter(verse => verse.text.toLowerCase().includes(searchLower));

			// Apply offset and limit
			const results = matchingVerses
				.slice(offset, offset + limit)
				.map(verse => ({
					abbreviation: bookMap[verse.book_id]?.abbreviation || '',
					chapter: verse.chapter,
					verse: verse.verse,
					text: verse.text
				}));

			// Return in SQL-like ResultSet format
			return {
				rows: {
					length: results.length,
					item: (i) => results[i]
				}
			};
		} catch (error) {
			console.error('Error searching:', error);
			throw error;
		}
	}

	async searchCount(searchTerm, tableVerses) {
		if (!this.db) {
			throw new Error('Database not initialized');
		}

		if (!this.db.objectStoreNames.contains(tableVerses)) {
			throw new Error(`Store ${tableVerses} does not exist`);
		}

		try {
			const tx = this.db.transaction(tableVerses, 'readonly');
			const store = tx.objectStore(tableVerses);
			const allVerses = await this._promisifyRequest(store.getAll());

			// Case-insensitive search and count
			const searchLower = searchTerm.toLowerCase();
			const count = allVerses.filter(verse => 
				verse.text.toLowerCase().includes(searchLower)
			).length;

			return count;
		} catch (error) {
			console.error('Error counting search results:', error);
			throw error;
		}
	}
}