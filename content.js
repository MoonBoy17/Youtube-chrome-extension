// --- Configuration ---
const TARGET_RATE = 1.5;
const BRAND_TEXT = "Made by Harsh Sukhwal";

// --- State Tracking ---
const pausedByExtension = new WeakSet();
const enforcedSpeeds = new WeakMap();
let isExtensionEnabled = true;

// Initialize state
chrome.storage.local.get(['extensionEnabled'], (result) => {
  if (result.extensionEnabled !== undefined) {
    isExtensionEnabled = result.extensionEnabled;
  }
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.extensionEnabled) {
    isExtensionEnabled = changes.extensionEnabled.newValue;
    if (!isExtensionEnabled) {
      // Optional: Clean up if disabled (e.g. remove branding)
      const brand = document.getElementById('yt-auto-pause-brand');
      if (brand) brand.remove();
    }
  }
});

// --- Feature: Branding ---
function injectBranding() {
  if (!isExtensionEnabled) return;
  if (document.getElementById('yt-auto-pause-brand')) return;

  const brandDiv = document.createElement('div');
  brandDiv.id = 'yt-auto-pause-brand';
  brandDiv.textContent = BRAND_TEXT;

  Object.assign(brandDiv.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '8px 12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontFamily: 'Roboto, Arial, sans-serif',
    fontSize: '12px',
    borderRadius: '8px',
    backdropFilter: 'blur(5px)',
    zIndex: '9999',
    pointerEvents: 'none',
    opacity: '0.8',
    transition: 'opacity 0.3s ease',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  });

  document.body.appendChild(brandDiv);
}

// --- Core Actions ---

function systemPause(video) {
  if (!isExtensionEnabled) return;
  if (!video.paused && !video.ended) {
    // Mark as system action using dataset
    video.dataset.ytAutoPauseSystem = 'true';
    pausedByExtension.add(video);
    video.pause();
    console.log('YouTube Auto-Pause: System paused video.');
  }
}

function systemResume(video) {
  if (video.paused) {
    video.dataset.ytAutoPauseSystem = 'true'; // Reusing same flag for "system action"
    video.play().catch(e => console.log('Auto-Resume failed:', e));
    // We don't delete from pausedByExtension here yet; the play event does it.
    // Actually, play event will delete it. That's fine.
  }
}

// --- Event Listeners ---

// Capture 'pause' events
document.addEventListener('pause', (e) => {
  const video = e.target;
  if (video.tagName !== 'VIDEO') return;

  // Check if we initiated this pause
  if (video.dataset.ytAutoPauseSystem === 'true') {
    // It was us. Clear the flag.
    video.dataset.ytAutoPauseSystem = '';
    // State is already in pausedByExtension (added in systemPause)
  } else {
    // It was the user (or YouTube)
    pausedByExtension.delete(video);
    console.log('YouTube Auto-Pause: User paused. State cleared.');
  }
}, true);

// Capture 'play' events
document.addEventListener('play', (e) => {
  const video = e.target;
  if (video.tagName !== 'VIDEO') return;

  if (video.dataset.ytAutoPauseSystem === 'true') {
    // We resumed it. Clear flag.
    video.dataset.ytAutoPauseSystem = '';
    pausedByExtension.delete(video); // Clean up state
  } else {
    // User played manually.
    pausedByExtension.delete(video);
    console.log('YouTube Auto-Pause: User played. State cleared.');
  }
}, true);


// --- Visibility Logic ---

function handleVisibilityChange() {
  const videos = document.querySelectorAll('video');
  if (document.hidden) {
    videos.forEach(video => {
      systemPause(video);
    });
  } else {
    videos.forEach(video => {
      if (pausedByExtension.has(video)) {
        systemResume(video);
      }
    });
  }
}

// --- Speed Logic ---
function enforceSpeed() {
  if (!isExtensionEnabled) return;
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    const currentSrc = video.currentSrc;
    const lastEnforcedSrc = enforcedSpeeds.get(video);

    if (currentSrc !== lastEnforcedSrc) {
      if (video.playbackRate !== TARGET_RATE && video.readyState > 0) {
        video.playbackRate = TARGET_RATE;
        enforcedSpeeds.set(video, currentSrc);
      } else if (video.readyState === 0) {
        video.onloadedmetadata = () => {
          if (video.playbackRate !== TARGET_RATE) {
            video.playbackRate = TARGET_RATE;
            enforcedSpeeds.set(video, currentSrc);
          }
        };
        enforcedSpeeds.set(video, currentSrc);
      } else {
        enforcedSpeeds.set(video, currentSrc);
      }
    }
  });
}

// --- Wiring ---

document.addEventListener('visibilitychange', handleVisibilityChange);

// removed window.blur/focus to prevent pausing when clicking extension icon.
// Only tab switch or minimize (visibilityState) will now trigger pause.


setInterval(() => {
  injectBranding();
  enforceSpeed();
}, 1000);

injectBranding();
enforceSpeed();
