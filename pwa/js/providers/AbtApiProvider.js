class AbtApiProvider extends BaseProvider {
	constructor() {
		super({
			name: 'AbtApi',
			headers: []
		});
		this.baseUrl = 'https://bible-api.bible-api.workers.dev';
	}

	async fetchBookList(versionParams) {
		const url = `${this.baseUrl}/v1/books/${versionParams.VERSIONID}`;

		const data = await this.fetchJSON(url);

		if (!Array.isArray(data)) {
			throw new Error('Invalid book list response from API');
		}

		// Transform to standard format - use bookid as the consistent ID
		return data.map(book => {
			return {
				id: book.bookid,           // Use actual book ID
				apiId: book.bookid,        // Keep for API calls
				name: book.name,
				abbreviation: book.abbreviation,
				chapters: book.chapters,
				source: 'api'
			};
		});
	}

	async fetchChapter(versionParams, bookApiId, chapterNum) {
		const url = `${this.baseUrl}/v1/text/${versionParams.VERSIONID}/${bookApiId}/${chapterNum}`;

		const verses = await this.fetchJSON(url);

		if (!Array.isArray(verses)) {
			throw new Error('Invalid chapter response from API');
		}

		// Store raw verses
		const rawVerses = {};
		
		// Transform to HTML
		let html = '';
		verses.forEach(verseObj => {
			const text = this.standardizeText(verseObj.text);
			html += `<p class="verse"><span class="verse-number">${verseObj.verse}</span>&nbsp;${text}</p>`;
			
			// Store raw text (with markup) - only ABT has this markup
			rawVerses[verseObj.verse] = verseObj.text.trim();
		});

		// Return both HTML and raw verses
		return {
			html: html,
			rawVerses: rawVerses
		};
	}

	async search(versionParams, searchTerm, page = 1) {
		const url = `${this.baseUrl}/v1/find/${versionParams.VERSIONID}` +
			'?search=' + encodeURIComponent(searchTerm) +
			`&match_case=false&match_whole=false&limit=${APP.SEARCH_RESULTS_PER_PAGE}&page=${page}`;

		const data = await this.fetchJSON(url);

		if (!data.results || data.results.length === 0) {
			return { results: [], total: 0 };
		}

		const results = data.results.map(result => {
			// Use BOOK_DATA helper function
			const bookAbbr = window.getBookAbbr(result.book);

			return {
				bookAbbr: bookAbbr,
				chapter: result.chapter.toString(),
				verse: result.verse.toString(),
				reference: `${bookAbbr} ${result.chapter}:${result.verse}`,
				text: this.standardizeText(result.text.replace(/<\/?mark>/g, ''))
			};
		});

		return {
			results: results,
			total: data.total,
			pages: data.pages,
			page: data.page
		};
	}

	standardizeText(text) {
		return (text ?? '')
			.replace(/>|\[p\]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}
	rawText(text) {
		return (text ?? '').trim();
	}
}

// Explicitly assign to window for global access
window.AbtApiProvider = AbtApiProvider;