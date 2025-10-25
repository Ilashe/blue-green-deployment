const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const APP_POOL = process.env.APP_POOL || 'unknown';
const RELEASE_ID = process.env.RELEASE_ID || 'unknown';

// Chaos engineering state
let chaosMode = {
  enabled: false,
  type: 'none', // 'error', 'slow', 'crash'
  delay: 5000
};

// Background images
const BACKGROUNDS = {
  blue: 'https://images.unsplash.com/photo-1579267217516-b73084bd79a6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1920',
  green: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1920'
};

const COLORS = {
  blue: { primary: '#1e3a8a', secondary: '#3b82f6', text: '#eff6ff' },
  green: { primary: '#14532d', secondary: '#22c55e', text: '#f0fdf4' }
};

// Middleware to apply chaos
const applyChaos = (req, res, next) => {
  if (!chaosMode.enabled) {
    return next();
  }

  if (chaosMode.type === 'error') {
    return res.status(500).json({ 
      error: 'Chaos mode: Simulated error',
      pool: APP_POOL,
      release: RELEASE_ID 
    });
  }

  if (chaosMode.type === 'slow') {
    setTimeout(next, chaosMode.delay);
    return;
  }

  if (chaosMode.type === 'crash') {
    console.log('💥 Chaos mode: Simulating crash');
    process.exit(1);
  }

  next();
};

// Chaos engineering endpoints
app.post('/chaos/start', (req, res) => {
  const mode = req.query.mode || 'error';
  const delay = parseInt(req.query.delay) || 5000;

  chaosMode.enabled = true;
  chaosMode.type = mode;
  chaosMode.delay = delay;

  console.log(`🔥 Chaos mode started: ${mode}`);
  
  res.json({
    message: 'Chaos mode activated',
    pool: APP_POOL,
    mode: mode,
    delay: mode === 'slow' ? delay : undefined
  });
});

app.post('/chaos/stop', (req, res) => {
  chaosMode.enabled = false;
  chaosMode.type = 'none';
  
  console.log('✅ Chaos mode stopped');
  
  res.json({
    message: 'Chaos mode deactivated',
    pool: APP_POOL
  });
});

app.get('/chaos/status', (req, res) => {
  res.json({
    pool: APP_POOL,
    chaos: chaosMode
  });
});

// Health check endpoint (bypasses chaos)
app.get('/healthz', (req, res) => {
  if (chaosMode.enabled && (chaosMode.type === 'error' || chaosMode.type === 'slow')) {
    return res.status(503).json({ 
      status: 'unhealthy', 
      pool: APP_POOL,
      release: RELEASE_ID,
      chaos: chaosMode.type
    });
  }
  
  res.status(200).json({ 
    status: 'healthy', 
    pool: APP_POOL,
    release: RELEASE_ID 
  });
});

// Version endpoint
app.get('/version', applyChaos, (req, res) => {
  res.json({
    pool: APP_POOL,
    release: RELEASE_ID,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main page
app.get('/', applyChaos, (req, res) => {
  const colors = COLORS[APP_POOL] || COLORS.blue;
  const background = BACKGROUNDS[APP_POOL] || BACKGROUNDS.blue;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${APP_POOL.toUpperCase()} Environment</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          min-height: 100vh;
          background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${background}');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${colors.text};
        }
        .container {
          text-align: center;
          padding: 3rem;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 600px;
          margin: 2rem;
        }
        h1 {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: ${colors.secondary};
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        .badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          background: ${colors.primary};
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 1rem 0;
          border: 2px solid ${colors.secondary};
        }
        .info {
          margin-top: 2rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 1rem;
        }
        .info-item {
          margin: 0.5rem 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .label {
          font-weight: 600;
          color: ${colors.secondary};
        }
        .pulse {
          animation: pulse 2s infinite;
        }
        .chaos-badge {
          background: #dc2626;
          padding: 0.3rem 0.8rem;
          border-radius: 5px;
          font-size: 0.9rem;
          margin-left: 1rem;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 class="pulse">${APP_POOL.toUpperCase()}</h1>
        <div class="badge">
          Environment ${APP_POOL.toUpperCase()}
          ${chaosMode.enabled ? '<span class="chaos-badge">⚠️ CHAOS MODE</span>' : ''}
        </div>
        <div class="info">
          <div class="info-item">
            <span class="label">Pool:</span>
            <span>${APP_POOL}</span>
          </div>
          <div class="info-item">
            <span class="label">Release:</span>
            <span>${RELEASE_ID}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span>${chaosMode.enabled ? '⚠️ Chaos Active' : '✓ Active'}</span>
          </div>
          <div class="info-item">
            <span class="label">Container:</span>
            <span>${process.env.HOSTNAME || 'local'}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ${APP_POOL.toUpperCase()} pool running on port ${PORT}`);
  console.log(`📦 Release: ${RELEASE_ID}`);
});
