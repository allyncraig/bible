// SearchManager - Handles Bible search functionality

class SearchManager {
	constructor(versionManager, databaseManager, apiClient, resultsElementId) {
		this.versionManager = versionManager;
		this.databaseManager = databaseManager;
		this.apiClient = apiClient;
		this.resultsElement = document.getElementById(resultsElementId);
		// Pagination state
		this.currentPage = 1;
		this.totalResults = 0;
		this.totalPages = 0;
		this.lastSearchTerm = '';
		this.lastVersion = null;
		this.cachedResults = {}; // Cache results by page number
	}

	async executeSearch(searchTerm, version, page = 1) {
		// Validate search term
		if (searchTerm.length === 0) {
			return { error: 'Please enter a search term' };
		}

		if (searchTerm.length < 3) {
			return { error: 'Search term must be at least 3 characters' };
		}

		// Check if this is a new search or pagination
		const isNewSearch = searchTerm !== this.lastSearchTerm || 
							version.abbreviation !== this.lastVersion?.abbreviation;

		if (isNewSearch) {
			// Reset pagination state for new search
			this.currentPage = 1;
			this.cachedResults = {};
			this.lastSearchTerm = searchTerm;
			this.lastVersion = version;
			page = 1; // Force to page 1 for new searches
		} else {
			this.currentPage = page;
		}

		// Check cache first
		if (this.cachedResults[page]) {
			return {
				success: true,
				results: this.cachedResults[page],
				searchTerm: searchTerm,
				page: page,
				totalResults: this.totalResults,
				totalPages: this.totalPages
			};
		}

		// Show loading (different style for pagination vs new search)
		this.showLoading(!isNewSearch);

		try {
			let searchResult;

			if (version.source === 'db') {
				searchResult = await this.searchDatabase(searchTerm, version, page);
			} else if (version.source === 'api') {
				searchResult = await this.searchAPI(searchTerm, version, page);
			}

			// Hide loading overlay if pagination
			if (!isNewSearch) {
				this.hideLoading();
			}

			// Cache results
			this.cachedResults[page] = searchResult.results;
			this.totalResults = searchResult.total;
			this.totalPages = Math.ceil(searchResult.total / APP.SEARCH_RESULTS_PER_PAGE);

			return {
				success: true,
				results: searchResult.results,
				searchTerm: searchTerm,
				page: page,
				totalResults: this.totalResults,
				totalPages: this.totalPages
			};
		} catch (error) {
			console.error('SearchManager: Search error', error);
			this.hideLoading();
			return { error: 'Search failed, please try again' };
		}
	}

	async searchDatabase(searchTerm, version, page) {
		try {
			const offset = (page - 1) * APP.SEARCH_RESULTS_PER_PAGE;

			const rs = await this.databaseManager.search(
				searchTerm,
				version.tableVerses,
				version.tableBooks,
				APP.SEARCH_RESULTS_PER_PAGE,
				offset
			);

			// Get total count for pagination
			const totalCount = await this.databaseManager.searchCount(
				searchTerm,
				version.tableVerses
			);

			if (rs.length === 0) {
				return { results: [], total: 0 };
			}

			// Get books to find book IDs
			const books = this.versionManager.getBooks();

			// Map the SQL results to match the expected format
			const results = [];
			const resultsList = rs.rows || rs;
			const resultsCount = rs.rows ? rs.rows.length : rs.length;

			for (let i = 0; i < resultsCount; i++) {
				const row = resultsList.item ? resultsList.item(i) : resultsList[i];

				// Find the book by abbreviation to get its ID
				const bookId = getBookIndexByAbbr(row.abbreviation);

				// Use standard 3-letter abbreviation from BOOK_DATA
				const standardAbbr = bookId ? getBookAbbr(bookId) : row.abbreviation;

				results.push({
					bookAbbr: standardAbbr,
					chapter: row.chapter,
					verse: row.verse,
					text: row.text,
					reference: standardAbbr + ' ' + row.chapter + ':' + row.verse
				});
			}

			return { results, total: totalCount };
		} catch (error) {
			console.error('Database search error:', error);
			throw error;
		}
	}

	async searchAPI(searchTerm, version, page) {
		try {
			const results = await this.apiClient.fetchSearch(version, searchTerm, page);

			// For bolls.life provider, map book IDs to abbreviations
			if (version.provider === 'bolls.life') {
				const books = this.versionManager.getBooks();
				const mappedResults = results.results.map(result => {
					const bookInfo = books.find(b => b.id === result.book);
					if (!bookInfo) {
						console.warn('Book ID not found:', result.book);
						return null;
					}

					// Use standard 3-letter abbreviation from BOOK_DATA
					const standardAbbr = getBookAbbr(bookInfo.id);

					return {
						bookAbbr: standardAbbr,
						chapter: result.chapter,
						verse: result.verse,
						reference: `${standardAbbr} ${result.chapter}:${result.verse}`,
						text: result.text
					};
				}).filter(r => r !== null);

				return { 
					results: mappedResults, 
					total: results.total 
				};
			}

			// For AbtApi and other providers that return standard format
			return { 
				results: results.results || results, 
				total: results.total 
			};
		} catch (error) {
			console.error('API search error:', error);
			throw error;
		}
	}

	renderResults(results, searchTerm, sourceType, pageInfo) {
		if (!results || results.length === 0) {
			this.resetPagination(); // hide pagination area
			this.showError('No verses match your search');
			return;
		}

		// Hide message area
		document.getElementById(UI.SEARCHMESSAGE).classList.add(CLASS.HIDDEN);
		// Show results area
		document.getElementById(UI.SEARCHLIST).classList.remove(CLASS.HIDDEN);

		// Update pagination controls FIRST (before clearing results)
		this.renderPagination(pageInfo);

		// Prepare data for template
		const templateData = results.map(item => ({
			bookAbbr: item.bookAbbr,
			chapter: item.chapter,
			verse: item.verse,
			reference: item.reference || `${item.bookAbbr} ${item.chapter}:${item.verse}`,
			text: this.highlightSearchTerm(item.text, searchTerm)
		}));

		// Render template (this still clears, but pagination is already updated)
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

	showLoading(isPagination = false) {
		if (isPagination) {
			// For pagination, just show a subtle loading indicator
			// Don't clear the existing results
			let loadingIndicator = document.getElementById('searchLoadingIndicator');
			if (!loadingIndicator) {
				loadingIndicator = document.createElement('div');
				loadingIndicator.id = 'searchLoadingIndicator';
				loadingIndicator.className = 'search-loading-overlay';
				loadingIndicator.innerHTML = '<span class="loading-spinner"></span>';
				this.resultsElement.style.position = 'relative';
				this.resultsElement.appendChild(loadingIndicator);
			}
			loadingIndicator.style.display = 'flex';
		} else {
			// For new searches, show full loading state
			this.resultsElement.innerHTML = '<div class="search-loading">Searching...</div>';
		}
	}

	hideLoading() {
		const loadingIndicator = document.getElementById('searchLoadingIndicator');
		if (loadingIndicator) {
			loadingIndicator.style.display = 'none';
		}
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
		this.resetPagination();
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

	renderPagination(pageInfo) {
		const { page, totalPages, totalResults, results } = pageInfo;

		// Get or create pagination container
		let paginationContainer = document.getElementById('searchPaginationContainer');
		if (!paginationContainer) {
			paginationContainer = document.createElement('div');
			paginationContainer.id = 'searchPaginationContainer';
			paginationContainer.className = 'search-pagination-container';

			// Insert after search box, before results
			const searchMessage = document.getElementById(UI.SEARCHMESSAGE);
			searchMessage.parentNode.insertBefore(paginationContainer, searchMessage.nextSibling);
		}

		// If only one page or no results, hide pagination
		if (totalPages <= 1) {
			paginationContainer.innerHTML = `
				<div class="search-showing">Page <strong>1</strong> of <strong>1</strong> : all results</div>
			`;
			return;
		}

		// Calculate page range to display
		const maxButtons = APP.SEARCH_MAX_PAGE_BUTTONS;
		let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
		let endPage = Math.min(totalPages, startPage + maxButtons - 1);

		// Adjust if we're near the end
		if (endPage - startPage + 1 < maxButtons) {
			startPage = Math.max(1, endPage - maxButtons + 1);
		}

		// Build page buttons HTML
		let pageButtonsHTML = '';
		for (let i = startPage; i <= endPage; i++) {
			const isCurrentPage = i === page;
			pageButtonsHTML += `
				<button class="page-nav-btn page-number-btn ${isCurrentPage ? 'current' : ''}" 
						onclick="navigateSearchPage(${i})"
						${isCurrentPage ? 'disabled' : ''}>${i}</button>
			`;
		}

		// Get first and last result references
		const firstRef = results[0]?.reference || '';
		const lastRef = results[results.length - 1]?.reference || '';

		// Build full pagination HTML
		paginationContainer.innerHTML = `
			<div class="search-pagination">
				<button class="page-nav-btn icon ion-ios-skipbackward" onclick="navigateSearchPage(1)" ${page === 1 ? 'disabled' : ''}></button>
				<button class="page-nav-btn icon ion-arrow-left-b" onclick="navigateSearchPage(${page - 1})" ${page === 1 ? 'disabled' : ''}></button>
				${pageButtonsHTML}
				<button class="page-nav-btn icon ion-arrow-right-b" onclick="navigateSearchPage(${page + 1})" ${page === totalPages ? 'disabled' : ''}></button>
				<button class="page-nav-btn icon ion-ios-skipforward" onclick="navigateSearchPage(${totalPages})" ${page === totalPages ? 'disabled' : ''}></button>
			</div>
			<div class="search-showing">
				Page <strong>${page}</strong> of <strong>${totalPages}</strong> : <strong>${firstRef}</strong> to <strong>${lastRef}</strong>
			</div>
		`;
	}

	resetPagination() {
		this.currentPage = 1;
		this.totalResults = 0;
		this.totalPages = 0;
		this.lastSearchTerm = '';
		this.lastVersion = null;
		this.cachedResults = {};

		const paginationContainer = document.getElementById('searchPaginationContainer');
		if (paginationContainer) {
			paginationContainer.innerHTML = '';
		}
	}

}