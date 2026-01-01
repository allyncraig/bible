// js/providers/ProviderFactory.js
class ProviderFactory {
	static providers = {
		'API.Bible': APIBibleProvider,
		'bolls.life': BollsLifeProvider,
		'helloao.org': HelloAOProvider
	};

	static instances = {}; // Cache instances

	static getProvider(providerName) {
		// Return cached instance if exists
		if (this.instances[providerName]) {
			return this.instances[providerName];
		}

		const ProviderClass = this.providers[providerName];
		if (!ProviderClass) {
			throw new Error('Unknown provider: ' + providerName);
		}

		// Create, cache, and return new instance
		this.instances[providerName] = new ProviderClass();
		return this.instances[providerName];
	}
}