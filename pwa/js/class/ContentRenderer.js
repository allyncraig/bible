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

			verseEl.addEventListener('touchstart', (e) => {
				touchStarted = true;
				longPressTimer = setTimeout(() => {
					if (touchStarted) {
						e.preventDefault();
						this.handleVerseLongPress(verseEl);
					}
				}, 500); // 500ms for long-press
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
				this.handleVerseLongPress(verseEl);
			});
		});
	}

	handleVerseLongPress(verseEl) {
		const bookId = verseEl.getAttribute('data-book');
		const chapter = verseEl.getAttribute('data-chapter');
		const verse = verseEl.getAttribute('data-verse');

		// Store selected verse in app state
		app.selectedVerse = {
			bookId: parseInt(bookId),
			chapter: parseInt(chapter),
			verse: parseInt(verse)
		};

		// Show verse menu
		app.modalManager.showVerseMenu();
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

	scrollToVerse(verseNumber) {
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

			verseParagraph.scrollIntoView({ behavior: 'smooth', block: 'center' });

			verseParagraph.classList.add('verse-highlight');

			setTimeout(() => {
				verseParagraph.classList.remove('verse-highlight');
			}, 3000);
		} else {
			// console.log(`Verse ${verseNumber} not found, scrolling to top`);
			this.scrollToTop();
		}
	}

	// async renderChapterInterlinear(bookName, chapter, versesVersionA, versesVersionB) {
	// 	const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());
	// 	const bookId = currentBook ? currentBook.id : '';
	// 	// Clear content area
	// 	this.contentElement.innerHTML = '';
	// 	// Get primary version abbreviation
	// 	const primaryVersion = app.configManager.getValue('interlinearPrimaryVersion') || 'BSB';
	// 	// Render interlinear header
	// 	Template.render('chapterHeaderTemplate', 'bibleHeader', {
	// 		bookName: bookName,
	// 		chapter: chapter,
	// 		versionName: `${primaryVersion} / ABT`
	// 	}, false);

	// 	// Handle both IndexedDB format (verses.rows) and direct array format
	// 	const listA = versesVersionA.rows || versesVersionA;
	// 	const listB = versesVersionB.rows || versesVersionB;
	// 	const lengthA = versesVersionA.rows ? versesVersionA.rows.length : versesVersionA.length;
	// 	const lengthB = versesVersionB.rows ? versesVersionB.rows.length : versesVersionB.length;

	// 	const maxVerses = Math.max(
	// 		lengthA > 0 ? (listA.item ? listA.item(lengthA - 1).verse : listA[lengthA - 1].verse) : 0,
	// 		lengthB > 0 ? (listB.item ? listB.item(lengthB - 1).verse : listB[lengthB - 1].verse) : 0
	// 	);

	// 	const mapVersionA = new Map();
	// 	const mapVersionB = new Map();

	// 	for (let i = 0; i < lengthA; i++) {
	// 		const verse = listA.item ? listA.item(i) : listA[i];
	// 		mapVersionA.set(verse.verse, verse.text);
	// 	}
	// 	for (let i = 0; i < lengthB; i++) {
	// 		const verse = listB.item ? listB.item(i) : listB[i];
	// 		mapVersionB.set(verse.verse, verse.text);
	// 	}

	// 	// Build verse pairs data
	// 	const versePairsData = [];
	// 	for (let verseNum = 1; verseNum <= maxVerses; verseNum++) {
	// 		const textVersionA = mapVersionA.get(verseNum) || `<em>(not in ${primaryVersion})</em>`;
	// 		const textVersionB = mapVersionB.get(verseNum) || '<em>(not in ABT)</em>';
	// 		const noteIcon = this.hasNoteIcon(bookId, chapter, verseNum);
	// 		versePairsData.push({
	// 			bookId: bookId,
	// 			chapter: chapter,
	// 			verseNumber: verseNum,
	// 			noteIcon: noteIcon,
	// 			verseTextA: textVersionA,
	// 			verseTextB: textVersionB
	// 		});
	// 	}
	// 	Template.render('interlinearVerseTemplate', 'bibleText', versePairsData, true);
	// 	document.getElementById('mainPlaceholder').classList.add('hidden');
	// 	this.scrollToTop();
	// 	this.attachVerseListeners();
	// }

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
		const scrollPosition = element.scrollTop + element.clientHeight;
		const scrollHeight = element.scrollHeight;

		// Check if near bottom
		if (scrollHeight - scrollPosition <= threshold) {
			// console.log('Near bottom, triggering completion check');
			this.handleReadingComplete();
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
		app.dailyReadingManager.markComplete(reading.day, reading.index, true);

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

		// Show completion notification
		openToast('Reading marked complete! ✓');

		// Check if day is complete
		if (app.dailyReadingManager.isDayComplete(reading.day)) {
			// Disable scroll detection temporarily to prevent double-triggers
			this.scrollCheckEnabled = false;
			showDayCompleteDialog(reading.day);
			// Re-enable after dialog
			setTimeout(() => {
				this.scrollCheckEnabled = true;
			}, 1000);
		}
	}

	renderChapterInterlinearUnified(bookName, chapter, versesA, versesB, sourceA, sourceB, versionAbbr) {
		const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());
		const bookId = currentBook ? currentBook.id : '';

		// Clear content area
		this.contentElement.innerHTML = '';

		// Render interlinear header with dynamic version name
		Template.render('chapterHeaderTemplate', 'bibleHeader', {
			bookName: bookName,
			chapter: chapter,
			versionName: `${versionAbbr || 'BSB'} / ABT`
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
			maxVerses
		});

		// Build verse pairs data
		const versePairsData = [];
		for (let verseNum = 1; verseNum <= maxVerses; verseNum++) {
			const textVersionA = mapVersionA.get(verseNum) || `<em>(not in ${versionAbbr || 'BSB'})</em>`;
			const textVersionB = mapVersionB.get(verseNum) || '<em>(not in ABT)</em>';
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

		Template.render('interlinearVerseTemplate', 'bibleText', versePairsData, true);
		document.getElementById('mainPlaceholder').classList.add('hidden');
		this.scrollToTop();
		this.attachVerseListeners();
	}
}