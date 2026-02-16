// js/providers/ProviderFactory.js
class ProviderFactory {
	static instances = {}; // Cache instances

	static getProviderClasses() {
		// Lazy initialization using window global lookup
		if (!this._providers) {
			this._providers = {
				'API.Bible': 'APIBibleProvider',
				'AbtApi': 'AbtApiProvider',
				'bolls.life': 'BollsLifeProvider',
				'helloao.org': 'HelloAOProvider',
			};
		}
		return this._providers;
	}

	static getProvider(providerName) {
		// Return cached instance if exists
		if (this.instances[providerName]) {
			return this.instances[providerName];
		}

		const providers = this.getProviderClasses();
		const providerClassName = providers[providerName];
		if (!providerClassName) {
			throw new Error('Unknown provider: ' + providerName);
		}

		// Look up the class from window at runtime
		const ProviderClass = window[providerClassName];
		if (!ProviderClass) {
			throw new Error(`Provider class ${providerClassName} not loaded`);
		}

		// Create, cache, and return new instance
		this.instances[providerName] = new ProviderClass();
		return this.instances[providerName];
	}
}