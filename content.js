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
    // Debug logging
    // console.log('Checking PR status...');

    let isMerged = false;

    // Selector 1: The main status badge
    // Based on user screenshot: span.State.State--merged inside .gh-header-meta
    const statusBadge = document.querySelector('.State--merged, .State.State--purple');
    if (statusBadge && statusBadge.textContent.trim().toLowerCase().includes('merged')) {
        console.log('PR_MERGED_EXTENSION: Detected merged status via badge:', statusBadge);
        isMerged = true;
    }

    // Selector 2: The Timeline Event for merging
    if (!isMerged) {
        // Look for the text "Pull request successfully merged and closed"
        const timelineItems = document.querySelectorAll('.TimelineItem-body, .timeline-comment-header-text');
        for (const item of timelineItems) {
            if (item.textContent.includes('Pull request successfully merged and closed')) {
                console.log('PR_MERGED_EXTENSION: Detected merged status via timeline event');
                isMerged = true;
                break;
            }
        }
    }

    // Selector 3: Data attribute on the PR header (sometimes present)
    if (!isMerged) {
        const header = document.querySelector('.gh-header-meta .State');
        if (header && header.getAttribute('title') === 'Status: Merged') {
            console.log('PR_MERGED_EXTENSION: Detected merged status via title attribute');
            isMerged = true;
        }
    }

    if (isMerged) {
        // For debugging/demo purposes, we allow it to play again on reload.
        // The original logic prevented it via sessionStorage, which made testing hard.
        // We still check 'hasPlayed' in triggerAnimation to prevent double loop in one session.
        triggerAnimation();
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
