// js/providers/BollsLifeProvider.js
class BollsLifeProvider extends BaseProvider {
	constructor() {
		super({
			name: 'bolls.life',
			headers: []
		});
	}

	async fetchBookList(versionParams) {
		const url = this.buildUrl(
			'https://bolls.life/get-books/{{VERSIONID}}/',
			versionParams
		);

		const data = await this.fetchJSON(url);
		const bookArray = Array.isArray(data) ? data : data.books;
		if (!bookArray) {
			throw new Error('Invalid book list response from API');
		}

		// Transform to standard format - use bookid as the consistent ID
		return bookArray.map((book, index) => {
			return {
				id: book.bookid,           // ✓ Use actual book ID
				apiId: book.bookid,        // Keep for API calls
				name: book.name,
				abbreviation: book.name.substring(0, 3).toUpperCase(),
				chapters: book.chapters,
				source: 'api'
			};
		});
	}

	async fetchChapter(versionParams, bookApiId, chapterNum) {
		const url = this.buildUrl(
			'https://bolls.life/get-text/{{VERSIONID}}/' + bookApiId + '/' + chapterNum + '/',
			versionParams
		);

		const verses = await this.fetchJSON(url);

		// Transform to HTML
		let html = '';
		verses.forEach(verseObj => {
			let text = verseObj.text;

			// Remove Strong's numbers
			text = text.replace(/<[Ss]>\d+<\/[Ss]>/g, '');

			html += `<p class="verse"><span class="verse-number">${verseObj.verse}</span>&nbsp;${text}</p>`;
		});

		// Return consistent format (no raw verses for this provider)
		return {
			html: html,
			rawVerses: {}
		};
	}

async search(versionParams, searchTerm, page = 1) {
	const baseUrl = 'https://bolls.life/v2/find/{{VERSIONID}}';
	const url = this.buildUrl(baseUrl, versionParams) + 
		'?search=' + encodeURIComponent(searchTerm) +
		`&match_case=false&match_whole=false&limit=${APP.SEARCH_RESULTS_PER_PAGE}&page=${page}`;

	const data = await this.fetchJSON(url);

	if (!data.results || data.results.length === 0) {
		return { results: [], total: 0 };
	}

	return {
		results: data.results,
		total: data.total
	};
}
}

window.BollsLifeProvider = BollsLifeProvider;