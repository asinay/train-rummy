(function () {
  const current = document.querySelector('meta[name="app-version"]')?.content;
  if (!current) return;
  let checking = false;
  let reloading = false;

  async function checkForUpdate() {
    if (checking || reloading || document.hidden || !navigator.onLine) return;
    checking = true;
    try {
      // Fetch the entry page, not a separate version file that could deploy first.
      const entry = new URL('index.html', document.baseURI);
      entry.searchParams.set('_check', Date.now());
      const response = await fetch(entry, { cache: 'no-store' });
      if (!response.ok) return;
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const latest = html.querySelector('meta[name="app-version"]')?.content;
      if (!latest || latest === current || !window.canReloadForUpdate?.()) return;
      const destination = new URL(location.href);
      // Avoid a reload loop if an intermediary still serves an older entry page.
      if (destination.searchParams.get('_release') === latest) return;
      destination.searchParams.set('_release', latest);
      reloading = true;
      location.replace(destination.href);
    } catch (_) {
      // Offline or failed checks leave the working application in place.
    } finally {
      checking = false;
    }
  }

  checkForUpdate();
  window.addEventListener('pageshow', checkForUpdate);
  window.addEventListener('online', checkForUpdate);
  document.addEventListener('visibilitychange', checkForUpdate);
  setInterval(checkForUpdate, 60000);
})();
