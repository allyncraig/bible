// ModalManager - Handles all modal display and interaction

class ModalManager {
	constructor(modalObj) {
		this.modals = Object.fromEntries(
			Object.entries(modalObj).map(([key, id]) => [id, document.getElementById(id + 'Modal')]) 
		);
		Object.values(this.modals).forEach(modal => {
			if (modal) {
				modal.classList.remove(CLASS.FLEX, CLASS.BLOCK);
				modal.classList.add(CLASS.HIDDEN);
			}
		})
	}

	show(modalName, element = null) {
		const modal = this.modals[modalName];
		if (!modal) return;
		modal.classList.remove(CLASS.HIDDEN);
		modal.classList.add(((modalName === 'splash') ? CLASS.FLEX : CLASS.BLOCK));
		if (modalName === 'search' && element !== null) {
			setTimeout(() => {
				const searchInput = document.getElementById(element);
				if (searchInput) {
					searchInput.focus();
				}
			}, 100);
		}
	}

	hide(modalName) {
		const modal = this.modals[modalName];
		if (!modal) return;
		modal.classList.remove(CLASS.FLEX, CLASS.BLOCK);
		modal.classList.add(CLASS.HIDDEN);
	}

	isVisible(modalName) {
		const modal = this.modals[modalName];
		if (!modal) return false;
		return !modal.classList.contains(CLASS.HIDDEN);
	}

	// Error dialog using about modal
	showError(message, onClose) {
		this.showAbout('Error', message, 'OK');

		// Add one-time close handler if provided
		if (onClose) {
			const button = document.getElementById('aboutCloseButton');
			const handler = () => {
				onClose();
				button.removeEventListener('click', handler);
			};
			button.addEventListener('click', handler);
		}
	}

	// verseMenuModal
	showVerseMenu(clientX, clientY) {
		this.show('verseMenu');

		// Position the menu near the click/touch location
		if (clientX !== undefined && clientY !== undefined) {
			const modal = this.modals['verseMenu'];
			const menuContent = modal.querySelector('.menu-content');

			if (menuContent) {
				// Get menu dimensions
				const menuRect = menuContent.getBoundingClientRect();
				const menuWidth = menuRect.width || 200; // fallback width
				const menuHeight = menuRect.height || 150; // fallback height

				// Get viewport dimensions
				const viewportWidth = window.innerWidth;
				const viewportHeight = window.innerHeight;

				const padding = 10; // padding from screen edges

				// Determine horizontal position
				// Default: top-left corner at click point
				let left = clientX;
				let useRightCorner = false;

				// If menu would go off right edge, use top-right corner instead
				if (left + menuWidth > viewportWidth - padding) {
					left = clientX - menuWidth;
					useRightCorner = true;

					// If still off screen (click too far left), clamp it
					if (left < padding) {
						left = padding;
					}
				}

				// Determine vertical position
				// Default: top corner at click point
				let top = clientY;
				let useBottomCorner = false;

				// If menu would go off bottom edge, use bottom corner instead
				if (top + menuHeight > viewportHeight - padding) {
					top = clientY - menuHeight;
					useBottomCorner = true;

					// If still off screen (click too high), clamp it
					if (top < padding) {
						top = padding;
					}
				}

				// Apply positioning
				menuContent.style.position = 'fixed';
				menuContent.style.left = left + 'px';
				menuContent.style.top = top + 'px';

				// Optional: Log which corner is being used (for debugging)
				// const corner = `${useBottomCorner ? 'bottom' : 'top'}-${useRightCorner ? 'right' : 'left'}`;
				// console.log(`Menu positioned at ${corner} corner`);
			}
		}

		// Enable/disable Suggest Edit button based on version
		const currentVersion = app.navigationManager.getCurrentVersion();
		const suggestButton = document.getElementById('menuSuggestEdit');

		if (suggestButton) {
			if (currentVersion === 'ABT') {
				suggestButton.disabled = false;
				suggestButton.style.opacity = '1';
			} else {
				suggestButton.disabled = true;
				suggestButton.style.opacity = '0.5';
			}
		}
	}

	hideVerseMenu() {
		this.hide('verseMenu');
	}	
}