// js/providers/BaseProvider.js
class BaseProvider {
	constructor(config) {
		this.config = config;
	}

	// Must be implemented by subclasses
	async fetchBookList(versionParams) {
		throw new Error('fetchBookList must be implemented by provider');
	}

	async fetchChapter(versionParams, bookId, chapterNum) {
		throw new Error('fetchChapter must be implemented by provider');
	}

	async search(versionParams, searchTerm) {
		throw new Error('search must be implemented by provider');
	}

	// Helper methods available to all providers
	buildUrl(urlTemplate, parameters) {
		let url = urlTemplate;
		if (parameters) {
			Object.keys(parameters).forEach(key => {
				url = url.replace(`{{${key}}}`, parameters[key]);
			});
		}
		return url;
	}

	async fetchJSON(url, options = {}) {
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}
		return await response.json();
	}
}

window.BaseProvider = BaseProvider;