const CACHE_NAME = "msite-cache-v1";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "msite.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("fetch", event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(resp=>{
        if (event.request.method === 'GET' && resp && resp.status===200) {
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request, resp.clone()));
        }
        return resp;
      }).catch(()=>response);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
});
