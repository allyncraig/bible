// APIClient - Handles all API requests with consistent error handling

// APIClient - Now just a thin wrapper around providers

class APIClient {
	getProviderForVersion(version) {
		if (!version.provider) {
			throw new Error('Version missing provider name');
		}
		return ProviderFactory.getProvider(version.provider);
	}

	async fetchBookList(version) {
		const provider = this.getProviderForVersion(version);
		const books = await provider.fetchBookList(version.parameters);
		return books;
	}

	async fetchChapter(version, bookApiId, chapterNum) {
		const provider = this.getProviderForVersion(version);
		const content = await provider.fetchChapter(version.parameters, bookApiId, chapterNum);
		return content;
	}

	async fetchSearch(version, searchTerm, page = 1) {
		const provider = this.getProviderForVersion(version);
		const results = await provider.search(version.parameters, searchTerm, page);
		return results;
	}
}