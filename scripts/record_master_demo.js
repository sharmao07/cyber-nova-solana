const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const APP_URL = 'http://localhost:3000';
const TMP_DIR = '/tmp/cyber_nova_video';

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit' });
    p.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

/**
 * Record a segment of exact duration using Puppeteer CDP Screencast piped to ffmpeg
 */
async function recordSegment(page, durationSec, outputFile, actionFn, labelText) {
  console.log(`\n======================================================`);
  console.log(`Recording Segment: ${path.basename(outputFile)} (${durationSec}s)`);
  if (labelText) console.log(`Label: ${labelText}`);
  console.log(`======================================================`);

  // Ensure any lingering modals are closed before recording
  await page.evaluate((txt) => {
    // If any modal overlay is present, remove it
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) modal.remove();

    let tag = document.getElementById('demo-video-label-tag');
    if (txt) {
      if (!tag) {
        tag = document.createElement('div');
        tag.id = 'demo-video-label-tag';
        tag.style.position = 'fixed';
        tag.style.bottom = '20px';
        tag.style.left = '24px';
        tag.style.zIndex = '999999';
        tag.style.color = '#00FFFF';
        tag.style.fontFamily = 'monospace';
        tag.style.fontSize = '13px';
        tag.style.fontWeight = '700';
        tag.style.background = 'rgba(8, 10, 18, 0.92)';
        tag.style.border = '1px solid rgba(0, 255, 255, 0.4)';
        tag.style.padding = '6px 16px';
        tag.style.borderRadius = '8px';
        tag.style.boxShadow = '0 4px 12px rgba(0,0,0,0.6)';
        tag.style.pointerEvents = 'none';
        document.body.appendChild(tag);
      }
      tag.innerText = txt;
    } else if (tag) {
      tag.remove();
    }
  }, labelText);

  const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '30',
    '-i', '-',
    '-t', `${durationSec.toFixed(2)}`,
    '-vf', 'scale=1920:1080,fps=60',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-b:v', '8500k',
    outputFile
  ]);

  ffmpeg.stdin.on('error', (err) => {
    // Safely ignore EPIPE when ffmpeg terminates stdin after reaching duration
    if (err.code !== 'EPIPE') {
      console.warn('ffmpeg stdin info:', err.message);
    }
  });

  let active = true;
  const client = await page.target().createCDPSession();
  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 92,
    maxWidth: 1920,
    maxHeight: 1080,
    everyNthFrame: 1
  });

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    if (active && ffmpeg.stdin.writable) {
      try {
        ffmpeg.stdin.write(Buffer.from(data, 'base64'));
      } catch (e) {}
    }
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  const startTime = Date.now();
  if (actionFn) {
    await actionFn(page, startTime, durationSec);
  }

  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed < durationSec) {
    await new Promise(r => setTimeout(r, (durationSec - elapsed) * 1000));
  }

  active = false;
  await client.send('Page.stopScreencast').catch(() => {});
  if (ffmpeg.stdin.writable) {
    try {
      ffmpeg.stdin.end();
    } catch (e) {}
  }

  await new Promise(resolve => ffmpeg.on('close', resolve));
  console.log(`Saved ${outputFile}`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--window-size=1920,1080',
      '--enable-webgl',
      '--use-gl=angle',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  const rootDir = '/Users/ojussharma/.gemini/antigravity/scratch/solarena';
  const titleCardUrl = `file://${rootDir}/scripts/render_title_card.html`;
  const endingCardUrl = `file://${rootDir}/scripts/render_ending_card.html`;

  // SEGMENT 1: Title Screen & Introduction (7.00s)
  await page.goto(titleCardUrl, { waitUntil: 'load' });
  await recordSegment(
    page,
    7.0,
    `${TMP_DIR}/seg1_title.mp4`,
    async () => {
      await new Promise(r => setTimeout(r, 7000));
    },
    null
  );

  // Load Main Live Application
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // Ensure game is in initial clean state (Medium difficulty, zero modals)
  await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) modal.remove();
  });

  // SEGMENT 2: Start Screen, Flight HUD & Controls (8.00s)
  // Shows full cabinet, HUD metrics, difficulty selector, and visible controls guide without opening any obscuring modal!
  await recordSegment(
    page,
    8.0,
    `${TMP_DIR}/seg2_controls.mp4`,
    async (p) => {
      // 1. Show idle flight cabinet with Nova on floor
      await new Promise(r => setTimeout(r, 2000));
      // 2. Click Easy Mode, then back to Medium Mode
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const easy = btns.find(b => b.innerText.includes('Easy'));
        if (easy) easy.click();
      });
      await new Promise(r => setTimeout(r, 2000));
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const med = btns.find(b => b.innerText.includes('Medium'));
        if (med) med.click();
      });
      await new Promise(r => setTimeout(r, 1500));
      // 3. Quick thruster engine test pulse on floor
      await p.keyboard.down('Space');
      await new Promise(r => setTimeout(r, 600));
      await p.keyboard.up('Space');
      await new Promise(r => setTimeout(r, 1900));
    },
    '[ 02 / 08 • FLIGHT HUD, DIFFICULTY MODES & VISIBLE CONTROLS ]'
  );

  // SEGMENT 3: Continuous Gameplay — Flight, Obstacles & Shards (20.00s)
  // Continuous, 100% visible, active gameplay: Nova flies through facility, dodges zappers, collects shards!
  await recordSegment(
    page,
    20.0,
    `${TMP_DIR}/seg3_gameplay_basic.mp4`,
    async (p, startTime, dur) => {
      // Enable AI navigation for pristine 60 FPS obstacle evasion and shard collection!
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const aiBtn = btns.find(b => b.innerText.includes('Manual Pilot') || b.innerText.includes('AI Copilot'));
        if (aiBtn && !aiBtn.innerText.includes('ACTIVE')) aiBtn.click();
      });

      // Let Nova fly with authentic 60 FPS physics dodging zappers and collecting shards
      const end = startTime + dur * 1000 - 500;
      while (Date.now() < end) {
        await new Promise(r => setTimeout(r, 500));
      }
    },
    '[ 03 / 08 • 60 FPS JETPACK FLIGHT & QUANTUM HAZARD EVASION ]'
  );

  // SEGMENT 4: Power-Ups, Special Abilities & Vehicles (15.00s)
  // Shows speed booster gates, vehicle boarding (Gravity Drifter), and eject armor protection!
  await recordSegment(
    page,
    15.0,
    `${TMP_DIR}/seg4_vehicles_abilities.mp4`,
    async (p, startTime, dur) => {
      // Continue flight through speed gates and vehicle tokens
      const end = startTime + dur * 1000 - 500;
      while (Date.now() < end) {
        await new Promise(r => setTimeout(r, 500));
      }
    },
    '[ 04 / 08 • SPEED BOOSTER, VEHICLES & EJECT-ARMOR ]'
  );

  // SEGMENT 5: Increasing Difficulty, Missiles & A.R.I.A. Holographic HUD (15.00s)
  // Switches to Apex Hard Mode (6.8 px/frame), shows homing missile warning alarms, holographic radar and threat brackets!
  await recordSegment(
    page,
    15.0,
    `${TMP_DIR}/seg5_difficulty_missiles_ai.mp4`,
    async (p, startTime, dur) => {
      // 1. Switch to Apex Hard Mode
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const hardBtn = btns.find(b => b.innerText.includes('Hard') && b.innerText.includes('1.8x'));
        if (hardBtn) hardBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));

      // 2. Ensure A.R.I.A. AI Copilot is active to show the holographic radar corridor, trajectory spline and threat brackets
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const aiBtn = btns.find(b => b.innerText.includes('Manual Pilot') || b.innerText.includes('AI Copilot'));
        if (aiBtn && !aiBtn.innerText.includes('ACTIVE')) aiBtn.click();
      });

      const end = startTime + dur * 1000 - 500;
      while (Date.now() < end) {
        await new Promise(r => setTimeout(r, 500));
      }
    },
    '[ 05 / 08 • APEX DIFFICULTY & A.R.I.A. HOLOGRAPHIC TACTICAL HUD ]'
  );

  // SEGMENT 6: Collision / Game-Over & On-Chain Solana Attestation (12.00s)
  // Turn off AI, Nova crashes into hazard, Flight Terminated modal appears, signs on-chain attestation, closes modal cleanly!
  await recordSegment(
    page,
    12.0,
    `${TMP_DIR}/seg6_crash_attestation.mp4`,
    async (p) => {
      // 1. Turn off AI so Nova crashes into hazard
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const aiBtn = btns.find(b => b.innerText.includes('ACTIVE') || b.innerText.includes('AI Copilot'));
        if (aiBtn && aiBtn.innerText.includes('ACTIVE')) aiBtn.click();
      });

      // 2. Wait 2 seconds for crash modal to appear
      await new Promise(r => setTimeout(r, 2200));

      // 3. Click "Attest Run on Solana" in the Flight Terminated modal
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const attestBtn = btns.find(b => b.innerText.includes('Attest') && b.innerText.includes('Solana'));
        if (attestBtn) attestBtn.click();
      });
      // Allow 5 seconds to display confirmed transaction on Solscan
      await new Promise(r => setTimeout(r, 5000));

      // 4. Click Close button to cleanly close modal and reset!
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const closeBtn = btns.find(b => b.innerText.trim() === 'Close');
        if (closeBtn) closeBtn.click();
        // Guaranteed removal if any modal remains
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) modal.remove();
      });
      await new Promise(r => setTimeout(r, 2000));
    },
    '[ 06 / 08 • RUN TERMINATION & ON-CHAIN SOLANA ATTESTATION ]'
  );

  // SEGMENT 7: Personal Best, Progression & DeFi Ecosystem (8.00s)
  // Shows saved personal best on HUD, clicks Quantum DeFi tab (AMM swap + Staking), then Flight Records!
  await recordSegment(
    page,
    8.0,
    `${TMP_DIR}/seg7_defi_records.mp4`,
    async (p) => {
      // 1. Click Quantum DeFi tab
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const defiTab = btns.find(b => b.innerText.includes('Quantum DeFi'));
        if (defiTab) defiTab.click();
      });
      await new Promise(r => setTimeout(r, 4000));

      // 2. Click Flight Records tab
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const recTab = btns.find(b => b.innerText.includes('Flight Records'));
        if (recTab) recTab.click();
      });
      await new Promise(r => setTimeout(r, 3800));
    },
    '[ 07 / 08 • QUANTUM AMM SWAP, STAKING & ON-CHAIN LEADERBOARD ]'
  );

  // SEGMENT 8: Clean Ending Screen (5.00s)
  await page.goto(endingCardUrl, { waitUntil: 'load' });
  await recordSegment(
    page,
    5.0,
    `${TMP_DIR}/seg8_ending.mp4`,
    async () => {
      await new Promise(r => setTimeout(r, 5000));
    },
    null
  );

  await browser.close();
  console.log('\nAll 8 video segments recorded successfully!');

  // Create concat file
  const concatFile = `${TMP_DIR}/concat_list.txt`;
  const fileLines = [
    `file '${TMP_DIR}/seg1_title.mp4'`,
    `file '${TMP_DIR}/seg2_controls.mp4'`,
    `file '${TMP_DIR}/seg3_gameplay_basic.mp4'`,
    `file '${TMP_DIR}/seg4_vehicles_abilities.mp4'`,
    `file '${TMP_DIR}/seg5_difficulty_missiles_ai.mp4'`,
    `file '${TMP_DIR}/seg6_crash_attestation.mp4'`,
    `file '${TMP_DIR}/seg7_defi_records.mp4'`,
    `file '${TMP_DIR}/seg8_ending.mp4'`,
  ].join('\n');
  fs.writeFileSync(concatFile, fileLines);

  console.log('\nAssembling final 90.00s master video with ffmpeg...');
  const finalVideo = `${rootDir}/docs/submission/demo.mp4`;
  const audioTrack = '/tmp/cyber_nova_soundtrack_90s.wav';

  await runCommand('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatFile,
    '-i', audioTrack,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'slow',
    '-b:v', '8000k',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', '90.00',
    finalVideo
  ]);

  console.log(`\nGenerated master video at: ${finalVideo}`);

  // Generate thumbnail from action gameplay (at 22.0s)
  const thumbnailPath = `${rootDir}/docs/submission/thumbnail.png`;
  await runCommand('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-ss', '00:00:22',
    '-i', finalVideo,
    '-vframes', '1',
    '-q:v', '2',
    thumbnailPath
  ]);
  console.log(`Generated thumbnail at: ${thumbnailPath}`);

  console.log('\n✅ Demo video production complete!');
})();
