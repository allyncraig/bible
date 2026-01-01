// NavigationManager - Handles book and chapter navigation

class NavigationManager {
	constructor(versionManager, storageManager, onNavigate) {
		this.versionManager = versionManager;
		this.storageManager = storageManager;
		this.onNavigate = onNavigate || function() {};

		this.currentBook = 1;
		this.currentChapter = 1;
		this.currentVersion = APP.DEFAULT_VERSION;
	}

	loadSettings() {
		const settings = this.storageManager.loadAppSettings();
		this.currentBook = settings.currentBook;
		this.currentChapter = settings.currentChapter;
		this.currentVersion = settings.currentVersion;

		// console.log('NavigationManager: Settings loaded', settings);
		return settings;
	}

	saveSettings() {
		const books = this.versionManager.getBooks();
		const currentBook = books.find(b => b.id === this.currentBook);
		const bookName = currentBook ? currentBook.name : null;

		this.storageManager.saveAppSettings(
			this.currentBook,
			this.currentChapter,
			this.currentVersion,
			bookName
		);
	}

	validateAndNavigate(bookId, chapter, showNotification = false) {
		const books = this.versionManager.getBooks();

		if (books.length === 0) {
			// console.log('Books not loaded yet');
			return false;
		}

		const bookIndex = books.findIndex(b => b.id === bookId);

		// Book doesn't exist
		if (bookIndex === -1) {
			console.warn('Book ID', bookId, 'not found. Navigating to first book.');
			if (showNotification) {
				this.showNotification('Book not found. Navigating to ' + books[0].name + '.');
			}
			this.currentBook = books[0].id;
			this.currentChapter = 1;
			return false;
		}

		const book = books[bookIndex];

		// Chapter doesn't exist
		if (chapter > book.chapters) {
			console.warn('Chapter', chapter, 'not found in', book.name);
			if (showNotification) {
				this.showNotification(book.name + ' only has ' + book.chapters + ' chapters. Navigating to chapter 1.');
			}
			this.currentBook = bookId;
			this.currentChapter = 1;
			return false;
		}

		// Valid navigation
		this.currentBook = bookId;
		this.currentChapter = chapter;
		return true;
	}

	navigatePrevious() {
		const books = this.versionManager.getBooks();

		if (books.length === 0) {
			// console.log('Books not loaded yet');
			return false;
		}

		if (!this.validateAndNavigate(this.currentBook, this.currentChapter, false)) {
			this.saveSettings();
			this.onNavigate();
			return false;
		}

		const currentBookIndex = books.findIndex(b => b.id === this.currentBook);
		if (currentBookIndex === -1) {
			console.error('Current book not found');
			return false;
		}

		if (this.currentChapter > 1) {
			this.currentChapter--;
		} else {
			if (currentBookIndex > 0) {
				this.currentBook = books[currentBookIndex - 1].id;
				this.currentChapter = books[currentBookIndex - 1].chapters;
			} else {
				const lastBook = books[books.length - 1];
				this.currentBook = lastBook.id;
				this.currentChapter = lastBook.chapters;
			}
		}

		// console.log(`Navigate to book ${this.currentBook} chapter ${this.currentChapter}`);
		this.saveSettings();
		this.onNavigate();
		return true;
	}

	navigateNext() {
		const books = this.versionManager.getBooks();

		if (books.length === 0) {
			// console.log('Books not loaded yet');
			return false;
		}

		if (!this.validateAndNavigate(this.currentBook, this.currentChapter, false)) {
			this.saveSettings();
			this.onNavigate();
			return false;
		}

		const currentBookIndex = books.findIndex(b => b.id === this.currentBook);
		if (currentBookIndex === -1) {
			console.error('Current book not found');
			return false;
		}

		if (this.currentChapter < books[currentBookIndex].chapters) {
			this.currentChapter++;
		} else {
			if (currentBookIndex < books.length - 1) {
				this.currentBook = books[currentBookIndex + 1].id;
				this.currentChapter = 1;
			} else {
				this.currentBook = books[0].id;
				this.currentChapter = 1;
			}
		}

		// console.log(`Navigate to book ${this.currentBook}  chapter ${this.currentChapter}`);
		this.saveSettings();
		this.onNavigate();
		return true;
	}

	navigateToChapter(bookId, chapter) {
		this.currentBook = bookId;
		this.currentChapter = chapter;

		// console.log(`Selected book ${bookId},  chapter ${chapter}`);
		this.saveSettings();
		this.onNavigate();
		return true;
	}

	navigateToSearchResult(bookAbbr, chapter, verse) {
		const books = this.versionManager.getBooks();

		const book = books.find(b => {
			return b.abbreviation === bookAbbr || b.apiId === bookAbbr;
		});

		if (!book) {
			console.error('Book not found:', bookAbbr);
			this.showNotification('Book not found');
			return false;
		}

		this.currentBook = book.id;
		this.currentChapter = chapter;

		this.saveSettings();
		this.onNavigate();

		// Return verse number so caller can scroll to it
		return verse;
	}

	showNotification(message) {
		openToast(message);
	}

	getCurrentBook() {
		return this.currentBook;
	}

	getCurrentChapter() {
		return this.currentChapter;
	}

	getCurrentVersion() {
		return this.currentVersion;
	}

	setCurrentVersion(version) {
		this.currentVersion = version;
	}

	setPosition(bookId, chapter) {
		this.currentBook = bookId;
		this.currentChapter = chapter;
	}
}