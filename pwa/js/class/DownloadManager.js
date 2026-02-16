// DownloadManager - Handles downloading and installing Bible versions

class DownloadManager {
	constructor(databaseManager, storageManager, versionManager) {
		this.databaseManager = databaseManager;
		this.storageManager = storageManager;
		this.versionManager = versionManager;
		this.downloadInProgress = false;
	}

	async downloadAndInstallBible(url, versionCode, progressCallback, expectedChecksum = null) {
		if (this.downloadInProgress) {
			throw new Error('Download already in progress');
		}

		this.downloadInProgress = true;

		try {
			// Step 1: Download ZIP file
			progressCallback(`Downloading ${versionCode}.zip...`, 0);

			// Detect environment
			const isPWA = !window.cordova;
			let zipBlob;

			if (isPWA) {
				// PWA: Use standard fetch
				const response = await fetch(url + versionCode + '.zip');
				if (!response.ok) {
					throw new Error(`Download failed: ${response.status}`);
				}
				zipBlob = await response.blob();
			} else {
				// Cordova: Use existing method
				zipBlob = await HTTPClient.getBlob(url + versionCode + '.zip');
			}

			// Verify size
			if (!zipBlob || zipBlob.size === 0) {
				throw new Error('Downloaded file is empty');
			}

			// Step 2: Verify checksum if provided
			if (expectedChecksum) {
				progressCallback('Verifying download...', 35);
				const checksum = await this.calculateCRC32(zipBlob);
				// console.log('Expected CRC: %s Calculated CRC: %s', expectedChecksum, checksum);

				if (checksum !== expectedChecksum.toLowerCase()) {
					throw new Error('Download corrupted: checksum mismatch');
				}
				// console.log('✓ Download verified');
			}

			progressCallback('Unzipping...', 40);

			// Step 3: Unzip in memory
			const zip = new JSZip();
			const unzipped = await zip.loadAsync(zipBlob);

			progressCallback('Reading files...', 60);

			// Step 4: Extract CSV contents
			const booksCSV = await unzipped.file(`${versionCode}_books.csv`).async('text');
			const versesCSV = await unzipped.file(`${versionCode}_verses.csv`).async('text');

			// console.log('Files extracted, importing to database...');
			progressCallback('Importing to database...', 75);

			// Step 5: Import to database
			await this.importToDatabase(versionCode, booksCSV, versesCSV, (message, percent) => {
				const progress = 75 + (percent * 0.25);
				progressCallback(message, progress);
			});

			progressCallback('Installation complete!', 100);

			this.downloadInProgress = false;
			return { success: true };

		} catch (error) {
			this.downloadInProgress = false;
			console.error('Download and install failed:', error);
			throw error;
		}
	}

	// Simple CRC32 implementation
	calculateCRC32(blob) {
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = function(e) {
				const data = new Uint8Array(e.target.result);
				let crc = 0xFFFFFFFF;

				for (let i = 0; i < data.length; i++) {
					crc = crc ^ data[i];
					for (let j = 0; j < 8; j++) {
						crc = (crc >>> 1) ^ (0xEDB88320 & -(crc & 1));
					}
				}

				const result = (crc ^ 0xFFFFFFFF) >>> 0;
				resolve(result.toString(16).padStart(8, '0'));
			};
			reader.readAsArrayBuffer(blob);
		});
	}

	async importToDatabase(versionCode, booksCSV, versesCSV, progressCallback) {
		// Open database if not already open
		if (!this.databaseManager.db) {
			await this.databaseManager.open();
		}

		// Create tables for this version
		await this.databaseManager.createTablesForVersion(versionCode);
		progressCallback('Tables created', 5);

		// Parse and import books
		const bookRows = this.databaseManager.parseCSV(booksCSV);
		await this.databaseManager.insertBooksForVersion(versionCode, bookRows.slice(1)); // Skip header
		progressCallback('Books imported', 20);

		// Parse and import verses
		const verseRows = this.databaseManager.parseCSV(versesCSV);
		await this.databaseManager.insertVersesForVersion(versionCode, verseRows.slice(1), progressCallback);

		// Mark this version as initialized
		this.storageManager.setVersionInitialized(versionCode, true);
	}

	async importVersesBatch(versionCode, rows, progressCallback) {
		return new Promise((resolve, reject) => {
			const batchSize = 100;
			let currentBatch = 0;
			const totalBatches = Math.ceil(rows.length / batchSize);

			const insertNextBatch = () => {
				const start = currentBatch * batchSize;
				const end = Math.min(start + batchSize, rows.length);

				if (start >= rows.length) {
					// console.log('All verses inserted');
					progressCallback('Verses imported', 100);
					resolve();
					return;
				}

				const percentage = Math.round((currentBatch / totalBatches) * 100);
				progressCallback(`Importing verses... ${percentage}%`, percentage);

				this.databaseManager.db.transaction(
					(tx) => {
						for (let i = start; i < end; i++) {
							const row = rows[i];
							tx.executeSql(
								`INSERT INTO ${versionCode}_verses (id, book_id, chapter, verse, text) VALUES (?, ?, ?, ?, ?);`,
								[row[0], row[1], row[2], row[3], row[4]]
							);
						}
					},
					(error) => {
						console.error('Error inserting batch:', error);
						currentBatch++;
						insertNextBatch();
					},
					() => {
						// console.log(`Batch ${currentBatch + 1} inserted`);
						currentBatch++;
						insertNextBatch();
					}
				);
			};

			insertNextBatch();
		});
	}

	async deleteVersion(abbreviation) {
		// Check if this is the current version
		const currentVersion = app.navigationManager.getCurrentVersion();
		const needsSwitch = (currentVersion === abbreviation);

		// Delete the database tables
		await this.databaseManager.deleteVersion(abbreviation);

		// If this was the current version, switch to KJV
		if (needsSwitch) {
			app.navigationManager.setCurrentVersion('KJV');
			app.navigationManager.saveSettings();

			// Reload books and chapter for KJV
			const kjvVersion = app.versionManager.getVersion('KJV');
			if (kjvVersion) {
				await app.versionManager.loadBooksForVersion(kjvVersion);
				await loadCurrentChapter();
			}
			updateDisplay();
		}

		return { success: true, switchedToKJV: needsSwitch };
	}
}