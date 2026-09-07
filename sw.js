/* Misha Health Tracker — офлайн-кэш. Данные приложения лежат в IndexedDB, здесь только файлы приложения. */
var CACHE = "misha-v15";
/* Только обработанные ассеты. Исходники из assets/source/ не кэшируем. */
var ASSETS = [
  "./", "./index.html", "./manifest.json", "./assets/misha.webp",
  "./icon.svg", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon-180.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* по одному, чтобы отсутствие одного файла не срывало установку */
      return Promise.all(ASSETS.map(function(u){ return c.add(u).catch(function(){}); }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Сеть сначала, кэш — как запасной вариант: приложение открывается и без интернета. */
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); }).catch(function(){});
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(hit){
        return hit || caches.match("./index.html");
      });
    })
  );
});
