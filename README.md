# Chrome PR Merged - Souls-like Edition

This Chrome extension plays a "Souls"-like style victory animation and sound when a GitHub Pull Request is merged.

## Installation

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right corner.
3.  Click **Load unpacked**.
4.  Select the `chrome_pr_merged` directory:    `/.../you_merged`

## Configuration (Sound)

The extension comes with a placeholder for the victory sound. To enable the actual sound:

1.  Download or find a `victory.mp3` file (e.g., the "Victory Achieved" sound from DS).
2.  Replace the `victory.mp3` file in the project folder with your file.
3.  Reload the extension in `chrome://extensions` (click the refresh icon).

## How to Test (Without Merging)

You can simulate a merge by manipulating the DOM:
1.  Go to an **Open** PR.
2.  Use DevTools to find the status badge (`State--open`).
3.  Change the classes to `State--merged` (and `State--purple`), and change the text to "Merged".
4.  The extension will detect the change and trigger.

