// ContentRenderer - Handles rendering Bible content to the DOM

class ContentRenderer {
	constructor(contentElementId) {
		this.contentElement = document.getElementById(contentElementId);
		this.scrollListener = null;
		this.scrollTimeout = null;
		this.scrollCheckEnabled = false;
		this.lastScrollCheck = 0;
		this.scrollContainer = null; // Add this line
	}

	renderChapterFromDB(bookName, chapter, verses) {
		const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());
		const bookId = currentBook ? currentBook.id : '';

		// Clear content area
		this.contentElement.innerHTML = '';

		// Render chapter header
		Template.render('chapterHeaderTemplate', 'bibleHeader', {
			bookName: bookName,
			chapter: chapter
		}, false);

		// Render verses
		const versesData = [];
		const versesList = verses.rows || verses;
		const verseCount = verses.rows ? verses.rows.length : verses.length;
		for (let i = 0; i < verseCount; i++) {
			const verse = versesList.item ? versesList.item(i) : versesList[i];
			versesData.push({
				bookId: bookId,
				chapter: chapter,
				verseNumber: verse.verse,
				noteIcon: this.hasNoteIcon(bookId, chapter, verse.verse),
				verseText: verse.text
			});
		}

		Template.render('verseTemplate', 'bibleText', versesData, true);
		document.getElementById('mainPlaceholder').classList.add('hidden');

		// Add RTL class if needed
		const version = app.versionManager.getVersion(app.navigationManager.getCurrentVersion());
		const bibleTextEl = document.getElementById('bibleText');
		if (this.isRTLVersion(version)) {
			bibleTextEl.classList.add('rtl-text');
		} else {
			bibleTextEl.classList.remove('rtl-text');
		}

		this.scrollToTop();
		this.attachVerseListeners();
	}

	async renderChapterFromAPI(bookName, chapter, content) {
		const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());
		const bookId = currentBook ? currentBook.id : '';

		// Clear content area
		this.contentElement.innerHTML = '';

		// Render chapter header
		Template.render('chapterHeaderTemplate', 'bibleHeader', {
			bookName: bookName,
			chapter: chapter,
		}, false);

		// Parse API content and extract verses
		const versesData = this.parseAPIContent(content, bookId, chapter);

		// Render verses
		Template.render('verseTemplate', 'bibleText', versesData, true);
		document.getElementById('mainPlaceholder').classList.add('hidden');

		// Add RTL class if needed
		const version = app.versionManager.getVersion(app.navigationManager.getCurrentVersion());
		const bibleTextEl = document.getElementById('bibleText');
		if (this.isRTLVersion(version)) {
			bibleTextEl.classList.add('rtl-text');
		} else {
			bibleTextEl.classList.remove('rtl-text');
		}

		this.scrollToTop();
		this.attachVerseListeners();
	}

	parseAPIContent(content, bookId, chapter) {
		const versesData = [];
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = content;

		const verseParagraphs = tempDiv.querySelectorAll('p.verse');

		verseParagraphs.forEach(versePara => {
			const verseNumberSpan = versePara.querySelector('.verse-number');
			if (verseNumberSpan) {
				const verseNumber = verseNumberSpan.textContent.trim();

				// Get verse text (everything except the verse number span)
				const verseTextClone = versePara.cloneNode(true);
				const verseNumToRemove = verseTextClone.querySelector('.verse-number');
				if (verseNumToRemove) {
					verseNumToRemove.remove();
				}
				const verseText = verseTextClone.innerHTML.trim().replace(/^&nbsp;/, '');

				versesData.push({
					bookId: bookId,
					chapter: chapter,
					verseNumber: verseNumber,
					noteIcon: this.hasNoteIcon(bookId, chapter, verseNumber),
					verseText: verseText
				});
			}
		});

		return versesData;
	}

	attachVerseListeners() {
		const verses = this.contentElement.querySelectorAll('.verse[data-verse]');

		verses.forEach(verseEl => {
			// Mobile: long-press
			let longPressTimer;
			let touchStarted = false;
			let touchEvent = null;

			verseEl.addEventListener('touchstart', (e) => {
				touchStarted = true;
				touchEvent = e;
				longPressTimer = setTimeout(() => {
					if (touchStarted) {
						e.preventDefault();
						this.handleVerseLongPress(verseEl, touchEvent);
					}
				}, 500);
			});

			verseEl.addEventListener('touchend', () => {
				touchStarted = false;
				clearTimeout(longPressTimer);
			});

			verseEl.addEventListener('touchmove', () => {
				touchStarted = false;
				clearTimeout(longPressTimer);
			});

			// Desktop: right-click
			verseEl.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.handleVerseLongPress(verseEl, e);
			});
		});
	}

	handleVerseLongPress(verseEl, event) {
		const bookId = verseEl.getAttribute('data-book');
		const chapter = verseEl.getAttribute('data-chapter');
		const verse = verseEl.getAttribute('data-verse');

		// Store selected verse in app state
		app.selectedVerse = {
			bookId: parseInt(bookId),
			chapter: parseInt(chapter),
			verse: parseInt(verse)
		};

		// Get click/touch position
		let clientX, clientY;
		if (event.type === 'contextmenu') {
			// Desktop right-click
			clientX = event.clientX;
			clientY = event.clientY;
		} else if (event.changedTouches && event.changedTouches.length > 0) {
			// Mobile touch
			clientX = event.changedTouches[0].clientX;
			clientY = event.changedTouches[0].clientY;
		} else {
			// Fallback - center of verse element
			const rect = verseEl.getBoundingClientRect();
			clientX = rect.left + rect.width / 2;
			clientY = rect.top + rect.height / 2;
		}

		// Show verse menu at click position
		app.modalManager.showVerseMenu(clientX, clientY);
	}

	formatJSONArrayContent(jsonArray, transformConfig) {
		let html = '';

		// Parse if it's a string
		const verses = typeof jsonArray === 'string' ? JSON.parse(jsonArray) : jsonArray;

		verses.forEach(verseObj => {
			let verseNum = verseObj[transformConfig.verseField];
			let verseText = verseObj[transformConfig.textField];

			// Apply text transforms if specified
			if (transformConfig.transforms) {
				transformConfig.transforms.forEach(transform => {
					verseText = verseText.replace(transform.find, transform.replace);
				});
			}

			html += `<p class="verse"><span class="verse-number">${verseNum}</span>&nbsp;${verseText}</p>`;
		});

		return html;
	}

	applyContentTransforms(content, transformConfig) {
		if (transformConfig.type === 'html' && transformConfig.transforms) {
			transformConfig.transforms.forEach(transform => {
				content = content.replace(transform.find, transform.replace);
			});
		}

		return content;
	}

	renderError(message) {
		this.contentElement.innerHTML = `<div class="placeholder">${message}</div>`;
	}

	renderDatabaseError() {
		this.renderError('Database tables not found.<br>Please ensure the database file is properly configured.');
	}

	renderNoVersesError() {
		this.renderError('No verses found for this chapter.<br>Please check the database.');
	}

	scrollToTop() {
		const contentArea = document.querySelector('.content-area');
		if (contentArea) {
			contentArea.scrollTop = 0;
		}
	}

	scrollToVerse(verseNumber, instant = false) {
		const verseElements = document.querySelectorAll('.verse-number');
		let targetVerse = null;

		for (let i = 0; i < verseElements.length; i++) {
			const verseNum = parseInt(verseElements[i].textContent.trim());
			if (verseNum === verseNumber) {
				targetVerse = verseElements[i];
				break;
			}
		}

		if (targetVerse) {
			const verseParagraph = targetVerse.closest('.verse') || targetVerse.parentElement;

			// Add highlight class
			verseParagraph.classList.add('verse-highlight');
			setTimeout(() => {
				verseParagraph.classList.remove('verse-highlight');
			}, 2000);

			// Scroll with or without animation
			verseParagraph.scrollIntoView({ 
				behavior: instant ? 'auto' : 'smooth', 
				block: 'center' 
			});
		} else {
			this.scrollToTop();
		}
	}

	setFontSize(fontSize) {
		this.contentElement.style.fontSize = fontSize + 'px';
	}

	hasNoteIcon(bookId, chapter, verse) {
		return app.storageManager.hasNote(bookId, chapter, verse) 
			? '&nbsp;<i class="note-icon icon ion-document-text" onclick="openNoteFromIcon(event, this)"></i>' 
			: '';
	}

	enableScrollDetection() {
		if (this.scrollListener) {
			this.disableScrollDetection(); // Clean up old listener first
		}

		this.scrollCheckEnabled = false; // Disabled initially
		this.lastScrollCheck = 0;

		// Find the scrollable container - it's .content-area, not the content div
		const scrollContainer = document.querySelector('.content-area');
		if (!scrollContainer) {
			console.error('Scroll container not found');
			return;
		}

		this.scrollContainer = scrollContainer;

		this.scrollListener = () => {
			// Only check if enabled and enough time has passed
			const now = Date.now();
			if (!this.scrollCheckEnabled || now - this.lastScrollCheck < 150) {
				return;
			}

			// Debounce scroll events
			clearTimeout(this.scrollTimeout);
			this.scrollTimeout = setTimeout(() => {
				this.checkScrollCompletion();
				this.lastScrollCheck = Date.now();
			}, 150);
		};

		this.scrollContainer.addEventListener('scroll', this.scrollListener);

		// Enable checking after initial load delay
		setTimeout(() => {
			this.scrollCheckEnabled = true;
			// console.log('Scroll detection enabled');
		}, 500);
	}

	disableScrollDetection() {
		if (this.scrollListener && this.scrollContainer) {
			this.scrollContainer.removeEventListener('scroll', this.scrollListener);
			this.scrollListener = null;
			this.scrollContainer = null;
		}
		this.scrollCheckEnabled = false;
		clearTimeout(this.scrollTimeout);
		// console.log('Scroll detection disabled');
	}

	checkScrollCompletion() {
		// Only in daily reading mode
		if (!app.readingModeActive) return;

		const element = this.scrollContainer;
		if (!element) return;

		const threshold = 50; // pixels from bottom

		// Check if we have dimmed verses (partial chapter reading)
		const dimmedVerses = document.querySelectorAll('.verse.dimmed');
		const hasDimmedVerses = dimmedVerses.length > 0;

		if (hasDimmedVerses) {
			// For partial readings, find the last non-dimmed verse
			const allVerses = Array.from(document.querySelectorAll('.verse'));
			const lastVisibleVerse = allVerses.reverse().find(v => !v.classList.contains('dimmed'));

			if (!lastVisibleVerse) return;

			// Check if last visible verse is in viewport or has been scrolled past
			const verseRect = lastVisibleVerse.getBoundingClientRect();
			const containerRect = element.getBoundingClientRect();

			// Check if the bottom of the last visible verse is at or above the bottom of the viewport
			const isLastVerseVisible = verseRect.bottom <= containerRect.bottom + threshold;

			if (isLastVerseVisible) {
				this.handleReadingComplete();
			}
		} else {
			// For full chapter readings, use the original logic
			const scrollPosition = element.scrollTop + element.clientHeight;
			const scrollHeight = element.scrollHeight;

			if (scrollHeight - scrollPosition <= threshold) {
				this.handleReadingComplete();
			}
		}
	}

	handleReadingComplete() {
		const reading = app.dailyReadingManager.getCurrentReading();
		if (!reading) {
			console.log('No current reading');
			return;
		}

		// Check if already complete
		if (app.dailyReadingManager.isComplete(reading.day, reading.index)) {
			// console.log('Reading already complete');
			return; // Already marked
		}

		// console.log('Marking reading complete');
		// console.dir(reading);

		// Mark as complete
		app.dailyReadingManager.markComplete(parseInt(reading.day), reading.index, true);

		// Update UI if modal is open
		if (app.modalManager.isVisible(MODAL.READINGPLAN)) {
			// Update checkbox in modal
			const checkbox = document.querySelector(
				`[data-day="${reading.day}"][data-index="${reading.index}"]`
			);
			if (checkbox) {
				checkbox.dataset.state = '';
				checkbox.classList.remove('ion-android-checkbox-outline-blank');
				checkbox.classList.add('ion-android-checkbox-outline');
			}

			// Update progress
			updateProgressDisplay();

			// Update day card checkmark
			const dayCard = document.querySelector(`.day-card[data-day="${reading.day}"]`);
			if (dayCard) {
				const existingCheckbox = dayCard.querySelector('.day-checkbox');

				if (app.dailyReadingManager.isDayComplete(reading.day)) {
					if (!existingCheckbox) {
						const checkbox = document.createElement('div');
						checkbox.className = 'day-checkbox';
						checkbox.innerHTML = '✓';
						dayCard.appendChild(checkbox);
					}
				}
			}
		}

		// Check if day is complete
		if (app.dailyReadingManager.isDayComplete(reading.day)) {
			// Disable scroll detection temporarily to prevent double-triggers
			this.scrollCheckEnabled = false;
			openToast(`Day ${reading.day} Daily Reading Complete!`);
			// Re-enable after dialog
			setTimeout(() => {
				this.scrollCheckEnabled = true;
			}, 1000);
		}
	}

	renderChapterInterlinear(bookName, chapter, versesA, versesB, sourceA, sourceB, versionAbbr) {
		const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());
		const bookId = currentBook ? currentBook.id : '';

		// Clear content area
		this.contentElement.innerHTML = '';
		const displayBookName = getBookName(bookId);

		// Render interlinear header with dynamic version name
		Template.render('chapterHeaderTemplate', 'bibleHeader', {
			bookName: displayBookName,
			chapter: chapter,
			versionName: `${versionAbbr || APP.INTERLINEAR_FALLBACK_PRIMARY} / ABT`
		}, false);

		// Convert both to uniform format
		const mapVersionA = new Map();
		const mapVersionB = new Map();

		// Handle version A based on source
		if (sourceA === 'db') {
			// DB format: handle both .rows format and direct array
			const versesListA = versesA.rows || versesA;
			const verseCountA = versesA.rows ? versesA.rows.length : versesA.length;
			for (let i = 0; i < verseCountA; i++) {
				const verse = versesListA.item ? versesListA.item(i) : versesListA[i];
				mapVersionA.set(parseInt(verse.verse), verse.text);
			}
		} else {
			// API format: array of objects from parseAPIContent
			versesA.forEach(verse => {
				const verseNum = parseInt(verse.verseNumber);
				// Use verseText for API format, remove any HTML tags
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = verse.verseText;
				mapVersionA.set(verseNum, tempDiv.textContent || tempDiv.innerText);
			});
		}

		// Handle version B based on source
		if (sourceB === 'db') {
			// DB format: handle both .rows format and direct array
			const versesListB = versesB.rows || versesB;
			const verseCountB = versesB.rows ? versesB.rows.length : versesB.length;
			for (let i = 0; i < verseCountB; i++) {
				const verse = versesListB.item ? versesListB.item(i) : versesListB[i];
				mapVersionB.set(parseInt(verse.verse), verse.text);
			}
		} else {
			// API format: array of objects from parseAPIContent
			versesB.forEach(verse => {
				const verseNum = parseInt(verse.verseNumber);
				// Use verseText for API format, remove any HTML tags
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = verse.verseText;
				mapVersionB.set(verseNum, tempDiv.textContent || tempDiv.innerText);
			});
		}

		// Find max verse number
		const maxVerseA = mapVersionA.size > 0 ? Math.max(...mapVersionA.keys()) : 0;
		const maxVerseB = mapVersionB.size > 0 ? Math.max(...mapVersionB.keys()) : 0;
		const maxVerses = Math.max(maxVerseA, maxVerseB);

		console.log('Interlinear rendering:', {
			sourceA,
			sourceB,
			versesACount: mapVersionA.size,
			versesBCount: mapVersionB.size,
			maxVerses,
			versionAbbr
		});

		// Build verse pairs data
		const versePairsData = [];
		for (let verseNum = 1; verseNum <= maxVerses; verseNum++) {
			// Check if verse exists in each version
			const hasVerseA = mapVersionA.has(verseNum);
			const hasVerseB = mapVersionB.has(verseNum);

			// don't show the verse if both versions omit
			if (hasVerseA || hasVerseB) {
				// Get text or placeholder
				const textVersionA = hasVerseA 
					? mapVersionA.get(verseNum) 
					: `<em>(OMIT)</em>`;
				const textVersionB = hasVerseB 
					? mapVersionB.get(verseNum) 
					: '<em>(OMIT)</em>';
	
				const noteIcon = this.hasNoteIcon(bookId, chapter, verseNum);
	
				versePairsData.push({
					bookId: bookId,
					chapter: chapter,
					verseNumber: verseNum,
					noteIcon: noteIcon,
					verseTextA: textVersionA,
					verseTextB: textVersionB
				});
			}
		}

		Template.render('interlinearVerseTemplate', 'bibleText', versePairsData, true);
		document.getElementById('mainPlaceholder').classList.add('hidden');

		// Add RTL class if needed (check primary version)
		const primaryVersionAbbr = app.configManager.getValue('interlinearPrimaryVersion') || APP.INTERLINEAR_FALLBACK_PRIMARY;
		const primaryVersion = app.versionManager.getVersion(primaryVersionAbbr);
		const bibleTextEl = document.getElementById('bibleText');
		if (this.isRTLVersion(primaryVersion)) {
			bibleTextEl.classList.add('rtl-text');
		} else {
			bibleTextEl.classList.remove('rtl-text');
		}

		this.scrollToTop();
		this.attachVerseListeners();
	}

	isRTLVersion(version) {
		if (!version) return false;

		// Check for explicit textDirection property (future-proofing)
		if (version.textDirection === 'rtl') return true;

		// Check for RTL language codes
		const rtlLanguages = ['he', 'ar'];
		return rtlLanguages.includes(version.languageCode);
	}
}