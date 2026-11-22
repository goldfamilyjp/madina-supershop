/* Madina Halal Super — service worker (SHOP PAGE ONLY; the admin has none).
 *
 * Its main job is to make the shop installable on Android / desktop Chrome
 * (manifest + icons + a service worker with a fetch handler). It is kept
 * deliberately small and safe:
 *
 *   - Navigations, index.html, products.json and points.json are
 *     NETWORK-FIRST: prices, stock and point balances must never go stale.
 *     The cache is only a fallback when the network is unreachable.
 *   - Static images (hero slides, icons, logo, banners) and the web app
 *     manifests are CACHE-FIRST (they change rarely; new file names or a
 *     cache-version bump refresh them).
 *   - Everything else is left completely alone: no POST requests, no
 *     cross-origin requests (Google Forms, Apps Script, FormSubmit,
 *     Google Analytics, zipcloud), no other same-origin files — and never
 *     admin.html: the admin page has no service worker by design.
 *
 * Bump CACHE when this file's strategy changes: activation deletes every
 * older cache, so no visitor can get stuck on a stale copy.
 */
"use strict";

var CACHE = "madina-super-v1";

function isNetworkFirst(url, req) {
  if (req.mode === "navigate") return true;
  var path = url.pathname;
  return /(?:^|\/)(?:index\.html)?$/.test(path) ||
         /\/(?:products|points)\.json$/.test(path);
}

function isCacheFirst(url) {
  return /(?:hero-slide-\d+\.jpg|icon-[^/]*\.png|apple-touch-icon[^/]*\.png|logo\.jpg|shop-banner[^/]*\.jpg|manifest-[^/]*\.json)$/
    .test(url.pathname);
}

function networkFirst(req) {
  return fetch(req).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function (err) {
    return caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      if (req.mode === "navigate") throw err; // browser offline page
      return new Response("", { status: 503, statusText: "Offline" });
    });
  });
}

function cacheFirst(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(req).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    });
  });
}

self.addEventListener("install", function (event) {
  // Take over as soon as installed; nothing is precached, so install
  // cannot fail on a missing file.
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (n) {
        return n === CACHE ? null : caches.delete(n);
      }));
    })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return; // never touch POSTs (orders, email…)
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return; // cross-origin: hands off
  if (url.pathname.endsWith("/admin.html")) return; // admin: never handled
  if (isNetworkFirst(url, req)) {
    event.respondWith(networkFirst(req));
  } else if (isCacheFirst(url)) {
    event.respondWith(cacheFirst(req));
  }
  // Any other same-origin GET: not intercepted, loads exactly as before.
});
