// SearchManager - Handles Bible search functionality

class SearchManager {
	constructor(versionManager, databaseManager, apiClient, resultsElementId) {
		this.versionManager = versionManager;
		this.databaseManager = databaseManager;
		this.apiClient = apiClient;
		this.resultsElement = document.getElementById(resultsElementId);
	}

	async executeSearch(searchTerm, version) {
		// Validate search term
		if (searchTerm.length === 0) {
			return { error: 'Please enter a search term' };
		}

		if (searchTerm.length < 2) {
			return { error: 'Search term must be at least 2 characters' };
		}

		// Show loading
		this.showLoading();

		try {
			let results;

			if (version.source === 'db') {
				results = await this.searchDatabase(searchTerm, version);
			} else if (version.source === 'api') {
				results = await this.searchAPI(searchTerm, version);
			}

			return {
				success: true,
				results: results,
				searchTerm: searchTerm
			};
		} catch (error) {
			console.error('SearchManager: Search error', error);
			return { error: 'Search failed, please try again' };
		}
	}

	async searchDatabase(searchTerm, version) {
		try {
			const rs = await this.databaseManager.search(
				searchTerm,
				version.tableVerses,
				version.tableBooks,
				100
			);

			if (rs.length === 0) {
				return [];
			}

			// Get books to find book IDs
			const books = this.versionManager.getBooks();

			// Map the SQL results to match the expected format
			const results = [];
			const resultsList = rs.rows || rs;
			const resultsCount = rs.rows ? rs.rows.length : rs.length;
			if (resultsCount === 0) {
				return [];
			}
			for (let i = 0; i < resultsCount; i++) {
				const row = resultsList.item ? resultsList.item(i) : resultsList[i];

				// Find the book by abbreviation to get its ID
				const book = books.find(b => b.abbreviation === row.abbreviation);

				// Use standard 3-letter abbreviation from BOOK_ABBREVIATIONS
				const standardAbbr = book ? (BOOK_ABBREVIATIONS[book.id] || row.abbreviation) : row.abbreviation;

				results.push({
					bookAbbr: standardAbbr,
					chapter: row.chapter,
					verse: row.verse,
					text: row.text,
					reference: standardAbbr + ' ' + row.chapter + ':' + row.verse
				});
			}

			return results;
		} catch (error) {
			console.error('Database search error:', error);
			throw error;
		}
	}

	async searchAPI(searchTerm, version) {
		try {
			const results = await this.apiClient.fetchSearch(version, searchTerm);

			// For bolls.life provider, map book IDs to abbreviations
			if (version.provider === 'bolls.life') {
				const books = this.versionManager.getBooks();
				return results.map(result => {
					const bookInfo = books.find(b => b.id === result.bookId);
					if (!bookInfo) {
						console.warn('Book ID not found:', result.bookId);
						return null;
					}

					// Use standard 3-letter abbreviation from BOOK_ABBREVIATIONS
					const standardAbbr = BOOK_ABBREVIATIONS[bookInfo.id] || bookInfo.abbreviation;

					return {
						bookAbbr: standardAbbr,
						chapter: result.chapter,
						verse: result.verse,
						reference: `${standardAbbr} ${result.chapter}:${result.verse}`,
						text: result.text
					};
				}).filter(r => r !== null);
			}

			return results; // API.Bible already returns standard format
		} catch (error) {
			console.error('API search error:', error);
			throw error;
		}
	}

	renderResults(results, searchTerm, sourceType) {
		if (!results || results.length === 0) {
			this.showError('No verses match your search');
			return;
		}

		// Hide message area
		document.getElementById(UI.SEARCHMESSAGE).classList.add(CLASS.HIDDEN);
		// Show results area
		document.getElementById(UI.SEARCHLIST).classList.remove(CLASS.HIDDEN);

		// Prepare data for template
		const templateData = results.map(item => ({
			bookAbbr: item.bookAbbr,
			chapter: item.chapter,
			verse: item.verse,
			reference: item.reference || `${item.bookAbbr} ${item.chapter}:${item.verse}`,
			text: this.highlightSearchTerm(item.text, searchTerm)
		}));

		// console.log(document.getElementById(UI.SEARCHLIST));
		// Render template
		Template.render(UI.SEARCHTEMPLATE, UI.SEARCHLIST, templateData);
	}

	highlightSearchTerm(text, searchTerm) {
		let cleanedText = text.replace(/<(\w+)>.*?<\/\1>/g, '');
		const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(escapedTerm, 'gi');

		return cleanedText.replace(regex, match => {
			return '<mark class="search-highlight">' + match + '</mark>';
		});
	}

	showLoading() {
		this.resultsElement.innerHTML = '<div class="search-loading">Searching...</div>';
	}

	showPlaceholder() {
		const messageDiv = document.getElementById(UI.SEARCHMESSAGE);
		const info = document.getElementById(UI.SEARCHMESSAGETEXT);
		const resultDiv = document.getElementById(UI.SEARCHLIST);

		if (messageDiv) {
			messageDiv.classList.remove(CLASS.HIDDEN);
		}
		if (resultDiv) {
			resultDiv.classList.add(CLASS.HIDDEN);
		}

		if (info) {
			info.textContent = 'Enter a search term to find verses';
			info.className = 'placeholder';
		}

		Template.clear(UI.SEARCHLIST);
	}

	showError(errorMessage) {
		const messageDiv = document.getElementById(UI.SEARCHMESSAGE);
		const info = document.getElementById(UI.SEARCHMESSAGETEXT);
		const resultDiv = document.getElementById(UI.SEARCHLIST);

		if (messageDiv) {
			messageDiv.classList.remove(CLASS.HIDDEN);
		}
		if (resultDiv) {
			resultDiv.classList.add(CLASS.HIDDEN);
		}

		if (info) {
			info.textContent = errorMessage;
			info.className = 'search-error';
		}

		Template.clear(UI.SEARCHLIST);
	}

	handleResultClick(element) {
		const bookAbbr = element.getAttribute('data-book');
		const chapter = parseInt(element.getAttribute('data-chapter'));
		const verse = parseInt(element.getAttribute('data-verse'));

		// This will be called from the onclick handler
		// The app instance will handle the actual navigation
		if (window.app && window.app.handleSearchResultClick) {
			window.app.handleSearchResultClick(bookAbbr, chapter, verse);
		}
	}
}