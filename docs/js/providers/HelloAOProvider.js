// js/providers/HelloAOProvider.js
class HelloAOProvider extends BaseProvider {
	constructor() {
		super({
			name: 'helloao.org',
			headers: []
		});
	}

	async fetchBookList(versionParams) {
		const url = this.buildUrl(
			'https://bible.helloao.org/api/{{VERSIONID}}/books.json',
			versionParams
		);

		const data = await this.fetchJSON(url);

		// Transform to standard format - use order as the consistent ID
		return data.books.map((book) => ({
			id: book.order,              // ✓ Use order field (matches database ID)
			apiId: book.id,              // Keep "MAT", "MRK" etc. for API calls
			name: book.name,
			abbreviation: book.id,
			chapters: book.numberOfChapters,
			source: 'api'
		}));
	}

	async fetchChapter(versionParams, bookApiId, chapterNum) {
		const url = this.buildUrl(
			'https://bible.helloao.org/api/{{VERSIONID}}/' + bookApiId + '/' + chapterNum + '.json',
			versionParams
		);

		const data = await this.fetchJSON(url);
		const verses = data.chapter.content;

		// Transform verses to HTML
		let html = '';
		verses.forEach(verseObj => {
			if (verseObj.type === 'verse') {
				// Filter out note objects and join only strings
				const text = verseObj.content
					.filter(item => typeof item === 'string')
					.join(' ');

				html += `<p class="verse"><span class="verse-number">${verseObj.number}</span>&nbsp;${text}</p>`;
			}
		});

		return html;
	}

	async search(versionParams, searchTerm) {
		// HelloAO API does not support search
		return [];
	}
}