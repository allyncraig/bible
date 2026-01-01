// DatabaseManager - Handles all SQLite database operations

class DatabaseManager {
	constructor(dbFileName, storageManager) {
		this.dbFileName = dbFileName;
		this.storageManager = storageManager;
		this.db = null;
	}

	isAvailable() {
		return !!(window.cordova && window.sqlitePlugin);
	}

	async verifyDatabaseHasData(versionCode = null) {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				resolve(false);
				return;
			}

			// If no specific version, check if ANY version exists
			if (!versionCode) {
				// Try to get list of tables
				this.db.executeSql(
					"SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_books';",
					[],
					(rs) => {
						const hasData = rs.rows.length > 0;
						// console.log(`Database verification: found ${rs.rows.length} version tables`);
						resolve(hasData);
					},
					(error) => {
						console.log(`Database verification failed: ${error.message}`);
						resolve(false);
					}
				);
			} else {
				// Check specific version
				this.db.executeSql(
					`SELECT COUNT(*) as count FROM ${versionCode}_books;`,
					[],
					(rs) => {
						const count = rs.rows.item(0).count;
						// console.log(`Database verification for ${versionCode}: found ${count} books`);
						resolve(count > 0);
					},
					(error) => {
						console.log(`Database verification for ${versionCode} failed: ${error.message}`);
						resolve(false);
					}
				);
			}
		});
	}

	async getAvailableVersions() {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				resolve([]);
				return;
			}

			this.db.executeSql(
				"SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_books';",
				[],
				(rs) => {
					const versions = [];
					for (let i = 0; i < rs.rows.length; i++) {
						const tableName = rs.rows.item(i).name;
						// Extract version code from table name (e.g., "BSB_books" -> "BSB")
						const versionCode = tableName.replace('_books', '');
						versions.push(versionCode);
					}
					// console.log('Available DB versions: ' + versions.join(' '));
					resolve(versions);
				},
				(error) => {
					console.error('Error getting available versions');
					console.dir(error);
					resolve([]);
				}
			);
		});
	}

	open() {
		return new Promise((resolve, reject) => {
			this.db = window.sqlitePlugin.openDatabase({
				name: this.dbFileName,
				location: 'default'
			}, () => {
				// console.log('Database opened successfully');
				resolve(true);
			}, (error) => {
				console.error('Error opening database');
				console.dir(error);
				reject(error);
			});
		});
	}

	parseCSV(text) {
		const rows = [];
		let currentRow = [];
		let currentField = '';
		let inQuotes = false;

		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			const nextChar = text[i + 1];

			if (char === '"') {
				if (inQuotes && nextChar === '"') {
					currentField += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === ',' && !inQuotes) {
				currentRow.push(currentField);
				currentField = '';
			} else if ((char === '\n' || char === '\r') && !inQuotes) {
				if (currentField || currentRow.length > 0) {
					currentRow.push(currentField);
					rows.push(currentRow);
					currentRow = [];
					currentField = '';
				}
				if (char === '\r' && nextChar === '\n') {
					i++;
				}
			} else {
				currentField += char;
			}
		}

		if (currentField || currentRow.length > 0) {
			currentRow.push(currentField);
			rows.push(currentRow);
		}

		return rows;
	}

	loadBooks(versionCode) {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const query = `SELECT "id", "name", "abbreviation", "chapters" FROM "${versionCode}_books" ORDER BY "id";`;

			this.db.executeSql(query, [], 
				(rs) => {
					const books = [];
					for (let i = 0; i < rs.rows.length; i++) {
						const book = rs.rows.item(i);
						books.push({
							id: book.id,
							name: book.name,
							abbreviation: book.abbreviation,
							chapters: book.chapters,
							source: 'db'
						});
					}
					// console.log(`Loaded ${books.length} books from ${versionCode} database`);
					resolve(books);
				},
				reject
			);
		});
	}

	loadChapter(bookId, chapterNum, tableVerses) {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const query = `SELECT "book_id", "chapter", "verse", "text" FROM "${tableVerses}" WHERE "book_id" = ? AND "chapter" = ?;`;

			this.db.executeSql(query, [bookId, chapterNum],
				(rs) => {
					if (rs.rows.length > 0) {
						resolve(rs.rows);
					} else {
						reject(new Error('No verses found'));
					}
				},
				reject
			);
		});
	}

	loadVerse(bookId, chapterNum, verseNum, tableVerses) {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const query = `SELECT "book_id", "chapter", "verse", "text" FROM "${tableVerses}" WHERE "book_id" = ? AND "chapter" = ? AND "verse" = ?;`;

			this.db.executeSql(query, [bookId, chapterNum, verseNum],
				(rs) => {
					if (rs.rows.length > 0) {
						resolve(rs.rows.item(0));
					} else {
						reject(new Error('Verse not found'));
					}
				},
				reject
			);
		});
	}

	search(searchTerm, tableVerses, tableBooks, limit = 100) {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				reject(new Error('Database not initialized'));
				return;
			}

			const searchPattern = '%' + searchTerm + '%';
			const query = `SELECT b.abbreviation, v.chapter, v.verse, v.text 
				FROM "${tableVerses}" v 
				JOIN "${tableBooks}" b ON v.book_id = b.id 
				WHERE v.text LIKE ? COLLATE NOCASE 
				ORDER BY v.book_id, v.chapter, v.verse 
				LIMIT ?;`;

			this.db.executeSql(query, [searchPattern, limit],
				(rs) => {
					resolve(rs.rows);
				},
				reject
			);
		});
	}

	createTablesForVersion(versionCode) {
		return new Promise((resolve, reject) => {
			const createBooksTable = `CREATE TABLE IF NOT EXISTS "${versionCode}_books" ("id" INTEGER, "name" TEXT UNIQUE, "abbreviation" TEXT UNIQUE, "chapters" INTEGER, PRIMARY KEY("id" AUTOINCREMENT));`;
			const createVersesTable = `CREATE TABLE IF NOT EXISTS "${versionCode}_verses" ("id" INTEGER, "book_id" INTEGER, "chapter" INTEGER, "verse" INTEGER, "text" TEXT, PRIMARY KEY("id" AUTOINCREMENT), FOREIGN KEY("book_id") REFERENCES "${versionCode}_books"("id"));`;

			this.db.executeSql(createBooksTable, [], () => {
				// console.log(`${versionCode}_books table created`);

				this.db.executeSql(createVersesTable, [], () => {
					// console.log(`${versionCode}_verses table created`);
					resolve();
				}, reject);
			}, reject);
		});
	}

	insertBooksForVersion(versionCode, rows) {
		return new Promise((resolve, reject) => {
			let index = 0;

			const insertNext = () => {
				if (index >= rows.length) {
					// console.log(`All books inserted for ${versionCode}`);
					resolve();
					return;
				}

				const row = rows[index];
				const query = `INSERT INTO ${versionCode}_books (id, name, abbreviation, chapters) VALUES (?, ?, ?, ?);`;

				this.db.executeSql(query, [row[0], row[1], row[2], row[3]], 
					() => {
						index++;
						insertNext();
					},
					(error) => {
						console.error('Error inserting book:', error);
						index++;
						insertNext();
					}
				);
			};

			insertNext();
		});
	}

	async deleteVersion(abbreviation) {
		if (!this.db) {
			throw new Error('Database not open');
		}

		const booksTable = `${abbreviation}_books`;
		const versesTable = `${abbreviation}_verses`;

		try {
			await this.db.executeSql(`DROP TABLE IF EXISTS ${booksTable}`);
			await this.db.executeSql(`DROP TABLE IF EXISTS ${versesTable}`);
			// console.log(`Deleted tables for ${abbreviation}`);
		} catch (error) {
			console.error(`Error deleting version ${abbreviation}`);
			console.dir(error);
			throw error;
		}
	}
}