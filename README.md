# ServicePro - Web Admin Dashboard

A modern, responsive Web Admin Dashboard UI built for **ServicePro** (Home & Lifestyle Service Booking Platform) using **HTML5**, **Tailwind CSS (via CDN)**, and modular **Vanilla JavaScript (ES6+)**.

---

## 📁 Modular Folder Structure

Everything is organized into separate, dedicated folders for **login**, **dashboard**, **components**, and **data**:

```
service_pro_web/
├── index.html                           # Single-page bootstrap with Auth Guard (Login & Dashboard)
├── login/
│   └── login.js                         # Login Screen Controller, Demo Autofill, and Auth Validation
├── dashboard/
│   ├── dashboard.js                     # Dashboard Navigation, View Switching, and Sign Out Handler
│   └── components/
│       └── uiComponents.js              # KPI Cards, Distribution Bar, Tables, & Inline Notification Popover
├── assets/
│   └── css/
│       └── styles.css                   # Custom scrollbars, animations, status pills, and dropdown styling
├── js/
│   ├── app.js                           # Master App Bootstrap: Auth Session Checker & View Transition
│   └── data/
│       └── mockData.js                  # Central Data Store: Auth Session, Bookings, Services, Notifications
└── README.md
```

---

## 🔐 Authentication & Sign Out Flow

1. **Initial Screen:** When opening the application, the user starts on the clean, full-screen **Admin Login Screen**.
2. **One-Click Demo Credentials:** Click **"Fill Demo Admin"** to auto-populate `admin@servicepro.com` / `Admin@Pro2026!`.
3. **Sign In:** Clicking **"Sign In to Admin Portal"** verifies credentials, saves session in `localStorage`, and smoothly transitions into the **Dashboard**.
4. **Sign Out:** At the bottom of the fixed sidebar (right below the `Alex Morgan` profile card), there is a prominent **Sign Out** button (`🚪 Sign Out`). Clicking it clears the session and instantly returns to the Login Screen.

---

## 🔔 Inline Notification Dropdown Popover

- As requested, there is **no separate notifications page** cluttering the sidebar.
- Instead, clicking the **Notification Bell** in the top-right header toggles a **compact floating dropdown popover** anchored right below the bell.
- Displays recent customer mobile push notifications, timestamps, booking IDs, and delivery statuses.
- Includes a **"Clear All"** action to reset notification history.
- Clicking anywhere outside automatically closes the dropdown.

---

## 🚀 Running the Project

- **Direct in Browser:** Simply double-click `index.html` to open directly in Chrome, Edge, Safari, or Firefox (`file:///` protocol supported with zero CORS issues).
- **Via Local Server:** Run `npx serve .` or use VS Code's Live Server.
