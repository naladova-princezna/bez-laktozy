/* LactoSTOP — service worker (offline app shell) */
var CACHE = "lactostop-v2";
var ASSETS = [
  "./","./index.html","./manifest.webmanifest",
  "./lib/html5-qrcode.min.js",
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
  if(url.origin!==location.origin) return; // don't cache OFF API / images
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(res){
        return caches.open(CACHE).then(function(c){ try{ c.put(e.request,res.clone()); }catch(_){ } return res; });
      }).catch(function(){ return caches.match("./index.html"); });
    })
  );
});
