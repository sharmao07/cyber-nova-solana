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

  if (labelText) {
    await page.evaluate((txt) => {
      let tag = document.getElementById('demo-video-label-tag');
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
        tag.style.background = 'rgba(8, 10, 18, 0.9)';
        tag.style.border = '1px solid rgba(0, 255, 255, 0.4)';
        tag.style.padding = '6px 16px';
        tag.style.borderRadius = '8px';
        tag.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
        tag.style.pointerEvents = 'none';
        document.body.appendChild(tag);
      }
      tag.innerText = txt;
    }, labelText);
  }

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
    '-b:v', '8000k',
    outputFile
  ]);

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
    if (active) {
      try {
        ffmpeg.stdin.write(Buffer.from(data, 'base64'));
      } catch (e) {}
    }
    try {
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {}
  });

  const startTime = Date.now();
  // Execute interactive actions during recording
  if (actionFn) {
    await actionFn(page, startTime, durationSec);
  }

  // Ensure recording lasts the exact duration
  const elapsed = (Date.now() - startTime) / 1000;
  if (elapsed < durationSec) {
    await new Promise(r => setTimeout(r, (durationSec - elapsed) * 1000));
  }

  active = false;
  await client.send('Page.stopScreencast').catch(() => {});
  ffmpeg.stdin.end();

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

  // Load Main App
  await page.goto(APP_URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  // SEGMENT 2: Start Screen, Tutorial & Available Controls (8.00s)
  await recordSegment(
    page,
    8.0,
    `${TMP_DIR}/seg2_controls.mp4`,
    async (p) => {
      // Show flight cabinet
      await new Promise(r => setTimeout(r, 1500));
      // Click Flight Guide modal
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const guideBtn = btns.find(b => b.innerText.includes('Flight Guide'));
        if (guideBtn) guideBtn.click();
      });
      await new Promise(r => setTimeout(r, 4000));
      // Close modal
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const closeBtn = btns.find(b => b.innerText.includes('Got it') || b.innerText.includes('Close') || b.querySelector('svg'));
        if (closeBtn) closeBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));
    },
    '[ 02 / 08 • FLIGHT HUD, DIFFICULTY & CONTROLS GUIDE ]'
  );

  // SEGMENT 3: Continuous Gameplay — Movement, Obstacles & Shards (20.00s)
  await recordSegment(
    page,
    20.0,
    `${TMP_DIR}/seg3_gameplay_basic.mp4`,
    async (p, startTime, dur) => {
      // Natural flight: feather space key periodically to cruise between zappers and collect shards
      const end = startTime + dur * 1000 - 500;
      let thrust = false;
      while (Date.now() < end) {
        thrust = !thrust;
        if (thrust) {
          await p.keyboard.down('Space');
          await new Promise(r => setTimeout(r, 500 + Math.random() * 300));
        } else {
          await p.keyboard.up('Space');
          await new Promise(r => setTimeout(r, 350 + Math.random() * 250));
        }
      }
      await p.keyboard.up('Space');
    },
    '[ 03 / 08 • 60 FPS JETPACK FLIGHT & HAZARD EVASION ]'
  );

  // SEGMENT 4: Power-Ups, Special Abilities & Vehicles (15.00s)
  await recordSegment(
    page,
    15.0,
    `${TMP_DIR}/seg4_vehicles_abilities.mp4`,
    async (p, startTime, dur) => {
      // Play and show vehicle / gravity flipping
      const end = startTime + dur * 1000 - 500;
      let thrust = false;
      while (Date.now() < end) {
        thrust = !thrust;
        if (thrust) {
          await p.keyboard.down('Space');
          await new Promise(r => setTimeout(r, 600));
        } else {
          await p.keyboard.up('Space');
          await new Promise(r => setTimeout(r, 400));
        }
      }
      await p.keyboard.up('Space');
    },
    '[ 04 / 08 • SPEED BOOSTER, VEHICLES & EJECT-ARMOR ]'
  );

  // SEGMENT 5: Increasing Difficulty, Missiles & AI Copilot (15.00s)
  await recordSegment(
    page,
    15.0,
    `${TMP_DIR}/seg5_difficulty_missiles_ai.mp4`,
    async (p) => {
      // 1. Toggle Apex Hard Mode
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const hardBtn = btns.find(b => b.innerText.includes('Hard') && b.innerText.includes('1.8x'));
        if (hardBtn) hardBtn.click();
      });
      await new Promise(r => setTimeout(r, 2000));

      // 2. Fly in hard mode
      await p.keyboard.down('Space');
      await new Promise(r => setTimeout(r, 800));
      await p.keyboard.up('Space');
      await new Promise(r => setTimeout(r, 500));

      // 3. Toggle A.R.I.A. Autonomous AI Copilot
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const aiBtn = btns.find(b => b.innerText.includes('AI Copilot') || b.innerText.includes('Manual Pilot'));
        if (aiBtn) aiBtn.click();
      });

      // Let AI pilot autonomously with real-time holographic radar and threat brackets
      await new Promise(r => setTimeout(r, 11000));
    },
    '[ 05 / 08 • APEX DIFFICULTY & A.R.I.A. AUTONOMOUS AI COPILOT ]'
  );

  // SEGMENT 6: Collision / Game-Over & On-Chain Solana Attestation (12.00s)
  await recordSegment(
    page,
    12.0,
    `${TMP_DIR}/seg6_crash_attestation.mp4`,
    async (p) => {
      // Turn off AI autopilot and let Nova crash into hazard
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const aiBtn = btns.find(b => b.innerText.includes('ACTIVE') || b.innerText.includes('AI Copilot'));
        if (aiBtn && aiBtn.innerText.includes('ACTIVE')) aiBtn.click();
      });

      // Allow crash into hazard
      await new Promise(r => setTimeout(r, 3000));

      // Click "Attest Run on Solana" in the Flight Terminated modal
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const attestBtn = btns.find(b => b.innerText.includes('Attest') && b.innerText.includes('Solana'));
        if (attestBtn) attestBtn.click();
      });
      await new Promise(r => setTimeout(r, 6000));

      // Close modal
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const closeBtn = btns.find(b => b.innerText.trim() === 'Close');
        if (closeBtn) closeBtn.click();
      });
      await new Promise(r => setTimeout(r, 2500));
    },
    '[ 06 / 08 • RUN TERMINATION & ON-CHAIN SOLANA ATTESTATION ]'
  );

  // SEGMENT 7: Personal Best, Progression & DeFi Ecosystem (8.00s)
  await recordSegment(
    page,
    8.0,
    `${TMP_DIR}/seg7_defi_records.mp4`,
    async (p) => {
      // Click Quantum DeFi tab
      await p.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const defiTab = btns.find(b => b.innerText.includes('Quantum DeFi'));
        if (defiTab) defiTab.click();
      });
      await new Promise(r => setTimeout(r, 4000));

      // Click Flight Records tab
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
    '-b:v', '7500k',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-t', '90.00',
    finalVideo
  ]);

  console.log(`\nGenerated master video at: ${finalVideo}`);

  // Generate thumbnail from an action frame (at 25.0s)
  const thumbnailPath = `${rootDir}/docs/submission/thumbnail.png`;
  await runCommand('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-ss', '00:00:25',
    '-i', finalVideo,
    '-vframes', '1',
    '-q:v', '2',
    thumbnailPath
  ]);
  console.log(`Generated thumbnail at: ${thumbnailPath}`);

  // Create aetherbound alias copies as requested in prompt
  fs.copyFileSync(finalVideo, `${rootDir}/docs/submission/aetherbound-demo.mp4`);
  fs.copyFileSync(thumbnailPath, `${rootDir}/docs/submission/aetherbound-thumbnail.png`);
  console.log('Created aetherbound alias files.');

  console.log('\n✅ Demo video production complete!');
})();
