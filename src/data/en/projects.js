// English overrides for projects.js, by project id. Only translatable
// fields; everything else (slug, images, stack, links…) comes from the
// Spanish source. Practice items only translate what /projects shows.

export const projectsEn = {
  rapisites: {
    category: "SaaS",
    role: "Founder and full-stack developer",
    team: "Personal project",
    summary: "A SaaS that builds websites with AI: answer 4 questions and your site is live, with technical SEO, in minutes.",
    headline: "Answer four questions and your site is live, with technical SEO, in minutes.",
    highlights: [
      "80+ sites generated with AI (Claude API)",
      "API used by Wink to host its clients' websites",
      "Visual editor with autosave, undo/redo and drag & drop",
    ],
    description:
      "RapiSites is my main personal project: a multi-tenant website builder where anyone answers four questions and gets a complete site —structure, content and SEO metadata— generated with the Claude API in under thirty seconds. Each site is served on its own subdomain or on the client's domain with automatic HTTPS, and it's published atomically: a pre-publish SEO audit, a frozen snapshot and a version history with one-click rollback. It includes a visual editor with autosave, undo/redo and drag & drop sections, a catalog of 57 components that ship no JavaScript on the public site (performance is SEO) and bilingual sites. I design and build it end to end, from product to infrastructure: Nuxt 4 with SSR, PostgreSQL + Drizzle, pg-boss queues, Cloudflare R2, Caddy with wildcard and on-demand certificates, Docker deployments on a hardened VPS, encrypted backups and observability with Sentry and BetterStack. It's live and under active development.",
    features: [
      "4-question wizard that generates structure, content and SEO with the Claude API.",
      "Multi-tenant sites on subdomains and custom domains with automatic HTTPS.",
      "Atomic publishing with SEO audit, version history and rollback.",
      "Visual editor with autosave, undo/redo and drag & drop sections.",
      "57 components with no JavaScript on the public site, in Spanish and English.",
      "Own infrastructure: Docker, Caddy, PostgreSQL, R2, encrypted backups and monitoring.",
    ],
  },
  "wink-app": {
    category: "Platform",
    role: "Head of Development",
    team: "Wink Digital S.A.",
    summary: "Multi-agency digital signage platform: real-time management of screens, content and playlists.",
    headline: "A network of screens — content, playlists and schedules — run from a single dashboard, with data and permissions isolated per agency.",
    highlights: [
      "500+ deployments and 99% of screens online",
      "Real-time monitoring: content, device and network",
      "Multi-agency with MFA (TOTP) and role-based access",
    ],
    description:
      "Wink App is the control panel of the Wink ecosystem for managing digital signage screen networks. It handles screens, zones and groups, uploading and organizing content, building playlists and scheduling playback — all on a multi-agency architecture with data and permissions isolated per client. I build it with a focus on security (multi-factor authentication and role-based access control) and real-time sync with Firebase.",
    features: [
      "Management of screens, zones and display groups.",
      "Content and playlist editor with time-based scheduling.",
      "Multi-agency architecture with isolated data and permissions.",
      "Security with MFA (TOTP) and role-based access control (RBAC).",
      "Real-time data sync with Firebase.",
    ],
  },
  "wink-studio": {
    category: "Platform",
    role: "Head of Development",
    team: "Wink Digital S.A.",
    summary: "A studio for HTML apps on Wink's screens: SDK, player simulator, automated certification and 10 apps ready for the catalog.",
    headline: "The studio where the apps for Wink's screens are made: they're created, configured, certified and packaged for upload from a single screen.",
    highlights: [
      "10 finished, certified apps: Weather, Daily Menu, Queue…",
      "A studio with every app: settings, scenarios, listing, certify and upload",
      "Player simulator and automated certification across all 11 sizes",
    ],
    description:
      "Wink Studio is the studio where the HTML apps that run on Wink's screens are designed, tested and packaged: Weather, Daily Menu, Queue, Departures Board, Clock, Order Ready, Notices, Agenda, Birthdays and Countdown. Each app is a static site (Vite + TypeScript) to be hosted on RapiSites and published to the Wink dashboard's catalog, where any company can add it to its layouts; they're finished and certified, and publishing waits on the back end. An app declares its settings in a manifest and the form to edit them builds itself; the SDK handles settings, the screen's time zone and communication with the player. For development there's a simulator that acts as the player and shows the app in all 11 real sizes at once, and before shipping every app goes through an automated certification in Chrome: overflow and clipped text at every size, loading in under a second with a 4× slower CPU, working offline, 20 scene changes in a row and 24 hours of fast-forwarded clock without memory growth. CI only certifies the apps that changed. Everything runs from the studio's home screen: each app with its screenshot, its version and whether it's certified or changed since; from there you create a new app with a wizard, edit its settings and scenarios with the live app alongside, write its catalog listing while seeing how it looks in the dashboard, certify it with live progress, and prepare it for upload with a final review and the folder ready to drag in.",
    features: [
      "10 apps for screens, each with its settings, scenarios and catalog listing.",
      "Studio home with every app: version, whether it's certified or changed since, and what it's waiting on from the back end.",
      "“New app” wizard, settings and scenario editors, and the catalog listing with the dashboard preview alongside.",
      "Prepare for upload: checks everything is in order and builds the folder for Web App plus the listing folder.",
      "SDK: per-instance settings, the screen's time zone and communication with the player.",
      "Settings manifest (text, color, date, time, lists…) from which the form to edit them is generated (today in the studio and the simulator; in the dashboard once the back end reads the manifest).",
      "Player simulator: all 11 sizes at once, live settings, one-click scenarios, network drops and scene changes.",
      "Automated certification in Chrome, run from the studio with live progress and history; CI only certifies what changed.",
      "Built for a Raspberry Pi: offline-ready, no memory leaks and anti burn-in animations.",
    ],
  },
  "wink-site": {
    category: "Website",
    role: "Head of Development",
    team: "Wink Digital S.A.",
    summary: "Wink's official website: lead capture, pricing plans and a showcase of the digital signage platform.",
    headline: "Wink's commercial front door: a site built to convert, with every step of the funnel measured.",
    highlights: [
      "11 sections designed to capture leads",
      "GA4 + GTM tracking with custom events",
      "CSS-3D scrollytelling on “How it works”",
    ],
    description:
      "Wink Site is the marketing site and commercial front door of the Wink ecosystem. I designed and built the whole site with a focus on conversion: hero, value proposition, metrics, service models, platform capabilities, a Wink AI showcase, real deployment stories, testimonials, a comparison table of the four plans (Basic, Professional, Business, Enterprise) and a validated contact form sent through EmailJS for lead capture. It's built with Vue 3 + Vite, PrimeVue and Tailwind for the UI, Pinia for state and VueFire for Firebase, and deployed on Firebase Hosting with hardened security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy) and immutable asset caching. Measurement runs on Google Tag Manager + GA4 with a custom tracking plan for key events such as form submissions, demo clicks, plan expansion and user properties to tell B2B prospects from individuals.",
    features: [
      "11-section site built for conversion and lead capture.",
      "Contact form with vee-validate + EmailJS and a custom validation schema.",
      "Comparison table and cards for the four pricing plans.",
      "GA4 tracking through Google Tag Manager with custom events (lead, demo, navigation, plan expansion).",
      "Hardened security headers on Firebase Hosting (HSTS, CSP, X-Frame, Permissions-Policy).",
      "Scroll animations with AOS and a responsive, mobile-first design.",
    ],
  },
  hmc: {
    category: "Platform",
    role: "Full-stack developer",
    team: "Client project",
    summary: "Medical website with a quote module and an admin dashboard. Vue + Firebase.",
    headline: "Online quotes for medical tests with clear prices, plus a dashboard for the team to manage their content.",
    highlights: [
      "Quote builder with per-test detail and totals",
      "Admin dashboard for doctors, specialties and articles",
      "Role-based access with Firebase Auth",
    ],
    description:
      "I designed and built a complete web platform for Honduras Medical Center, focused on managing its medical content and patient care. It includes an admin dashboard for doctors, specialties and articles, and a robust medical test quote module that lets users request personalized estimates online, listing each selected test with its price and medical notes. It's built with Vue 3, Firebase, Pinia and Tailwind CSS, designed to be fully responsive, fast and secure, with Firebase Auth for authentication and a role system for admin access.",
    features: [
      "Admin dashboard for doctors, specialties and articles.",
      "Medical quote module with a table and totals.",
      "Login with access roles.",
      "Responsive, mobile-first site.",
    ],
  },
  gantthub: {
    category: "SaaS",
    role: "Creator and full-stack developer",
    team: "Personal project",
    summary: "A collaborative project manager: Kanban, Gantt, budget, meetings and ideas in one place. Vue 3 + Firebase.",
    headline: "Board, Gantt, budget and meetings in one place: it started as a way to organize my own projects and today Wink and 10 other companies use it.",
    highlights: [
      "Used by Wink and 10 other companies",
      "A custom Gantt: drag to move, stretch to change dates",
      "Role permissions in Firestore rules, with 70+ tests",
    ],
    description:
      "GanttHub started as my tool for keeping track of my own tasks; then I used it to organize Wink, RapiSites and SwiftFlow, and that's how it became a product. It brings together what usually lives in several tools: a Kanban board with drag & drop, a hand-built Gantt chart (drag to move, stretch to change dates, day, week or month views and milestones), per-project budget and finances in several currencies, meetings with built-in video calls (Jitsi) and a summary, ideas, and process flows that can be generated with AI. The home dashboard answers “what changed and what's on me”: projects that need attention, what's assigned to you, mentions and team workload. Every project has roles (owner, admin, editor and viewer) enforced in the Firestore and Storage rules, not just in the UI, and covered by tests in the emulator. The interface is built on my own component library, with tokens, per-project theming, Spanish and English, and it works as a PWA. Notifications —mentions, due-date reminders, invitations and daily and weekly reports— go out by email from Cloud Functions. I design and build it end to end: Vue 3, TypeScript, Pinia, Tailwind CSS 4 and Firebase (Auth with 2FA, Firestore, Storage, Functions and Hosting).",
    features: [
      "Kanban board with drag & drop, subtasks, files, notes with mentions and activity.",
      "A custom Gantt chart: move and stretch bars, day, week or month views, milestones and grouping.",
      "Per-project budget and finances (USD, HNL, EUR), hourly or fixed price, with CSV export.",
      "Meetings with built-in video calls (Jitsi), email invitations and a summary.",
      "Owner, admin, editor and viewer roles enforced in the Firestore and Storage rules, with tests.",
      "Home dashboard with what changed, what's assigned to you, mentions and project health.",
      "Emails for mentions, due dates, invitations and daily and weekly reports (Cloud Functions).",
      "Own component library, 2FA (TOTP), Spanish and English, and PWA.",
    ],
  },
  swiftflow: {
    category: "Tool",
    role: "Creator and developer",
    team: "Personal project",
    summary: "A typing test in Spanish and English that doesn't just measure you: it tells you where you slip and builds the practice to fix it.",
    headline: "A typing test that doesn't just measure: it tells you where you slip and builds the practice to fix it.",
    highlights: [
      "50+ people use it, no ads and no account",
      "Errors by key, finger and combination, with practice to fix them",
      "100% keyboard-operable, checked with axe",
    ],
    description:
      "SwiftFlow is my hobby project, and I keep improving it: a typing test in Spanish and English that goes beyond measuring speed. It analyzes every keystroke to show which keys, fingers and combinations slow you down, and builds practice around your weak spots. It has 13 modes —time, words, numbers, quotes, literature classics, voice dictation, code in 8 languages, zen, key and finger training—, a 24-lesson touch-typing course adapted to your keyboard layout, achievements, daily and weekly challenges, and a history with an error map, trends, streaks and personalized tips. Everything works without an account or a server: data lives in the browser, it installs as a PWA and works offline. It's built with Vue 3, Pinia and Tailwind CSS 4, organized by feature, with unit tests in Vitest, end-to-end tests in Playwright and accessibility checks with axe.",
    features: [
      "13 practice modes, including voice dictation and code in 8 languages.",
      "Error analysis by key, finger and combination, with personalized tips.",
      "24-lesson touch-typing course, adapted to 5 keyboard layouts.",
      "Achievements, daily and weekly challenges, and shareable monthly recaps.",
      "UI and texts in Spanish and English, 100% keyboard-operable.",
      "PWA with no account or server: works offline and stores everything in the browser.",
    ],
  },

  // Practice
  hacecuanto: {
    category: "Mobile app",
    role: "iOS design and development",
    team: "Personal project",
    summary: "A native iOS and watchOS app to know how long ago you did something: events, habits with streaks and things due every X days.",
    headline: "How long ago was the last time? One tap to log it and the app tells you when it's due, from the iPhone, widgets, Siri or the Apple Watch.",
    highlights: [
      "Native iPhone and Apple Watch app in SwiftUI + SwiftData",
      "Log without opening the app: widgets, Siri, Control Center and notifications",
      "Reminders that learn your rhythm and places that ask when you arrive",
    ],
    description:
      "Hace Cuánto (Spanish for “how long ago”) answers a question I kept asking myself: how long ago was the last time I…? Got a haircut, washed the car, went grocery shopping, read. Each thing is an item of one of three kinds: an event (just how long ago and how many times), a habit (with a daily or weekly goal and a streak) or something due every X days (it tells you how long until it's due or how overdue it is). Logging is one tap, with a toast to undo; if you want, you add a detail (text, a number or choices), another date or a timer that shows in the Dynamic Island. Home opens with what's due and a summary of your week, and every item has its numbers, an 18-week calendar, a monthly count and its patterns (“You do it most on Sunday nights”). You can log without opening the app: single-item, multi-item and to-do widgets, the Lock Screen, Control Center, Siri and the “Log ✓” button on notifications. Reminders learn your rhythm, habits with a daily goal can nudge you every so often within a time window, and an item can have a place: when you get to the store it asks whether to log it. The Apple Watch has its own app and complication, and logs even when the iPhone isn't nearby. There are automatic JSON backups, and restoring never duplicates anything. I built it end to end in Swift: SwiftUI, SwiftData shared through an App Group, App Intents, WidgetKit, ActivityKit, Core Location and WatchConnectivity, with tests for the logic and for every widget at every size.",
    features: [
      "Three item kinds: event, habit with a goal and streak, and “every X days” that tells you when it's due.",
      "One tap to log, with undo; optional detail (text, number or choices), another date or a timer.",
      "Home with what's due and your week; per item: numbers, calendar, monthly count and patterns.",
      "Single-item, multi-item and to-do widgets, Lock Screen and Control Center.",
      "Siri and Shortcuts: “Log Reading in Hace Cuánto”, “How long ago Haircut?”.",
      "A live timer in the Dynamic Island and on the Lock Screen.",
      "Reminders that learn your rhythm, nudges during the day and places that ask when you arrive.",
      "Apple Watch app and complication that log even when the iPhone isn't nearby.",
      "Searchable history, 14 templates, archiving and automatic JSON backups.",
    ],
  },
  tasksphere: { category: "Practice", summary: "App to manage tasks, assign owners and track project progress." },
  "patient-management": { category: "Practice", summary: "Veterinary clinic system with records, appointments, treatments and billing." },
  "real-state": { category: "Practice", summary: "Real estate search with advanced filters. Vue + Firebase." },
  "point-of-sale": { category: "Practice", summary: "Simple, modern POS with product, price and payment control. Vue + Firebase." },
  "expense-tracking": { category: "Practice", summary: "Expense and monthly budget tracker with charts and stats." },
  "calorie-tracker": { category: "Practice", summary: "App to log calories eaten and burned, with daily tracking and a minimal design." },
  "crypto-quote": { category: "Practice", summary: "Real-time cryptocurrency price lookup with a modern interface." },
  guitarla: { category: "Practice", summary: "Guitar e-commerce with a responsive catalog, built in React." },
  cocktail: { category: "Practice", summary: "Cocktail and drink recipe search. Vue + Tailwind + a drinks API." },
  "weather-search": { category: "Practice", summary: "Current weather by city, with a responsive design and live data." },
  "expense-planner": { category: "Practice", summary: "Expense planner with budgets and interactive stats." },
  "tips-calculator": { category: "Practice", summary: "Real-time tip and bill-splitting calculator. React + Tailwind + TypeScript." },
  "bienes-raices": { category: "Practice", summary: "Real estate site with a property catalog and simple navigation." },
};
