const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('updates.js', 'utf8');
const settle = () => new Promise(resolve => setImmediate(resolve));

async function setup(options = {}) {
  const requests = [], navigations = [], events = {};
  const document = {
    hidden: !!options.hidden,
    baseURI: 'https://example.com/train-rummy/?room=TRAIN-1234',
    querySelector: () => ({ content: '1' }),
    addEventListener: (name, fn) => { events[name] = fn; }
  };
  const context = {
    document, navigator: { onLine: !options.offline }, URL, Date,
    location: {
      href: options.url || document.baseURI,
      replace: value => navigations.push(value)
    },
    canReloadForUpdate: () => !options.busy,
    addEventListener: (name, fn) => { events[name] = fn; },
    setInterval: fn => { events.interval = fn; },
    DOMParser: class {
      parseFromString() {
        return { querySelector: () => options.missing ? null : ({ content: options.latest || '2' }) };
      }
    },
    fetch: async (url, init) => {
      requests.push({ url: String(url), init });
      if (options.failure) throw Error('offline');
      return { ok: !options.httpError, text: async () => '<html></html>' };
    }
  };
  context.window = context;
  vm.runInNewContext(source, context);
  await settle();
  return { requests, navigations, events, document, options };
}

test('new release fetches uncached entry page under the project path and preserves room', async () => {
  const s = await setup();
  assert.equal(s.requests[0].init.cache, 'no-store');
  assert.equal(new URL(s.requests[0].url).pathname, '/train-rummy/index.html');
  assert.ok(new URL(s.requests[0].url).searchParams.has('_check'));
  const next = new URL(s.navigations[0]);
  assert.equal(next.searchParams.get('room'), 'TRAIN-1234');
  assert.equal(next.searchParams.get('_release'), '2');
  await s.events.interval();
  assert.equal(s.navigations.length, 1);
});

for (const [name, options] of Object.entries({
  'same version': { latest: '1' },
  'missing version': { missing: true },
  'active game or unsaved work': { busy: true },
  'offline': { offline: true },
  'hidden app': { hidden: true },
  'network failure': { failure: true },
  'HTTP failure': { httpError: true },
  'stale entry loop': { url: 'https://example.com/train-rummy/?_release=2' }
})) {
  test(name + ' does not reload', async () => {
    const s = await setup(options);
    assert.equal(s.navigations.length, 0);
  });
}

test('foreground event retries a deferred update once safe', async () => {
  const options = { busy: true };
  const s = await setup(options);
  options.busy = false;
  await s.events.visibilitychange();
  assert.equal(s.navigations.length, 1);
});

test('real app reload guard protects games, session restores, inputs and admin sheets', () => {
  const app = fs.readFileSync('app.js', 'utf8');
  const guard = app.slice(app.indexOf('window.canReloadForUpdate ='), app.indexOf('\nbuildTopics();'));
  const state = { game: false, ending: false, selected: false, setup: true, overlay: false, focus: false, typed: false, session: '{}' };
  const context = {
    window: {}, currentGameId: null, endingGame: false, selectedPlayerIds: new Set(),
    document: {
      getElementById: () => ({ classList: { contains: () => state.setup } }),
      querySelector: () => state.focus ? {} : null,
      querySelectorAll: selector => selector === '.overlay' ? [{}] : [{ value: state.typed ? 'TRAIN-1234' : '' }]
    },
    getComputedStyle: () => ({ display: state.overlay ? 'flex' : 'none' }),
    sessionStorage: { getItem: () => state.session }
  };
  vm.runInNewContext(guard, context);
  const safe = context.window.canReloadForUpdate;
  assert.equal(safe(), true);
  context.currentGameId = 'game'; assert.equal(safe(), false); context.currentGameId = null;
  context.endingGame = true; assert.equal(safe(), false); context.endingGame = false;
  context.selectedPlayerIds.add('player'); assert.equal(safe(), false); context.selectedPlayerIds.clear();
  state.setup = false; assert.equal(safe(), false); state.setup = true;
  for (const key of ['overlay', 'focus', 'typed']) {
    state[key] = true; assert.equal(safe(), false, key); state[key] = false;
  }
  state.session = '{"gameId":"restoring"}'; assert.equal(safe(), false);
  state.session = 'unreadable'; assert.equal(safe(), false);
});

test('all local styles and scripts use the release version', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const version = html.match(/name="app-version" content="([^"]+)"/)[1];
  const assets = [...html.matchAll(/(?:src|href)="([^"/:]+\.(?:js|css))\?v=([^"]+)"/g)];
  assert.ok(assets.length >= 10);
  for (const asset of assets) assert.equal(asset[2], version, asset[1]);
});
