## Obsrvr.

**Precision Research & Market Observation Tool**

Obsrvr is a high-performance, minimalist web application designed for field researchers and market observers to track frequency and timing data with zero-latency, allowing you to log complex variables via large touch targets and haptic feedback without looking away from your subject.

---

### Core Features

* **Customizable Research Grid:** Generate a dynamic grid of up to 20 unique variable counters instantly.
* **Sequential Interval Tracking:** Capture the exact millisecond-precision time elapsed between any two button presses (Global Interval).
* **Variable-Specific Delta:** Track the frequency and time gap between successive presses of the same variable to identify patterns in specific behaviors.
* **Zen Mode (Focus):** A full-screen interface that strips away all UI chrome, leaving only the touch targets to prevent accidental navigation.
* **Variable Renaming:** Real-time labeling of counters to adapt to changing observation environments.
* **Export:** Pre-named CSV exports that switch between simple summary statistics and deep-dive sequential logs based on your session settings.
* **Tactile UX:** Integrated haptic (vibration) feedback for every successful log, ensuring data entry is confirmed without visual checks.

---

### Technical Deep Dive

#### Architecture & State

The app operates on a **Single-Source-of-Truth (SSoT)** state object. Unlike traditional DOM-reliant counters, every click updates a central JavaScript state before reflecting in the UI. This ensures that the history stack and log array remain synchronized for accurate undo operations and exports.

#### Time-Series Data Collection

Obsrvr utilizes the `Date.now()` method to generate Unix timestamps for every event.

* **Global Interval Calculation:** t_{\Delta} = t_{current} - t_{last\_any\_press}
* **Variable Interval Calculation:** t_{var\Delta} = t_{current} - t_{last\_specific\_press}
This data is pushed into a `clickLogs` array, forming a linear time-series dataset that can be imported into R, Python, or Excel for advanced statistical analysis.

#### Mobile Performance Optimization

To achieve a "native app" feel in a browser environment, the following engineering choices were made:

* **Touch-Action Manipulation:** The CSS `touch-action: manipulation` property is applied globally to kill the 300ms click delay on mobile browsers and disable double-tap zooming.
* **Haptic Bridge:** Uses the `navigator.vibrate` API to provide physical feedback, mimicking the sensation of a mechanical tally counter.
* **Viewport Locking:** Employs `user-scalable=no` and `maximum-scale=1.0` meta tags to prevent accidental layout shifts during rapid-fire tapping sessions.

#### Deployment

Designed for serverless hosting. The app is a static site (HTML5/CSS3/Vanilla JS) that requires no backend, making it ideal for **GitHub Pages** deployment. Data is processed entirely client-side, ensuring researcher privacy and offline reliability.

---

### Setup

1. Upload `index.html`, `styles.css`, and `script.js` to your repository.
2. Enable **GitHub Pages** in settings.
3. Access the URL on your mobile device and "Add to Home Screen" for the full PWA experience.
