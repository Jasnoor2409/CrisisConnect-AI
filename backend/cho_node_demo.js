/**
 * CHO Learning Lab — Node.js Educational Scripts
 *
 * This file is a STANDALONE educational script — NOT part of the production
 * Express server. Run it independently with: node cho_node_demo.js
 *
 * Covers CHO Syllabus:
 *   - Lecture 49: Node.js fundamentals, global objects, server-side JS
 *   - Lecture 50: Event loop, non-blocking I/O
 *   - Lecture 51: CommonJS vs ES Modules, fs, path
 *   - Lecture 52: Buffers, Streams, EventEmitter
 *   - Lecture 53: HTTP module, request-response lifecycle
 */

// ── LECTURE 49: Node.js Fundamentals ─────────────────────────────────────────
// Node.js global objects — these exist in Node but NOT in the browser
console.log('\n=== CHO Lecture 49: Node.js Global Objects ===');
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Memory usage:', process.memoryUsage().heapUsed, 'bytes');
console.log('__filename is available via import.meta.url in ES Modules');
console.log('setTimeout, setInterval, clearTimeout are global in Node');

// In Node.js, 'global' is the top-level object (like 'window' in browsers)
// global.myVar = 'hello'; // This works in Node, would be window.myVar in browser

// ── LECTURE 50: Event Loop & Non-Blocking I/O ─────────────────────────────────
console.log('\n=== CHO Lecture 50: Event Loop Demonstration ===');

console.log('[1] Synchronous: Start');

// setTimeout schedules a callback on the macrotask queue
setTimeout(() => {
  console.log('[4] Async Macrotask: setTimeout callback fires (after sync code finishes)');
}, 0);

// Promise.resolve schedules on the microtask queue (higher priority than setTimeout)
Promise.resolve().then(() => {
  console.log('[3] Async Microtask: Promise .then() fires (before setTimeout)');
});

console.log('[2] Synchronous: End');
// Output order: 1 → 2 → 3 → 4
// This demonstrates: sync → microtask queue → macrotask queue

// ── LECTURE 51: CommonJS vs ES Modules ───────────────────────────────────────
// This file uses CommonJS (require/module.exports) for demonstration
// The main server uses ES Modules (import/export) — do NOT mix them

// const fs = require('fs');           // CommonJS — works in .cjs files
// const path = require('path');       // CommonJS — works in .cjs files
// import fs from 'fs';               // ES Module — used in production server

// We use dynamic import here because this file is in an ESM project
import('fs').then(({ default: fs }) => {
  import('path').then(({ default: path }) => {
    // ── fs module: read current directory ─────────────────────────────────
    console.log('\n=== CHO Lecture 51: fs Module ===');

    // path.join() creates platform-safe file paths
    const currentDir = path.join(process.cwd());
    console.log('Current working directory:', currentDir);

    // fs.readdir — async, non-blocking
    fs.readdir(currentDir, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err.message);
        return;
      }
      // CHO Lecture 11: slice() to show first 5 files
      const firstFive = files.slice(0, 5);
      console.log('First 5 files in directory:', firstFive);
    });

    // ── LECTURE 52: Buffers ─────────────────────────────────────────────────
    console.log('\n=== CHO Lecture 52: Buffers ===');

    // A Buffer is a fixed-size chunk of raw binary memory
    const buf = Buffer.from('CrisisConnect AI Emergency Data', 'utf8');
    console.log('Buffer (hex):', buf.toString('hex').substring(0, 40) + '...');
    console.log('Buffer (base64):', buf.toString('base64').substring(0, 40) + '...');
    console.log('Buffer length:', buf.length, 'bytes');
    console.log('Decoded back:', buf.toString('utf8'));

    // ── LECTURE 52: Streams ──────────────────────────────────────────────────
    console.log('\n=== CHO Lecture 52: EventEmitter ===');

    import('events').then(({ default: EventEmitter }) => {
      // EventEmitter is the foundation of Node.js — everything (HTTP, fs, streams) uses it
      class IncidentEventBus extends EventEmitter {
        reportIncident(incidentData) {
          console.log('IncidentEventBus: Emitting incident:reported event');
          this.emit('incident:reported', incidentData);
        }
      }

      const bus = new IncidentEventBus();

      // Register a listener (like addEventListener in the browser)
      bus.on('incident:reported', (data) => {
        console.log('Listener received incident:', data.title, '| Category:', data.category);
      });

      // Emit the event
      bus.reportIncident({ title: 'Demo Fire', category: 'Fire', severity: 'High' });
    });

    // ── LECTURE 53: HTTP Module ──────────────────────────────────────────────
    console.log('\n=== CHO Lecture 53: HTTP Module (Educational Demo) ===');

    import('http').then(({ default: http }) => {
      // Create a basic HTTP server — this is what Express is built on top of
      const educationalServer = http.createServer((req, res) => {
        // req = IncomingMessage (request details)
        // res = ServerResponse (what we send back)

        console.log(`HTTP Request: ${req.method} ${req.url}`);

        // Set response headers
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;

        // Simple routing
        if (req.url === '/cho-demo') {
          res.end(JSON.stringify({
            message: 'CHO Lecture 53: HTTP Module Demo',
            method: req.method,
            url: req.url,
            headers: req.headers,
          }));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Route not found' }));
        }
      });

      // Start on port 5001 (different from production port 5000)
      const EDU_PORT = 5099;
      educationalServer.listen(EDU_PORT, () => {
        console.log(`CHO Educational HTTP server running on port ${EDU_PORT}`);
        console.log(`Visit: http://localhost:${EDU_PORT}/cho-demo`);
        console.log('(Press Ctrl+C to stop)');

        // Auto-close after 5 seconds so the demo doesn't block
        setTimeout(() => {
          educationalServer.close(() => {
            console.log('CHO Educational HTTP server closed after demo.');
          });
        }, 5000);
      });
    });
  });
});
