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
      "RapiSites is my main personal project: a multi-tenant website builder where anyone answers four questions and gets a complete site —structure, content and SEO metadata— generated with the Claude API in under thirty seconds. Each site is served on its own subdomain or on the client's domain with automatic HTTPS, and it's published atomically: a pre-publish SEO audit, a frozen snapshot and a version history with one-click rollback. It includes a visual editor with autosave, undo/redo and drag & drop sections, a catalog of 33 sections that ship no JavaScript on the public site (performance is SEO) and bilingual sites. I design and build it end to end, from product to infrastructure: Nuxt 4 with SSR, PostgreSQL + Drizzle, pg-boss queues, Cloudflare R2, Caddy with wildcard and on-demand certificates, Docker deployments on a hardened VPS, encrypted backups and observability with Sentry and BetterStack. It's live and under active development.",
    features: [
      "4-question wizard that generates structure, content and SEO with the Claude API.",
      "Multi-tenant sites on subdomains and custom domains with automatic HTTPS.",
      "Atomic publishing with SEO audit, version history and rollback.",
      "Visual editor with autosave, undo/redo and drag & drop sections.",
      "33 sections with no JavaScript on the public site, in Spanish and English.",
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
