// App constants
const APP = Object.freeze({
	NAME: 'My Bible App',
	COPYRIGHT_YEAR: '2025',
	SPLASH_TIMEOUT: 3000,
	DEFAULT_BOOK: 1,
	DEFAULT_CHAPTER: 1,
	DEFAULT_VERSION: 'KJV',
	DEFAULT_FONTSIZE: 18,
	LOCAL_KEY_BOOK: 'currentBook',
	LOCAL_KEY_CHAPTER: 'currentChapter',
	LOCAL_KEY_VERSION: 'currentVersion',
	ICON: 'img/bible.png',
	DB_FILE_NAME: 'bibles.db',
	/* BIBLE_APP_URL: 'https://bibleapp.wasmer.app/', */
	BIBLE_APP_URL: 'https://craigappfoundry.github.io/ABTBible/',
	BIBLE_VERSIONS_FILE: 'bibles.json',
	READING_PLAN_FILE: 'reading_plan.json',
	/* VOTD_URL: 'https://www.scriptura-api.com/api/daytext?version=kjv', */
	VOTD_URL_LBO: 'https://labs.bible.org/api/?passage=votd',
	READING_PLAN_KEY: 'readingPlan',
	TIMEOUT: 300,
	FONTS_SANSSERIF: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
	FONTS_SERIF: "Georgia, 'Times New Roman', Times, serif",
	// FormSubmit.co
	SUGGESTION_ENDPOINT: 'https://formsubmit.co/e27ec8ac829c0e7b5cf6d70701d2c520',
	SUGGESTION_SUBJECT: 'ABT Verse Suggestion',
	CONTACT_ENDPOINT: 'https://formsubmit.co/e27ec8ac829c0e7b5cf6d70701d2c520',
	CONTACT_SUBJECT: 'ABT Contact Form',
	// Google Forms
	GOOGLE_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSf50w3y5pb3Y9y4dAo483ZIE5sCr7PRu2VqJp_fxI7JzpcJyQ/formResponse',
	GOOGLE_FORM_FIELD_REFERENCE: 'entry.614902232',
	GOOGLE_FORM_FIELD_CURRENT: 'entry.308213628',
	GOOGLE_FORM_FIELD_SUGGESTION: 'entry.854046487',
	GOOGLE_CONTACT_FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSfxhnEWyXxZimbkv_xbHsABH5s0UMkTygRX_xB1W9DFgIxdQg/formResponse',
	GOOGLE_FORM_FIELD_CONTACT_TYPE: 'entry.1950454683',
	GOOGLE_FORM_FIELD_CONTACT_MESSAGE: 'entry.2113617686',
});

const TEXT = Object.freeze({
	SPLASH_MESSAGE: `<span class="splash-appname">${APP.NAME}</span><br/><span class="splash-apptext">v{{VERSION}}</span><br/><span class="splash-apptext">(c) ${APP.COPYRIGHT_YEAR} by <em>ZICAsoft</em></span>`,
	ABOUT_MESSAGE: `<span class="about-appname">${APP.NAME}</span><br><span class="about-apptext">v{{VERSION}}</span><br><span class="about-apptext">(c) ${APP.COPYRIGHT_YEAR} by <em>ZICAsoft</em></span><br><img width="80" height="80" class="radius" src="${APP.ICON}">`,
	ABOUT_TITLE: 'About this App',
	VOTD_TITLE: 'Verse of the Day'
});

const EVENT = Object.freeze({
	DEVICEREADY: 'deviceready',
	DOMCONTENTLOADED: 'DOMContentLoaded',
	CLICK: 'click',
	KEYPRESS: 'keypress',
});

const CLASS = Object.freeze({
	HIDDEN: 'hidden',
	DARK: 'dark',
	LIGHT: 'light',
	SELECTED: 'selected',
	FLEX: 'flex',
	BLOCK: 'block'
});

const MODAL = Object.freeze({
	MENU: 'menu',
	ABOUT: 'about',
	CONFIG: 'config',
	VERSION: 'version',
	SEARCH: 'search',
	CHAPTER: 'chapter',
	DOWNLOAD: 'download',
	SPLASH: 'splash',
	VERSEMENU: 'verseMenu',
	BOOKMARK: 'bookmark',
	NOTE: 'note',
	ALLNOTES: 'allNotes',
	READINGPLAN: 'readingPlan',
	DAYCOMPLETE: 'dayComplete',
	LOG: 'log',
	CONTACT: 'contact',
});

const UI = Object.freeze({
	PREVCHAPTER: 'prevChapter',
	NEXTCHAPTER: 'nextChapter',
	CHAPTERSELECT: 'chapterSelect',
	DECREASEFONT: 'decreaseFont',
	INCREASEFONT: 'increaseFont',
	BIBLETEXT: 'bibleText',
	VERSIONBUTTON: 'versionButton',
	SEARCHBUTTON: 'searchButton',
	MENUBUTTON: 'menuButton',
	MAINCONTENT: 'mainContent',
	MENUMODAL: 'menuModal',
	ABOUTMODAL: 'aboutModal',
	CONFIGMODAL: 'configModal',
	VERSIONMODAL: 'versionModal',
	SEARCHMODAL: 'searchModal',
	BOOKMARKMODAL: 'bookmarkModal',
	SEARCHINPUT: 'searchInput',
	SEARCHMESSAGE: 'searchMessage',
	SEARCHMESSAGETEXT: 'searchMessageText',
	SEARCHLIST: 'searchList',
	SEARCHTEMPLATE: 'searchTemplate',
	VERSEMENUMODAL: 'verseMenuModal',
	READINGPLANMODAL: 'readingPlanModal',
	SPLASH_INFO: 'splash-info',
});

// Define configuration
const CONFIG_DEFINITION = [
	{
		key: 'interlinearPrimaryVersion',
		label: 'Interlinear Primary Version:',
		type: 'select',
		default_value: 'BSB',
		values: VERSION_CONFIG.filter(v => v.abbreviation !== 'ABT').map(v => v.abbreviation),
		display_values: VERSION_CONFIG.filter(v => v.abbreviation !== 'ABT').map(v => `${v.abbreviation} - ${v.name}`),
		help: 'Select the Bible version to display alongside ABT in interlinear mode.',
		onChange: (value) => {
			// If interlinear mode is active, reload to show new version
			if (app.configManager.getValue('interlinearMode')) {
				loadCurrentChapter();
				updateDisplay();
			}
		}
	},
	{
		key: 'darkMode',
		label: 'Display Mode:',
		type: 'toggle',
		default_value: false,
		text: 'Enable Dark Mode',
		help: 'Switch between light and dark color themes.',
		onChange: (value) => {
			// Apply dark mode immediately when toggled
			document.body.style.colorScheme = (value) ? CLASS.DARK : CLASS.LIGHT;
		}
	},
	{
		key: 'fontStyle',
		label: 'Font Style:',
		type: 'radio',
		default_value: 'serif',
		values: ['serif', 'sans-serif'],
		display_values: ['Serif Fonts', 'Sans-Serif Fonts'],
		help: 'Choose between serif and sans-serif fonts for Bible text.',
		onChange: (value) => {
			// Apply font change immediately when selected
			const el = document.getElementById(UI.MAINCONTENT);
			el.style.fontFamily = (value === 'serif') ? APP.FONTS_SERIF : APP.FONTS_SANSSERIF;
		}
	},
	{
		key: 'fontSize',
		label: 'Text Size:',
		type: 'slider',
		default_value: 18,
		min: 12,
		max: 32,
		step: 2,
		help: 'Adjust the size of Bible text.',
		onChange: (value) => {
			// Apply font size immediately for live preview
			app.fontSize = parseInt(value);
			app.contentRenderer.setFontSize(app.fontSize);
			// Note: ConfigManager will handle saving to storage
		}
	},
];


// App state - now much simpler
const app = {
	fontSize: 18,
	minFontSize: 12,
	maxFontSize: 32,
	splashMessage: '',
	aboutMessage: '',
	logMessages: [],
	dailyVerse: {
		book: '',
		chapter: '',
		verse: '',
		text: '',
		date: ''
	},
	selectedVerse: null,
	currentReading: null,
	readingModeActive: false,
	readingModeDay: null,
	debugEnabled: false,
	noteDialogMode: 'note',

	// Manager instances
	storageManager: null,
	apiClient: null,
	databaseManager: null,
	versionManager: null,
	navigationManager: null,
	contentRenderer: null,
	searchManager: null,
	modalManager: null,
	configManager: null,
	dailyReadingManager: null,
};

// Initialize app
document.addEventListener(EVENT.DEVICEREADY, onDeviceReady, false);

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('./service-worker.js');
	});
}

function onDeviceReady() {
	if (app.debugEnabled) {
		document.getElementById('menuItemShowLog').classList.remove('hidden');
		(function() {
			const original = {
				log: console.log,
				warn: console.warn,
				error: console.error
			};

			function capture(type, args) {
				app.logMessages.push({
					type,
					message: JSON.stringify(Array.from(args))  // Capture raw arguments
				});
			}

			console.log = function() {
				capture("log", arguments);
				original.log.apply(console, arguments);
				console.dir(arguments);
			};

			console.warn = function() {
				capture("warn", arguments);
				original.warn.apply(console, arguments);
				console.dir(arguments);
			};

			console.error = function() {
				capture("error", arguments);
				original.error.apply(console, arguments);
				console.dir(arguments);
			};
		})();
	}

	// console.log('Cordova is ready');
	initializeApp();
}

// For testing in browser
if (!window.cordova) {
	document.addEventListener(EVENT.DOMCONTENTLOADED, initializeApp);
}

async function initializeApp() {
	const rect = document.getElementById('chapterSelect').getBoundingClientRect();
	document.getElementById('prevChapter').style.height = rect.height + 'px';
	document.getElementById('nextChapter').style.height = rect.height + 'px';
	app.modalManager = new ModalManager(MODAL);
	cordova.getAppVersion.getVersionNumber((version) => {
		app.splashMessage = (TEXT.SPLASH_MESSAGE).replace("{{VERSION}}", version);
		app.aboutMessage = (TEXT.ABOUT_MESSAGE).replace("{{VERSION}}", version);
		const infoEl = document.getElementById(UI.SPLASH_INFO);
		if (infoEl && app.splashMessage) {
			infoEl.innerHTML = app.splashMessage;
		}
		app.modalManager.show(MODAL.SPLASH);
		setTimeout(() => {
			app.modalManager.hide(MODAL.SPLASH);
		}, APP.SPLASH_TIMEOUT);
	});

	// Initialize managers
	app.storageManager = new StorageManager();
	app.apiClient = new APIClient();
	// app.modalManager = new ModalManager();

	// app.databaseManager = new DatabaseManager(
	// 	APP.DB_FILE_NAME,
	// 	app.storageManager
	// );

	app.databaseManager = new IndexedDBManager(
		APP.DB_FILE_NAME,
		app.storageManager
	);

	app.versionManager = new VersionManager(
		VERSION_CONFIG,
		app.databaseManager,
		app.apiClient,
		app.storageManager
	);

	app.downloadManager = new DownloadManager(
		app.databaseManager,
		app.storageManager,
		app.versionManager
	);

	app.navigationManager = new NavigationManager(
		app.versionManager,
		app.storageManager,
		() => loadCurrentChapter()
	);

	app.contentRenderer = new ContentRenderer(UI.BIBLETEXT);

	app.searchManager = new SearchManager(
		app.versionManager,
		app.databaseManager,
		app.apiClient,
		UI.SEARCHLIST
	);

	// Initialize configuration manager with StorageManager
	app.configManager = new ConfigManager(CONFIG_DEFINITION, app.storageManager, {
		storageKey: 'bible_app_config',
		pageId: 'configurationPage',
		onChange: (values) => {
			// console.log('Config updated')
			// console.dir(values);
		}
	});

	loadVotD();  // Load in background, don't wait
	loadReadingPlan();  // Load in background, don't wait
	setupVotDAutoRefresh();  // Setup event listeners

	// Load saved settings
	const settings = app.navigationManager.loadSettings();
	// Load font size from ConfigManager
	app.fontSize = app.configManager.getValue('fontSize');

	app.dailyReadingManager = new DailyReadingManager(
		app.storageManager,
		app.navigationManager
	);

	await app.dailyReadingManager.initialize();

	// Update interlinear menu text on startup
	updateInterlinearMenuText();

	// Apply dark mode on startup if enabled
	document.body.style.colorScheme = (app.configManager.getValue('darkMode')) ? CLASS.DARK : CLASS.LIGHT;

	// Apply font style on startup
	const fontFamily = app.configManager.getValue('fontStyle');
	const el = document.getElementById(UI.MAINCONTENT);
	el.style.fontFamily = (fontFamily === 'serif') ? APP.FONTS_SERIF : APP.FONTS_SANSSERIF;

	// Apply font size from ConfigManager
	app.contentRenderer.setFontSize(app.fontSize);

	// Initialize database
	await initializeDatabase();

	// Set up event listeners
	setupEventListeners();

	// Update display
	updateDisplay();
}

async function initializeDatabase() {
	if (!app.databaseManager.isAvailable()) {
		console.log('SQLite plugin not available, skipping database initialization');
		// Still need to load books even without database
		await loadBooksAndChapter();
		return;
	}

	// Always open the database
	await app.databaseManager.open();

	// Check if any version data exists in the database
	const hasData = await app.databaseManager.verifyDatabaseHasData();

	// Load books for default version
	await loadBooksAndChapter();
}

function setupVotDAutoRefresh() {
	// Cordova: app returns from background
	document.addEventListener('resume', checkAndReloadVotD, false);

	// Browser: tab becomes visible
	document.addEventListener('visibilitychange', () => {
		if (!document.hidden) {
			checkAndReloadVotD();
		}
	}, false);
}

const getDateToday = () => { return new Date().toISOString().split('T')[0]; }

function checkAndReloadVotD() {
	const today = getDateToday();
	if (app.dailyVerse.date !== today) {
		// console.log('New day detected, reloading VotD');
		loadVotD();
	}
}

async function loadVotD(reload = false) {
	const today = getDateToday();

	// First, try to load VotD from localStorage
	const cached = app.storageManager.getVotD();
	if (cached && cached.today === today && !reload) {
		app.dailyVerse = cached;
		// console.log('VotD loaded from cache');
	} else {
		// Fetch VotD from API
		try {
			const response = await HTTPClient.fetch(APP.VOTD_URL_LBO, { responseType: 'html' });
			const votd = parseLBOHtml(response, today);
			app.dailyVerse = votd;
			app.storageManager.setVotD(votd.book, votd.chapter, votd.verse, votd.text, votd.today);
			// console.log('VotD loaded from API');
		} catch(e) {
			console.log('Background VotD load failed: ' + e.message);
			if (cached) {
				app.dailyVerse = cached;
				// console.log('Using old cached VotD as fallback');
			}
		}
	}
}

async function loadReadingPlan() {
	// Check if already cached
	const cached = app.storageManager.getReadingPlan();
	if (cached) {
		// console.log('Reading plan loaded from cache');
		return;
	}

	// If not cached, fetch from server
	try {
		// console.log('Fetching reading plan from server...');
		const planData = await HTTPClient.getJSON(APP.BIBLE_APP_URL + APP.READING_PLAN_FILE);
		app.storageManager.setReadingPlan(planData);
		// console.log('Reading plan downloaded and cached');
	} catch (e) {
		console.error(`Failed to load reading plan: ${e.message}`);
	}
}

async function getAvailableVersions() {
	const dbVersions = await app.versionManager.getAvailableDBVersions();

	return VERSION_CONFIG.map(version => {
		// For new format with sources object
		if (version.sources) {
			const hasDB = version.sources.db && dbVersions.includes(version.abbreviation);
			const hasAPI = !!version.sources.api;

			// Version is available if it has either source available
			if (hasDB || hasAPI) {
				return {
					...version,
					hasLocalCopy: hasDB  // Flag for UI to show LOCAL badge
				};
			}
			return null; // No available source
		}

		// Legacy format compatibility
		if (version.source === 'api') {
			return { ...version, hasLocalCopy: false };
		}
		if (version.source === 'db') {
			return dbVersions.includes(version.abbreviation) ? { ...version, hasLocalCopy: true } : null;
		}
		return version;
	}).filter(v => v !== null);
}

async function loadBooksAndChapter() {
	let version = app.versionManager.getVersion(app.navigationManager.getCurrentVersion());

	// If saved version is from DB but data doesn't exist, switch to KJV
	if (version && version.source === 'db') {
		const hasData = await app.versionManager.hasVersionData(version.abbreviation);
		if (!hasData) {
			// console.log(`${version.abbreviation} data not available, switching to KJV`);
			app.navigationManager.setCurrentVersion('KJV');
			app.navigationManager.saveSettings();
			version = app.versionManager.getVersion('KJV');
		}
	}

	if (version) {
		try {
			await app.versionManager.loadBooksForVersion(version);
			await loadCurrentChapter();
		} catch (error) {
			console.error('Failed to load version:', error);
			app.contentRenderer.renderError('Failed to load Bible version. Please check your internet connection and try again.');
		}
	}
}

function setupEventListeners() {
	document.getElementById(UI.PREVCHAPTER).addEventListener(EVENT.CLICK, () => {
		if (app.readingModeActive) {
			handleDailyReadingPrevious();
		} else {
			app.navigationManager.navigatePrevious();
			updateDisplay();
			animateContentTransition('left');
		}
	});

	document.getElementById(UI.NEXTCHAPTER).addEventListener(EVENT.CLICK, () => {
		if (app.readingModeActive) {
			handleDailyReadingNext();
		} else {
			app.navigationManager.navigateNext();
			updateDisplay();
			animateContentTransition('right');
		}
	});

	document.getElementById(UI.CHAPTERSELECT).addEventListener(EVENT.CLICK, () => {
		if (app.readingModeActive) {
			showReadingPlan(); // Opens Reading Plan modal in daily mode
		} else {
			showChapterSelector();
		}
	});

	document.getElementById(UI.VERSIONBUTTON).addEventListener(EVENT.CLICK, () => {
		showVersionSelector();
	});

	document.getElementById(UI.SEARCHBUTTON).addEventListener(EVENT.CLICK, showSearch);
	document.getElementById(UI.MENUBUTTON).addEventListener(EVENT.CLICK, () => {
		app.modalManager.show(MODAL.MENU);
	});

	// Search input Enter key handler
	document.addEventListener(EVENT.KEYPRESS, (e) => {
		if (
			e.key === 'Enter' &&
			e.target.id === UI.SEARCHINPUT &&
			app.modalManager.isVisible(MODAL.SEARCH)
		) {
			executeSearch();
		}
	});

	// Close menu when clicking outside
	document.addEventListener(EVENT.CLICK, (e) => {
		if (
			e.target.id === MODAL.MENU + 'Modal' &&
			app.modalManager.isVisible(MODAL.MENU)
		) {
			closeModal(MODAL.MENU);
		}
		if (
			e.target.id === MODAL.VERSEMENU + 'Modal' &&
			app.modalManager.isVisible(MODAL.VERSEMENU)
		) {
			closeModal(MODAL.VERSEMENU);
		}
	});
}

function animateContentTransition(direction) {
	const bibleText = document.getElementById(UI.MAINCONTENT);
	if (!bibleText) return;

	// Remove any existing animation classes
	bibleText.classList.remove('slide-in-left', 'slide-in-right');

	// Force reflow to restart animation
	void bibleText.offsetWidth;

	// Add appropriate animation class
	if (direction === 'left') {
		// Moving forward - content slides in from right
		bibleText.classList.add('slide-in-left');
	} else {
		// Moving backward - content slides in from left
		bibleText.classList.add('slide-in-right');
	}

	// Remove class after animation completes
	setTimeout(() => {
		bibleText.classList.remove('slide-in-left', 'slide-in-right');
	}, APP.TIMEOUT); // Match animation-duration in CSS
}

async function loadCurrentChapter() {
	const version = app.versionManager.getVersion(app.navigationManager.getCurrentVersion());

	if (!version) {
		console.error('Version not found:', app.navigationManager.getCurrentVersion());
		return;
	}

	const books = app.versionManager.getBooks();
	const needsBookLoad = books.length === 0 || 
		(version.source === 'api' && (!books[0] || books[0].source !== 'api')) ||
		(version.source === 'db' && (!books[0] || books[0].source !== 'db'));

	if (needsBookLoad) {
		// console.log('Loading books for version:', version.abbreviation);
		await app.versionManager.loadBooksForVersion(version);
		updateDisplay();
	}

	await loadChapterContent(version);
}

async function loadChapterContent(version) {
	const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());

	if (!currentBook) {
		console.error('Book not found with ID:', app.navigationManager.getCurrentBook());
		return;
	}

	const isInterlinear = app.configManager.getValue('interlinearMode');

	try {
		// Check if interlinear mode is enabled
		if (isInterlinear) {
			const primaryVersionAbbr = app.configManager.getValue('interlinearPrimaryVersion') || 'BSB';
			const versionA = app.versionManager.getVersion(primaryVersionAbbr);
			const versionB = app.versionManager.getVersion('ABT');

			if (!versionA || !versionB) {
				console.warn('Interlinear mode enabled but versions not configured, falling back to single version');
				app.configManager.setValue('interlinearMode', false);
				updateInterlinearMenuText();
			} else {
				try {
					// Resolve both versions to get proper sources (DB or API)
					const resolvedVersionA = await app.versionManager.resolveVersionSource(versionA);
					const resolvedVersionB = await app.versionManager.resolveVersionSource(versionB);

					// Check if either version needs API loading
					const needsLoading = resolvedVersionA.source === 'api' || resolvedVersionB.source === 'api';
					if (needsLoading) {
						loading(`Loading ${primaryVersionAbbr} / ABT...`);
					}

					// Load books for version A if it's from API to get correct apiId
					let bookA = currentBook;
					if (resolvedVersionA.source === 'api') {
						const booksA = await app.apiClient.fetchBookList(resolvedVersionA);
						bookA = booksA.find(b => b.id === currentBook.id);
						if (!bookA) {
							throw new Error(`Book ID ${currentBook.id} not found in ${primaryVersionAbbr}`);
						}
					}

					// Load books for version B if it's from API to get correct apiId
					let bookB = currentBook;
					if (resolvedVersionB.source === 'api') {
						const booksB = await app.apiClient.fetchBookList(resolvedVersionB);
						bookB = booksB.find(b => b.id === currentBook.id);
						if (!bookB) {
							throw new Error(`Book ID ${currentBook.id} not found in ABT`);
						}
					}

					// Fetch verses from both versions (regardless of source)
					let versesA, versesB;

					// Fetch version A
					if (resolvedVersionA.source === 'db') {
						versesA = await app.databaseManager.loadChapter(
							currentBook.id,
							app.navigationManager.getCurrentChapter(),
							resolvedVersionA.tableVerses
						);
					} else {
						// Fetch from API and parse into verse format using correct apiId for this version
						const contentA = await app.apiClient.fetchChapter(
							resolvedVersionA,
							bookA.apiId,
							app.navigationManager.getCurrentChapter()
						);
						versesA = app.contentRenderer.parseAPIContent(contentA, currentBook.id, app.navigationManager.getCurrentChapter());
					}

					// Fetch version B
					if (resolvedVersionB.source === 'db') {
						versesB = await app.databaseManager.loadChapter(
							currentBook.id,
							app.navigationManager.getCurrentChapter(),
							resolvedVersionB.tableVerses
						);
					} else {
						// Fetch from API and parse into verse format using correct apiId for this version
						const contentB = await app.apiClient.fetchChapter(
							resolvedVersionB,
							bookB.apiId,
							app.navigationManager.getCurrentChapter()
						);
						versesB = app.contentRenderer.parseAPIContent(contentB, currentBook.id, app.navigationManager.getCurrentChapter());
					}

					// Close loading indicator
					if (needsLoading) {
						closeLoading();
					}

					// Render interlinear with unified verse format
					app.contentRenderer.renderChapterInterlinearUnified(
						currentBook.name,
						app.navigationManager.getCurrentChapter(),
						versesA,
						versesB,
						resolvedVersionA.source,
						resolvedVersionB.source,
						primaryVersionAbbr
					);
					return;
				} catch (error) {
					closeLoading(); // Make sure to close loading on error
					console.warn('Error rendering interlinear versions:', error);
					openToast('Error loading interlinear view: ' + error.message);
					app.configManager.setValue('interlinearMode', false);
					updateInterlinearMenuText();
				}
			}
		}

		// Resolve the version source to get proper properties
		const resolvedVersion = await app.versionManager.resolveVersionSource(version);

		// Normal single-version rendering
		if (resolvedVersion.source === 'db') {
			const verses = await app.databaseManager.loadChapter(
				currentBook.id,
				app.navigationManager.getCurrentChapter(),
				resolvedVersion.tableVerses
			);
			app.contentRenderer.renderChapterFromDB(
				currentBook.name,
				app.navigationManager.getCurrentChapter(),
				verses
			);
		} else if (resolvedVersion.source === 'api') {
			const content = await app.apiClient.fetchChapter(
				resolvedVersion,
				currentBook.apiId,
				app.navigationManager.getCurrentChapter()
			);

			app.contentRenderer.renderChapterFromAPI(
				currentBook.name,
				app.navigationManager.getCurrentChapter(),
				content
			);
		}
	} catch (error) {
		console.error('Error loading chapter:', error);
		app.contentRenderer.renderError('Error loading chapter: ' + error.message);
	}
}

function updateDisplay() {
	const chapterButton = document.getElementById(UI.CHAPTERSELECT);
	const versionButton = document.getElementById(UI.VERSIONBUTTON);

	const books = app.versionManager.getBooks();
	if (books.length === 0) {
		return;
	}

	const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());

	// Use standard abbreviation from book ID instead of book.abbreviation
	const bookDisplay = currentBook 
		? (BOOK_ABBREVIATIONS[currentBook.id] || currentBook.abbreviation)
		: app.navigationManager.getCurrentBook();

	chapterButton.textContent = bookDisplay + ' ' + app.navigationManager.getCurrentChapter();

	// Update version button to show interlinear mode
	const isInterlinear = app.configManager.getValue('interlinearMode');
	if (isInterlinear) {
		const primaryVersion = app.configManager.getValue('interlinearPrimaryVersion') || 'BSB';
		versionButton.textContent = `${primaryVersion}/ABT`;
	} else {
		versionButton.textContent = app.navigationManager.getCurrentVersion();
	}
}

/*** Chapter Selector ***/

function showChapterSelector() {
	const books = app.versionManager.getBooks();

	if (books.length === 0) {
		return;
	}

	// const modal = document.getElementById('chapterModal');
	// const title = document.getElementById('selectorTitle');
	const content = document.getElementById('selectorContent');

	content.innerHTML = '';

	books.forEach(book => {
		const bookButton = document.createElement('button');
		bookButton.id = 'book-' + book.id;
		bookButton.textContent = book.name;

		bookButton.classList.add('book-panel');
		if (book.id === app.navigationManager.getCurrentBook()) {
			bookButton.classList.add('active');
		}

		const chapterContainer = document.createElement('div');
		chapterContainer.id = 'chapters-' + book.id;
		chapterContainer.classList.add('chapter-box');
		// Store if this should be open initially
		chapterContainer.dataset.isOpen = 'false';

		bookButton.onclick = () => {
			toggleChapterList(book, bookButton, chapterContainer);
		};

		const chapterGrid = document.createElement('div');
		chapterGrid.classList.add('chapter-grid');

		for (let i = 1; i <= book.chapters; i++) {
			const chapterButton = document.createElement('button');
			chapterButton.textContent = i;
			chapterButton.classList.add('book-chapter-button');
			if (book.id === app.navigationManager.getCurrentBook() && i === app.navigationManager.getCurrentChapter()) {
				chapterButton.classList.add('current');
			}

			chapterButton.onclick = (e) => {
				e.stopPropagation();
				selectChapter(book.id, i);
			};

			chapterGrid.appendChild(chapterButton);
		}

		chapterContainer.appendChild(chapterGrid);
		content.appendChild(bookButton);
		content.appendChild(chapterContainer);

		// Open current book's chapters after a brief delay
		if (book.id === app.navigationManager.getCurrentBook()) {
			const rows = Math.ceil(book.chapters / 5);
			const gridHeight = rows * 65 + 50;
			chapterContainer.style.maxHeight = gridHeight + 'px';
			chapterContainer.classList.add('open');
			chapterContainer.dataset.isOpen = 'true';

			setTimeout(() => {
				bookButton.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 100);
		}
	});

	app.modalManager.show(MODAL.CHAPTER);
}

function toggleChapterList(book, bookButton, chapterContainer) {
	const isCurrentlyOpen = chapterContainer.dataset.isOpen === 'true';

	// Reset all book buttons to their default state
	const allBookButtons = document.querySelectorAll('[id^="book-"]');
	const currentBook = app.navigationManager.getCurrentBook();
	allBookButtons.forEach(btn => {
		const bookId = parseInt(btn.id.replace('book-', ''));
		if (bookId !== currentBook) {
			btn.classList.remove('active');
		}
	});

	// Close all other chapter containers
	const allChapterContainers = document.querySelectorAll('[id^="chapters-"]');
	allChapterContainers.forEach(container => {
		if (container !== chapterContainer) {
			container.classList.remove('open');
			container.dataset.isOpen = 'false';
		}
	});

	if (isCurrentlyOpen) {
		// Close this container
		chapterContainer.classList.remove('open');
		chapterContainer.dataset.isOpen = 'false';
	} else {
		// Open this container
		setTimeout(() => {
			chapterContainer.classList.add('open');
			chapterContainer.dataset.isOpen = 'true';

			// Highlight the opened book button if not current book
			if (book.id !== app.navigationManager.getCurrentBook()) {
				bookButton.classList.add('active');
			}

			// Wait for the open animation to start, then scroll
			setTimeout(() => {
				const selectorContent = document.getElementById('selectorContent');
				const containerRect = selectorContent.getBoundingClientRect();
				const buttonRect = bookButton.getBoundingClientRect();
				const scrollOffset = buttonRect.top - containerRect.top + selectorContent.scrollTop;

				selectorContent.scrollTo({
					top: scrollOffset,
					behavior: 'smooth'
				});
			}, 100);
		}, 50);
	}
}

function showChapterSelector() {
	const books = app.versionManager.getBooks();

	if (books.length === 0) {
		return;
	}

	const content = document.getElementById('selectorContent');

	content.innerHTML = '';

	books.forEach(book => {
		const bookButton = document.createElement('button');
		bookButton.id = 'book-' + book.id;
		bookButton.textContent = book.name;

		bookButton.classList.add('book-panel');
		if (book.id === app.navigationManager.getCurrentBook()) {
			bookButton.classList.add('active');
		}

		const chapterContainer = document.createElement('div');
		chapterContainer.id = 'chapters-' + book.id;
		chapterContainer.classList.add('chapter-box');
		chapterContainer.dataset.isOpen = 'false';

		bookButton.onclick = () => {
			toggleChapterList(book, bookButton, chapterContainer);
		};

		const chapterGrid = document.createElement('div');
		chapterGrid.classList.add('chapter-grid');

		for (let i = 1; i <= book.chapters; i++) {
			const chapterButton = document.createElement('button');
			chapterButton.textContent = i;
			chapterButton.classList.add('book-chapter-button');
			if (book.id === app.navigationManager.getCurrentBook() && i === app.navigationManager.getCurrentChapter()) {
				chapterButton.classList.add('current');
			}

			chapterButton.onclick = (e) => {
				e.stopPropagation();
				selectChapter(book.id, i);
			};

			chapterGrid.appendChild(chapterButton);
		}

		chapterContainer.appendChild(chapterGrid);
		content.appendChild(bookButton);
		content.appendChild(chapterContainer);

		// Open current book's chapters
		if (book.id === app.navigationManager.getCurrentBook()) {
			chapterContainer.classList.add('open');
			chapterContainer.dataset.isOpen = 'true';

			setTimeout(() => {
				bookButton.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 100);
		}
	});

	app.modalManager.show(MODAL.CHAPTER);
}

function selectChapter(bookId, chapter) {
	app.navigationManager.navigateToChapter(bookId, chapter);
	updateDisplay();
	animateContentTransition('right');
	closeModal(MODAL.CHAPTER);
}

/*** Version Selector ***/

async function showVersionSelector() {
	// console.log('showVersionSelector()');
	if (app.configManager.getValue('interlinearMode')) {
		document.getElementById('versionInterlinearButton').classList.add(CLASS.SELECTED);
	} else {
		document.getElementById('versionInterlinearButton').classList.remove(CLASS.SELECTED);
	}

	// Check if both required versions are available
	const primaryVersionAbbr = app.configManager.getValue('interlinearPrimaryVersion') || 'BSB';
	const versionList = await getAvailableVersions();
	const hasPrimary = versionList.some(v => v.abbreviation === primaryVersionAbbr);
	const hasABT = versionList.some(v => v.abbreviation === 'ABT');
	const interlinearAvailable = hasPrimary && hasABT;

	// Update interlinear button text
	const interlinearText = document.getElementById('interlinearVersionText');
	if (interlinearText) {
		interlinearText.textContent = `Compare ${primaryVersionAbbr} with ABT`;
	}

	// Show/hide interlinear button based on availability
	const interlinearButton = document.getElementById('versionInterlinearButton');
	if (interlinearButton) {
		if (interlinearAvailable) {
			interlinearButton.classList.remove(CLASS.HIDDEN);
		} else {
			interlinearButton.classList.add(CLASS.HIDDEN);
		}
	}

	// Render version list
	const versionItems = versionList.map(item => ({
		selected: ((!app.configManager.getValue('interlinearMode') && item.abbreviation === app.navigationManager.getCurrentVersion()) ? CLASS.SELECTED : ''),
		abbreviation: item.abbreviation,
		languageCode: item.languageCode.toUpperCase(),
		name: item.name,
		hidden: (item.hasLocalCopy ? '' : CLASS.HIDDEN)  // Show LOCAL badge if DB exists
	}));

	Template.render('versionTemplate', 'versionList', versionItems);

	app.modalManager.show(MODAL.VERSION);
}

async function selectVersion(element) {
	const versionAbbr = element.getAttribute('data-abbreviation');
	if (versionAbbr === app.navigationManager.getCurrentVersion() && !app.configManager.getValue('interlinearMode')) {
		closeModal(MODAL.VERSION);
		return;
	}

	// Disable interlinear mode when switching versions
	if (app.configManager.getValue('interlinearMode')) {
		app.configManager.setValue('interlinearMode', false);
		updateInterlinearMenuText();
	}

	const version = app.versionManager.getVersion(versionAbbr);
	if (!version) {
		console.error('Version not found:', versionAbbr);
		return;
	}
	const isApi = (version.source === 'api');

	closeModal(MODAL.VERSION);

	if (isApi) loading('Loading ' + version.name + '...');

	const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());
	const result = await app.versionManager.switchVersionSafely(
		version,
		app.navigationManager.getCurrentBook(),
		app.navigationManager.getCurrentChapter(),
		currentBook ? currentBook.name : null
	);

	if (result.success) {
		app.navigationManager.setPosition(result.bookId, result.chapter);
		app.navigationManager.setCurrentVersion(version.abbreviation);
		app.navigationManager.saveSettings();

		if (result.notification) {
			app.navigationManager.showNotification(result.notification);
		}

		updateDisplay();
		animateContentTransition('right');
		await loadChapterContent(version);
		if (isApi) closeLoading();
	} else {
		if (isApi) closeLoading();
		app.modalManager.showError(
			'Failed to load ' + version.name + ': ' + result.error + '<br><br>Reverting to KJV.',
			() => {
				app.navigationManager.setCurrentVersion('KJV');
				app.navigationManager.saveSettings();
				updateDisplay();
				animateContentTransition('right');
				loadCurrentChapter();
			}
		);
	}
}

/*** Search Functions ***/

function showSearch() {
	const input = document.getElementById(UI.SEARCHINPUT);
	input.value = '';
	app.searchManager.showPlaceholder();
	app.modalManager.show(MODAL.SEARCH, UI.SEARCHINPUT);
}

async function executeSearch() {
	const input = document.getElementById(UI.SEARCHINPUT);
	const searchTerm = input.value.trim();

	const version = app.versionManager.getVersion(app.navigationManager.getCurrentVersion());
	if (!version) {
		app.searchManager.showError('Version not found');
		return;
	}
	const resolvedVersion = await app.versionManager.resolveVersionSource(version);
	const result = await app.searchManager.executeSearch(searchTerm, resolvedVersion);
	// console.dir(result);

	if (!result || result.error) {
		app.navigationManager.showNotification(result.error);
	} else if (result.success) {
		if (result.results.length === 0) {
			app.searchManager.showError('No verses match your search');
		} else {
			app.searchManager.renderResults(result.results, result.searchTerm, version.source);
		}
	}
}

// Global function for search result clicks
app.handleSearchResultClick = function(bookAbbr, chapter, verse) {
	// Disable interlinear mode when navigating from search
	if (app.configManager.getValue('interlinearMode')) {
		app.configManager.setValue('interlinearMode', false);
		updateInterlinearMenuText();
	}

	const verseNum = app.navigationManager.navigateToSearchResult(bookAbbr, chapter, verse);
	const chapterButton = document.getElementById(UI.CHAPTERSELECT);
	const currentBook = app.versionManager.findBookById(app.navigationManager.getCurrentBook());
	const bookDisplay = currentBook ? currentBook.abbreviation : app.navigationManager.getCurrentBook();
	chapterButton.textContent = bookDisplay + ' ' + app.navigationManager.getCurrentChapter();

	// Update version button to reflect single version mode
	updateDisplay();
	animateContentTransition('right');

	closeModal(MODAL.SEARCH);

	if (verseNum) {
		setTimeout(() => {
			app.contentRenderer.scrollToVerse(verseNum);
		}, APP.TIMEOUT);
	}
};

/*** Modal ***/

function closeModal(tag) {
	app.modalManager.hide(tag);
}

/*** Menu Functions ***/

function showConfigure() {
	closeModal(MODAL.MENU);
	app.configManager.render();
	app.modalManager.show(MODAL.CONFIG);
}

async function showDownload() {
	closeModal(MODAL.MENU);
	app.modalManager.show(MODAL.DOWNLOAD);
	let bibleVersions = [];
	const versions = await getAvailableVersions();

	loading('Loading Bible versions...');

	try {
		bibleVersions = await HTTPClient.getJSON(APP.BIBLE_APP_URL + APP.BIBLE_VERSIONS_FILE);
	} catch (error) {
		console.log(`Failed to load Bible versions: (${APP.BIBLE_APP_URL + APP.BIBLE_VERSIONS_FILE}) ${error.name}/${error.message}/${error.code} : stack(${error.stack})`);
		bibleVersions = [];
	} finally {
		closeLoading();
		if (bibleVersions.length > 0) {
			// Create a Set of versions that have LOCAL DATABASE copies
			const localVersions = new Set(
				versions
					.filter(v => v.hasLocalCopy === true)
					.map(v => v.abbreviation)
			);

			// Prepare data for template
			const templateData = bibleVersions.map(item => ({
				code: item.code,
				name: item.name,
				exists: localVersions.has(item.code),
				hidden: localVersions.has(item.code) ? '' : CLASS.HIDDEN
			}));

			document.getElementById('downloadVersionHeader').innerText = 'Select a version to download for offline reading:';
			Template.render('downloadVersionTemplate', 'downloadVersionList', templateData);
		} else {
			document.getElementById('downloadVersionHeader').innerText = 'Unable to load the offline versions list.';
			document.getElementById('downloadVersionList').classList.add(CLASS.HIDDEN);
		}
	}
}

async function loadOfflineVersion(code) {
	try {
		const versions = await getAvailableVersions();
		const version = versions.find(item => item.abbreviation === code);

		// Check if it actually has a local DB copy (not just API availability)
		if (version && version.hasLocalCopy === true) {
			alert(`The selected version (${code}) has already been downloaded.`);
			return;
		}

		loading('Preparing download...');

		await app.downloadManager.downloadAndInstallBible(APP.BIBLE_APP_URL, code, (message, progress) => {
			// Update loading message with progress
			const e = document.getElementById('lmsg');
			if (e) {
				e.textContent = `${message} (${Math.round(progress)}%)`;
			}
		});

		closeLoading();

		// Show success message
		openToast(`${code} Bible installed successfully!`);

		// Reload app to show Bible in version selector
		await loadBooksAndChapter();

		// Refresh the download modal to show updated status
		await showDownload();

	} catch (error) {
		closeLoading();
		alert(`Failed to download ${code}: ` + error.message);
	}
}

async function handleDownloadItemClick(code, isDownloaded) {
	if (isDownloaded) {
		// Show confirmation dialog
		if (confirm(`Delete ${code} from local storage?\n\nThis will remove the offline version and cannot be undone.`)) {
			closeModal(MODAL.DOWNLOAD);
			loading(`Deleting ${code}...`);

			try {
				const result = await app.downloadManager.deleteVersion(code);
				closeLoading();

				if (result.switchedToKJV) {
					openToast(`${code} deleted. Switched to KJV.`);
				} else {
					openToast(`${code} deleted successfully.`);
				}

				// Refresh the download modal to show updated status
				await showDownload();
			} catch (error) {
				closeLoading();
				alert(`Failed to delete ${code}: ${error.message}`);
			}
		}
	} else {
		// Existing download logic
		await loadOfflineVersion(code);
	}
}

function showContact() {
	closeModal(MODAL.MENU);
	app.modalManager.show(MODAL.CONTACT);
}

async function sendContactMessage() {
	const contactType = document.querySelector('input[name="contactType"]:checked');
	const message = document.getElementById('contactComments').value;

	// Validation
	if (!contactType) {
		openToast('Please select a contact type');
		return;
	}

	if (!message || !message.trim()) {
		openToast('Please enter a message');
		return;
	}

	loading('Sending message...');

	try {
		// Submit to BOTH services in parallel
		await Promise.all([
			submitToGoogleForms(APP.GOOGLE_CONTACT_FORM_URL, {
				[APP.GOOGLE_FORM_FIELD_CONTACT_TYPE]: contactType.value,
				[APP.GOOGLE_FORM_FIELD_CONTACT_MESSAGE]: message.trim()
			}),
			submitToFormSubmit(APP.CONTACT_ENDPOINT, `${APP.CONTACT_SUBJECT} - ${contactType.value}`, {
				contact_type: contactType.value,
				message: message.trim()
			})
		]);

		closeLoading();
		closeModal(MODAL.CONTACT);
		openToast('Message sent successfully! Thank you.');
		
		// Clear form
		document.getElementById('contactComments').value = '';
		document.querySelectorAll('input[name="contactType"]').forEach(radio => {
			radio.checked = radio.id === 'comment'; // Reset to default
		});
	} catch (error) {
		closeLoading();
		console.error('Contact form submission failed:', error);

		// Fallback to email
		const emailFallback = confirm(
			'Could not send message online.\n\n' +
			'Would you like to open your email client to send it manually?'
		);

		if (emailFallback) {
			const subject = encodeURIComponent(`${APP.CONTACT_SUBJECT} - ${contactType.value}`);
			const body = encodeURIComponent(
				`Contact Type: ${contactType.value}\n\n` +
				`Message:\n${message.trim()}`
			);
			window.location.href = `mailto:your-email@example.com?subject=${subject}&body=${body}`;
			openToast('Opening email client...');
		} else {
			openToast('Message not sent. Your text has been preserved.');
		}
	}
}

async function submitToGoogleForms(formUrl, fieldMappings) {
	const formData = new FormData();
	
	// Add all field mappings
	Object.entries(fieldMappings).forEach(([fieldId, value]) => {
		formData.append(fieldId, value);
	});

	// Note: no-cors means we can't verify, but Google receives it
	await fetch(formUrl, {
		method: 'POST',
		body: formData,
		mode: 'no-cors'
	});
}

async function submitToFormSubmit(endpoint, subject, fieldMappings) {
	const formData = new FormData();
	formData.append('_subject', subject);
	formData.append('_template', 'box');
	formData.append('_captcha', 'false');
	
	// Add all field mappings
	Object.entries(fieldMappings).forEach(([fieldName, value]) => {
		formData.append(fieldName, value);
	});

	const response = await fetch(endpoint, {
		method: 'POST',
		body: formData,
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('FormSubmit failed');
	}
}

function showAbout() {
	closeModal(MODAL.MENU);
	showAboutModal(TEXT.ABOUT_TITLE, app.aboutMessage);
}

function showAboutModal(title, message) {
	const titleEl = document.getElementById('aboutTitle');
	const messageEl = document.getElementById('aboutMessage');

	if (titleEl) titleEl.textContent = title;
	if (messageEl) messageEl.innerHTML = message;

	app.modalManager.show(MODAL.ABOUT);
}

async function showVotD(reload = false) {
	closeModal(MODAL.MENU);

	// If not loaded yet, load it now (graceful fallback)
	if (!app.dailyVerse.today || reload) {
		loading('Retrieving verse of the day...');
		await loadVotD(reload);
		closeLoading();

		if (!app.dailyVerse.today) {
			openToast('Error retrieving the Verse of the Day.');
			return;
		}
	}

	// Display VotD
	const message = `<div class="votd-area">
		<p class="votd-text">${app.dailyVerse.text}</p>
		<p class="votd-reference">- ${app.dailyVerse.book} ${app.dailyVerse.chapter}:${app.dailyVerse.verse}</p>
		<p>
			<button onclick="votdGoToChapter('${app.dailyVerse.book}', '${app.dailyVerse.chapter}', '${app.dailyVerse.verse}')" class="votd-button">
				Go to Chapter
			</button>
		</p>
	</div>`;
	showAboutModal(TEXT.VOTD_TITLE, message);
}

function parseLBOHtml(htmlString, today) {
	let bodyContent = htmlString;

	// Extract ALL <b>...</b> references
	const refMatches = [...bodyContent.matchAll(/<b>\s*([^<]+?)\s*<\/b>/gi)];
	if (refMatches.length === 0) {
		throw new Error("No <b>Book Chapter:Verse</b> reference found.");
	}

	// Parse first reference for book and chapter
	const firstRef = refMatches[0][1].trim();
	const lastSpace = firstRef.lastIndexOf(" ");
	if (lastSpace === -1) {
		throw new Error("Reference format invalid: " + firstRef);
	}

	const book = firstRef.slice(0, lastSpace).trim();
	const chapVerse = firstRef.slice(lastSpace + 1).trim();
	const [chapter, firstVerse] = chapVerse.split(":");

	// Collect all verse numbers
	const verses = [parseInt(firstVerse)];
	for (let i = 1; i < refMatches.length; i++) {
		const ref = refMatches[i][1].trim();
		const verseNum = parseInt(ref.split(" ").pop());
		verses.push(verseNum);
	}

	// Determine verse format
	let verse;
	if (verses.length === 1) {
		verse = firstVerse;
	} else {
		// Check if consecutive
		const isConsecutive = verses.every((v, i) => i === 0 || v === verses[i - 1] + 1);
		if (isConsecutive) {
			verse = `${verses[0]}-${verses[verses.length - 1]}`;
		} else {
			verse = verses.join(',');
		}
	}

	// Extract text: remove all <b> tags and clean up
	let text = bodyContent.replace(/<b>[\s\S]*?<\/b>/gi, "");
	text = text.replace(/^[\s\n\r]+/, "").replace(/[\s\n\r]+$/, "");

	return {
		book,
		chapter,
		verse,
		text,
		today
	};
}

function votdGoToChapter(bookName, chapter, verse) {
	closeModal(MODAL.ABOUT);

	// get a list of books
	const books = app.versionManager.getBooks();
	if (books.length === 0) {
		// console.log('No books loaded');
		openToast('Unable to navigate to selected chapter. Books not loaded.');
		return;
	}
	// find the specific book
	const book = app.versionManager.findBookByName(bookName, books);
	if (!book) {
		// console.log('Book not found: ', bookName);
		openToast(`Book ${bookName} not found in current version.`);
		return;
	}
	// get the chapter number
	const chapterNum = parseInt(chapter);
	if (chapterNum < 1 || chapterNum > book.chapters) {
		// console.log(`Invalid chapter ${chapterNum} for ${book.name}`);
		openToast(`Invalid chapter ${chapterNum} for ${book.name}`);
		return;
	}
	// navigate to the book and chapter
	app.navigationManager.navigateToChapter(book.id, chapterNum);
	updateDisplay();
	animateContentTransition('right');
	// highlight the verse
	setTimeout(() => {
		app.contentRenderer.scrollToVerse(parseInt(verse));
	}, APP.TIMEOUT);
}

// Interlinear-related functions

function toggleInterlinearMode() {
	const currentValue = app.configManager.getValue('interlinearMode');
	app.configManager.setValue('interlinearMode', !currentValue);

	// Update menu text
	updateInterlinearMenuText();

	// Close menu
	closeModal(MODAL.MENU);

	// Reload chapter
	loadCurrentChapter();

	// Update display to reflect interlinear state
	updateDisplay();
}

function updateInterlinearMenuText() {
	const isEnabled = app.configManager.getValue('interlinearMode');
	const menuText = document.getElementById('interlinearMenuText');
	if (menuText) {
		menuText.textContent = isEnabled ? 'Disable Interlinear View' : 'Enable Interlinear View';
	}
} 

async function toggleInterlinearFromVersionSelector() {
	const currentValue = app.configManager.getValue('interlinearMode');

	if (!currentValue) {
		// Enabling interlinear - check if both versions exist in config
		const primaryVersionAbbr = app.configManager.getValue('interlinearPrimaryVersion') || 'BSB';
		const versionA = app.versionManager.getVersion(primaryVersionAbbr);
		const versionB = app.versionManager.getVersion('ABT');

		if (!versionB) {
			app.modalManager.showError('Interlinear mode requires ABT to be configured.');
			return;
		}

		if (!versionA) {
			// Fall back to BSB if configured version not found
			console.warn(`Configured version ${primaryVersionAbbr} not found, falling back to BSB`);
			app.configManager.setValue('interlinearPrimaryVersion', 'BSB');
			const fallbackVersion = app.versionManager.getVersion('BSB');

			if (!fallbackVersion) {
				app.modalManager.showError('Interlinear mode requires BSB or another configured version.');
				return;
			}
		}

		// Check if at least one source is available for each
		try {
			const versionToCheck = versionA || app.versionManager.getVersion('BSB');
			await app.versionManager.resolveVersionSource(versionToCheck);
			await app.versionManager.resolveVersionSource(versionB);
		} catch (error) {
			app.modalManager.showError('Error: One or both versions are not available.<br><br>' + error.message);
			return;
		}
	}

	app.configManager.setValue('interlinearMode', !currentValue);
	updateInterlinearMenuText();
	closeModal(MODAL.VERSION);

	// Reload chapter and update display
	loadCurrentChapter();
	updateDisplay();
	animateContentTransition('right');
}

// Long-click menu options

function showNoteEditor(fromList = false) {
	if (!app.selectedVerse) return;
	if (!fromList) {
		closeModal(MODAL.VERSEMENU);
	}

	app.noteDialogMode = 'note';

	const { bookId, chapter, verse } = app.selectedVerse;
	const currentBook = app.versionManager.findBookById(bookId);
	const reference = `${currentBook.name} ${chapter}:${verse}`;

	// Update UI for note mode
	document.getElementById('noteTitle').textContent = 'Verse Notes';
	document.getElementById('noteLabel').textContent = 'Commentary for';
	document.getElementById('noteReference').textContent = reference;
	const saveBtn = document.getElementById('noteSaveButton');
	saveBtn.innerText = 'Save Note';
	saveBtn.classList.remove('ion-paper-airplane');
	saveBtn.classList.add('ion-edit');
	const cancelBtn = document.getElementById('noteCancelButton');
	cancelBtn.innerText = 'Clear Note';
	cancelBtn.classList.remove('ion-close');
	cancelBtn.classList.add('ion-trash-a');
	document.getElementById('noteCopyButton').classList.remove('hidden');

	// Show/hide Copy button based on whether verse is in current view
	const copyBtn = document.getElementById('noteCopyButton');
	if (copyBtn) {
		if (fromList) {
			copyBtn.classList.add('hidden');
		} else {
			copyBtn.classList.remove('hidden');
		}
	}

	const existingNote = app.storageManager.getNote(bookId, chapter, verse);
	const textarea = document.getElementById('noteText');

	if (existingNote) {
		textarea.value = existingNote;
		textarea.placeholder = '';
	} else {
		textarea.value = '';
		textarea.placeholder = 'Enter your notes here...';
	}

	// Show/hide "Go to Verse" button based on whether we're editing from list
	const goToVerseBtn = document.getElementById('noteGoToVerseButton');
	if (goToVerseBtn) {
		if (fromList) {
			goToVerseBtn.classList.remove('hidden');
		} else {
			goToVerseBtn.classList.add('hidden');
		}
	}

	app.modalManager.show(MODAL.NOTE);
}

function showSuggestEdit() {
	if (!app.selectedVerse) return;
	closeModal(MODAL.VERSEMENU);

	app.noteDialogMode = 'suggestion';

	const { bookId, chapter, verse } = app.selectedVerse;
	const currentBook = app.versionManager.findBookById(bookId);
	const reference = `${currentBook.name} ${chapter}:${verse}`;

	// Update UI for suggestion mode
	document.getElementById('noteTitle').textContent = 'Suggest Verse Edit';
	document.getElementById('noteLabel').textContent = 'Suggestion for';
	document.getElementById('noteReference').textContent = reference;
	const saveBtn = document.getElementById('noteSaveButton');
	saveBtn.innerText = 'Send Suggestion';
	saveBtn.classList.remove('ion-edit');
	saveBtn.classList.add('ion-paper-airplane');
	const cancelBtn = document.getElementById('noteCancelButton');
	cancelBtn.innerText = 'Cancel';
	cancelBtn.classList.remove('ion-trash-a');
	cancelBtn.classList.add('ion-close');
	document.getElementById('noteCopyButton').classList.remove('hidden');

	const textarea = document.getElementById('noteText');
	textarea.value = '';
	textarea.placeholder = 'Enter your suggested edit here...';

	app.modalManager.show(MODAL.NOTE);
}

function noteGoToVerse() {
	if (!app.selectedVerse) return;

	const { bookId, chapter, verse } = app.selectedVerse;

	// Disable interlinear mode when navigating
	if (app.configManager.getValue('interlinearMode')) {
		app.configManager.setValue('interlinearMode', false);
		updateInterlinearMenuText();
	}

	// Close both modals
	closeModal(MODAL.NOTE);
	closeModal(MODAL.ALLNOTES);

	app.navigationManager.navigateToChapter(bookId, chapter);
	updateDisplay();
	animateContentTransition('right');

	setTimeout(() => {
		app.contentRenderer.scrollToVerse(verse);
	}, APP.TIMEOUT);
}

function editVerse() {
	if (!app.selectedVerse) return;

	const currentVersion = app.navigationManager.getCurrentVersion();
	if (currentVersion !== 'ABT') {
		openToast('Edit is only available for ABT version');
		return;
	}

	// console.log('Edit verse:', app.selectedVerse);
	openToast('Verse editor coming soon!');
	closeModal(MODAL.VERSEMENU);
}

// Bookmark functions

function showBookmark() {
	closeModal(MODAL.MENU);
	app.modalManager.show(MODAL.BOOKMARK);
	setBookmarkModalContent();
}

function setBookmarkModalContent() {
	const bookmark = app.storageManager.getBookmark();
	document.getElementById('bookmarkSavedVerse').innerText = (bookmark === null) ? 'None' : formatReference(bookmark);
}

function formatReference(obj) {
	return `${app.versionManager.findBookById(obj.bookId).name} ${obj.chapter}:${obj.verse}`;	
}

function bookmarkClear() {
	app.storageManager.clearBookmark();
	setBookmarkModalContent();
}

function bookmarkSet() {
	closeModal(MODAL.VERSEMENU);
	app.storageManager.setBookmark(app.selectedVerse.bookId, app.selectedVerse.chapter, app.selectedVerse.verse);
	setBookmarkModalContent();
	openToast('Bookmark Set');
}

function gotoBookmark() {
	closeModal(MODAL.BOOKMARK)
	closeModal(MODAL.MENU);
	const bookmark = app.storageManager.getBookmark();
	if (!bookmark) {
		openToast('No bookmark set.');
		return;
	}

	// Disable interlinear mode when navigating from bookmark
	if (app.configManager.getValue('interlinearMode')) {
		app.configManager.setValue('interlinearMode', false);
		updateInterlinearMenuText();
	}

	// Navigate to the bookmarked position
	app.navigationManager.navigateToChapter(bookmark.bookId, bookmark.chapter);
	updateDisplay();
	animateContentTransition('right');
	// Scroll to the verse after a short delay
	setTimeout(() => {
		app.contentRenderer.scrollToVerse(bookmark.verse);
	}, APP.TIMEOUT);
}

// Notes functions

async function noteSave() {
	if (!app.selectedVerse) return;

	const { bookId, chapter, verse } = app.selectedVerse;
	const text = document.getElementById('noteText').value;

	if (app.noteDialogMode === 'suggestion') {
		// Handle suggestion submission
		await sendSuggestion(bookId, chapter, verse, text);
		app.noteDialogMode = 'note';  // Reset mode after suggestion
	} else {
		// Handle note saving (existing logic)
		if (!text || !text.trim()) {
			app.storageManager.clearNote(bookId, chapter, verse);
			closeModal(MODAL.NOTE);
			openToast('Note cleared');
		} else {
			app.storageManager.setNote(bookId, chapter, verse, text);
			closeModal(MODAL.NOTE);
			openToast('Note saved successfully');
		}

		// Reload chapter to show/hide note icon
		loadCurrentChapter();

		// Scroll to the verse after reload completes
		setTimeout(() => {
			app.contentRenderer.scrollToVerse(verse);
		}, APP.TIMEOUT);
	}
}

function noteCancel() {
	if (!app.selectedVerse) return;

	if (app.noteDialogMode === 'suggestion') {
		// Just close for suggestions
		closeModal(MODAL.NOTE);
		return;
	}

	// For notes - confirm deletion
	const { bookId, chapter, verse } = app.selectedVerse;

	if (!confirm('Delete this note? This cannot be undone.')) {
		return;
	}

	app.storageManager.clearNote(bookId, chapter, verse);
	document.getElementById('noteText').value = '';
	closeModal(MODAL.NOTE);
	openToast('Note deleted');

	// Check if we're editing from the All Notes list
	const isFromAllNotesList = app.modalManager.isVisible(MODAL.ALLNOTES);

	if (isFromAllNotesList) {
		// Check if this note is from the currently viewed chapter
		const currentBookId = app.navigationManager.getCurrentBook();
		const currentChapter = app.navigationManager.getCurrentChapter();

		if (bookId === currentBookId && chapter === currentChapter) {
			// Reload the chapter to remove the note icon
			loadCurrentChapter();
		}

		// Refresh the All Notes list
		showAllNotes();
	} else {
		// Reload chapter to hide note icon
		loadCurrentChapter();

		// Scroll to the verse after reload completes
		setTimeout(() => {
			app.contentRenderer.scrollToVerse(verse);
		}, APP.TIMEOUT);
	}
}

function openNoteFromIcon(event, iconElement) {
	event.stopPropagation(); // Prevent verse long-press

	const verseEl = iconElement.closest('.verse');
	const bookId = parseInt(verseEl.getAttribute('data-book'));
	const chapter = parseInt(verseEl.getAttribute('data-chapter'));
	const verse = parseInt(verseEl.getAttribute('data-verse'));

	app.selectedVerse = { bookId, chapter, verse };
	showNoteEditor();
}

function showAllNotes() {
	closeModal(MODAL.MENU);

	const notes = app.storageManager.getNotes();
	const noteKeys = Object.keys(notes);

	if (noteKeys.length === 0) {
		document.getElementById('allNotesMessage').classList.remove(CLASS.HIDDEN);
		document.getElementById('allNotesResult').classList.add(CLASS.HIDDEN);
	} else {
		document.getElementById('allNotesMessage').classList.add(CLASS.HIDDEN);
		document.getElementById('allNotesResult').classList.remove(CLASS.HIDDEN);

		// Convert notes to template data
		const noteItems = noteKeys.map(key => {
			const [bookId, chapter, verse] = key.split('-').map(Number);
			const book = app.versionManager.findBookById(bookId);
			const bookName = book ? book.name : `Book ${bookId}`;

			return {
				key: key,
				reference: `${bookName} ${chapter}:${verse}`,
				text: notes[key]
			};
		});

		// Sort by reference (book, chapter, verse)
		noteItems.sort((a, b) => {
			const [aBook, aChap, aVerse] = a.key.split('-').map(Number);
			const [bBook, bChap, bVerse] = b.key.split('-').map(Number);

			if (aBook !== bBook) return aBook - bBook;
			if (aChap !== bChap) return aChap - bChap;
			return aVerse - bVerse;
		});

		Template.render('noteItemTemplate', 'allNotesList', noteItems);
	}

	app.modalManager.show(MODAL.ALLNOTES);
}

function editNoteFromList(key) {
	const [bookId, chapter, verse] = key.split('-').map(Number);

	app.selectedVerse = { bookId, chapter, verse };
	console.log('editNoteFromList: true');
	showNoteEditor(true);
}

async function copyVerseText() {
	if (!app.selectedVerse) return;

	const { bookId, chapter, verse } = app.selectedVerse;

	try {
		// Always get ABT version
		const abtVersion = app.versionManager.getVersion('ABT');
		if (!abtVersion) {
			openToast('ABT version not available');
			return;
		}

		// Resolve version source (DB or API)
		const resolvedVersion = await app.versionManager.resolveVersionSource(abtVersion);

		let verseText;

		if (resolvedVersion.source === 'db') {
			// Fetch from database
			const verseData = await app.databaseManager.loadVerse(
				bookId,
				chapter,
				verse,
				resolvedVersion.tableVerses
			);
			verseText = verseData ? verseData.text : null;
		} else {
			// Fetch from API
			const currentBook = app.versionManager.findBookById(bookId);

			// Get ABT book list to find correct apiId
			const abtBooks = await app.apiClient.fetchBookList(resolvedVersion);
			const abtBook = abtBooks.find(b => b.id === bookId);

			if (!abtBook) {
				throw new Error('Book not found in ABT');
			}

			const content = await app.apiClient.fetchChapter(
				resolvedVersion,
				abtBook.apiId,
				chapter
			);

			// Parse the API content to get verses
			const verses = app.contentRenderer.parseAPIContent(content, bookId, chapter);
			const verseData = verses.find(v => v.verse === verse);
			verseText = verseData ? verseData.text : null;
		}

		if (!verseText) {
			openToast('Could not find verse text');
			return;
		}

		// Replace textarea content
		document.getElementById('noteText').value = verseText;
		openToast('ABT verse text copied to editor');

	} catch (error) {
		console.error('Error fetching ABT verse:', error);
		openToast('Error loading verse text: ' + error.message);
	}
}

async function sendSuggestion(bookId, chapter, verse, suggestionText) {
	if (!suggestionText || !suggestionText.trim()) {
		openToast('Please enter a suggestion');
		return;
	}

	const currentBook = app.versionManager.findBookById(bookId);
	const reference = `${currentBook.name} ${chapter}:${verse}`;

	// Get current verse text
	const verseEl = document.querySelector(
		`.verse[data-book="${bookId}"][data-chapter="${chapter}"][data-verse="${verse}"]`
	);

	let currentVerseText = 'Could not retrieve current text';
	if (verseEl) {
		const verseClone = verseEl.cloneNode(true);
		const verseNumber = verseClone.querySelector('.verse-number');
		if (verseNumber) verseNumber.remove();
		const noteIcon = verseClone.querySelector('.note-icon');
		if (noteIcon) noteIcon.remove();
		currentVerseText = verseClone.textContent.trim().replace(/^\s+/, '');
	}

	loading('Sending suggestion...');

	try {
		// Submit to BOTH services in parallel
		await Promise.all([
			submitToGoogleForms(APP.GOOGLE_FORM_URL, {
				[APP.GOOGLE_FORM_FIELD_REFERENCE]: reference,
				[APP.GOOGLE_FORM_FIELD_CURRENT]: currentVerseText,
				[APP.GOOGLE_FORM_FIELD_SUGGESTION]: suggestionText.trim()
			}),
			submitToFormSubmit(APP.SUGGESTION_ENDPOINT, `${APP.SUGGESTION_SUBJECT} - ${reference}`, {
				reference: reference,
				current_text: currentVerseText,
				suggestion: suggestionText.trim()
			})
		]);

		closeLoading();
		closeModal(MODAL.NOTE);
		openToast('Suggestion sent successfully! Thank you.');
		document.getElementById('noteText').value = '';
	} catch (error) {
		closeLoading();
		console.error('Suggestion submission failed:', error);

		// Fallback to email
		const emailFallback = confirm(
			'Could not send suggestion online.\n\n' +
			'Would you like to open your email client to send it manually?'
		);

		if (emailFallback) {
			const subject = encodeURIComponent(`${APP.SUGGESTION_SUBJECT} - ${reference}`);
			const body = encodeURIComponent(
				`Reference: ${reference}\n\n` +
				`Current Text:\n${currentVerseText}\n\n` +
				`Suggested Edit:\n${suggestionText.trim()}`
			);
			window.location.href = `mailto:your-email@example.com?subject=${subject}&body=${body}`;
			openToast('Opening email client...');
		} else {
			openToast('Suggestion not sent. Your text has been preserved.');
		}
	}
}

// Reading Plan Functions

const getDayOfYear = (date) =>
	Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

// Enter Daily Reading Mode
function enterDailyReadingMode(day, readingIndex) {
	app.dailyReadingManager.enterDailyMode(day, readingIndex);
	app.readingModeActive = true;
	app.readingModeDay = day;

	updateHeaderForDailyMode(true);

	// Show exit button
	const exitBtn = document.getElementById('exitDailyReadingButton');
	if (exitBtn) exitBtn.classList.remove('hidden');

	// console.log(`Entering daily reading mode: day(${day}) idx(${readingIndex})`);
}

// Exit Daily Reading Mode
function exitDailyReadingMode() {
	app.dailyReadingManager.exitDailyMode();
	app.readingModeActive = false;
	app.readingModeDay = null;

	// Disable scroll detection
	app.contentRenderer.disableScrollDetection();

	updateHeaderForDailyMode(false);

	// Hide exit button
	const exitBtn = document.getElementById('exitDailyReadingButton');
	if (exitBtn) exitBtn.classList.add('hidden');

	closeModal(MODAL.READINGPLAN);
	// console.log('Exiting daily reading mode');
}

function updateHeaderForDailyMode(isActive) {
	const backButton = document.getElementById('dailyReadingBackButton');
	const title = document.getElementById('headerTitle');

	if (isActive) {
		backButton.classList.remove('hidden');
		title.textContent = 'Daily Reading';
	} else {
		backButton.classList.add('hidden');
		title.textContent = 'My Bible App';
	}
}

async function showReadingPlan() {
	closeModal(MODAL.MENU);

	// Check for year rollover FIRST
	const rolloverStats = app.dailyReadingManager.checkYearRollover();
	if (rolloverStats) {
		showYearRolloverMessage(rolloverStats);
		// Don't return - continue to show the reading plan modal
	}

	let planData = app.storageManager.getReadingPlan();
	if (!planData) {
		await loadReadingPlan();
		planData = app.storageManager.getReadingPlan();
		if (!planData) {
			openToast('Failed to load reading plan. Please try again later.');
			console.log('Failed to load plan data.');
			return;
		}
	}

	const today = new Date();
	const dayOfYear = getDayOfYear(today);

	// Determine which day to display
	const displayDay = app.readingModeActive ? app.readingModeDay : dayOfYear;
	const todaysReadings = planData[displayDay - 1];

	if (!todaysReadings) {
		openToast('No reading plan available for today.');
		return;
	}

	// Render day cards
	renderDayCards(displayDay, today);

	// Update header
	const dateStr = today.toLocaleDateString('en-US', { 
		weekday: 'long', 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	});

	const totalDays = app.dailyReadingManager.getDayCount();
	document.getElementById('readingPlanDoY').innerText = displayDay;
	document.getElementById('readingPlanTotal').innerText = totalDays;
	document.getElementById('readingPlanDate').innerText = dateStr;

	// Prepare template data - always create 5 slots
	const readings = [];
	for (let i = 0; i < 5; i++) {
		if (i < todaysReadings.length) {
			// Real reading
			readings.push({
				reference: expandReference(todaysReadings[i]),
				day: displayDay,
				index: i,
				state: app.dailyReadingManager.isComplete(displayDay, i) ? '' : '-blank',
				hidden: ''
			});
		} else {
			// Empty slot
			readings.push({
				reference: '',
				day: displayDay,
				index: i,
				state: '-blank',
				hidden: 'hidden'
			});
		}
	}

	// Render using template
	Template.render('readingPlanTemplate', 'readingPlanList', readings);

	// Update progress display
	updateProgressDisplay();

	app.modalManager.show(MODAL.READINGPLAN);

	// Scroll to current day WITHOUT animation on first open
	requestAnimationFrame(() => {
		const cardsContainer = document.getElementById('dailyReadingCards');

		// Temporarily disable smooth scrolling
		const originalBehavior = cardsContainer.style.scrollBehavior;
		cardsContainer.style.scrollBehavior = 'auto';

		// Scroll to position
		scrollToCurrentDay(displayDay, true);

		// Restore smooth scrolling for future interactions
		setTimeout(() => {
			cardsContainer.style.scrollBehavior = originalBehavior;
		}, 50);
	});
}

function toggleReadingComplete(el) {
	const state = el.getAttribute('data-state');
	const dayNum = parseInt(el.dataset.day);
	const readingIdx = parseInt(el.dataset.index);
	const newState = (state === '') ? '-blank' : '';
	el.dataset.state = newState;
	el.classList.remove(`ion-android-checkbox-outline${state}`);
	el.classList.add(`ion-android-checkbox-outline${newState}`);

	const isComplete = (newState === '') ? true : false;

	app.dailyReadingManager.markComplete(dayNum, readingIdx, isComplete);

	// Update progress display
	updateProgressDisplay();

	// Update day card checkmark
	const dayCard = document.querySelector(`.day-card[data-day="${dayNum}"]`);
	if (dayCard) {
		const existingCheckbox = dayCard.querySelector('.day-checkbox');

		if (app.dailyReadingManager.isDayComplete(dayNum)) {
			// Add checkmark if not present
			if (!existingCheckbox) {
				const checkbox = document.createElement('div');
				checkbox.className = 'day-checkbox';
				checkbox.innerHTML = '✓';
				dayCard.appendChild(checkbox);
			}
		} else {
			// Remove checkmark if present
			if (existingCheckbox) {
				existingCheckbox.remove();
			}
		}
	}

	// console.log('Toggled reading:' + JSON.stringify({ day: dayNum, index: readingIdx, complete: isComplete }));

	// Check if day is now complete
	if (isComplete && app.dailyReadingManager.isDayComplete(dayNum)) {
		showDayCompleteDialog(dayNum);
	}
}

function expandReference(ref) {
	const itemsArray = ref.split(' ');
	const book = app.versionManager.findBookByName(itemsArray[0]);
	let returnValue = ref;
	if (book) {
		returnValue = book.name + ' ' + itemsArray[1];
	}
	return returnValue;
}

function parseReadingReference(ref) {
	// Parse formats like:
	// "Gen 15" → { book: "Gen", chapter: 15, verseStart: null, verseEnd: null }
	// "Gal 4:1-19" → { book: "Gal", chapter: 4, verseStart: 1, verseEnd: 19 }
	// "Mrk 1:21-45" → { book: "Mrk", chapter: 1, verseStart: 21, verseEnd: 45 }

	const match = ref.match(/^([A-Za-z0-9\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
	if (!match) {
		console.error('Could not parse reading reference: ' + ref);
		return null;
	}

	return {
		book: match[1].trim(),
		chapter: parseInt(match[2]),
		verseStart: match[3] ? parseInt(match[3]) : null,
		verseEnd: match[4] ? parseInt(match[4]) : null
	};
}

function showYearRolloverMessage(stats) {
	const message = `
		<div class="align-center full-width">
			<p class="font18 text-bold margin-bottom">Congratulations!</p>
			<p class="font16 margin-bottom">
				You completed <strong class="text-blue-700 dark:text-yellow-300">${stats.completed}/${stats.total}</strong> 
				readings (<strong class="text-blue-700 dark:text-yellow-300">${stats.percentage}%</strong>) in <strong>${stats.year}</strong>!
			</p>
			<p class="font14 text-grey-600 dark:text-grey-400">
				Your progress has been reset for the new year. Keep up the great work!
			</p>
		</div>
	`;
	showAboutModal('Year Complete!', message);
}

function scrollToVerseAndDim(verseStart, verseEnd) {
	const verses = document.querySelectorAll('.verse[data-verse]');
	let hasPartialChapter = false;
	const transitionPoints = []; // Store indices where transitions occur
	let previousWasDimmed = null;

	verses.forEach((verseEl, index) => {
		const verseNum = parseInt(verseEl.getAttribute('data-verse'));

		if (verseEnd !== null) {
			const shouldDim = verseNum < verseStart || verseNum > verseEnd;

			if (shouldDim) {
				verseEl.classList.add('dimmed');
				hasPartialChapter = true;
			} else {
				verseEl.classList.remove('dimmed');
			}

			// Detect transitions
			if (previousWasDimmed !== null && previousWasDimmed !== shouldDim) {
				transitionPoints.push(index); // Transition happens at this verse
			}
			previousWasDimmed = shouldDim;
		}
	});

	// Add buttons if partial chapter
	if (hasPartialChapter) {
		// Remove any existing buttons first
		document.querySelectorAll('.view-full-chapter-btn').forEach(btn => btn.remove());

		// 1. Add button at the top (before first verse)
		if (verses.length > 0) {
			const topBtn = createViewFullChapterButton();
			verses[0].parentNode.insertBefore(topBtn, verses[0]);
		}

		// 2. Add buttons at transition points
		transitionPoints.forEach(index => {
			const transitionBtn = createViewFullChapterButton();
			verses[index].parentNode.insertBefore(transitionBtn, verses[index]);
		});

		// 3. Add button at the bottom (after last verse)
		if (verses.length > 0) {
			const bottomBtn = createViewFullChapterButton();
			const lastVerse = verses[verses.length - 1];
			lastVerse.parentNode.insertBefore(bottomBtn, lastVerse.nextSibling);
		}
	}

	// Scroll to starting verse
	app.contentRenderer.scrollToVerse(verseStart);
}

function createViewFullChapterButton() {
	const btn = document.createElement('button');
	// view-full-chapter-btn this selector is required to make the buttons disappear when pressed.
	btn.classList.add(
		'height-reset', 'margin-top', 'block-margin-auto', 'margin-bottom',
		'padding', 'blue', 'dark:blue-700', 'text-white', 'radius', 'font14',
		'view-full-chapter-btn'
	);
	btn.textContent = 'View Full Chapter';
	btn.onclick = viewFullChapter;
	return btn;
}

function viewFullChapter() {
	// Remove dimming from all verses
	const verses = document.querySelectorAll('.verse.dimmed');
	verses.forEach(v => v.classList.remove('dimmed'));

	// Remove ALL buttons (not just one)
	const buttons = document.querySelectorAll('.view-full-chapter-btn');
	buttons.forEach(btn => btn.remove());

	// Clear reading context
	app.currentReading = null;

	// Leave Daily Reading Mode
	exitDailyReadingMode();
}

function clearReadingPlan() {
	app.modalManager.clearReadingPlan();
	alert('Reading Plan Cache Cleared.');
}

async function loadDailyReading() {
	const reading = app.dailyReadingManager.getCurrentReading();
	if (!reading) {
		console.error('No current reading found');
		return;
	}

	const parsed = parseReadingReference(reading.reference);
	if (!parsed) {
		console.error('Could not parse reading:', reading.reference);
		return;
	}

	const books = app.versionManager.getBooks();
	const book = app.versionManager.findBookByName(parsed.book, books);

	if (!book) {
		openToast(`Book "${parsed.book}" not found`);
		return;
	}

	// Validate chapter
	if (parsed.chapter > book.chapters) {
		openToast(`${book.name} only has ${book.chapters} chapters`);
		return;
	}

	// Store reading context
	app.currentReading = {
		reference: reading.reference,
		day: reading.day,
		parsed: parsed,
		bookId: book.id
	};

	// Navigate to chapter
	app.navigationManager.setPosition(book.id, parsed.chapter);
	await loadCurrentChapter();
	updateDisplay();

	// Enable scroll detection for auto-completion
	app.contentRenderer.enableScrollDetection();

	// If verse range specified, scroll and dim
	if (parsed.verseStart !== null) {
		setTimeout(() => {
			scrollToVerseAndDim(parsed.verseStart, parsed.verseEnd);
		}, 500);

		// Show context toast
		const verseRange = parsed.verseEnd ? `${parsed.verseStart}-${parsed.verseEnd}` : parsed.verseStart;
		openToast(`Reading: ${book.name} ${parsed.chapter}:${verseRange} (Day ${reading.day})`);
	} else {
		// Full chapter reading
		openToast(`Reading: ${book.name} ${parsed.chapter} (Day ${reading.day})`);
	}
}

function navigateToReading(reference, day, index) {
	const dayNum = parseInt(day);
	const readingIdx = parseInt(index);

	enterDailyReadingMode(dayNum, readingIdx);

	closeModal(MODAL.READINGPLAN);

	loadDailyReading();
}

function handleDailyReadingPrevious() {
	if (app.dailyReadingManager.navigatePrevious()) {
		loadDailyReading();
		updateDisplay();
		animateContentTransition('left');
	} else {
		openToast('Already at first reading for this day');
	}
}

function handleDailyReadingNext() {
	if (app.dailyReadingManager.navigateNext()) {
		loadDailyReading();
		updateDisplay();
		animateContentTransition('right');
	} else {
		openToast('Already at last reading for this day');
	}
}

// Day Complete Dialog Handlers

function showDayCompleteDialog(dayNumber) {
	document.getElementById('completedDayNumber').textContent = dayNumber;
	app.modalManager.show(MODAL.DAYCOMPLETE);
}

function dayCompleteOK() {
	app.modalManager.hide(MODAL.DAYCOMPLETE);
	if (!app.modalManager.isVisible(MODAL.READINGPLAN)) {
		showReadingPlan();
	}
	// Stay in daily reading mode
}

function dayCompleteReturnToBible() {
	app.modalManager.hide(MODAL.DAYCOMPLETE);
	exitDailyReadingMode();
}

// Render day cards dynamically
function renderDayCards(selectedDay, todayDate) {
	const cardsContainer = document.getElementById('dailyReadingCards');
	cardsContainer.innerHTML = '';

	const totalDays = app.dailyReadingManager.getDayCount();
	const todayDayNum = getDayOfYear(todayDate);
	const year = app.dailyReadingManager.readingModeYear || new Date().getFullYear();

	// Create cards dynamically
	for (let day = 1; day <= totalDays; day++) {
		const card = document.createElement('div');
		card.className = 'day-card';
		card.setAttribute('data-day', day);
		card.onclick = () => selectDailyDay(day);

		// Add selected class
		if (day === selectedDay) {
			card.classList.add('selected');
		}

		// Add today class
		if (day === todayDayNum && year === new Date().getFullYear()) {
			card.classList.add('today');
		}

		// Day number
		const dayNumber = document.createElement('div');
		dayNumber.className = 'day-number';
		dayNumber.textContent = day;

		// Date label (e.g., "Jan 15")
		const date = getDayDate(day, year);
		const dayDate = document.createElement('div');
		dayDate.className = 'day-date';
		dayDate.textContent = date;

		// Checkmark if day complete
		if (app.dailyReadingManager.isDayComplete(day)) {
			const checkbox = document.createElement('div');
			checkbox.className = 'day-checkbox';
			checkbox.innerHTML = '✓';
			card.appendChild(checkbox);
		}

		card.appendChild(dayNumber);
		card.appendChild(dayDate);
		cardsContainer.appendChild(card);
	}
}

// Convert day number (1-366) to date string (e.g., "Jan 15")
function getDayDate(dayNum, year) {
	const date = new Date(year, 0); // January 1st
	date.setDate(dayNum);

	const month = date.toLocaleDateString('en-US', { month: 'short' });
	const day = date.getDate();

	return `${month} ${day}`;
}

// Scroll to selected/today's card
function scrollToCurrentDay(dayNum, immediate = false) {
	const cardsContainer = document.getElementById('dailyReadingCards');
	const selectedCard = cardsContainer.querySelector(`.day-card[data-day="${dayNum}"]`);

	if (selectedCard) {
		// Calculate scroll position to center the card
		const containerWidth = cardsContainer.offsetWidth;
		const cardLeft = selectedCard.offsetLeft;
		const cardWidth = selectedCard.offsetWidth;

		const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);

		if (immediate) {
			// Instant scroll (no animation)
			cardsContainer.scrollLeft = scrollPosition;
		} else {
			// Smooth scroll
			cardsContainer.scrollTo({
				left: scrollPosition,
				behavior: 'smooth'
			});
		}
	}
}

// Update progress display
function updateProgressDisplay() {
	const progress = app.dailyReadingManager.getProgress();
	const totalDays = app.dailyReadingManager.getDayCount();

	document.getElementById('progressCount').textContent = `${progress.completed}/${totalDays}`;
	document.getElementById('progressPercent').textContent = `${progress.percentage}%`;

	const progressBar = document.getElementById('progressBar');
	progressBar.style.width = `${progress.percentage}%`;
}

// Handle day card selection
function selectDailyDay(day) {
	const planData = app.storageManager.getReadingPlan();
	if (!planData || !planData[day - 1]) {
		openToast('No readings found for this day.');
		return;
	}

	const todaysReadings = planData[day - 1];
	const today = new Date();

	// Update header
	const dateStr = getDayDate(day, app.dailyReadingManager.readingModeYear || today.getFullYear());
	const totalDays = app.dailyReadingManager.getDayCount();

	document.getElementById('readingPlanDoY').innerText = day;
	document.getElementById('readingPlanTotal').innerText = totalDays;
	document.getElementById('readingPlanDate').innerText = dateStr;

	// Update readings list - always create 5 slots
	const readings = [];
	for (let i = 0; i < 5; i++) {
		if (i < todaysReadings.length) {
			// Real reading
			readings.push({
				reference: expandReference(todaysReadings[i]),
				day: day,
				index: i,
				state: app.dailyReadingManager.isComplete(day, i) ? '' : '-blank',
				hidden: ''
			});
		} else {
			// Empty slot
			readings.push({
				reference: '&nbsp;',
				day: day,
				index: i,
				state: '-blank',
				hidden: 'hidden'
			});
		}
	}

	Template.render('readingPlanTemplate', 'readingPlanList', readings);

	// Update card selection visually
	document.querySelectorAll('.day-card').forEach(card => {
		card.classList.remove('selected');
	});

	const selectedCard = document.querySelector(`.day-card[data-day="${day}"]`);
	if (selectedCard) {
		selectedCard.classList.add('selected');
		scrollToCurrentDay(day, false);
	}
}

// TESTING FUNCTIONS AREA
// REMOVE or comment out for public releases

// Show Log Modal functions
function showLog() {
	closeModal(MODAL.MENU);
	app.modalManager.show(MODAL.LOG);
	renderLogMessages();
}

function clearLogMessages() {
	app.logMessages = [];
	window.logList = [];
	renderLogMessages();
}

function renderLogMessages() {
	const logList = app.logMessages.map(p => ({
		type: p.type,
		message: p.message
	}));
	Template.render('logMessageTemplate', 'logMessageList', logList);
}

// Add this function temporarily for testing
//async function clearBookCache() {
	/* Clear cache for all versions */
	// const versionList = await getAvailableVersions();
	// for (let i = 0; i <= versionList.length; i++) {
	// 	const version = app.versionManager.getVersion(versionList[i].abbreviation);
	// 	app.versionManager.clearBookCache(version.abbreviation);
	// 	console.log(`Cleared cache for ${version.abbreviation}`);
	// }
	/* Clear cache for a specific version */
	// if (app.versionManager) {
	// 	const version = app.versionManager.getVersion('SBL');
	// 	app.versionManager.clearBookCache(version);
	// 	openToast('Book cache cleared.');
	// 	closeModal(MODAL.MENU);
	// }
// 	closeModal(MODAL.MENU);
// }

// function debugBookIds() {
// 	clearLogMessages();
// 	const books = app.versionManager.getBooks();
// 	const version = app.versionManager.getVersion(app.navigationManager.getCurrentVersion());

// 	console.log('\n=== BOOK ID DEBUG ===');
// 	console.log('Current Version:', version.abbreviation, '(' + version.source + ')');
// 	console.log('Total Books:', books.length);
// 	console.log('\nFirst 5 Books:');
// 	books.slice(0, 5).forEach(b => {
// 		console.log(`  id: ${b.id}, apiId: ${b.apiId}, name: ${b.name}, abbr: ${b.abbreviation}`);
// 	});
// 	console.log('\nSample NT Books (Matthew, Mark, Luke):');
// 	[40, 41, 42].forEach(id => {
// 		const book = books.find(b => b.id === id);
// 		if (book) {
// 			console.log(`  id: ${book.id}, apiId: ${book.apiId}, name: ${book.name}, abbr: ${book.abbreviation}`);
// 		} else {
// 			console.log(`  id: ${id} - NOT FOUND`);
// 		}
// 	});
// 	console.log('===================\n');
// 	renderLogMessages();
// }

// function showStorage() {
// 	closeModal(MODAL.MENU);
// 	renderStorageView();
//	showAboutModal('Local Storage Manager', '<div id="storageViewContainer"></div>');
// }

// function renderStorageView() {
// 	// Small delay to ensure modal content is in DOM
// 	setTimeout(() => {
// 		const container = document.getElementById('storageViewContainer');
// 		if (!container) return;

// 		let html = '';

// 		// Get all localStorage items
// 		const items = [];
// 		for (let i = 0; i < localStorage.length; i++) {
// 			const key = localStorage.key(i);
// 			const value = localStorage.getItem(key);
// 			items.push({ key, value });
// 		}

// 		// Sort items alphabetically by key
// 		items.sort((a, b) => a.key.localeCompare(b.key));

// 		if (items.length === 0) {
// 			html = '<div class="storage-empty">No items in local storage</div>';
// 		} else {
// 			// Add Delete All button
// 			html += '<button onclick="deleteAllStorage()" class="storage-delete-all-btn">Delete All Storage</button>';

// 			// Add storage container
// 			html += '<div class="storage-container">';

// 			items.forEach(item => {
// 				html += `
// 					<div class="storage-item">
// 						<div class="storage-key">${escapeHtml(item.key)}</div>
// 						<div class="storage-value">${escapeHtml((item.value.length <= 50) ? item.value : item.value.slice(0,50) + '...' )}</div>
// 						<button onclick="deleteStorageItem('${escapeHtml(item.key)}')" class="storage-delete-btn">Delete</button>
// 					</div>
// 				`;
// 			});

// 			html += '</div>';
// 		}

// 		container.innerHTML = html;
// 	}, 100);
// }

// function deleteStorageItem(key) {
// 	if (!confirm(`Delete storage item?\n\nKey: ${key}\n\nThis cannot be undone.`)) {
// 		return;
// 	}

// 	try {
// 		localStorage.removeItem(key);
// 		openToast(`Deleted: ${key}`);
// 		renderStorageView();
// 	} catch (error) {
// 		openToast(`Error deleting item: ${error.message}`);
// 	}
// }

// function deleteAllStorage() {
// 	if (!confirm('Delete ALL local storage items?\n\nThis will remove all app data including settings, bookmarks, notes, and cache.\n\nThis cannot be undone!')) {
// 		return;
// 	}

// 	// Second confirmation for safety
// 	if (!confirm('Are you absolutely sure?\n\nThis action is irreversible and will reset the entire app.')) {
// 		return;
// 	}

// 	try {
// 		localStorage.clear();
// 		openToast('All storage cleared');
// 		renderStorageView();
// 	} catch (error) {
// 		openToast(`Error clearing storage: ${error.message}`);
// 	}
// }

// function escapeHtml(text) {
// 	const div = document.createElement('div');
// 	div.textContent = text;
// 	return div.innerHTML;
// }

// END TESTING FUNCTIONS AREA

// Expose app globally for debugging and HTML onclick handlers
window.app = app;
