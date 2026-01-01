// HTTPClient - Static class for all HTTP requests with CORS bypass on device
class HTTPClient {
	// Main fetch method
	static async fetch(url, options = {}) {
		const useCordovaHttp = HTTPClient.useCordovaHttp();

		if (useCordovaHttp) {
			return await HTTPClient.fetchCordova(url, options);
		} else {
			// PWA/Browser mode - use standard fetch
			return await HTTPClient.fetchStandard(url, options);
		}
	}

	static useCordovaHttp = () => !!(
		window.cordova && 
        window.cordova.plugin && 
        window.cordova.plugin.http &&
        typeof window.cordova.plugin.http.sendRequest === 'function' &&
        !window.cordova.platformId === 'browser'
	);

	// Fetch using cordova-plugin-advanced-http
	static fetchCordova(url, options = {}) {
		return new Promise((resolve, reject) => {
			const headers = options.headers || {};
			const method = (options.method || 'GET').toLowerCase();
			const params = options.params || {};
			const responseType = options.responseType || 'json';

			// Set headers if provided
			Object.keys(headers).forEach(key => {
				window.cordova.plugin.http.setHeader('*', key, headers[key]);
			});

			// Set data serializer based on response type
			if (responseType === 'json') {
				window.cordova.plugin.http.setDataSerializer('json');
			} else {
				window.cordova.plugin.http.setDataSerializer('utf8');
			}

			// Choose the appropriate HTTP method
			const httpMethod = method === 'post' ? 'post' : 'get';

			window.cordova.plugin.http[httpMethod](
				url,
				params,
				headers,
				(response) => {
					try {
						let data = response.data;

						// Parse based on requested response type
						if (responseType === 'json' && typeof data === 'string') {
							data = JSON.parse(data);
						}

						resolve(data);
					} catch (error) {
						reject(new Error('Failed to parse response: ' + error.message));
					}
				},
				(error) => {
					console.error('HTTP request failed:', error);
					reject(new Error(`HTTP error! status: ${error.status || 'Network error'}`));
				}
			);
		});
	}

	static downloadFileCordova(url, options = {}) {
		return new Promise((resolve, reject) => {
			// Download to temporary location
			const fileName = 'temp_download_' + Date.now() + '.zip';
			const filePath = cordova.file.cacheDirectory + fileName;

			window.cordova.plugin.http.downloadFile(
				url,                    // url
				{},                     // params
				{},                     // headers
				filePath,               // filePath
				(fileEntry) => {        // onSuccess callback
					// Read the file and convert to Blob
					fileEntry.file((file) => {
						const reader = new FileReader();
						reader.onloadend = function() {
							const blob = new Blob([this.result], { type: 'application/zip' });
							resolve(blob);
						};
						reader.onerror = reject;
						reader.readAsArrayBuffer(file);
					}, reject);
				},
				(error) => {            // onError callback
					console.error('Download failed:', error);
					reject(new Error(`Download error: ${error.status || 'Network error'}`));
				}
			);
		});
	}

	// Fallback fetch using standard JavaScript fetch
	static async fetchStandard(url, options = {}) {
		const fetchOptions = {
			method: options.method || 'GET',
			headers: options.headers || {}
		};

		// Add body if it's a POST request
		if (options.body) {
			fetchOptions.body = JSON.stringify(options.body);
		}

		const response = await fetch(url, fetchOptions);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// Return based on requested response type
		const responseType = options.responseType || 'json';
		switch (responseType) {
			case 'json':
				return await response.json();
			case 'text':
				return await response.text();
			case 'arraybuffer':
				return await response.arrayBuffer();
			case 'blob':
				return await response.blob();
			default:
				return await response.json();
		}
	}

	// Convenience methods
	static async getJSON(url, options = {}) {
		return await HTTPClient.fetch(url, { ...options, responseType: 'json' });
	}

	static async getText(url, options = {}) {
		return await HTTPClient.fetch(url, { ...options, responseType: 'text' });
	}

	static async getBlob(url, options = {}) {
		const useCordovaHttp = HTTPClient.useCordovaHttp();

		if (useCordovaHttp) {
			// Cordova: Use downloadFile method
			return await HTTPClient.downloadFileCordova(url, options);
		} else {
			// PWA: Use standard fetch
			return await HTTPClient.fetch(url, { ...options, responseType: 'blob' });
		}
	}

	static async post(url, data, options = {}) {
		return await HTTPClient.fetch(url, {
			...options,
			method: 'POST',
			body: data
		});
	}

	static async postJSON(url, data, options = {}) {
		return await HTTPClient.fetch(url, {
			...options,
			method: 'POST',
			body: data,
			responseType: 'json',
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {})
			}
		});
	}
}