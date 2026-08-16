/* LactoSTOP — service worker (offline app shell) */
var CACHE = "lactostop-v6";
var ASSETS = [
  "./","./index.html","./manifest.webmanifest",
  "./lib/zxing.min.js",
  "./icon-180.png","./icon-192.png","./icon-512.png"
];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  if(e.request.method!=="GET") return;
  var url=new URL(e.request.url);
  if(url.origin!==location.origin) return; // don't touch OFF API / images
  var putCopy=function(res){ if(res && res.ok){ var copy=res.clone(); caches.open(CACHE).then(function(c){ try{ c.put(e.request,copy); }catch(_){ } }); } return res; };
  // data.json: network-first so "Načíst z repozitáře" gets fresh data, cache as offline fallback
  if(/data\.json$/.test(url.pathname)){
    e.respondWith(fetch(e.request).then(putCopy).catch(function(){ return caches.match(e.request); }));
    return;
  }
  // app shell: cache-first
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(putCopy).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
