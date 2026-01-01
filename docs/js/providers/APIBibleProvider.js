// js/providers/APIBibleProvider.js
class APIBibleProvider extends BaseProvider {
	constructor() {
		super({
			name: 'API.Bible',
			headers: [
				{ key: 'api-key', value: '6137240b9a8edac580561a665162013b' },
				{ key: 'accept', value: 'application/json' }
			]
		});
	}

	async fetchBookList(versionParams) {
		const url = this.buildUrl(
			'https://api.scripture.api.bible/v1/bibles/{{VERSIONID}}/books?include-chapters=true',
			versionParams
		);

		const data = await this.fetchJSON(url, this.getHeaders());

		// Extract and transform to standard format
		const books = data.data.map((book, index) => {
			const chapterCount = book.chapters 
				? book.chapters.filter(ch => ch.number !== 'intro').length 
				: 0;

			return {
				id: index + 1,
				apiId: book.id,
				name: book.name,
				abbreviation: book.abbreviation,
				chapters: chapterCount,
				source: 'api'
			};
		});

		return books;
	}

	async fetchChapter(versionParams, bookApiId, chapterNum) {
		const url = this.buildUrl(
			'https://api.scripture.api.bible/v1/bibles/{{VERSIONID}}/chapters/' + 
			bookApiId + '.' + chapterNum + 
			'?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false',
			versionParams
		);

		const data = await this.fetchJSON(url, this.getHeaders());
		const content = data.data.content;

		// Apply transformations
		return this.transformContent(content);
	}

	async search(versionParams, searchTerm) {
		const url = this.buildUrl(
			'https://api.scripture.api.bible/v1/bibles/{{VERSIONID}}/search?query=' + 
			encodeURIComponent(searchTerm),
			versionParams
		);

		const data = await this.fetchJSON(url, this.getHeaders());

		// Transform to standard format
		return data.data.verses.map(verse => {
			const chapterId = verse.chapterId || '';
			const parts = chapterId.split('.');
			const idParts = verse.id.split('.');

			return {
				bookAbbr: parts[0] || '',
				chapter: parts[1] || '',
				verse: idParts[2] || '',
				reference: verse.reference,
				text: verse.text
			};
		});
	}

	transformContent(content) {
		// Remove paragraph tags
		content = content.replace(/<\/?p[^>]*>/g, '');

		// Replace verse spans
		content = content.replace(/<span[^>]*class="v"[^>]*>(\d+)<\/span>/g, 
			' <span class="verse-number">$1</span>&nbsp;');

		// Detect paragraph marks
		content = content.replace(/(<span class="verse-number">\d+<\/span>)\s*¶/g, 
			'</p><p class="verse">$1');

		// Wrap in paragraphs
		content = '<p class="verse">' + content + '</p>';

		// Clean up class names
		content = content.replace(/<span class="nd">/g, '<span class="lord">');
		content = content.replace(/<span class="add">/g, '<span class="added">');

		return content;
	}

	getHeaders() {
		const headers = {};
		this.config.headers.forEach(h => {
			headers[h.key] = h.value;
		});
		return { headers };
	}
}