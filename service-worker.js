// service-worker.js
const CACHE_NAME = 'si-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/welcome.html',
  '/style.css',
  '/script.js',
  '/fallbackPdf.js'
];

// PDF files to cache
const pdfPaths = [
  '/pdfs/04A/Sujet04A-RobotLaveurDeVitre.pdf',
  '/pdfs/04B/Sujet04B-RobotLaveurDeVitres.pdf',
  '/pdfs/04C/Sujet04C_RobotLaveurDeVitre.pdf',
  '/pdfs/15A/Sujet15A-Barrière automatique.pdf',
  '/pdfs/15B/Sujet15B-Barrière automatique.pdf',
  '/pdfs/15C/Sujet15C-Barrière automatique.pdf',
  '/pdfs/30A/Sujet30A-TravellingMotorise.pdf',
  '/pdfs/30B/Sujet30B_TravellingMotorise.pdf',
  '/pdfs/30C/Sujet30C-TravellingMotorise.pdf'
];

// Cache all HTML pages
const htmlPages = [
  '/projet_04A.html',
  '/projet_04B.html',
  '/projet_04C.html',
  '/projet_15A.html',
  '/projet_15B.html',
  '/projet_15C.html',
  '/projet_30A.html',
  '/projet_30B.html',
  '/projet_30C.html'
];

// All resources to cache
const allResources = [...urlsToCache, ...pdfPaths, ...htmlPages];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(allResources);
      })
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', event => {
  // Special handling for PDF files
  if (event.request.url.includes('.pdf')) {
    event.respondWith(
      fetch(event.request, {
        // Add no-cors mode to help with CORS issues
        mode: 'no-cors',
        credentials: 'omit'
      })
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Open cache and store the fetched response
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // If network fetch fails, try to get from cache
        return caches.match(event.request);
      })
    );
  } else {
    // Standard handling for non-PDF resources
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response
          const responseToCache = response.clone();
          
          // Open cache and store the fetched response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fetch fails, try to get from cache
          return caches.match(event.request);
        })
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
