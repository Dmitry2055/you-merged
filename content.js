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

let lastStatus = 'unknown'; // 'unknown', 'open', 'merged', 'closed'

/**
 * Helper to determine current PR status from DOM
 */
function getCurrentStatus() {
    // 1. Check for Merged Badge
    const mergedBadge = document.querySelector('.State--merged, .State.State--purple');
    if (mergedBadge && mergedBadge.textContent.trim().toLowerCase().includes('merged')) {
        return 'merged';
    }

    // 2. Check for Open Badge
    const openBadge = document.querySelector('.State--open, .State.State--green');
    if (openBadge && openBadge.textContent.trim().toLowerCase().includes('open')) {
        return 'open';
    }

    // 3. Check for Closed Badge (red)
    const closedBadge = document.querySelector('.State--closed, .State.State--red');
    if (closedBadge && closedBadge.textContent.trim().toLowerCase().includes('closed')) {
        return 'closed';
    }

    // 4. Fallback: Check Timeline for "successfully merged" (strong indicator of merge)
    const timelineItems = document.querySelectorAll('.TimelineItem-body, .timeline-comment-header-text');
    for (const item of timelineItems) {
        if (item.textContent.includes('Pull request successfully merged and closed')) {
            return 'merged';
        }
    }

    // 5. Fallback: Title attributes
    const header = document.querySelector('.gh-header-meta .State');
    if (header) {
        const title = header.getAttribute('title');
        if (title === 'Status: Merged') return 'merged';
        if (title === 'Status: Open') return 'open';
        if (title === 'Status: Closed') return 'closed'; // or merged
    }

    return 'unknown';
}

function triggerAnimation() {
    if (hasPlayed) return;
    hasPlayed = true;

    console.log('PR Merged! Triggering Soul-like animation...');

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
            // Do NOT reset hasPlayed = false here. 
            // We only want it to play once per session/page load.
            // If the user un-merges and re-merges (rare), a reload is usually needed anyway.
        }, 2000);
    }, 5000);
}

function checkStatus() {
    const currentStatus = getCurrentStatus();

    // Log status change for debugging
    if (currentStatus !== lastStatus && currentStatus !== 'unknown') {
        console.log(`PR Status Change: ${lastStatus} -> ${currentStatus}`);
    }

    // Logic: Only play if we transition from 'open' to 'merged'.
    // If we load the page and it is already 'merged' (unknown -> merged), we DO NOT play.
    if (currentStatus === 'merged') {
        if (lastStatus === 'open') {
            triggerAnimation();
        } else if (lastStatus === 'unknown') {
            // Initial load is merged. Mark as played silently so we don't trigger later randomly.
            hasPlayed = true;
        }
    }

    // Update state, but ignore 'unknown' intermediate states if we already have a known state
    // (e.g. during a partial re-render) - though usually strictly following DOM is safer.
    if (currentStatus !== 'unknown') {
        lastStatus = currentStatus;
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
