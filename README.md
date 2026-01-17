# YouTube Auto-Pause Extension

A smart Chrome extension that automatically manages your YouTube playback. It pauses videos when you look away (switch tabs, minimize windows) and resumes them when you return, ensuring you never miss a moment.

## Features

- **Smart Auto-Pause**: Automatically pauses video playback when the tab is hidden or the window is minimized.
- **Auto-Resume**: Seamlessly resumes playback when the YouTube tab becomes active again.
- **Speed Enforcement**: Enforces a default 1.5x playback speed for efficient viewing.
- **Manual Override**: If you manually pause/play, the extension respects your choice.
- **Toggle Control**: Easily enable or disable the extension via the popup menu.

## Installation

1.  Clone this repository or download the source code.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the directory containing this extension's files.

## Usage

-   **Normal Use**: Just watch YouTube! The extension works in the background.
-   **Popup Controls**: Click the extension icon in the toolbar to toggle the features on or off.
-   **Status Indicator**: A green dot in the popup indicates the extension is active; a grey dot means it is disabled.

## Permissions

-   `storage`: Used to save your "Enable/Disable" preference.
-   Host Permissions: `*://*.youtube.com/*` to interact with YouTube video players.

## Credits

Designed & Built by **Harsh Sukhwal**.
