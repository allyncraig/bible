// Version configurations
const VERSION_CONFIG = [
	{
		abbreviation: 'ABT',
		name: "Allyn's Bible Translation",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			db: {
				tableBooks: 'ABT_books',
				tableVerses: 'ABT_verses'
			},
			api: {
				provider: 'AbtApi',
				parameters: {
					VERSIONID: 'ABT'
				}
			}
		},
	},
	{
		abbreviation: 'BSB',
		name: 'Berean Study Bible',
		languageCode: 'en',
		languageName: 'English',
		sources: {
			db: {
				tableBooks: 'BSB_books',
				tableVerses: 'BSB_verses'
			},
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'BSB'
				}
			}
		}
	},
	{
		abbreviation: 'ESV',
		name: "English Standard Version 2001, 2016",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'ESV'
				}
			}
		}
	},
/* 	{
		abbreviation: 'FBV',
		name: 'Free Bible Version',
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'API.Bible',
				parameters: {
					VERSIONID: '65eec8e0b60e656b-01'
				}
			}
		}
	}, */
	{
		abbreviation: 'KJV',
		name: "King James Version",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'KJV'
				}
			}
		}
	},
	{
		abbreviation: 'NASB',
		name: "New American Standard Bible (1995)",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'NASB'
				}
			}
		}
	},
	{
		abbreviation: 'NET',
		name: "New English Translation, 2007",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'NET'
				}
			}
		}
	},
	{
		abbreviation: 'NIV',
		name: "New International Version",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'NIV'
				}
			}
		}
	},
	{
		abbreviation: 'NKJV',
		name: "New King James Version",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'NKJV'
				}
			}
		}
	},
/* 	{
		abbreviation: 'KJV',
		name: 'King James Version',
		languageCode: 'en',
		languageName: 'English',
		source: 'api',
		provider: 'API.Bible',
		parameters: {
			VERSIONID: 'de4e12af7f28f599-01'
		}
	}, */
	{
		abbreviation: 'YLT',
		name: "Young's Literal Translation",
		languageCode: 'en',
		languageName: 'English',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'YLT'
				}
			}
		}
	},
	{
		abbreviation: 'NBS',
		name: "Nouvelle Bible Segond, 2002",
		languageCode: 'fr',
		languageName: 'French',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'NBS'
				}
			}
		}
	},
	{
		abbreviation: 'BW',
		name: "Biblia Warszawska, 1975",
		languageCode: 'po',
		languageName: 'Polish',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'BW'
				}
			}
		}
	},
	{
		abbreviation: 'RV1960',
		name: "Reina Valera 1960",
		languageCode: 'es',
		languageName: 'Spanish',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'RV1960'
				}
			}
		}
	},
	{
		abbreviation: 'tgl_ulb',
		name: "Tagalog banal na Bibliya",
		languageCode: 'tgl',
		languageName: 'Tagalog',
		sources: {
			api: {
				provider: 'helloao.org',
				parameters: {
					VERSIONID: 'tgl_ulb'
				}
			}
		}
	},
	{
		abbreviation: 'ilo_ulb',
		name: "Ilocano Ti Biblia",
		languageCode: 'ilo',
		languageName: 'Ilocano',
		sources: {
			api: {
				provider: 'helloao.org',
				parameters: {
					VERSIONID: 'ilo_ulb'
				}
			}
		}
	},
	{
		abbreviation: 'SBL',
		name: "SBL Greek NT",
		languageCode: 'gr',
		languageName: 'Koine Greek',
		sources: {
			api: {
				provider: 'helloao.org',
				parameters: {
					VERSIONID: 'grc_sbl'
				}
			}
		}
	},
	{
		abbreviation: 'NTGT',
		name: "Greek NT: Tischendorf 8th Ed.",
		languageCode: 'gr',
		languageName: 'Koine Greek',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'NTGT'
				}
			}
		}
	},
	{
		abbreviation: 'TR',
		name: "Elzevir Textus Receptus 1624",
		languageCode: 'gr',
		languageName: 'Koine Greek',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'TR'
				}
			}
		}
	},
	{
		abbreviation: 'LXX',
		name: "Septuagint",
		languageCode: 'gr',
		languageName: 'Koine Greek',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'LXX'
				}
			}
		}
	},
	{
		abbreviation: 'WLC',
		name: "Westminster Leningrad Codex",
		languageCode: 'he',
		languageName: 'Ancient Hebrew',
		sources: {
			api: {
				provider: 'bolls.life',
				parameters: {
					VERSIONID: 'WLC'
				}
			}
		}
	}
];
