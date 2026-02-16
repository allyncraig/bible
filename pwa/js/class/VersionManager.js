// VersionManager - Manages Bible versions, book loading, and version switching

class VersionManager {
	constructor(versionConfig, databaseManager, apiClient, storageManager) {
		this.versionConfig = versionConfig;
		this.databaseManager = databaseManager;
		this.apiClient = apiClient;
		this.storageManager = storageManager;
		this.currentBooks = [];
	}

	getVersion(abbreviation) {
		return this.versionConfig.find(v => v.abbreviation === abbreviation);
	}

	async loadBooksForVersion(version) {
		// Resolve which source to use
		const resolvedVersion = await this.resolveVersionSource(version);

		if (resolvedVersion.source === 'db') {
			return await this.loadBooksFromDatabase(resolvedVersion);
		} else if (resolvedVersion.source === 'api') {
			return await this.loadBooksFromAPI(resolvedVersion);
		}
		return [];
	}

	async loadBooksFromDatabase(version) {
		try {
			const books = await this.databaseManager.loadBooks(version.abbreviation);
			this.currentBooks = this.filterCanonicalBooks(books);
			return this.currentBooks;
		} catch (error) {
			console.error('VersionManager: Error loading books from database', error);
			return [];
		}
	}

	async hasVersionData(versionCode) {
		if (!this.databaseManager.isAvailable()) {
			return false;
		}
		try {
			return await this.databaseManager.verifyDatabaseHasData(versionCode);
		} catch (error) {
			// If table doesn't exist, treat as no data available
			console.log(`DB check for ${versionCode}: ${error.message}`);
			return false;
		}
	}

	async getAvailableDBVersions() {
		if (!this.databaseManager.isAvailable()) {
			return [];
		}
		return await this.databaseManager.getAvailableVersions();
	}

	async loadBooksFromAPI(version) {
		// Check cache first
		const cacheKey = this.getBookCacheKey(version);
		const cached = this.storageManager.getBookCache(cacheKey);

		if (cached) {
			this.currentBooks = this.filterCanonicalBooks(cached);
			return this.currentBooks;
		}

		// Fetch from API via provider
		try {
			const books = await this.apiClient.fetchBookList(version);

			if (!books || !Array.isArray(books)) {
				throw new Error('Could not load books from API');
			}

			// Filter before caching
			const canonicalBooks = this.filterCanonicalBooks(books);

			// Cache the filtered books
			this.storageManager.setBookCache(cacheKey, canonicalBooks);

			this.currentBooks = canonicalBooks;
			return canonicalBooks;
		} catch (error) {
			console.error('VersionManager: Error loading books from API: ' + error.message);
			throw error;
		}
	}

	getBookCacheKey(version) {
		const versionId = version.parameters?.VERSIONID || version.abbreviation;
		return 'api_books_' + version.provider + '_' + versionId;
	}

	clearBookCache(version) {
		const cacheKey = this.getBookCacheKey(version);
		this.storageManager.clearBookCache(cacheKey);
	}

	findBookByName(bookName, books = null) {
		const searchBooks = books || this.currentBooks;

		if (!bookName || !searchBooks || searchBooks.length === 0) {
			return null;
		}

		const normalize = (name) => {
			return name
				.toLowerCase()
				.replace(/\s+/g, ' ')
				.trim()
				.replace(/\bfirst\b/g, '1')
				.replace(/\bsecond\b/g, '2')
				.replace(/\bthird\b/g, '3')
				.replace(/\bthe\b/g, '')
				.replace(/\bof\b/g, '')
				.replace(/s$/, '')
				.trim();
		};

		const normalizedSearch = normalize(bookName);

		// Try exact match on name first
		for (let i = 0; i < searchBooks.length; i++) {
			if (normalize(searchBooks[i].name) === normalizedSearch) {
				return searchBooks[i];
			}
		}

		// Try exact match on abbreviation (case-insensitive)
		const searchUpper = bookName.toUpperCase();
		for (let i = 0; i < searchBooks.length; i++) {
			if (searchBooks[i].abbreviation && 
					searchBooks[i].abbreviation.toUpperCase() === searchUpper) {
				return searchBooks[i];
			}
		}

		// Try abbreviation lookup (e.g., "PRO" -> id 20 -> Proverbs)
		const bookId = getBookIndexByName(searchUpper);
		if (bookId) {
			const book = searchBooks.find(b => b.id === parseInt(bookId));
			if (book) return book;
		}

		// Try partial match on name
		for (let i = 0; i < searchBooks.length; i++) {
			const normalizedBookName = normalize(searchBooks[i].name);
			if (normalizedBookName.indexOf(normalizedSearch) !== -1 || 
					normalizedSearch.indexOf(normalizedBookName) !== -1) {
				return searchBooks[i];
			}
		}

		// Try partial match on abbreviation
		for (let i = 0; i < searchBooks.length; i++) {
			if (searchBooks[i].abbreviation && 
					searchBooks[i].abbreviation.toUpperCase().indexOf(searchUpper) !== -1) {
				return searchBooks[i];
			}
		}

		return null;
	}

	findBookById(bookId, books = null) {
		const searchBooks = books || this.currentBooks;
		return searchBooks.find(b => b.id === bookId);
	}

	filterCanonicalBooks(books) {
		// Filter to only include canonical Protestant books (ID 1-66)
		return books.filter(book => book.id <= 66);
	}

	async hasDBData() {
		if (!this.databaseManager.isAvailable()) {
			return false;
		}
		return await this.databaseManager.verifyDatabaseHasData();
	}

	async switchVersionSafely(newVersion, currentBookId, currentChapter, currentBookName) {
		// console.log('Switching from', currentBookName, currentChapter, 'to version', newVersion.abbreviation);
		try {
			// Resolve the version source first
			const resolvedVersion = await this.resolveVersionSource(newVersion);

			// Load books for resolved version
			const books = await this.loadBooksForVersion(newVersion); // This will auto-resolve internally

			if (!books || books.length === 0) {
				throw new Error('Failed to load book list');
			}

			let targetBookId = null;
			let targetChapter = currentChapter;
			let notificationMessage = null;

			// Priority 1: Match by book name
			if (currentBookName) {
				const matchedBook = this.findBookByName(currentBookName, books);

				if (matchedBook) {
					targetBookId = matchedBook.id;

					if (currentChapter > matchedBook.chapters) {
						targetChapter = 1;
						notificationMessage = currentBookName + ' chapter ' + currentChapter + ' not found. ' +
							'Navigating to ' + matchedBook.name + ' chapter 1 (max: ' + matchedBook.chapters + ' chapters).';
					}
				}
			}

			// Priority 2: Try same book ID
			if (targetBookId === null && currentBookId) {
				const bookById = books.find(b => b.id === currentBookId);
				if (bookById) {
					targetBookId = bookById.id;

					if (currentChapter > bookById.chapters) {
						targetChapter = 1;
						notificationMessage = 'Chapter ' + currentChapter + ' not found. ' +
							'Navigating to ' + bookById.name + ' chapter 1.';
					}
				} else {
					notificationMessage = (currentBookName || 'Book') + ' not found in ' + newVersion.name + '. ' +
						'Navigating to ' + books[0].name + '.';
				}
			}

			// Priority 3: Default to first book
			if (targetBookId === null) {
				targetBookId = books[0].id;
				targetChapter = 1;
				if (!notificationMessage) {
					notificationMessage = 'Navigating to ' + books[0].name + ' chapter 1.';
				}
			}

			return {
				success: true,
				bookId: targetBookId,
				chapter: targetChapter,
				notification: notificationMessage
			};
		} catch (error) {
			console.error('VersionManager: Error switching version: ' + error.message);
			return {
				success: false,
				error: error.message
			};
		}
	}

	getBooks() {
		return this.currentBooks;
	}

	setBooks(books) {
		this.currentBooks = books;
	}

	async resolveVersionSource(version) {
		// Check if version has sources object (new format)
		if (version.sources) {
			// Priority 1: Use DB if available
			if (version.sources.db) {
				const hasData = await this.hasVersionData(version.abbreviation);
				if (hasData) {
					return {
						source: 'db',
						...version.sources.db,
						abbreviation: version.abbreviation,
						name: version.name,
						languageCode: version.languageCode,
						languageName: version.languageName
					};
				}
			}

			// Priority 2: Fall back to API if available
			if (version.sources.api) {
				return {
					source: 'api',
					provider: version.sources.api.provider,
					parameters: version.sources.api.parameters,
					abbreviation: version.abbreviation,
					name: version.name,
					languageCode: version.languageCode,
					languageName: version.languageName
				};
			}

			// No available source
			throw new Error(`No available source for ${version.abbreviation}`);
		}

		// Legacy format - return as-is
		return version;
	}

	getStandardBookName(bookId) {
		return getBookName(bookId);
	}

	getStandardBookAbbr(bookId) {
		return getBookAbbr(bookId);
	}
}