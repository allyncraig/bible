const BOOK_DATA = [
	null, // index 0 (unused, makes IDs match indices)
	{ abbr: "Gen", name: "Genesis", testament: "OT" },
	{ abbr: "Exo", name: "Exodus", testament: "OT" },
	{ abbr: "Lev", name: "Leviticus", testament: "OT" },
	{ abbr: "Num", name: "Numbers", testament: "OT" },
	{ abbr: "Deu", name: "Deuteronomy", testament: "OT" },
	{ abbr: "Jos", name: "Joshua", testament: "OT" },
	{ abbr: "Jdg", name: "Judges", testament: "OT" },
	{ abbr: "Rut", name: "Ruth", testament: "OT" },
	{ abbr: "1Sa", name: "1 Samuel", testament: "OT" },
	{ abbr: "2Sa", name: "2 Samuel", testament: "OT" },
	{ abbr: "1Ki", name: "1 Kings", testament: "OT" },
	{ abbr: "2Ki", name: "2 Kings", testament: "OT" },
	{ abbr: "1Ch", name: "1 Chronicles", testament: "OT" },
	{ abbr: "2Ch", name: "2 Chronicles", testament: "OT" },
	{ abbr: "Ezr", name: "Ezra", testament: "OT" },
	{ abbr: "Neh", name: "Nehemiah", testament: "OT" },
	{ abbr: "Est", name: "Esther", testament: "OT" },
	{ abbr: "Job", name: "Job", testament: "OT" },
	{ abbr: "Psa", name: "Psalms", testament: "OT" },
	{ abbr: "Pro", name: "Proverbs", testament: "OT" },
	{ abbr: "Ecc", name: "Ecclesiastes", testament: "OT" },
	{ abbr: "Sng", name: "Song of Solomon", testament: "OT" },
	{ abbr: "Isa", name: "Isaiah", testament: "OT" },
	{ abbr: "Jer", name: "Jeremiah", testament: "OT" },
	{ abbr: "Lam", name: "Lamentations", testament: "OT" },
	{ abbr: "Ezk", name: "Ezekiel", testament: "OT" },
	{ abbr: "Dan", name: "Daniel", testament: "OT" },
	{ abbr: "Hos", name: "Hosea", testament: "OT" },
	{ abbr: "Jol", name: "Joel", testament: "OT" },
	{ abbr: "Amo", name: "Amos", testament: "OT" },
	{ abbr: "Oba", name: "Obadiah", testament: "OT" },
	{ abbr: "Jon", name: "Jonah", testament: "OT" },
	{ abbr: "Mic", name: "Micah", testament: "OT" },
	{ abbr: "Nam", name: "Nahum", testament: "OT" },
	{ abbr: "Hab", name: "Habakkuk", testament: "OT" },
	{ abbr: "Zep", name: "Zephaniah", testament: "OT" },
	{ abbr: "Hag", name: "Haggai", testament: "OT" },
	{ abbr: "Zec", name: "Zechariah", testament: "OT" },
	{ abbr: "Mal", name: "Malachi", testament: "OT" },
	{ abbr: "Mat", name: "Matthew", testament: "NT" },
	{ abbr: "Mrk", name: "Mark", testament: "NT" },
	{ abbr: "Luk", name: "Luke", testament: "NT" },
	{ abbr: "Jhn", name: "John", testament: "NT" },
	{ abbr: "Act", name: "Acts", testament: "NT" },
	{ abbr: "Rom", name: "Romans", testament: "NT" },
	{ abbr: "1Co", name: "1 Corinthians", testament: "NT" },
	{ abbr: "2Co", name: "2 Corinthians", testament: "NT" },
	{ abbr: "Gal", name: "Galatians", testament: "NT" },
	{ abbr: "Eph", name: "Ephesians", testament: "NT" },
	{ abbr: "Php", name: "Philippians", testament: "NT" },
	{ abbr: "Col", name: "Colossians", testament: "NT" },
	{ abbr: "1Th", name: "1 Thessalonians", testament: "NT" },
	{ abbr: "2Th", name: "2 Thessalonians", testament: "NT" },
	{ abbr: "1Ti", name: "1 Timothy", testament: "NT" },
	{ abbr: "2Ti", name: "2 Timothy", testament: "NT" },
	{ abbr: "Tit", name: "Titus", testament: "NT" },
	{ abbr: "Phm", name: "Philemon", testament: "NT" },
	{ abbr: "Heb", name: "Hebrews", testament: "NT" },
	{ abbr: "Jas", name: "James", testament: "NT" },
	{ abbr: "1Pe", name: "1 Peter", testament: "NT" },
	{ abbr: "2Pe", name: "2 Peter", testament: "NT" },
	{ abbr: "1Jn", name: "1 John", testament: "NT" },
	{ abbr: "2Jn", name: "2 John", testament: "NT" },
	{ abbr: "3Jn", name: "3 John", testament: "NT" },
	{ abbr: "Jud", name: "Jude", testament: "NT" },
	{ abbr: "Rev", name: "Revelation", testament: "NT" }
];

const BOOK_INDEX = {
	byAbbr: Object.create(null),
	byName: Object.create(null)
};

for (let i = 1; i < BOOK_DATA.length; i++) {
	const b = BOOK_DATA[i];
	if (!b) continue;

	BOOK_INDEX.byAbbr[b.abbr.toLowerCase()] = i;
	BOOK_INDEX.byName[b.name.toLowerCase()] = i;
}

// Helper function to get book abbreviation by ID
function getBookAbbr(bookId) {
	return BOOK_DATA[bookId]?.abbr || `Book${bookId}`;
}

// Helper function to get book name by ID
function getBookName(bookId) {
	return BOOK_DATA[bookId]?.name || `Book ${bookId}`;
}

// Helper function to get testament by book ID
function getBookTestament(bookId) {
	return BOOK_DATA[bookId]?.testament || null;
}

// Helper function to look up ID by Abbreviation
function getBookIndexByAbbr(abbr) {
	if (!abbr) return undefined;
	return BOOK_INDEX.byAbbr[abbr.toLowerCase()];
}
// Helper function to look up ID by Name
function getBookIndexByName(name) {
	if (!name) return undefined;
	return BOOK_INDEX.byName[name.toLowerCase()];
}