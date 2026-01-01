// service-worker.js

const CACHE_NAME = 'my-bible-app';

const ASSETS_TO_CACHE = [
	'./',
	'./index.html',
	'./manifest.json',
	'./css/index.css',
	'./js/index.js'
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
	);
	self.skipWaiting();
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(keys =>
			Promise.all(
				keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
			)
		)
	);
	self.clients.claim();
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(
			response => response || fetch(event.request)
		)
	);
});
