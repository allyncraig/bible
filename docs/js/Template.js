// js/Template.js
class Template {
	/**
	 * Renders a template with data
	 * @param {string} templateId - ID of the template element
	 * @param {string} targetId - ID of container to render into
	 * @param {Object|Array} data - Single object or array of objects
	 * @param {boolean} append - If true, append to container; if false, replace contents (default: false)
	 */
	static render(templateId, targetId, data, append = false) {
		const template = document.getElementById(templateId);
		const target = document.getElementById(targetId);

		if (!template) {
			console.error(`Template not found: ${templateId}`);
			return;
		}

		if (!target) {
			console.error(`Target container not found: ${targetId}`);
			return;
		}

		if (!append) {
			target.innerHTML = '';
		}

		const dataArray = Array.isArray(data) ? data : [data];
		const fragment = document.createDocumentFragment();

		dataArray.forEach(item => {
			const clone = template.content.cloneNode(true);

			// Handle data-onclick attributes
			clone.querySelectorAll('[data-onclick]').forEach(el => {
				const onclick = this.interpolate(el.getAttribute('data-onclick'), item);
				el.setAttribute('onclick', onclick);
				el.removeAttribute('data-onclick');
			});

			// Interpolate all text content
			this.interpolateNode(clone, item);

			fragment.appendChild(clone);
		});

		target.appendChild(fragment);
	}

	/**
	 * Interpolates all text nodes and attributes in a node
	 * @param {Node} node - Node to process
	 * @param {Object} data - Data object
	 */
	static interpolateNode(node, data) {
		const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
		const nodes = [];

		let currentNode;
		while (currentNode = walker.nextNode()) {
			if (currentNode.textContent.includes('{{')) {
				nodes.push(currentNode);
			}
		}

		nodes.forEach(textNode => {
			const temp = document.createElement('div');
			temp.innerHTML = this.interpolate(textNode.textContent, data);
			textNode.replaceWith(...temp.childNodes);
		});

		// Also handle attributes
		if (node.querySelectorAll) {
			node.querySelectorAll('*').forEach(el => {
				Array.from(el.attributes).forEach(attr => {
					if (attr.value.includes('{{')) {
						attr.value = this.interpolate(attr.value, data);
					}
				});
			});
		}
	}

	/**
	 * Interpolates a string with {{variable}} syntax
	 * @param {string} template - Template string
	 * @param {Object} data - Data object
	 * @returns {string} Interpolated string
	 */
	static interpolate(template, data) {
		return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
			const value = key.split('.').reduce((obj, k) => obj?.[k], data);
			return value !== undefined ? value : '';
		});
	}

	/**
	 * Clears a container
	 * @param {string} targetId - ID of container to clear
	 */
	static clear(targetId) {
		const target = document.getElementById(targetId);
		if (target) {
			target.innerHTML = '';
		}
	}
}