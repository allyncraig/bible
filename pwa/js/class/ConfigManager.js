class ConfigManager {
	constructor(configDefinition, storageManager, options = {}) {
		this.config = configDefinition;
		this.storageManager = storageManager;
		this.storageKey = options.storageKey || 'app_config';
		this.pageId = options.pageId || 'configuration-page';
		this.onChangeCallback = options.onChange || null;
		this.values = {};

		// Load saved values or use defaults
		this.loadValues();
	}

	loadValues() {
		try {
			const saved = this.storageManager.get(this.storageKey);
			if (saved) {
				this.values = { ...this.getDefaults(), ...JSON.parse(saved) };
			} else {
				this.values = this.getDefaults();
			}
		} catch (e) {
			console.warn('Error loading config:', e);
			this.values = this.getDefaults();
		}
	}

	getDefaults() {
		const defaults = {};
		this.config.forEach(item => {
			defaults[item.key] = item.default_value;
		});
		return defaults;
	}

	saveValues() {
		try {
			this.storageManager.set(this.storageKey, JSON.stringify(this.values));
			if (this.onChangeCallback) {
				this.onChangeCallback(this.values);
			}
		} catch (e) {
			console.error('Error saving config:', e);
		}
	}

	getValue(key) {
		return this.values[key];
	}

	setValue(key, value) {
		this.values[key] = value;
		this.saveValues();
	}

	render() {
		const page = document.getElementById(this.pageId);
		if (!page) {
			console.error('Configuration page element not found:', this.pageId);
			return;
		}

		// Clear existing content
		page.innerHTML = '';

		// Create content wrapper
		const content = document.createElement('div');
		content.className = 'config-area';

		// Render each config item
		this.config.forEach(item => {
			const itemEl = this.renderItem(item);
			if (itemEl) {
				content.appendChild(itemEl);
			}
		});

		page.appendChild(content);
	}

	renderItem(item) {
		const wrapper = document.createElement('div');
		wrapper.className = 'config-item';

		// Label
		const label = document.createElement('label');
		label.textContent = item.label;
		label.className = 'config-label'; // 'config-label';
		wrapper.appendChild(label);

		// Input based on type
		let inputContainer;
		switch (item.type) {
			case 'radio':
				inputContainer = this.renderRadio(item);
				break;
			case 'toggle':
				inputContainer = this.renderToggle(item);
				break;
			case 'text':
			case 'number':
				inputContainer = this.renderInput(item);
				break;
			case 'select':
				inputContainer = this.renderSelect(item);
				break;
			case 'slider':
				inputContainer = this.renderSlider(item);
				break;
			default:
				console.warn('Unknown config type:', item.type);
				return null;
		}

		if (inputContainer) {
			wrapper.appendChild(inputContainer);
		}

		// Help text
		if (item.help) {
			const help = document.createElement('small');
			help.className = 'config-help'; // 'config-help';
			help.textContent = item.help;
			wrapper.appendChild(help);
		}

		return wrapper;
	}

	renderRadio(item) {
		const container = document.createElement('div');
		container.classList.add('config-radio-group');

		item.values.forEach((value, index) => {
			const option = document.createElement('label');
			option.classList.add('config-radio-option');

			const input = document.createElement('input');
			input.classList.add('config-radio-input', 'accent');
			input.type = 'radio';
			input.name = item.key;
			input.value = value;
			input.checked = this.values[item.key] === value;
			input.addEventListener('change', () => {
				this.setValue(item.key, value);
				if (item.onChange) {
					item.onChange(value, this.values);
				}
			});

			const span = document.createElement('span');
			span.classList.add('config-radio-label');
			span.textContent = item.display_values ? item.display_values[index] : value;

			option.appendChild(input);
			option.appendChild(span);
			container.appendChild(option);
		});

		return container;
	}

	renderToggle(item) {
		const container = document.createElement('div');
		container.className = 'config-toggle-container';

		const description = document.createElement('div');
		description.className = 'config-toggle-description';

		if (item.text) {
			const strong = document.createElement('strong');
			strong.textContent = item.text;
			description.appendChild(strong);
		}

		container.appendChild(description);

		const toggleLabel = document.createElement('label');
		toggleLabel.className = 'config-toggle-switch';

		const input = document.createElement('input');
		input.type = 'checkbox';
		input.checked = this.values[item.key] === true;
		input.addEventListener('change', () => {
			this.setValue(item.key, input.checked);
			if (item.onChange) {
				item.onChange(input.checked, this.values);
			}
		});

		const slider = document.createElement('span');
		slider.className = 'config-toggle-slider';

		toggleLabel.appendChild(input);
		toggleLabel.appendChild(slider);
		container.appendChild(toggleLabel);

		return container;
	}

	renderSlider(item) {
		const container = document.createElement('div');
		container.className = 'config-slider-container';

		// Slider input
		const slider = document.createElement('input');
		slider.type = 'range';
		slider.className = 'config-slider';
		slider.min = item.min || 0;
		slider.max = item.max || 100;
		slider.step = item.step || 1;
		slider.value = this.values[item.key];

		// Value display
		const valueDisplay = document.createElement('span');
		valueDisplay.className = 'config-slider-value';
		valueDisplay.textContent = this.values[item.key];

		// Update on input (for live preview)
		slider.addEventListener('input', () => {
			const value = item.type === 'number' ? parseFloat(slider.value) : slider.value;
			valueDisplay.textContent = value;

			// Call onChange for live preview (but don't save yet)
			if (item.onChange) {
				item.onChange(value, this.values);
			}
		});

		// Save on change (when user releases slider)
		slider.addEventListener('change', () => {
			const value = parseFloat(slider.value);
			this.setValue(item.key, value);
			if (item.onChange) {
				item.onChange(value, this.values);
			}
		});

		// Wrapper for slider and value
		const sliderWrapper = document.createElement('div');
		sliderWrapper.className = 'config-slider-wrapper';
		sliderWrapper.appendChild(slider);
		sliderWrapper.appendChild(valueDisplay);

		container.appendChild(sliderWrapper);

		return container;
	}

	renderInput(item) {
		const container = document.createElement('div');
		container.className = 'config-input-container';

		// Handle special case for weight with unit suffix
		if (item.unit_suffix) {
			container.classList.add('config-input-with-unit');
		}

		const input = document.createElement('input');
		input.type = item.type === 'number' ? 'number' : 'text';
		input.value = item.display_transform 
			? item.display_transform(this.values[item.key], this.values)
			: this.values[item.key];

		if (item.min !== undefined) input.min = item.min;
		if (item.max !== undefined) input.max = item.max;
		if (item.step !== undefined) input.step = item.step;
		if (item.placeholder) input.placeholder = item.placeholder;

		input.addEventListener('change', () => {
			let value = item.type === 'number' ? parseFloat(input.value) : input.value;

			// Apply value transformation if provided (e.g., convert lbs to kg)
			if (item.value_transform) {
				value = item.value_transform(value, this.values);
			}

			this.setValue(item.key, value);
			if (item.onChange) {
				item.onChange(value, this.values);
			}
		});

		container.appendChild(input);

		// Add unit suffix if provided
		if (item.unit_suffix) {
			const unitLabel = document.createElement('span');
			unitLabel.className = 'config-unit-label';
			unitLabel.id = item.unit_suffix_id || `unit-${item.key}`;
			unitLabel.textContent = item.unit_suffix(this.values);
			container.appendChild(unitLabel);
		}

		return container;
	}

	renderSelect(item) {
		const select = document.createElement('select');
		select.className = 'config-select';

		const currentValue = this.values[item.key];

		item.values.forEach((value, index) => {
			const option = document.createElement('option');
			option.value = value;
			option.textContent = item.display_values ? item.display_values[index] : value;
			select.appendChild(option);
		});

		// Set the selected value AFTER all options are added
		select.value = currentValue;

		select.addEventListener('change', () => {
			this.setValue(item.key, select.value);
			if (item.onChange) {
				item.onChange(select.value, this.values);
			}
		});

		return select;
	}

	// Update specific UI elements (useful for dependent fields like unit labels)
	updateUI() {
		this.render();
	}
}
