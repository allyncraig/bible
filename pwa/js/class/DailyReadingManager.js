class DailyReadingManager {
	constructor(storageManager, navigationManager) {
		this.storageManager = storageManager;
		this.navigationManager = navigationManager;
		this.readingPlan = [];              // Full 366-day plan
		this.completionState = [];          // Array of arrays [366][N]
		this.readingModeDay = null;         // Current day (1-366)
		this.readingModeYear = null;        // Current year (e.g., 2025)
		this.isActive = false;              // Daily mode active flag
		this.currentReadingIndex = null;    // Index in current day's readings
	}

	// Initialize: Load reading plan and completion state
	async initialize() {
		// Load reading plan from storage (already cached by loadReadingPlan)
		this.readingPlan = this.storageManager.getReadingPlan();

		if (!this.readingPlan || !Array.isArray(this.readingPlan) || this.readingPlan.length === 0) {
			console.warn('DailyReadingManager: No reading plan found, waiting for it to load...');
			this.readingPlan = [];
			// Don't initialize completion state yet - wait for reading plan to be loaded
			this.completionState = [];
			this.readingModeYear = new Date().getFullYear();
			return;
		}

		// Load completion state
		this.loadState();

		// Initialize completion state if empty
		if (this.completionState.length === 0) {
			this.initializeCompletionState();
		}

		// Set current year if not set
		if (!this.readingModeYear) {
			this.readingModeYear = new Date().getFullYear();
			this.saveState();
		}

		// console.dir({
		// 	message: 'DailyReadingManager initialized:',
		// 	planDays: this.readingPlan.length,
		// 	year: this.readingModeYear,
		// 	completions: this.completionState.length
		// });
	}

	ensureInitialized() {
		// Called when reading plan modal opens to ensure completion state is ready
		if (this.readingPlan.length > 0 && this.completionState.length === 0) {
			console.log('Late initializing completion state...');
			this.initializeCompletionState();

			if (!this.readingModeYear) {
				this.readingModeYear = new Date().getFullYear();
				this.saveState();
			}
		}
	}

	// Initialize empty completion state (all false)
	initializeCompletionState() {
		this.completionState = [];
		for (let i = 0; i < this.readingPlan.length; i++) {
			const dayReadings = this.readingPlan[i];
			const dayCompletions = new Array(dayReadings.length).fill(false);
			this.completionState.push(dayCompletions);
		}
		this.saveState();
	}

	// Enter daily reading mode
	enterDailyMode(day, readingIndex) {
		this.isActive = true;
		this.readingModeDay = day;
		this.currentReadingIndex = readingIndex;

		// console.dir({
		// 	message: 'Entered daily reading mode:',
		// 	day: day,
		// 	readingIndex: readingIndex
		// });
	}

	// Exit daily reading mode
	exitDailyMode() {
		this.isActive = false;
		this.readingModeDay = null;
		this.currentReadingIndex = null;

		// console.log('Exited daily reading mode');
	}

	// Get readings for a specific day
	getDayReadings(day) {
		if (day < 1 || day > this.readingPlan.length) {
			console.error('Invalid day number:', day);
			return [];
		}
		return this.readingPlan[day - 1] || [];
	}

	// Get current reading reference
	getCurrentReading() {
		if (!this.isActive || !this.readingModeDay) {
			return null;
		}

		const readings = this.getDayReadings(this.readingModeDay);
		if (this.currentReadingIndex < 0 || this.currentReadingIndex >= readings.length) {
			return null;
		}

		return {
			reference: readings[this.currentReadingIndex],
			day: this.readingModeDay,
			index: this.currentReadingIndex
		};
	}

	// Mark a reading as complete or incomplete
	markComplete(day, readingIndex, completed) {
		if (day < 1 || day > this.completionState.length) {
			console.error('Invalid day:', day);
			return;
		}

		const dayCompletions = this.completionState[day - 1];
		if (readingIndex < 0 || readingIndex >= dayCompletions.length) {
			console.error('Invalid reading index:', readingIndex);
			return;
		}

		dayCompletions[readingIndex] = completed;
		this.saveState();

		console.dir({
			message: 'Marked reading:',
			day: day,
			index: readingIndex,
			completed: completed
		});
	}

	// Check if a specific reading is complete
	isComplete(day, readingIndex) {
		if (day < 1 || day > this.completionState.length) {
			return false;
		}

		const dayCompletions = this.completionState[day - 1];
		if (readingIndex < 0 || readingIndex >= dayCompletions.length) {
			return false;
		}

		return dayCompletions[readingIndex] === true;
	}

	// Check if all readings for a day are complete
	isDayComplete(day) {
		if (day < 1 || day > this.completionState.length) {
			return false;
		}

		const dayCompletions = this.completionState[day - 1];
		return dayCompletions.every(completed => completed === true);
	}

	// Get overall progress statistics
	getProgress() {
		let completedDays = 0;
		const totalDays = this.completionState.length;

		for (let i = 0; i < totalDays; i++) {
			if (this.completionState[i].every(c => c === true)) {
				completedDays++;
			}
		}

		const percentage = totalDays > 0 ? (completedDays / totalDays * 100).toFixed(1) : 0;

		return {
			completed: completedDays,
			total: totalDays,
			percentage: percentage
		};
	}

	// Navigate to next reading in current day
	navigateNext() {
		if (!this.isActive || !this.readingModeDay) {
			return false;
		}

		const readings = this.getDayReadings(this.readingModeDay);
		if (this.currentReadingIndex < readings.length - 1) {
			this.currentReadingIndex++;
			return true;
		}

		return false; // Already at last reading
	}

	// Navigate to previous reading in current day
	navigatePrevious() {
		if (!this.isActive || !this.readingModeDay) {
			return false;
		}

		if (this.currentReadingIndex > 0) {
			this.currentReadingIndex--;
			return true;
		}

		return false; // Already at first reading
	}

	// Check if can navigate to next reading
	canNavigateNext() {
		if (!this.isActive || !this.readingModeDay) {
			return false;
		}

		const readings = this.getDayReadings(this.readingModeDay);
		return this.currentReadingIndex < readings.length - 1;
	}

	// Check if can navigate to previous reading
	canNavigatePrevious() {
		if (!this.isActive || !this.readingModeDay) {
			return false;
		}

		return this.currentReadingIndex > 0;
	}

	// Check for year rollover and reset if needed
	checkYearRollover() {
		const today = new Date();
		const currentYear = today.getFullYear();

		// Get last opened date
		const lastOpened = this.storageManager.get('dailyReadingLastOpened');
		let lastOpenedYear = null;

		if (lastOpened) {
			const lastDate = new Date(lastOpened);
			lastOpenedYear = lastDate.getFullYear();
		}

		// Update last opened date
		this.storageManager.set('dailyReadingLastOpened', today.toISOString());

		// Check if year has changed since last open
		if (lastOpenedYear && currentYear > lastOpenedYear) {
			// Get progress before resetting
			const progress = this.getProgress();

			console.dir({
				message: 'Year rollover detected:',
				lastYear: this.readingModeYear,
				newYear: currentYear,
				progress: progress
			});

			// Return stats for congratulations message
			const stats = {
				year: this.readingModeYear,
				completed: progress.completed,
				total: progress.total,
				percentage: progress.percentage
			};

			// Reset for new year
			this.resetCompletions();
			this.readingModeYear = currentYear;
			this.saveState();

			return stats;
		}

		return null; // No rollover
	}

	// Reset all completions
	resetCompletions() {
		this.initializeCompletionState();
		// console.log('All completions reset');
	}

	// Save state to localStorage
	saveState() {
		this.storageManager.setDailyReadingProgress(
			this.readingModeYear,
			this.completionState
		);
	}

	// Load state from localStorage
	loadState() {
		const saved = this.storageManager.getDailyReadingProgress();

		if (saved && saved.completions) {
			this.readingModeYear = saved.year;
			this.completionState = saved.completions;

			// console.dir({
			// 	message: 'Loaded completion state:',
			// 	year: this.readingModeYear,
			// 	days: this.completionState.length
			// });
		} else {
			// console.log('No saved completion state found');
			this.completionState = [];
			this.readingModeYear = new Date().getFullYear();
		}
	}

	getDayCount() {
		const year = this.readingModeYear || new Date().getFullYear();
		// Check if leap year
		const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
		return isLeapYear ? 366 : 365;
	}
}
