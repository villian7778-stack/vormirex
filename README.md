# 🤖 AI Tutor — Premium AI-Powered Education Platform

A **production-quality, frontend-only SaaS-style education website** built with ultra-modern futuristic UI. Features dark theme with neon blue/purple gradients, glassmorphism design, smooth animations, and simulated AI behavior.

---

## ✅ Completed Features

### 🎨 Design System
- **Dark theme** with neon blue (`#3b82f6`), purple (`#8b5cf6`), and cyan (`#06b6d4`) accents
- **Glassmorphism** — frosted glass cards with blur backgrounds and transparent overlays
- **Soft glow effects** — neon borders, box shadows, gradient glows on hover
- **Animated gradient text** — multi-color shifting hero headline
- **Starfield canvas background** — subtle animated star particles
- **Mesh gradient orbs** — large blurred color orbs in the background
- **Smooth page transitions** — fade + slide animations between all pages
- **Counter animations** — stat values count up on page load
- **Progress bar animations** — smooth width transitions with glow effects
- **Hover lift effects** — cards lift and glow on hover
- **Mouse-reactive card shading** — radial gradient follows cursor over cards
- **Toast notification system** — sliding toast messages for XP gains and alerts

### 📐 Layout
- **Left sidebar navigation** — fixed 260px sidebar with logo, nav items, user info
- **Sticky top header** — breadcrumb, streak display, notifications, avatar
- **Responsive design** — collapses to hamburger menu on mobile
- **Mobile overlay** — backdrop dismisses sidebar on mobile

### 🏠 Landing Page
- **Hero section** — animated headline with floating subject cards
- **Stats bar** — 50K+ students, 500+ courses, 98% satisfaction
- **Features section** — 6 feature cards with colored icons
- **Testimonials** — 3 student testimonials with ratings
- **Pricing** — 3-tier pricing table (Free, Pro $12/mo, Team $49/mo)
- **Navigation** — smooth scroll to sections, CTA buttons

### ⚡ Dashboard Page
- **Welcome section** — personalized greeting + continue button
- **4 stat cards** — streak, completion %, study hours, XP points
- **Weekly Activity chart** — Chart.js bar chart with gradient fill
- **Subject Progress** — 3 progress bars with different color themes
- **Continue Learning** — 2 course cards with clickable play buttons
- **AI Recommendations** — 3 personalized suggestions with badges
- **Recent Activity** — timeline of recent completions and events

### 📚 Subjects Page
- **9 subject cards** — Math, Python, Physics, Chemistry, History, Geography, Literature, Statistics, ML
- **Search/filter bar** — real-time filtering by subject name
- **Progress indicators** — per-subject progress bars with color-coded fills
- **Status badges** — In Progress, New, Not Started, Started
- **Filter tabs** — All / In Progress / Completed

### 🎥 Video Learning Page
- **Mock video player** — decorative math formula overlay, progress bar, controls
- **Play/pause toggle** — animated play state with "PLAYING" indicator
- **Video progress** — clickable seek bar with animated thumb
- **AI Action buttons** — 4 buttons: Explain Simply, Give Example, Exam Answer, Summarize
- **Split-screen layout** — video on left, AI chat panel on right
- **Transcript panel** — scrollable transcript with timestamp highlights
- **Live AI chat panel** — connected chat that responds to button actions

### 💬 AI Chat Page
- **ChatGPT-style UI** — message bubbles with avatar icons
- **Simulated AI responses** — predefined intelligent answers for 5 topics + generic fallbacks
- **Typing animation** — "AI is thinking..." with bouncing dots
- **Response delay** — 1–2 second realistic delay before response appears
- **Suggestion chips** — 5 clickable question suggestions
- **Markdown formatting** — bold, code blocks, line breaks rendered
- **Clear history** — reset chat button

### 🗺️ Roadmap Page
- **Overall progress card** — 38% completion with visual progress bar
- **Weekly timeline** — 9 tasks across Mon–Sun with status indicators
- **Timeline dots** — Done (green ✓), Active (blue ▶ with pulse), Pending (gray)
- **Connector lines** — vertical lines linking timeline items
- **AI Study Tips** — 3 tip cards with integration advice, strategy, weekly goal
- **AI Roadmap Chat** — inline mini-chat to ask about the roadmap plan

### 🎯 Quiz Page
- **Intro screen** — stats (5 questions, 10 min, +200 XP)
- **5 MCQ questions** — Integration by Parts themed questions
- **Instant feedback** — correct/wrong state animations on options
- **AI explanation** — detailed explanation card after each answer
- **Countdown timer** — turns red under 60 seconds
- **Progress bar** — tracks question completion (20% per question)
- **Score screen** — emoji, score, XP earned, accuracy %, time taken
- **Retake option** — reset and restart quiz

### 👤 Profile Page
- **Avatar with online status** — gradient avatar with green dot
- **Badges row** — Pro Member, Streak, Level, Top 5%
- **4 mini stat cards** — study time, streak, subjects, XP
- **8 badge grid** — 4 earned (glowing), 4 locked (dimmed)
- **Weak Topics section** — 3 topics with red progress bars
- **AI Insights card** — personalized analysis with strengths and predictions

---

## 🔗 Page URIs (Navigation)

| Page | Nav Trigger | Description |
|------|------------|-------------|
| `/` | Landing Page | Marketing homepage (default) |
| `#dashboard` | ⚡ Dashboard | Main learning hub |
| `#subjects` | 📚 Subjects | Browse all subjects |
| `#learn` | 🎥 Video Learn | Video + AI split screen |
| `#chat` | 💬 AI Chat | Full ChatGPT-style AI chat |
| `#roadmap` | 🗺️ Roadmap | Weekly learning plan |
| `#quiz` | 🎯 Quiz | MCQ quiz with AI feedback |
| `#profile` | 👤 Profile | User stats and AI insights |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| **HTML5** | Semantic structure, all 8 pages |
| **CSS3** | Custom design system, animations, glassmorphism |
| **JavaScript (ES6+)** | Navigation, AI simulation, quiz logic, charts |
| **Chart.js** | Dashboard weekly activity bar chart |
| **Font Awesome 6** | Icons throughout the app |
| **Google Fonts** | Inter (body) + Space Grotesk (headings) |

---

## 📁 File Structure

```
index.html          — Main app (Landing + all 8 app pages)
css/
  style.css         — Complete design system (2,100+ lines)
js/
  app.js            — Full application logic (850+ lines)
README.md           — This file
```

---

## 🤖 Simulated AI Behavior

All AI responses are predefined (no real API calls):

| Trigger | AI Response |
|---------|------------|
| "Newton's Laws" | Explains all 3 laws with car/rocket examples |
| "Integration by Parts" | Formula, LIATE rule, worked example |
| "Python list comprehension" | Syntax, 3 examples, tips |
| "Photosynthesis" | Two-stage explanation with equation |
| "DNA vs RNA" | Side-by-side comparison table |
| Any other topic | 3 rotating intelligent fallback responses |
| Video: Explain Simply | Detailed integration concept explanation |
| Video: Give Example | Step-by-step ∫x·eˣ dx walkthrough |
| Video: Exam Answer | Full marks-formatted exam solution |
| Video: Summarize | 4-point lesson summary |

**Typing delay:** 1,000–2,200ms (randomized) + "AI is thinking..." animation

---

## 🚀 Key Interactions

- **Enter App** → Click "Start Learning Free" or any CTA on landing page
- **Navigate** → Click any sidebar item to switch pages
- **Play video** → Click the play button to activate progress animation
- **AI actions** → Click colored buttons below video to get AI explanations
- **Send chat** → Type in any chat input + Enter or Send button
- **Take quiz** → Click "Start Quiz" → select answers → get instant feedback
- **Keyboard shortcut** → `Ctrl/Cmd + K` to open AI Chat

---

## 🎯 Recommended Next Steps

1. **Real AI Integration** — Connect to OpenAI GPT-4 API or similar
2. **Video Streaming** — Integrate actual video content (YouTube, Vimeo, or HLS)
3. **Backend + Auth** — User authentication, saved progress with database
4. **Real Progress Tracking** — Persist quiz scores, study time via Table API
5. **More Subjects** — Expand subject cards and actual lesson content
6. **Mobile App** — Convert to React Native or Flutter app
7. **AI Roadmap Generation** — Dynamic roadmap generation based on user goals
8. **Voice Mode** — Text-to-speech for AI tutor responses
9. **Collaborative Features** — Study groups, leaderboards, live sessions
10. **Offline Mode** — PWA support for offline learning

---

## ✨ Design Highlights

- **Glassmorphism cards** with `backdrop-filter: blur(20px)`
- **Animated hero gradient** text cycling through blue→purple→cyan
- **Mouse-reactive** card backgrounds with radial gradient follow effect
- **Toast notifications** slide in/out with spring animations
- **Counter animations** for all stat numbers on page load
- **Progress bars** animate from 0 to target on page enter
- **Quiz options** turn green/red with smooth transition on answer
- **Timeline dots** pulse blue for the active task
