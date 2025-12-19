# Chrome PR Merged - Souls-like Edition

This Chrome extension plays a "Souls"-like style victory animation and sound when a GitHub Pull Request is merged.

## Installation

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** in the top right corner.
3.  Click **Load unpacked**.
4.  Select the `chrome_pr_merged` directory:
    `/.../chrome_pr_merged`

## Configuration (Sound)

The extension comes with a placeholder for the victory sound. To enable the actual sound:

1.  Download or find a `victory.mp3` file (e.g., the "Victory Achieved" sound from DS).
2.  Replace the `victory.mp3` file in the project folder with your file.
3.  Reload the extension in `chrome://extensions` (click the refresh icon).

## Usage

1.  Go to any GitHub Pull Request page.
2.  Merge the Pull Request.
3.  Enjoy the victory!

## Troubleshooting

-   **No sound?** Make sure you replaced `victory.mp3` with a valid audio file. Also, check if you have interacted with the page (Chrome blocks autoplay audio until user interaction).
-   **No animation?** The extension looks for the purple "Merged" badge. If GitHub updates their UI, this might need an update.
