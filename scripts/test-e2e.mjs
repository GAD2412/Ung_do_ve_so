/**
 * scripts/test-e2e.mjs
 * End-to-end verification of Sổ Xố Bỏ Túi using Chrome DevTools Protocol (CDP) in Node.js
 */

import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9222;

async function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function startChrome() {
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    'about:blank'
  ]);
  
  // Wait for debug port to be ready
  for (let i = 0; i < 20; i++) {
    await sleep(250);
    try {
      const resp = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (resp.ok) {
        console.log('Chrome CDP is ready');
        return chrome;
      }
    } catch {}
  }
  throw new Error('Could not connect to Chrome CDP');
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.msgId = 1;
    this.pending = new Map();
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = err => reject(err);
      this.ws.onmessage = evt => {
        const data = JSON.parse(evt.data);
        if (data.id && this.pending.has(data.id)) {
          const { resolve, reject } = this.pending.get(data.id);
          this.pending.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Evaluation failed');
    }
    return res.result?.value;
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('--- Starting E2E Verification ---');
  const chromeProcess = await startChrome();

  try {
    // Create new tab
    const newTabResp = await fetch(`http://127.0.0.1:${PORT}/json/new?http://localhost:8080/index.html`, { method: 'PUT' });
    const tabData = await newTabResp.json();
    const client = new CDPClient(tabData.webSocketDebuggerUrl);
    await client.init();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');

    // Automatically accept any dialog if prompted
    client.ws.addEventListener('message', async (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data.method === 'Page.javascriptDialogOpening') {
          await client.send('Page.handleJavaScriptDialog', { accept: true });
        }
      } catch {}
    });

    console.log('Navigated to app, waiting for data to load...');
    await sleep(1500);

    // 1. Verify app title and loaded lottery dates
    const title = await client.evaluate('document.title');
    console.log('Page Title:', title);
    assert.equal(title, 'Sổ Xố Bỏ Túi');

    const dateOptions = await client.evaluate(`
      Array.from(document.querySelectorAll('#manualDate')).map(el => el.value)
    `);
    console.log('Manual Date value:', dateOptions[0]);
    assert.ok(dateOptions[0]);

    // 2. Test Dò tay vé trúng (Giải Tám: 999915 on Bình Phước 2026-11-07)
    console.log('\n[TEST 1] Dò tay vé trúng (Giải Tám: 999915)...');
    await client.evaluate(`
      document.getElementById('manualDate').value = '2026-11-07';
      document.getElementById('manualDate').dispatchEvent(new Event('change'));
      document.getElementById('manualStation').value = 'Bình Phước';
      document.getElementById('manualTicket').value = '999915';
      document.getElementById('btnManualCheck').click();
    `);
    await sleep(500);

    const wonText = await client.evaluate(`document.getElementById('checkResultContainer').innerText`);
    console.log('Winning Check Output:\n', wonText);
    assert.ok(wonText.includes('CHÚC MỪNG BẠN ĐÃ TRÚNG THƯỞNG'), 'Should announce prize');
    assert.ok(wonText.includes('Giải Tám'), 'Should include Giải Tám');
    assert.ok(wonText.includes('100.000'), 'Should include 100.000 đ');

    // 3. Test Dò tay vé trượt (000000)
    console.log('\n[TEST 2] Dò tay vé trượt (000000)...');
    await client.evaluate(`
      document.getElementById('manualTicket').value = '000000';
      document.getElementById('btnManualCheck').click();
    `);
    await sleep(500);

    const lostText = await client.evaluate(`document.getElementById('checkResultContainer').innerText`);
    console.log('Losing Check Output:\n', lostText);
    assert.ok(lostText.includes('chưa trúng thưởng'), 'Should state ticket did not win');

    // 4. Test Thêm vé vào ví & xem Ví vé
    console.log('\n[TEST 3] Thêm vé vào ví & tự động dò khi mở app...');
    // Save winning ticket 999915 into wallet
    await client.evaluate(`
      window.saveTicketToWallet('999915', 'Bình Phước', '2026-11-07', 'mn');
      // Also save future/waiting ticket
      window.saveTicketToWallet('123456', 'Hồ Chí Minh', '2026-12-01', 'mn');
    `);
    await sleep(300);

    // Switch to Wallet tab
    await client.evaluate(`
      document.querySelector('[data-tab="tab-wallet"]').click();
    `);
    await sleep(300);

    const walletItems = await client.evaluate(`
      Array.from(document.querySelectorAll('.ticket-item')).map(el => el.innerText)
    `);
    console.log('Wallet items count:', walletItems.length);
    assert.equal(walletItems.length, 2, 'Wallet should have 2 tickets');
    console.log('Wallet ticket 1:\n', walletItems[0]);
    assert.ok(walletItems[1].includes('Trúng 100.000 đ') || walletItems[0].includes('Trúng 100.000 đ'), 'One ticket should be winning');

    // 5. Test Reload & LocalStorage persistence
    console.log('\n[TEST 4] Reload page and verify tickets persisted in localStorage...');
    await client.send('Page.reload');
    await sleep(1500);

    await client.evaluate(`
      document.querySelector('[data-tab="tab-wallet"]').click();
    `);
    await sleep(300);

    const reloadedWalletCount = await client.evaluate(`document.querySelectorAll('.ticket-item').length`);
    console.log('Wallet ticket count after reload:', reloadedWalletCount);
    assert.equal(reloadedWalletCount, 2, 'Tickets should still exist after reload');

    // 6. Test Offline Capability (simulate network down)
    console.log('\n[TEST 5] Offline test (disable network and verify page loads)...');
    // Ensure service worker is ready before cutting connection
    await client.evaluate(`navigator.serviceWorker.ready`);
    await sleep(500);

    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      latency: 0,
      downloadThroughput: 0,
      uploadThroughput: 0
    });

    await client.send('Page.reload');
    await sleep(1500);

    const offlineTitle = await client.evaluate('document.title');
    console.log('Offline page title:', offlineTitle);
    assert.equal(offlineTitle, 'Sổ Xố Bỏ Túi');

    const offlineResultsAvailable = await client.evaluate(`Object.keys(window.LOTTERY_DATA || {}).length`);
    console.log('Offline cached lottery dates count:', offlineResultsAvailable);
    assert.ok(offlineResultsAvailable > 0, 'Results should be available offline via Service Worker cache');

    // 7. Test Tab Kết quả & Lô tô
    console.log('\n[TEST 6] Tab Kết quả & Bảng Lô Tô Đầu / Đuôi...');
    await client.evaluate(`
      document.querySelector('[data-tab="tab-results"]').click();
    `);
    await sleep(300);

    const lottoHeader = await client.evaluate(`document.getElementById('lottoContainer').innerText`);
    assert.ok(lottoHeader.includes('Bảng Lô Tô Đầu / Đuôi'), 'Should display Lô tô table');
    assert.ok(lottoHeader.includes('ĐẦU'), 'Should have ĐẦU column');
    assert.ok(lottoHeader.includes('ĐUÔI'), 'Should have ĐUÔI column');
    console.log('Lô tô header verified successfully!');

    client.close();
    console.log('\n=== ALL E2E TESTS PASSED SUCCESSFULLY! ===');
  } finally {
    chromeProcess.kill();
  }
}

run().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
