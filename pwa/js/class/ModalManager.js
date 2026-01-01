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
	showVerseMenu() {
		this.show('verseMenu');

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