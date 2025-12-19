// content.js

let hasPlayed = false;

function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'pr-merged-overlay';

    const text = document.createElement('div');
    text.className = 'pr-merged-text';
    text.innerText = 'PR MERGED';

    const flare = document.createElement('div');
    flare.className = 'pr-merged-flare';

    // Optional subtext
    const subtext = document.createElement('div');
    subtext.className = 'pr-merged-subtext';
    subtext.innerText = 'VICTORY ACHIEVED';

    overlay.appendChild(flare);
    overlay.appendChild(text);
    overlay.appendChild(subtext);

    document.body.appendChild(overlay);

    return overlay;
}

function playSound() {
    try {
        const audioUrl = chrome.runtime.getURL('victory.mp3');
        const audio = new Audio(audioUrl);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed (user interaction needed?):', e));
    } catch (e) {
        console.error('Error playing sound:', e);
    }
}

function triggerAnimation() {
    if (hasPlayed) return;
    hasPlayed = true;

    console.log('PR Merged! Triggering Dark Souls animation...');

    playSound();

    const overlay = createOverlay();

    // Force reflow
    overlay.offsetHeight;

    // Add show class to trigger transitions
    requestAnimationFrame(() => {
        overlay.classList.add('show');
    });

    // Remove after some time
    setTimeout(() => {
        overlay.classList.remove('show');
        // Wait for fade out
        setTimeout(() => {
            overlay.remove();
            hasPlayed = false; // Reset so it can play again if status toggles (unlikely but possible) 
        }, 2000);
    }, 5000);
}

function checkStatus() {
    // Selectors for GitHub PR status
    // 1. The main status badge in the header
    const statusBadge = document.querySelector('.State.State--purple, .gh-header-meta .State--purple');

    if (statusBadge && statusBadge.textContent.trim().toLowerCase().includes('merged')) {
        // Check if we already triggered for this instance? 
        // We only want to trigger if we witnessed the transition OR if we want to confirm it works.
        // For now, let's trigger it. But to avoid looping, we rely on 'hasPlayed'.
        // However, if I refresh the page on a merged PR, it will play.
        // Maybe we want to be smarter: only play if we saw it NOT merged before?
        // Since the request says "Trigger shall be PR being merged", playing on load of an already merged PR might be annoying.
        // I'll add a check: if detecting on initial load, maybe don't play? 
        // But for testing, it's easier if it plays.
        // I'll stick to: if it's merged, trigger. A simple sessionStorage flag could prevent re-triggering on reload?

        const prId = window.location.pathname; // unique enough for now
        const sessionKey = `pr-merged-played-${prId}`;

        if (!sessionStorage.getItem(sessionKey)) {
            triggerAnimation();
            sessionStorage.setItem(sessionKey, 'true');
        }
    }
}

// Observer to watch for DOM changes (GitHub SPA navigation / dynamic updates)
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
            checkStatus();
        }
    }
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Initial check
checkStatus();

console.log('Dark Souls PR Extension loaded.');
