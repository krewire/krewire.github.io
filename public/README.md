# Krewire Favicon & App Icon Pack

Official multi-platform icon package for the Krewire ecosystem.

## Assets Included

| File | Resolution | Target & Usage |
| :--- | :--- | :--- |
| **`favicon.ico`** | Multi (16, 32, 48) | Fallback for legacy browsers, desktop shortcuts |
| **`favicon.svg`** | Scalable Vector | Modern SVG favicon for Chrome, Firefox, Safari |
| **`favicon-16x16.png`** | 16 × 16 | Standard browser tab |
| **`favicon-32x32.png`** | 32 × 32 | Retina browser tab, Safari pinned tab |
| **`favicon-48x48.png`** | 48 × 48 | Windows taskbar & desktop shortcut |
| **`favicon-96x96.png`** | 96 × 96 | Google TV, desktop dock |
| **`apple-touch-icon.png`** | 180 × 180 | Apple iOS Safari Home Screen icon |
| **`apple-touch-icon-152x152.png`** | 152 × 152 | Apple iPad Home Screen icon |
| **`android-chrome-192x192.png`** | 192 × 192 | Android PWA app icon |
| **`android-chrome-512x512.png`** | 512 × 512 | Android PWA splash screen & Google Play |
| **`mstile-150x150.png`** | 150 × 150 | Windows 8/10/11 Start tile |
| **`site.webmanifest`** | JSON | Web App Manifest configuration |
| **`browserconfig.xml`** | XML | Windows Tile color configuration |

## HTML Integration Snippet

Paste the following into your HTML head section:

```html
<!-- Modern SVG Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">

<!-- Standard ICO Fallback -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- PNG Icons for High-DPI Browsers -->
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">

<!-- Apple iOS Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android / PWA Manifest -->
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0B1F3B">

<!-- Windows Tile -->
<meta name="msapplication-TileColor" content="#0B1F3B">
<meta name="msapplication-config" content="/browserconfig.xml">
```
