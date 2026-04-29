/* ============================================
   AI TUTOR — Main Application JavaScript
   ============================================ */

'use strict';

// ============================================
// APP STATE
// ============================================
const AppState = {
  currentPage: 'dashboard',
  isPlaying: false,
  videoProgress: 32,
  quizState: {
    current: 0,
    score: 0,
    answers: [],
    timer: null,
    timeLeft: 600,
    started: false
  },
  chatHistory: [],
  videoChatHistory: []
};

// ============================================
// NAVIGATION
// ============================================
function navigate(page, el) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById('page-' + page);
  if (target) {
    target.classList.add('active');
  }

  // Update nav items
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  if (el) el.classList.add('active');

  // Update header
  const titles = {
    dashboard: { title: 'Dashboard', breadcrumb: 'AI Tutor / Dashboard' },
    subjects:  { title: 'Subjects',  breadcrumb: 'AI Tutor / Subjects' },
    learn:     { title: 'Video Learning', breadcrumb: 'AI Tutor / Learn' },
    chat:      { title: 'AI Chat',   breadcrumb: 'AI Tutor / AI Chat' },
    roadmap:   { title: 'Roadmap',   breadcrumb: 'AI Tutor / Roadmap' },
    quiz:      { title: 'Quiz',      breadcrumb: 'AI Tutor / Quiz' },
    profile:   { title: 'Profile',   breadcrumb: 'AI Tutor / Profile' }
  };

  const info = titles[page] || { title: page, breadcrumb: 'AI Tutor / ' + page };
  document.getElementById('header-title').textContent = info.title;
  document.getElementById('header-breadcrumb').textContent = info.breadcrumb;

  AppState.currentPage = page;

  // Page-specific init
  if (page === 'dashboard') initDashboardCharts();
  if (page === 'subjects')  renderSubjects();
  if (page === 'roadmap')   renderRoadmap();
  if (page === 'quiz' && !AppState.quizState.started) { /* just show intro */ }

  // Scroll to top
  const mc = document.querySelector('.main-content');
  if (mc) mc.scrollTop = 0; else window.scrollTo(0, 0);
}

function enterApp() {
  document.getElementById('landing-page').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  navigate('dashboard', document.querySelector('[data-page="dashboard"]'));
  setTimeout(initDashboardCharts, 100);
}

function exitApp() {
  document.getElementById('app').style.display = 'none';
  const floatBtn = document.getElementById('float-ai-btn');
  if (floatBtn) floatBtn.style.display = 'none';
  document.getElementById('landing-page').style.display = 'block';
  window.scrollTo(0, 0);
  const mc = document.querySelector('.main-content');
  if (mc) mc.scrollTop = 0;
}

function closeSidebar() { document.querySelector('.sidebar')?.classList.remove('open'); }
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ============================================
// DASHBOARD CHARTS
// ============================================
function initDashboardCharts() {
  const canvas = document.getElementById('activityChart');
  if (!canvas) return;

  // Destroy existing chart if any
  if (canvas._chartInstance) {
    canvas._chartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Study Hours',
        data: [2.5, 3.2, 1.8, 4.1, 3.5, 2.0, 3.2],
        backgroundColor: function(context) {
          const chart = context.chart;
          const {ctx: c, chartArea} = chart;
          if (!chartArea) return 'rgba(59,130,246,0.6)';
          const gradient = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(59,130,246,0.3)');
          gradient.addColorStop(1, 'rgba(139,92,246,0.8)');
          return gradient;
        },
        borderColor: 'rgba(139,92,246,0.8)',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.95)',
          borderColor: 'rgba(59,130,246,0.3)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          callbacks: {
            label: ctx => ` ${ctx.raw}h studied`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11 }, callback: v => v + 'h' },
          beginAtZero: true
        }
      }
    }
  });

  canvas._chartInstance = chart;
}

// ============================================
// SUBJECTS PAGE
// ============================================
const SUBJECTS = [
  { icon: '📐', name: 'Mathematics', topics: 156, progress: 72, color: '#3b82f6', tag: 'In Progress', tagStyle: 'badge-blue', lessons: '48 lessons done', time: '42h studied' },
  { icon: '💻', name: 'Python Programming', topics: 203, progress: 48, color: '#8b5cf6', tag: 'In Progress', tagStyle: 'badge-purple', lessons: '32 lessons done', time: '28h studied' },
  { icon: '🔬', name: 'Physics', topics: 178, progress: 61, color: '#06b6d4', tag: 'In Progress', tagStyle: 'badge-blue', lessons: '38 lessons done', time: '35h studied' },
  { icon: '🧪', name: 'Chemistry', topics: 142, progress: 22, color: '#10b981', tag: 'New', tagStyle: 'badge-green', lessons: '6 lessons done', time: '4h studied' },
  { icon: '📜', name: 'History', topics: 98, progress: 0, color: '#f59e0b', tag: 'Not Started', tagStyle: 'badge-orange', lessons: '0 lessons done', time: '—' },
  { icon: '🌍', name: 'Geography', topics: 88, progress: 0, color: '#ec4899', tag: 'Not Started', tagStyle: 'badge-orange', lessons: '0 lessons done', time: '—' },
  { icon: '📖', name: 'Literature', topics: 115, progress: 15, color: '#f87171', tag: 'Started', tagStyle: 'badge-red', lessons: '5 lessons done', time: '3h studied' },
  { icon: '🧮', name: 'Statistics', topics: 120, progress: 0, color: '#a78bfa', tag: 'Not Started', tagStyle: 'badge-orange', lessons: '0 lessons done', time: '—' },
  { icon: '🤖', name: 'Machine Learning', topics: 180, progress: 8, color: '#60a5fa', tag: 'Started', tagStyle: 'badge-blue', lessons: '3 lessons done', time: '2h studied' }
];

function renderSubjects() {
  const grid = document.getElementById('subjects-grid');
  if (!grid || grid.dataset.rendered) return;
  grid.dataset.rendered = 'true';

  grid.innerHTML = SUBJECTS.map((s, i) => `
    <div class="glass-card" style="padding:24px;cursor:pointer;animation:fadeInUp 0.4s ease ${i * 0.06}s both;border-color:rgba(${hexToRgb(s.color)},0.15);"
         onmouseover="this.style.borderColor='rgba(${hexToRgb(s.color)},0.45)';this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 32px rgba(${hexToRgb(s.color)},0.12)'"
         onmouseout="this.style.borderColor='rgba(${hexToRgb(s.color)},0.15)';this.style.transform='';this.style.boxShadow=''"
         onclick="openSubject('${s.name}')">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
        <div style="width:52px;height:52px;border-radius:14px;background:rgba(${hexToRgb(s.color)},0.15);border:1px solid rgba(${hexToRgb(s.color)},0.3);display:flex;align-items:center;justify-content:center;font-size:24px;">${s.icon}</div>
        <span class="badge ${s.tagStyle}">${s.tag}</span>
      </div>
      <div style="font-size:16px;font-weight:700;margin-bottom:4px;">${s.name}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">${s.topics} topics · ${s.lessons}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:12px;color:var(--text-muted);">Progress</span>
        <span style="font-size:13px;font-weight:700;color:${s.color};">${s.progress}%</span>
      </div>
      <div class="progress-bar">
        <div style="height:100%;width:${s.progress}%;background:linear-gradient(90deg,${s.color},${adjustColor(s.color)});border-radius:100px;box-shadow:0 0 8px ${s.color}55;transition:width 1s ease;"></div>
      </div>
      <div style="margin-top:12px;font-size:12px;color:var(--text-muted);">⏱️ ${s.time}</div>
    </div>
  `).join('');
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '59,130,246';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

function adjustColor(hex) {
  // Slightly lighten/shift color for gradient
  const shifts = {
    '#3b82f6': '#8b5cf6',
    '#8b5cf6': '#ec4899',
    '#06b6d4': '#3b82f6',
    '#10b981': '#06b6d4',
    '#f59e0b': '#f87171',
    '#ec4899': '#a78bfa',
    '#f87171': '#fb923c',
    '#a78bfa': '#ec4899',
    '#60a5fa': '#a78bfa'
  };
  return shifts[hex] || hex;
}

function openSubject(name) {
  navigate('learn', document.querySelector('[data-page="learn"]'));
}

// ============================================
// VIDEO PLAYER
// ============================================
function togglePlay() {
  AppState.isPlaying = !AppState.isPlaying;
  const icon = document.getElementById('play-icon');
  const ctrlIcon = document.getElementById('ctrl-play-icon');
  const indicator = document.getElementById('playing-indicator');

  if (AppState.isPlaying) {
    icon.className = 'fas fa-pause';
    ctrlIcon.className = 'fas fa-pause';
    indicator.style.display = 'block';
    startVideoProgress();
  } else {
    icon.className = 'fas fa-play';
    ctrlIcon.className = 'fas fa-play';
    indicator.style.display = 'none';
    stopVideoProgress();
  }
}

let videoInterval = null;
function startVideoProgress() {
  videoInterval = setInterval(() => {
    AppState.videoProgress = Math.min(100, AppState.videoProgress + 0.1);
    updateVideoUI();
    if (AppState.videoProgress >= 100) {
      AppState.isPlaying = false;
      clearInterval(videoInterval);
    }
  }, 200);
}

function stopVideoProgress() {
  clearInterval(videoInterval);
}

function updateVideoUI() {
  const p = AppState.videoProgress;
  const prog = document.getElementById('video-progress');
  const thumb = document.getElementById('video-thumb');
  const timeEl = document.getElementById('video-time');

  if (prog) prog.style.width = p + '%';
  if (thumb) thumb.style.left = p + '%';

  // Update time display
  const totalSec = 2700; // 45 min
  const elapsed = Math.floor((p / 100) * totalSec);
  const remaining = totalSec;
  if (timeEl) timeEl.textContent = formatTime(elapsed) + ' / ' + formatTime(remaining);
}

function seekVideo(e, bar) {
  const rect = bar.getBoundingClientRect();
  const pct = ((e.clientX - rect.left) / rect.width) * 100;
  AppState.videoProgress = Math.max(0, Math.min(100, pct));
  updateVideoUI();
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return m + ':' + s;
}

// ============================================
// AI RESPONSES
// ============================================
const AI_RESPONSES = {
  // Video page action responses
  explain: `📖 **Integration by Parts — Explained Simply**\n\nImagine you have two friends trying to share something, and one's giving while the other is taking. That's basically integration by parts!\n\n**The Formula:** ∫u dv = uv − ∫v du\n\n**What it means:** When you can't integrate a product directly, you split it. One part becomes 'u' and the other 'dv'. Then you apply the formula and the tricky integral becomes simpler.\n\n**Remember LIATE:** Always pick 'u' from:\n• L — Logarithm\n• I — Inverse trig\n• A — Algebraic (like x, x²)\n• T — Trigonometric\n• E — Exponential`,

  example: `💡 **Real Example: ∫x·eˣ dx**\n\nLet's solve this step by step!\n\n**Step 1:** Choose u and dv\n• u = x → du = dx\n• dv = eˣ dx → v = eˣ\n\n**Step 2:** Apply ∫u dv = uv − ∫v du\n∫x·eˣ dx = x·eˣ − ∫eˣ dx\n\n**Step 3:** Solve the remaining integral\n∫x·eˣ dx = x·eˣ − eˣ + C\n\n**Answer:** eˣ(x − 1) + C ✅\n\n*Tip: Always verify by differentiating your answer!*`,

  exam: `📝 **Exam-Ready Answer Format**\n\n**Q: Evaluate ∫x·eˣ dx using Integration by Parts**\n\n**Solution:**\nUsing integration by parts: ∫u dv = uv − ∫v du\n\nLet u = x and dv = eˣ dx\nThen du = dx and v = eˣ\n\nApplying the formula:\n∫x·eˣ dx = x·eˣ − ∫eˣ dx\n           = x·eˣ − eˣ + C\n           = eˣ(x − 1) + C\n\n**∴ ∫x·eˣ dx = eˣ(x − 1) + C** [3 marks]\n\n*Marks awarded for: correct identification of u and v (1), correct application (1), correct simplification (1)*`,

  summary: `📋 **Lesson Summary: Integration Techniques**\n\n**Key Concepts Covered:**\n1. **Integration by Parts** — ∫u dv = uv − ∫v du\n2. **LIATE Rule** for choosing u\n3. **Substitution Method** — change variables to simplify\n4. **Partial Fractions** — for rational functions\n\n**When to use Integration by Parts:**\n✅ Products of two different types of functions\n✅ Logarithmic or inverse trig functions alone\n✅ When substitution doesn't work\n\n**Practice Recommended:**\n• ∫x·sin(x) dx\n• ∫ln(x) dx\n• ∫x²·eˣ dx`
};

// ============================================
// MAIN CHAT AI RESPONSES
// ============================================
const CHAT_RESPONSES = {
  default: [
    "That's a great question! Let me break this down for you simply. Think of it like building blocks — once you understand the foundation, everything else clicks into place. The key concept here is that {topic} works by establishing a relationship between the known and unknown. Would you like me to give you a real-world example?",
    "Great question! Here's how I'd explain it: Imagine you're trying to {analogy}. That's exactly how this concept works in practice. The core idea is to first understand WHY it works, then HOW it works. This makes it much easier to remember for exams!",
    "I love this question! It's one of the most important fundamentals you'll need. Let me explain it in 3 simple steps:\n\n1️⃣ **Understand the concept** — {step1}\n2️⃣ **See it in action** — {step2}\n3️⃣ **Apply it yourself** — {step3}\n\nWould you like practice problems to test your understanding?"
  ],
  newton: `🍎 **Newton's 3 Laws of Motion — Simply Explained**\n\n**Law 1 (Inertia):** An object at rest stays at rest, and an object in motion stays in motion, UNLESS something pushes or pulls it.\n🚗 *Example:* You feel pushed back when a car accelerates. That's because your body wants to stay still!\n\n**Law 2 (F = ma):** The bigger the force, the more something accelerates. The heavier it is, the less it accelerates.\n⚽ *Example:* Kicking a football hard makes it go fast. Kicking a boulder? Not so much.\n\n**Law 3 (Action-Reaction):** Every action has an equal and opposite reaction.\n🚀 *Example:* Rockets push gas backward → gas pushes rocket forward!\n\nWant practice problems on any of these? 🎯`,

  integration: `∫ **Integration by Parts — Complete Guide**\n\n**The Big Idea:** When you can't integrate a product easily, use the formula:\n\n**∫u dv = uv − ∫v du**\n\n**LIATE Rule (choose 'u' in this order):**\n• **L**ogarithms → ln(x)\n• **I**nverse trig → arctan(x)\n• **A**lgebraic → x, x², x³\n• **T**rigonometric → sin(x), cos(x)\n• **E**xponential → eˣ\n\n**Worked Example:** ∫x·sin(x) dx\n• u = x, dv = sin(x)dx\n• du = dx, v = -cos(x)\n• = -x·cos(x) + ∫cos(x)dx\n• = **-x·cos(x) + sin(x) + C** ✅\n\nShall I give you 3 practice problems to try? 🎯`,

  python: `🐍 **Python List Comprehension — Quick Master Guide**\n\n**What is it?** A short, elegant way to create lists in one line!\n\n**Basic Syntax:**\n\`\`\`python\n[expression for item in iterable if condition]\n\`\`\`\n\n**Examples:**\n\`\`\`python\n# Squares of 1-10\nsquares = [x**2 for x in range(1, 11)]\n# [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]\n\n# Even numbers only\nevens = [x for x in range(20) if x % 2 == 0]\n\n# String manipulation\nwords = ["hello", "world"]\nupper = [w.upper() for w in words]\n\`\`\`\n\n**Why use it?**\n✅ Faster than regular for loops\n✅ More readable (once you know it!)\n✅ Pythonic — preferred by pros\n\nWant to see nested list comprehensions? 🚀`,

  photosynthesis: `🌿 **Photosynthesis — The Plant's Food Factory**\n\n**Simple Explanation:**\nPlants are like solar-powered food factories. They take sunlight, water, and CO₂, and make their own food (glucose)!\n\n**The Equation:**\n6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\n*(Carbon dioxide + Water + Sunlight → Sugar + Oxygen)*\n\n**Two Stages:**\n\n☀️ **Light Reactions** (in Thylakoids)\n• Capture sunlight energy\n• Split water molecules\n• Produce ATP and NADPH (energy carriers)\n\n🌑 **Calvin Cycle** (in Stroma)\n• Uses ATP and NADPH\n• Converts CO₂ into glucose\n• Doesn't need direct light\n\n**Real-world connection:** Every time you eat a plant (or an animal that ate plants), you're consuming stored solar energy from photosynthesis! 🌍\n\nWould you like a diagram explanation or exam questions? 📝`,

  dna: `🧬 **DNA vs RNA — Key Differences**\n\n| Feature | DNA | RNA |\n|---------|-----|-----|\n| **Shape** | Double helix | Single strand |\n| **Sugar** | Deoxyribose | Ribose |\n| **Bases** | A, T, G, C | A, **U**, G, C |\n| **Location** | Nucleus (mostly) | Nucleus & Cytoplasm |\n| **Function** | Stores genetic info | Carries & reads info |\n| **Lifespan** | Permanent | Temporary |\n\n**Memory trick:** \n• **D**NA = **D**ouble strand, **D**eoxyribose, has **T**hymine\n• **R**NA = **R**ibose, has **U**racil, **R**uns around the cell\n\n**Types of RNA:**\n🔹 mRNA — messenger, carries DNA's instructions\n🔹 tRNA — transfer, brings amino acids\n🔹 rRNA — ribosomal, makes proteins\n\nThink of DNA as the master blueprint 📐 and RNA as the working copies 📋!`
};

function getAIResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes('newton') || msg.includes('motion') || msg.includes('law')) return CHAT_RESPONSES.newton;
  if (msg.includes('integrat') || msg.includes('calculus') || msg.includes('∫')) return CHAT_RESPONSES.integration;
  if (msg.includes('python') || msg.includes('list comp') || msg.includes('coding')) return CHAT_RESPONSES.python;
  if (msg.includes('photosynthesis') || msg.includes('plant') || msg.includes('chlorophyll')) return CHAT_RESPONSES.photosynthesis;
  if (msg.includes('dna') || msg.includes('rna') || msg.includes('gene')) return CHAT_RESPONSES.dna;

  // Generic fallback
  const fallbacks = [
    `🤖 Great question! Here's how I'd explain **"${message}"**:\n\nThis is a fascinating topic that connects to many real-world applications. The core principle involves understanding the relationship between cause and effect in this context.\n\n**Key Points:**\n• Start with the foundational definitions\n• Work through specific examples step by step\n• Connect the concept to something familiar\n• Practice with varied problem types\n\nI recommend checking out the relevant lesson in your Roadmap, then testing yourself with a Quiz. Would you like me to dive deeper into any specific aspect? 📚`,
    `🎓 Excellent question! Let me teach you **"${message}"** in the simplest way possible:\n\n**Think of it this way:** Imagine a simple, everyday situation... This concept works exactly like that, just applied more formally.\n\n**Step-by-step breakdown:**\n1. First, understand the core definition\n2. Recognize when to apply this concept\n3. Practice with easy examples first\n4. Build up to harder problems\n\nRemember: every expert was once a beginner. Keep asking questions like this and you'll master it! Want some practice problems? 🎯`,
    `💡 I love that you're curious about **"${message}"**! Here's my simple explanation:\n\nThis concept is all about understanding patterns and applying rules consistently. The best way to learn it is through worked examples.\n\n**The Golden Rule:** Always start with the simplest case, then add complexity.\n\n**Real-world application:** You encounter this in everyday life when... [building intuition here helps retention by 3x!]\n\nShall I give you a quick quiz on this to test your understanding? 🎯`
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ============================================
// AI CHAT — MAIN
// ============================================
function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  addChatMessage('main-chat', msg, 'user');
  input.value = '';

  // Hide suggestions after first message
  const sugg = document.getElementById('chat-suggestions');
  if (sugg) sugg.style.display = 'none';

  // Show typing
  const typingId = showTyping('main-chat');

  const delay = 1200 + Math.random() * 1000;
  setTimeout(() => {
    removeTyping('main-chat', typingId);
    const response = getAIResponse(msg);
    addChatMessage('main-chat', response, 'ai');
  }, delay);
}

function sendSuggestion(text) {
  const input = document.getElementById('chat-input');
  input.value = text;
  sendChat();
}

function clearChat() {
  const chat = document.getElementById('main-chat');
  chat.innerHTML = `
    <div class="chat-msg">
      <div class="chat-avatar ai">🤖</div>
      <div class="chat-bubble ai">
        Chat cleared! I'm ready to help you learn anything. What subject are we tackling today? 🎓
      </div>
    </div>`;
  document.getElementById('chat-suggestions').style.display = 'block';
}

// ============================================
// AI CHAT — VIDEO PANEL
// ============================================
function sendVideoChat() {
  const input = document.getElementById('video-chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  addChatMessage('video-chat', msg, 'user');
  input.value = '';

  const typingId = showTyping('video-chat');
  const delay = 1000 + Math.random() * 800;

  setTimeout(() => {
    removeTyping('video-chat', typingId);
    const response = getAIResponse(msg);
    addChatMessage('video-chat', response, 'ai');
  }, delay);
}

function clearVideoChat() {
  document.getElementById('video-chat').innerHTML = `
    <div class="chat-msg">
      <div class="chat-avatar ai">🤖</div>
      <div class="chat-bubble ai">Chat cleared! Ask me anything about the current lesson. 🎓</div>
    </div>`;
}

function aiAction(type) {
  const chat = document.getElementById('video-chat');
  const labels = {
    explain: 'Can you explain this topic simply?',
    example: 'Give me a real example for this topic.',
    exam: 'How would I answer this in an exam?',
    summary: 'Summarize what we\'ve covered so far.'
  };

  addChatMessage('video-chat', labels[type], 'user');

  const typingId = showTyping('video-chat');
  setTimeout(() => {
    removeTyping('video-chat', typingId);
    const response = AI_RESPONSES[type] || AI_RESPONSES.explain;
    addChatMessage('video-chat', response, 'ai');
    chat.scrollTop = chat.scrollHeight;
  }, 1400);
}

// ============================================
// CHAT HELPERS
// ============================================
function addChatMessage(containerId, text, role) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isAI = role === 'ai';
  const div = document.createElement('div');
  div.className = `chat-msg${isAI ? '' : ' user'}`;

  // Format markdown-style bold (**text**)
  const formatted = formatMarkdown(text);

  div.innerHTML = `
    <div class="chat-avatar ${isAI ? 'ai' : 'user-msg'}">${isAI ? '🤖' : 'A'}</div>
    <div class="chat-bubble ${isAI ? 'ai' : 'user'}">${formatted}</div>
  `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:13px;">$1</code>');
}

function showTyping(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-msg';
  div.id = id;
  div.innerHTML = `
    <div class="chat-avatar ai">🤖</div>
    <div class="chat-bubble ai" style="padding:10px 14px;">
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="font-size:12px;color:var(--text-muted);">AI is thinking</span>
        <div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>
      </div>
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(containerId, id) {
  if (!id) return;
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ============================================
// ROADMAP
// ============================================
const ROADMAP_TASKS = [
  { day: 'Monday', topic: 'Integration by Parts — Theory', status: 'done', duration: '45 min', icon: '📐' },
  { day: 'Monday', topic: 'Integration by Parts — Practice Problems', status: 'done', duration: '30 min', icon: '✏️' },
  { day: 'Tuesday', topic: 'Trigonometric Substitution', status: 'done', duration: '50 min', icon: '📐' },
  { day: 'Wednesday', topic: 'Partial Fractions — Introduction', status: 'active', duration: '45 min', icon: '🔢' },
  { day: 'Wednesday', topic: 'Partial Fractions — Exercises', status: 'pending', duration: '30 min', icon: '✏️' },
  { day: 'Thursday', topic: 'Improper Integrals', status: 'pending', duration: '40 min', icon: '∞' },
  { day: 'Friday', topic: 'Mixed Integration Quiz', status: 'pending', duration: '20 min', icon: '🎯' },
  { day: 'Saturday', topic: 'Review & Weak Topics', status: 'pending', duration: '60 min', icon: '🔄' },
  { day: 'Sunday', topic: 'Rest day — Light reading only', status: 'pending', duration: 'Optional', icon: '😴' }
];

function renderRoadmap() {
  const tl = document.getElementById('roadmap-timeline');
  if (!tl || tl.dataset.rendered) return;
  tl.dataset.rendered = 'true';

  tl.innerHTML = ROADMAP_TASKS.map((t, i) => `
    <div class="timeline-item" style="animation:fadeInUp 0.4s ease ${i*0.07}s both">
      <div class="timeline-dot ${t.status}">
        ${t.status === 'done' ? '✓' : t.status === 'active' ? '▶' : '○'}
      </div>
      <div class="timeline-content">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
          <div>
            <div style="font-size:10px;font-weight:600;letter-spacing:1px;color:var(--text-muted);margin-bottom:4px;">${t.day.toUpperCase()}</div>
            <div style="font-size:14px;font-weight:${t.status === 'active' ? '700' : '500'};color:${t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)'};${t.status === 'done' ? 'text-decoration:line-through' : ''};">
              ${t.icon} ${t.topic}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            <span style="font-size:12px;color:var(--text-muted);">⏱ ${t.duration}</span>
            ${t.status === 'active' ? `<button class="btn btn-primary btn-sm" onclick="navigate('learn', document.querySelector('[data-page=learn]'))" style="font-size:12px;padding:5px 12px;">Start →</button>` : ''}
            ${t.status === 'done' ? `<span class="badge badge-green" style="font-size:10px;">Done ✓</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

const ROADMAP_CHAT_RESPONSES = [
  "Great question! Integration is placed first in your roadmap because it's the **foundation** for everything that follows. Calculus builds layer by layer — you need integration to understand differential equations, and differential equations to understand physics simulations. Think of it as learning to walk before you run! 🚶‍♂️",
  "Based on your learning patterns, I've structured your roadmap with **45-minute focused blocks** because that matches your optimal attention span. Research shows that spaced repetition (revisiting concepts after 1–2 days) improves retention by up to 80%! Your Wednesday review session is specifically designed for this. 🧠",
  "Your roadmap is **8 weeks long** because that's the optimal time to reach genuine understanding vs. surface memorization. Week 1-3 covers fundamentals, Week 4-5 builds connections, Week 6-7 applies concepts, and Week 8 is revision. You're right on track! 🎯"
];
let roadmapResponseIndex = 0;

function sendRoadmapChat() {
  const input = document.getElementById('roadmap-chat-input');
  const response = document.getElementById('roadmap-chat-response');
  if (!input || !response) return;

  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  response.style.display = 'block';
  response.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:12px;color:var(--text-muted);">AI is thinking...</span><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';

  setTimeout(() => {
    const reply = ROADMAP_CHAT_RESPONSES[roadmapResponseIndex % ROADMAP_CHAT_RESPONSES.length];
    roadmapResponseIndex++;
    response.innerHTML = '🤖 ' + formatMarkdown(reply);
  }, 1300);
}

// ============================================
// QUIZ
// ============================================
const QUIZ_QUESTIONS = [
  {
    question: "Which of the following is the correct formula for Integration by Parts?",
    options: [
      "∫u dv = uv + ∫v du",
      "∫u dv = uv − ∫v du",
      "∫u dv = u²v − ∫v du",
      "∫u dv = uv − ∫u dv"
    ],
    correct: 1,
    explanation: "✅ **Correct!** The Integration by Parts formula is **∫u dv = uv − ∫v du**. This is derived from the product rule of differentiation. The key is to choose u and dv wisely using the LIATE rule."
  },
  {
    question: "Using the LIATE rule, what should you choose as 'u' when evaluating ∫x·ln(x) dx?",
    options: [
      "u = x",
      "u = ln(x)",
      "u = x·ln(x)",
      "Either can be chosen"
    ],
    correct: 1,
    explanation: "✅ **Correct!** According to LIATE, **Logarithm (L)** comes before **Algebraic (A)**, so u = ln(x) is the right choice. This makes the remaining integral simpler to solve."
  },
  {
    question: "What is the integral of ∫eˣ·sin(x) dx? (Choose the correct approach)",
    options: [
      "Apply substitution u = eˣ",
      "Apply Integration by Parts twice",
      "The integral cannot be evaluated",
      "Use partial fractions"
    ],
    correct: 1,
    explanation: "✅ **Correct!** For ∫eˣ·sin(x) dx, we apply Integration by Parts **twice** and then solve for the integral algebraically. This gives: eˣ(sin(x) − cos(x))/2 + C"
  },
  {
    question: "What is ∫ln(x) dx?",
    options: [
      "1/x + C",
      "x·ln(x) + C",
      "x·ln(x) − x + C",
      "ln(x²)/2 + C"
    ],
    correct: 2,
    explanation: "✅ **Correct!** Using Integration by Parts with u = ln(x) and dv = dx:\n• v = x, du = 1/x dx\n• ∫ln(x) dx = x·ln(x) − ∫x·(1/x)dx = x·ln(x) − x + C"
  },
  {
    question: "When would you NOT use Integration by Parts?",
    options: [
      "When integrating a product of two different function types",
      "When integrating x·cos(x)",
      "When integrating sin²(x) (use trig identity instead)",
      "When integrating x·eˣ"
    ],
    correct: 2,
    explanation: "✅ **Correct!** For ∫sin²(x) dx, it's better to use the **trigonometric identity** sin²(x) = (1 − cos(2x))/2, which gives a much simpler integral. Integration by Parts is for products of different function types!"
  }
];

let quizTimerInterval = null;

function startQuiz() {
  AppState.quizState = {
    current: 0,
    score: 0,
    answers: [],
    timer: null,
    timeLeft: 600,
    started: true
  };

  document.getElementById('quiz-intro').style.display = 'none';
  document.getElementById('quiz-main').style.display = 'block';
  document.getElementById('quiz-score').style.display = 'none';

  loadQuestion(0);
  startQuizTimer();
}

function loadQuestion(index) {
  const q = QUIZ_QUESTIONS[index];
  const qNum = document.getElementById('q-num');
  const qText = document.getElementById('question-text');
  const optCont = document.getElementById('options-container');
  const feedback = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('next-btn');
  const progBar = document.getElementById('quiz-progress-bar');

  if (qNum) qNum.textContent = index + 1;
  if (qText) qText.textContent = q.question;
  if (progBar) progBar.style.width = ((index + 1) / QUIZ_QUESTIONS.length * 100) + '%';
  if (feedback) feedback.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';

  if (optCont) {
    optCont.innerHTML = q.options.map((opt, i) => `
      <div class="quiz-option" id="opt-${i}" onclick="selectAnswer(${i})">
        <div class="quiz-option-letter">${String.fromCharCode(65 + i)}</div>
        <span>${opt}</span>
      </div>
    `).join('');
  }
}

function selectAnswer(selected) {
  const q = QUIZ_QUESTIONS[AppState.quizState.current];
  const isCorrect = selected === q.correct;
  const feedback = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('next-btn');

  // Disable all options
  document.querySelectorAll('.quiz-option').forEach(o => o.style.pointerEvents = 'none');

  // Mark selected
  const selectedEl = document.getElementById('opt-' + selected);
  const correctEl = document.getElementById('opt-' + q.correct);

  if (isCorrect) {
    selectedEl.classList.add('correct');
    AppState.quizState.score++;
  } else {
    selectedEl.classList.add('wrong');
    correctEl.classList.add('correct');
  }

  AppState.quizState.answers.push({ selected, correct: q.correct, isCorrect });

  // Show feedback
  if (feedback) {
    feedback.style.display = 'block';
    const explanation = formatMarkdown(isCorrect ? q.explanation : `❌ **Not quite!** The correct answer is **${q.options[q.correct]}**.\n\n${q.explanation}`);
    feedback.innerHTML = `
      <div style="display:flex;gap:10px;align-items:flex-start;">
        <span style="font-size:20px;">${isCorrect ? '🎉' : '💡'}</span>
        <div>
          <div style="font-size:14px;font-weight:600;margin-bottom:6px;color:${isCorrect ? '#4ade80' : '#f87171'};">
            ${isCorrect ? 'Correct! Great job!' : 'Not quite right'}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;">${explanation}</div>
        </div>
      </div>`;
    feedback.style.borderColor = isCorrect ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.2)';
    feedback.style.background = isCorrect ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.04)';
  }

  // Show next button
  if (nextBtn) nextBtn.style.display = 'inline-flex';
}

function nextQuestion() {
  AppState.quizState.current++;

  if (AppState.quizState.current >= QUIZ_QUESTIONS.length) {
    showScore();
  } else {
    loadQuestion(AppState.quizState.current);
  }
}

function showScore() {
  clearInterval(quizTimerInterval);
  const score = AppState.quizState.score;
  const total = QUIZ_QUESTIONS.length;
  const pct = Math.round((score / total) * 100);
  const timeUsed = 600 - AppState.quizState.timeLeft;

  document.getElementById('quiz-main').style.display = 'none';
  document.getElementById('quiz-score').style.display = 'block';

  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '😊' : '💪';
  const msg = pct >= 80 ? 'Excellent performance!' : pct >= 60 ? 'Good job! Keep practicing!' : 'Don\'t give up! Review and retry!';

  document.getElementById('score-emoji').textContent = emoji;
  document.getElementById('score-display').textContent = `${score}/${total}`;
  document.getElementById('score-message').textContent = msg;
  document.getElementById('score-xp').textContent = `+${score * 40} XP`;
  document.getElementById('score-accuracy').textContent = pct + '%';
  document.getElementById('score-time').textContent = formatTime(timeUsed);
}

function restartQuiz() {
  clearInterval(quizTimerInterval);
  document.getElementById('quiz-score').style.display = 'none';
  document.getElementById('quiz-intro').style.display = 'block';
  AppState.quizState.started = false;
}

function startQuizTimer() {
  AppState.quizState.timeLeft = 600;
  const timerEl = document.getElementById('quiz-timer');

  quizTimerInterval = setInterval(() => {
    AppState.quizState.timeLeft--;
    if (timerEl) timerEl.textContent = formatTime(AppState.quizState.timeLeft);

    if (AppState.quizState.timeLeft <= 0) {
      clearInterval(quizTimerInterval);
      showScore();
    }

    // Warning color when low
    if (AppState.quizState.timeLeft <= 60) {
      if (timerEl) timerEl.style.color = '#f87171';
    }
  }, 1000);
}

// ============================================
// DEMO MODE (Landing Page)
// ============================================
function showDemo() {
  enterApp();
  navigate('learn', document.querySelector('[data-page="learn"]'));
}

// ============================================
// INTERSECTION OBSERVER — Scroll Animations
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.glass-card, .stat-card').forEach(el => {
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// ============================================
// PARTICLE / STAR FIELD BACKGROUND
// ============================================
function createStarfield() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.4;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let stars = [];
  const NUM_STARS = 80;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.15 + 0.05
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 163, 184, ${s.opacity})`;
      ctx.fill();

      s.opacity += (Math.random() - 0.5) * 0.02;
      s.opacity = Math.max(0.1, Math.min(0.8, s.opacity));
    });
    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
}

// ============================================
// NAV HOVER EFFECTS (sidebar items)
// ============================================
function initNavEffects() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      // Ripple effect
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(0);
        width:120px;height:120px;border-radius:50%;
        background:rgba(59,130,246,0.15);
        animation:ripple 0.5s ease forwards;pointer-events:none;
      `;
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    });
  });
}

// Add ripple keyframe dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to { transform: translate(-50%,-50%) scale(1); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============================================
// BUTTON HOVER GLOW EFFECTS
// ============================================
function initButtonEffects() {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.boxShadow = '0 6px 28px rgba(59,130,246,0.7), 0 0 0 1px rgba(139,92,246,0.4)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.boxShadow = '';
    });
  });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { info: '💬', success: '✅', warning: '⚠️', error: '❌', xp: '⭐' };
  const colors = {
    info: 'rgba(59,130,246,0.3)',
    success: 'rgba(34,197,94,0.3)',
    warning: 'rgba(251,146,60,0.3)',
    error: 'rgba(239,68,68,0.3)',
    xp: 'rgba(139,92,246,0.3)'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.borderColor = colors[type] || colors.info;
  toast.innerHTML = `
    <span style="font-size:20px;">${icons[type] || '💬'}</span>
    <span style="font-size:13px;color:var(--text-primary);flex:1;line-height:1.4;">${message}</span>
    <button onclick="this.closest('.toast').remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:0 0 0 8px;">×</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
  if (document.getElementById('app').style.display === 'none') return;

  // Cmd/Ctrl + K → focus chat
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    navigate('chat', document.querySelector('[data-page="chat"]'));
    setTimeout(() => document.getElementById('chat-input')?.focus(), 100);
    showToast('AI Chat opened — ask anything!', 'info');
  }
});

// ============================================
// COUNTER ANIMATION
// ============================================
function animateCounters() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const target = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
    const suffix = el.textContent.replace(/[0-9.]/g, '');
    if (isNaN(target) || target === 0) return;

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target * 10) / 10;
      el.textContent = (current >= 1000 ? current.toLocaleString() : current) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Create starfield background
  createStarfield();

  // Nav item click handler (prevent double-binding)
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.style.cursor = 'pointer';
  });

  // Init nav effects
  initNavEffects();

  // Init button effects
  setTimeout(initButtonEffects, 100);

  // Initial scroll animation setup
  initScrollAnimations();

  // Auto-animate progress bars on dashboard
  setTimeout(() => {
    document.querySelectorAll('.progress-fill').forEach(bar => {
      const target = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = target; }, 200);
    });
    animateCounters();
  }, 500);

  console.log('%c🤖 AI Tutor Loaded!', 'color:#3b82f6;font-size:18px;font-weight:bold;');
  console.log('%cBuilt with ❤️ — Ultra-premium AI SaaS Education Platform', 'color:#8b5cf6;font-size:12px;');
});

// ============================================
// SMOOTH LANDING SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ============================================
// AUTH PAGES
// ============================================
const AUTH_PAGES = ['auth-login','auth-signup','auth-forgot','auth-onboarding'];

function showAuth(page) {
  // Hide everything
  document.getElementById('landing-page').style.display = 'none';
  document.getElementById('app').style.display = 'none';
  AUTH_PAGES.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById('auth-' + page);
  if (target) target.style.display = 'block';
}

function hideAuth() {
  AUTH_PAGES.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function doLogin() {
  const email = document.getElementById('login-email')?.value?.trim();
  const pass = document.getElementById('login-password')?.value;
  if (!email || !pass) { showToast('Please fill in all fields','warning'); return; }
  showToast('Signing you in...','info', 1500);
  setTimeout(() => {
    hideAuth();
    showAuth('onboarding');
  }, 1200);
}

function doSignup() {
  const name = document.getElementById('signup-name')?.value?.trim();
  const email = document.getElementById('signup-email')?.value?.trim();
  const pass = document.getElementById('signup-password')?.value;
  if (!name || !email || !pass) { showToast('Please fill in all fields','warning'); return; }
  if (pass.length < 6) { showToast('Password must be at least 6 characters','warning'); return; }
  showToast('Creating your account...','info', 1500);
  setTimeout(() => { hideAuth(); showAuth('onboarding'); }, 1200);
}

function doForgot() {
  const email = document.getElementById('forgot-email')?.value?.trim();
  if (!email) { showToast('Please enter your email','warning'); return; }
  document.getElementById('forgot-form').style.display = 'none';
  document.getElementById('forgot-success').style.display = 'block';
  const el = document.getElementById('forgot-sent-email');
  if (el) el.textContent = email;
}

// ============================================
// ONBOARDING
// ============================================
let currentObStep = 1;

function obNext(step) {
  const stepEl = document.getElementById('ob-step-' + step);
  // Validate selection for step 1 & 3
  if ((step === 1 || step === 3) && stepEl) {
    const selected = stepEl.querySelector('.option-card.selected');
    if (!selected) { showToast('Please make a selection to continue','warning'); return; }
  }
  goToObStep(step + 1);
}

function obPrev(step) { goToObStep(step - 1); }

function goToObStep(n) {
  // Update step content
  document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
  const next = document.getElementById('ob-step-' + n);
  if (next) next.classList.add('active');
  currentObStep = n;

  // Update indicators
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById('step-dot-' + i);
    const line = document.getElementById('step-line-' + i);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < n) dot.classList.add('done'), dot.textContent = '✓';
    else if (i === n) dot.classList.add('active'), dot.textContent = i;
    else dot.textContent = i;
    if (line) line.classList.toggle('done', i < n);
  }
}

function selectObOption(el, group) {
  const parent = el.closest('.onboarding-step') || el.parentElement;
  parent.querySelectorAll('[data-group="' + group + '"], .option-grid .option-card').forEach(c => {
    if (c.getAttribute('onclick') && c.getAttribute('onclick').includes(group)) c.classList.remove('selected');
  });
  // Only deselect cards in same call type
  const allCards = el.parentElement.querySelectorAll('.option-card');
  allCards.forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function toggleObSelect(el) {
  el.classList.toggle('selected');
}

function completeOnboarding() {
  hideAuth();
  enterApp();
  setTimeout(() => showToast('🚀 Welcome! Your AI roadmap is ready!', 'success', 4000), 600);
}

// ============================================
// SETTINGS
// ============================================
function switchSettingsTab(tab, btn) {
  document.querySelectorAll('.settings-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  const section = document.getElementById('settings-' + tab);
  if (section) section.classList.add('active');
}

// ============================================
// LEADERBOARD — populate list
// ============================================
const LB_DATA = [
  { rank: 4, name: 'Sofia Reyes',    xp: '11,200', avatar: 'S', color: '#ec4899' },
  { rank: 5, name: 'James O\'Brien', xp: '10,880', avatar: 'J', color: '#f59e0b' },
  { rank: 6, name: 'Ananya Singh',   xp: '9,750',  avatar: 'A', color: '#8b5cf6' },
  { rank: 7, name: 'Liam Foster',    xp: '8,430',  avatar: 'L', color: '#06b6d4' },
  { rank: 9, name: 'Priya Nair',     xp: '2,110',  avatar: 'P', color: '#10b981' },
  { rank: 10, name: 'Tom Weiss',     xp: '1,890',  avatar: 'T', color: '#64748b' },
];

function renderLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  if (!list || list.dataset.rendered) return;
  list.dataset.rendered = 'true';
  list.innerHTML = LB_DATA.map((u, i) => `
    <div class="leaderboard-row" style="animation:fadeInUp 0.3s ease ${i*0.07}s both;">
      <div class="rank-num" style="color:var(--text-muted);">${u.rank}</div>
      <div class="lb-avatar" style="background:${u.color};border:2px solid ${u.color}44;">${u.avatar}</div>
      <div style="flex:1;">
        <div style="font-size:14px;font-weight:600;">${u.name}</div>
        <div style="font-size:11px;color:var(--text-muted);">🔥 ${Math.floor(Math.random()*15+3)} streak</div>
      </div>
      <div class="lb-xp">${u.xp} XP</div>
    </div>
  `).join('');
}

// ============================================
// NOTES — filter tabs
// ============================================
function filterNotes(type, btn) {
  document.querySelectorAll('.settings-tabs .tab-btn, #page-notes .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  showToast('Filtered: ' + type, 'info', 1500);
}

// ============================================
// BOOKMARK
// ============================================
function toggleBookmark(btn) {
  btn.classList.toggle('active');
  const isNowActive = btn.classList.contains('active');
  btn.innerHTML = isNowActive ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
  showToast(isNowActive ? '🔖 Bookmarked!' : 'Bookmark removed', isNowActive ? 'success' : 'info', 2000);
}

// ============================================
// GLOBAL SEARCH
// ============================================
function showSearchDropdown() {
  document.getElementById('search-dropdown')?.classList.add('show');
}

function closeSearch() {
  document.getElementById('search-dropdown')?.classList.remove('show');
  const inp = document.getElementById('header-search-input');
  if (inp) inp.value = '';
}

function updateSearchDropdown(val) {
  const dd = document.getElementById('search-dropdown');
  if (!dd) return;
  if (val.length === 0) { dd.classList.add('show'); return; }
  const items = dd.querySelectorAll('.search-result-item');
  let anyVisible = false;
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    const match = text.includes(val.toLowerCase());
    item.style.display = match ? '' : 'none';
    if (match) anyVisible = true;
  });
  dd.classList.toggle('show', anyVisible || val.length > 0);
}

document.addEventListener('click', e => {
  if (!e.target.closest('#header-search-wrapper')) closeSearch();
  if (!e.target.closest('#notif-wrapper')) closeNotifPanel();
});

// ============================================
// NOTIFICATION PANEL
// ============================================
function toggleNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (panel) panel.classList.toggle('show');
}

function closeNotifPanel() {
  document.getElementById('notif-panel')?.classList.remove('show');
}

function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(i => i.classList.remove('unread'));
  document.getElementById('notif-badge').style.display = 'none';
  showToast('All notifications marked as read','success', 2000);
}

// ============================================
// COMMAND PALETTE
// ============================================
function openCmdPalette() {
  const overlay = document.getElementById('cmd-overlay');
  if (overlay) {
    overlay.classList.add('show');
    setTimeout(() => document.getElementById('cmd-input')?.focus(), 50);
  }
}

function closeCmdPalette() {
  document.getElementById('cmd-overlay')?.classList.remove('show');
  const inp = document.getElementById('cmd-input');
  if (inp) inp.value = '';
  filterCmdItems('');
}

function cmdNavigate(page) {
  closeCmdPalette();
  const el = document.querySelector('[data-page="' + page + '"]');
  navigate(page, el);
}

function filterCmdItems(val) {
  const items = document.querySelectorAll('.cmd-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = (!val || text.includes(val.toLowerCase())) ? '' : 'none';
  });
}

function handleCmdKey(e) {
  if (e.key === 'Escape') closeCmdPalette();
  if (e.key === 'Enter') {
    const focused = document.querySelector('.cmd-item.focused') || document.querySelector('.cmd-item:not([style*="none"])');
    if (focused) focused.click();
  }
}

// Override Ctrl+K to open palette instead of just navigating chat
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (document.getElementById('cmd-overlay')?.classList.contains('show')) {
      closeCmdPalette();
    } else {
      openCmdPalette();
    }
  }
  if (e.key === 'Escape') {
    closeCmdPalette();
    closeSearch();
    closeNotifPanel();
  }
}, true);

// ============================================
// FLOATING AI CHAT
// ============================================
function toggleFloatPanel() {
  const panel = document.getElementById('float-chat-panel');
  if (panel) panel.classList.toggle('show');
}

function sendFloatChat() {
  const input = document.getElementById('float-chat-input');
  const msg = input?.value?.trim();
  if (!msg) return;
  addChatMessage('float-chat-msgs', msg, 'user');
  input.value = '';
  const typingId = showTyping('float-chat-msgs');
  setTimeout(() => {
    removeTyping('float-chat-msgs', typingId);
    addChatMessage('float-chat-msgs', getAIResponse(msg), 'ai');
  }, 1200 + Math.random() * 800);
}

// ============================================
// UPDATED NAVIGATE — new pages + show float btn
// ============================================
const _origNavBase = window.navigate;
// Extend titles for new pages
const _extraTitles = {
  settings:    { title: 'Settings',        breadcrumb: 'AI Tutor / Settings' },
  insights:    { title: 'AI Insights',     breadcrumb: 'AI Tutor / Insights' },
  leaderboard: { title: 'Leaderboard',     breadcrumb: 'AI Tutor / Leaderboard' },
  planner:     { title: 'Study Planner',   breadcrumb: 'AI Tutor / Planner' },
  notes:       { title: 'Notes',           breadcrumb: 'AI Tutor / Notes' },
  course:      { title: 'Course Detail',   breadcrumb: 'AI Tutor / Course' },
};

// Patch the main navigate to handle extra pages
const _patchedNavigate = window.navigate;
window.navigate = function(page, el) {
  if (_extraTitles[page]) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    if (el) el.classList.add('active');
    const info = _extraTitles[page];
    const titleEl = document.getElementById('header-title');
    const bcEl = document.getElementById('header-breadcrumb');
    if (titleEl) titleEl.textContent = info.title;
    if (bcEl) bcEl.textContent = info.breadcrumb;
    AppState.currentPage = page;
    const mc2 = document.querySelector('.main-content');
    if (mc2) mc2.scrollTop = 0; else window.scrollTo(0, 0);
    if (page === 'leaderboard') setTimeout(renderLeaderboard, 100);
    return;
  }
  _patchedNavigate(page, el);
  if (page === 'leaderboard') setTimeout(renderLeaderboard, 100);
};

// Show floating AI btn when inside app
function enterApp() {
  const floatBtn = document.getElementById('float-ai-btn');
  if (floatBtn) floatBtn.style.display = 'block';
}

// Update landing nav buttons to show auth
document.addEventListener('DOMContentLoaded', () => {
  // Wire landing "Sign In" to login page
  document.querySelectorAll('.landing-nav .btn-secondary').forEach(btn => {
    if (btn.textContent.trim() === 'Sign In') {
      btn.onclick = () => showAuth('login');
    }
  });
  document.querySelectorAll('.landing-nav .btn-primary').forEach(btn => {
    if (btn.textContent.includes('Get Started')) {
      btn.onclick = () => showAuth('signup');
    }
  });
});

// Planner week navigation (mock)
function prevWeek() { showToast('Previous week — Apr 14–20, 2026', 'info', 2000); }
function nextWeek() { showToast('Next week — Apr 28–May 4, 2026', 'info', 2000); }

// ============================================
// THEME TOGGLE (Dark / Light Mode)
// ============================================
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('light-mode');
  const isLight = body.classList.contains('light-mode');
  const btn = document.getElementById('theme-toggle-btn');
  const chk = document.getElementById('settings-dark-toggle');
  if (btn) btn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
  if (chk) chk.checked = !isLight;
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  showToast(isLight ? '☀️ Light mode on' : '🌙 Dark mode on', 'info', 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    const btn = document.getElementById('theme-toggle-btn');
    const chk = document.getElementById('settings-dark-toggle');
    if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
    if (chk) chk.checked = false;
  }
});

// ============================================
// MOBILE BOTTOM NAV
// ============================================
function mobNav(page, btn) {
  document.querySelectorAll('.mob-nav-item').forEach(i => i.classList.remove('active'));
  if (btn) btn.classList.add('active');
  navigate(page);
}

// ============================================
// POMODORO TIMER
// ============================================
const PomState = {
  mode: 'focus',
  minutes: 25,
  seconds: 0,
  totalSeconds: 25 * 60,
  elapsed: 0,
  running: false,
  interval: null,
  session: 0,
  task: 'Study Session',
  modes: { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }
};

function _updatePomRing() {
  const ring = document.getElementById('pomo-ring-progress');
  if (!ring) return;
  const r = 96;
  const circumference = 2 * Math.PI * r;
  const progress = PomState.elapsed / PomState.modes[PomState.mode];
  const offset = circumference - progress * circumference;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;
}

function _updatePomDisplay() {
  const el = document.getElementById('pomo-display');
  const lbl = document.getElementById('pomo-mode-label');
  if (el) el.textContent = String(PomState.minutes).padStart(2, '0') + ':' + String(PomState.seconds).padStart(2, '0');
  if (lbl) lbl.textContent = { focus: 'FOCUS', short: 'SHORT BREAK', long: 'LONG BREAK' }[PomState.mode];
  _updatePomRing();
}

function setPomodoroMode(mode, btn) {
  clearInterval(PomState.interval);
  PomState.running = false;
  PomState.mode = mode;
  PomState.elapsed = 0;
  const total = PomState.modes[mode];
  PomState.minutes = Math.floor(total / 60);
  PomState.seconds = 0;
  document.querySelectorAll('#page-pomodoro .tab-btn').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const tabId = { focus: 'pomo-tab-focus', short: 'pomo-tab-short', long: 'pomo-tab-long' }[mode];
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
  }
  const startBtn = document.getElementById('pomo-play-btn');
  if (startBtn) startBtn.textContent = '▶';
  _updatePomDisplay();
}

function togglePomodoro() {
  const btn = document.getElementById('pomo-play-btn');
  if (PomState.running) {
    clearInterval(PomState.interval);
    PomState.running = false;
    if (btn) btn.textContent = '▶';
  } else {
    PomState.running = true;
    if (btn) btn.textContent = '⏸';
    PomState.interval = setInterval(() => {
      PomState.elapsed++;
      const remaining = PomState.modes[PomState.mode] - PomState.elapsed;
      PomState.minutes = Math.floor(remaining / 60);
      PomState.seconds = remaining % 60;
      _updatePomDisplay();
      if (remaining <= 0) {
        clearInterval(PomState.interval);
        PomState.running = false;
        if (PomState.mode === 'focus') {
          PomState.session++;
          _updateSessionDots();
          launchConfetti();
          showToast('Focus session complete! Take a break.', 'success', 4000);
          if (PomState.session % 4 === 0) showLevelUp(Math.floor(PomState.session / 4) + 1, '🍅');
        } else {
          showToast('Break over! Time to focus.', 'info', 3000);
        }
        setPomodoroMode(PomState.mode === 'focus' ? 'short' : 'focus', null);
      }
    }, 1000);
  }
}

function resetPomodoro() {
  clearInterval(PomState.interval);
  PomState.running = false;
  PomState.elapsed = 0;
  const total = PomState.modes[PomState.mode];
  PomState.minutes = Math.floor(total / 60);
  PomState.seconds = 0;
  const btn = document.getElementById('pomo-play-btn');
  if (btn) btn.textContent = '▶';
  _updatePomDisplay();
}

function skipPomodoro() {
  clearInterval(PomState.interval);
  PomState.running = false;
  const next = PomState.mode === 'focus' ? 'short' : 'focus';
  const tabId = { focus: 'pomo-tab-focus', short: 'pomo-tab-short', long: 'pomo-tab-long' }[next];
  setPomodoroMode(next, document.getElementById(tabId));
  showToast('Session skipped.', 'info', 2000);
}

function _updateSessionDots() {
  const dotIds = ['sdot-1', 'sdot-2', 'sdot-3', 'sdot-4'];
  const count = PomState.session % 4;
  dotIds.forEach((id, i) => {
    const dot = document.getElementById(id);
    if (!dot) return;
    dot.classList.toggle('done', i < count);
    dot.classList.toggle('active', i === count);
  });
}

function selectPomodoroTask(el, name) {
  document.querySelectorAll('.pomodoro-task-item').forEach(t => t.classList.remove('active-task'));
  if (el) el.classList.add('active-task');
  PomState.task = name;
  const taskEl = document.getElementById('pomo-current-task');
  if (taskEl) taskEl.textContent = name;
}

// ============================================
// FLASHCARD SYSTEM
// ============================================
const FLASHCARD_DATA = {
  math: {
    title: 'Mathematics',
    cards: [
      { q: 'What is the quadratic formula?', a: 'x = (-b ± √(b²-4ac)) / 2a', hint: 'Used to solve ax²+bx+c=0' },
      { q: 'What is the derivative of sin(x)?', a: 'cos(x)', hint: 'Trigonometric derivative' },
      { q: 'What is the integral of 1/x?', a: 'ln|x| + C', hint: 'Natural logarithm' },
      { q: 'What is Euler\'s number (e) approximately?', a: '2.71828...', hint: 'Base of natural logarithm' },
      { q: 'What is the Pythagorean theorem?', a: 'a² + b² = c²', hint: 'Right triangle sides' },
    ]
  },
  physics: {
    title: 'Physics',
    cards: [
      { q: 'What is Newton\'s second law?', a: 'F = ma (Force = mass × acceleration)', hint: 'Relates force, mass, and acceleration' },
      { q: 'What is the speed of light?', a: '≈ 3 × 10⁸ m/s', hint: 'In vacuum' },
      { q: 'What is Ohm\'s Law?', a: 'V = IR (Voltage = Current × Resistance)', hint: 'Electrical circuits' },
      { q: 'What is kinetic energy?', a: 'KE = ½mv²', hint: 'Energy of motion' },
      { q: 'What is the formula for gravitational potential energy?', a: 'PE = mgh', hint: 'Height-based energy' },
    ]
  },
  chemistry: {
    title: 'Chemistry',
    cards: [
      { q: 'What is the atomic number of Carbon?', a: '6', hint: 'Period 2 element' },
      { q: 'What is the molecular formula of water?', a: 'H₂O', hint: '2 hydrogen, 1 oxygen' },
      { q: 'What is Avogadro\'s number?', a: '6.022 × 10²³', hint: 'Particles per mole' },
      { q: 'What is the pH of a neutral solution?', a: '7', hint: 'Pure water at 25°C' },
      { q: 'What is an isotope?', a: 'Atoms of the same element with different neutron counts', hint: 'Same Z, different A' },
    ]
  },
  python: {
    title: 'Python',
    cards: [
      { q: 'What does the __init__ method do in Python?', a: 'It is the constructor — called when a new object is created from a class.', hint: 'Special/dunder method' },
      { q: 'What is a list comprehension?', a: '[expression for item in iterable if condition] — a concise way to create lists.', hint: 'e.g. [x*2 for x in range(5)]' },
      { q: 'What is the difference between a list and a tuple?', a: 'Lists are mutable (changeable); tuples are immutable (fixed after creation).', hint: 'list = [], tuple = ()' },
      { q: 'What does the "self" keyword refer to in a class?', a: 'It refers to the current instance of the class.', hint: 'Always first parameter in instance methods' },
      { q: 'What is a Python decorator?', a: 'A function that wraps another function to extend its behavior without modifying it.', hint: 'Used with @decorator syntax' },
    ]
  },
  history: {
    title: 'World History',
    cards: [
      { q: 'In what year did World War II end?', a: '1945', hint: 'Allied victory in Europe and Pacific' },
      { q: 'Who was the first President of the United States?', a: 'George Washington', hint: 'Served 1789–1797' },
      { q: 'What ancient wonder was located in Alexandria?', a: 'The Great Library (Lighthouse of Alexandria)', hint: 'Egyptian port city' },
      { q: 'What year did the Berlin Wall fall?', a: '1989', hint: 'End of Cold War era' },
      { q: 'Who wrote the Declaration of Independence?', a: 'Thomas Jefferson (primary author)', hint: '1776' },
    ]
  }
};

const FlashState = {
  deckId: null,
  cards: [],
  index: 0,
  flipped: false,
  stats: { easy: 0, ok: 0, hard: 0 }
};

function openDeck(deckId) {
  const deck = FLASHCARD_DATA[deckId];
  if (!deck) return;
  FlashState.deckId = deckId;
  FlashState.cards = [...deck.cards].sort(() => Math.random() - 0.5);
  FlashState.index = 0;
  FlashState.flipped = false;
  FlashState.stats = { easy: 0, ok: 0, hard: 0 };
  FlashState.totalPoints = 0;
  FlashState.maxPoints = 0;
  const deckView = document.getElementById('fc-deck-view');
  const studyView = document.getElementById('fc-study-view');
  if (deckView) deckView.style.display = 'none';
  if (studyView) studyView.style.display = 'block';
  _renderFlashcard();
}

function closeDeck() {
  const deckView = document.getElementById('fc-deck-view');
  const studyView = document.getElementById('fc-study-view');
  if (deckView) deckView.style.display = 'block';
  if (studyView) studyView.style.display = 'none';
  FlashState.deckId = null;
}

function _renderFlashcard() {
  const card = FlashState.cards[FlashState.index];
  if (!card) return;
  const qEl   = document.getElementById('fc-question');
  const aEl   = document.getElementById('fc-answer');
  const hEl   = document.getElementById('fc-hint-text');
  const numEl = document.getElementById('fc-current-num');
  const totEl = document.getElementById('fc-total-num');
  const bar   = document.getElementById('fc-progress');
  if (qEl)   qEl.textContent   = card.q;
  if (aEl)   aEl.textContent   = card.a;
  if (hEl)   hEl.textContent   = card.hint;
  if (numEl) numEl.textContent = FlashState.index + 1;
  if (totEl) totEl.textContent = FlashState.cards.length;
  if (bar)   bar.style.width   = ((FlashState.index / FlashState.cards.length) * 100) + '%';

  // Reset card to question side
  const cardEl = document.getElementById('flashcard-el');
  if (cardEl) cardEl.classList.remove('flipped');
  FlashState.flipped = false;

  // Show answer input, hide comparison
  const ansBox     = document.getElementById('fc-answer-box');
  const compareArea= document.getElementById('fc-compare-area');
  const studentAns = document.getElementById('fc-student-answer');
  const hintReveal = document.getElementById('fc-hint-reveal');
  if (ansBox)      ansBox.style.display      = 'block';
  if (compareArea) compareArea.style.display = 'none';
  if (studentAns)  studentAns.value          = '';
  if (hintReveal)  hintReveal.style.display  = 'none';
}

function fcShowHint() {
  const card = FlashState.cards[FlashState.index];
  if (!card) return;
  const hintReveal = document.getElementById('fc-hint-reveal');
  if (hintReveal) {
    hintReveal.textContent = '💡 ' + card.hint;
    hintReveal.style.display = 'block';
  }
}

function fcCheckAnswer() {
  const studentAns = document.getElementById('fc-student-answer').value.trim();
  const card = FlashState.cards[FlashState.index];

  // Flip the card to show correct answer
  const cardEl = document.getElementById('flashcard-el');
  if (cardEl) { cardEl.classList.add('flipped'); FlashState.flipped = true; }

  // Populate comparison panel
  const yourDisplay    = document.getElementById('fc-your-answer-display');
  const correctDisplay = document.getElementById('fc-correct-answer-display');
  if (yourDisplay)    yourDisplay.textContent    = studentAns || '(no answer written)';
  if (correctDisplay) correctDisplay.textContent = card ? card.a : '';

  // Switch panels
  document.getElementById('fc-answer-box').style.display      = 'none';
  document.getElementById('fc-compare-area').style.display    = 'block';
}

function flipCard() {
  // Keep flipCard for backwards compat but it now does nothing on its own
  // (the flow is controlled by fcCheckAnswer)
}

function rateCard(rating) {
  FlashState.stats[rating]++;

  // Score contribution: easy=10, ok=5, hard=0
  const points = { easy: 10, ok: 5, hard: 0 };
  FlashState.totalPoints = (FlashState.totalPoints || 0) + points[rating];
  FlashState.maxPoints   = (FlashState.maxPoints   || 0) + 10;

  FlashState.index++;
  if (FlashState.index >= FlashState.cards.length) {
    _showFlashcardResults();
  } else {
    _renderFlashcard();
  }
}

function _showFlashcardResults() {
  const studyView = document.getElementById('fc-study-view');
  if (!studyView) return;
  const { easy, ok, hard } = FlashState.stats;
  const total = easy + ok + hard;
  const score = FlashState.maxPoints > 0
    ? Math.round((FlashState.totalPoints / FlashState.maxPoints) * 100)
    : 0;
  studyView.innerHTML = `
    <div style="text-align:center;padding:2rem;" class="fade-in">
      <div style="font-size:3rem;margin-bottom:1rem;">${score >= 80 ? '🌟' : score >= 60 ? '👍' : '💪'}</div>
      <h2 style="color:var(--neon-blue);margin-bottom:.5rem;">Deck Complete!</h2>
      <p style="color:var(--text-secondary);margin-bottom:1.5rem;">${total} cards reviewed</p>
      <div style="display:flex;gap:1rem;justify-content:center;margin-bottom:1.5rem;flex-wrap:wrap;">
        <div style="background:rgba(16,185,129,.15);border:1px solid #10b981;padding:.5rem 1rem;border-radius:8px;">✅ Easy: ${easy}</div>
        <div style="background:rgba(245,158,11,.15);border:1px solid #f59e0b;padding:.5rem 1rem;border-radius:8px;">🟡 OK: ${ok}</div>
        <div style="background:rgba(239,68,68,.15);border:1px solid #ef4444;padding:.5rem 1rem;border-radius:8px;">🔴 Hard: ${hard}</div>
      </div>
      <div style="font-size:1.4rem;font-weight:700;color:var(--neon-cyan);margin-bottom:1.5rem;">Score: ${score}%</div>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="openDeck('${FlashState.deckId}')">Review Again</button>
        <button class="btn btn-secondary" onclick="closeDeck()">Back to Decks</button>
      </div>
    </div>`;
  if (score >= 80) { launchConfetti(); showLevelUp(2, '🃏'); }
}

// ============================================
// DAILY CHALLENGE
// ============================================
const CHALLENGE_QUESTIONS = [
  {
    q: 'A train travels 120 km in 2 hours. What is its average speed?',
    options: ['50 km/h', '60 km/h', '70 km/h', '80 km/h'],
    correct: 1,
    explanation: 'Speed = Distance ÷ Time = 120 ÷ 2 = 60 km/h'
  },
  {
    q: 'What is the value of x in: 2x + 6 = 18?',
    options: ['4', '5', '6', '7'],
    correct: 2,
    explanation: '2x = 18 - 6 = 12, so x = 6'
  },
  {
    q: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correct: 2,
    explanation: 'Mars appears red due to iron oxide (rust) on its surface.'
  },
  {
    q: 'What is the chemical symbol for Gold?',
    options: ['Go', 'Gd', 'Ag', 'Au'],
    correct: 3,
    explanation: 'Au comes from the Latin word "Aurum" meaning gold.'
  },
  {
    q: 'How many sides does a hexagon have?',
    options: ['5', '6', '7', '8'],
    correct: 1,
    explanation: 'Hexa- is a Greek prefix meaning six.'
  }
];

const ChallengeState = {
  questions: [],
  current: 0,
  score: 0,
  answered: false,
  timerInterval: null,
  timeLeft: 30
};

function startDailyChallenge() {
  ChallengeState.questions = [...CHALLENGE_QUESTIONS].sort(() => Math.random() - 0.5);
  ChallengeState.current = 0;
  ChallengeState.score = 0;
  ChallengeState.answered = false;
  const intro = document.getElementById('challenge-intro');
  const area = document.getElementById('challenge-area');
  if (intro) intro.style.display = 'none';
  if (area) area.style.display = 'block';
  _renderChallengeQuestion();
}

function _renderChallengeQuestion() {
  const q = ChallengeState.questions[ChallengeState.current];
  const area = document.getElementById('challenge-area');
  if (!area || !q) return;
  ChallengeState.answered = false;
  area.innerHTML = `
    <div class="challenge-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <span style="color:var(--text-secondary);">Question ${ChallengeState.current + 1} / ${ChallengeState.questions.length}</span>
      <span id="challenge-timer" style="font-size:1.5rem;font-weight:700;color:var(--neon-cyan);">:30</span>
      <span style="color:var(--neon-purple);">Score: ${ChallengeState.score}</span>
    </div>
    <div class="glass-card" style="padding:1.5rem;margin-bottom:1.5rem;">
      <p style="font-size:1.1rem;font-weight:600;line-height:1.6;">${q.q}</p>
    </div>
    <div class="challenge-options" style="display:flex;flex-direction:column;gap:.75rem;">
      ${q.options.map((opt, i) => `
        <button class="challenge-opt glass-card" onclick="answerChallenge(${i})"
          style="padding:1rem 1.5rem;text-align:left;border-radius:12px;cursor:pointer;border:1px solid var(--border-glass);background:var(--bg-glass);color:var(--text-primary);font-size:1rem;transition:all .2s;">
          <span style="color:var(--neon-blue);font-weight:700;margin-right:.75rem;">${String.fromCharCode(65 + i)}.</span>${opt}
        </button>`).join('')}
    </div>`;
  _startChallengeTimer();
}

function _startChallengeTimer() {
  clearInterval(ChallengeState.timerInterval);
  ChallengeState.timeLeft = 30;
  ChallengeState.timerInterval = setInterval(() => {
    ChallengeState.timeLeft--;
    const el = document.getElementById('challenge-timer');
    if (el) {
      el.textContent = ':' + String(ChallengeState.timeLeft).padStart(2, '0');
      if (ChallengeState.timeLeft <= 10) el.style.color = '#ef4444';
    }
    if (ChallengeState.timeLeft <= 0) {
      clearInterval(ChallengeState.timerInterval);
      if (!ChallengeState.answered) answerChallenge(-1);
    }
  }, 1000);
}

function answerChallenge(index) {
  if (ChallengeState.answered) return;
  clearInterval(ChallengeState.timerInterval);
  ChallengeState.answered = true;
  const q = ChallengeState.questions[ChallengeState.current];
  const opts = document.querySelectorAll('.challenge-opt');
  const correct = index === q.correct;
  if (correct) ChallengeState.score += 10 + ChallengeState.timeLeft;
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.style.background = 'rgba(16,185,129,.25)';
    else if (i === index && !correct) btn.style.background = 'rgba(239,68,68,.25)';
  });
  const expl = document.createElement('div');
  expl.style.cssText = 'margin-top:1rem;padding:1rem;border-radius:12px;background:rgba(59,130,246,.1);border:1px solid var(--neon-blue);color:var(--text-secondary);';
  expl.innerHTML = `<strong>${correct ? '✅ Correct!' : index === -1 ? '⏰ Time\'s up!' : '❌ Wrong!'}</strong> ${q.explanation}`;
  document.querySelector('.challenge-options').after(expl);
  setTimeout(() => {
    ChallengeState.current++;
    if (ChallengeState.current >= ChallengeState.questions.length) {
      _showChallengeResults();
    } else {
      _renderChallengeQuestion();
    }
  }, 2200);
}

function _showChallengeResults() {
  const maxScore = ChallengeState.questions.length * 40;
  const pct = Math.round((ChallengeState.score / maxScore) * 100);
  const area = document.getElementById('challenge-area');
  area.innerHTML = `
    <div style="text-align:center;padding:2rem;">
      <div style="font-size:3.5rem;margin-bottom:1rem;">${pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'}</div>
      <h2 style="color:var(--neon-blue);margin-bottom:.5rem;">Challenge Complete!</h2>
      <p style="color:var(--text-secondary);margin-bottom:1.5rem;">${ChallengeState.questions.length} questions answered</p>
      <div style="font-size:2rem;font-weight:800;color:var(--neon-cyan);margin-bottom:.5rem;">${ChallengeState.score} pts</div>
      <div style="color:var(--text-secondary);margin-bottom:2rem;">Top accuracy: ${pct}%</div>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn-primary" onclick="startDailyChallenge()">Try Again</button>
        <button class="btn btn-secondary" onclick="document.getElementById('challenge-intro').style.display='block';document.getElementById('challenge-area').style.display='none';">Exit</button>
      </div>
    </div>`;
  if (pct >= 80) { launchConfetti(); showLevelUp(3, '🏆'); }
  else if (pct >= 50) { launchConfetti(); }
}

// ============================================
// CONFETTI CELEBRATION
// ============================================
function launchConfetti() {
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const container = document.body;
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${2 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    container.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}

// ============================================
// LEVEL-UP MODAL
// ============================================
function showLevelUp(level, emoji) {
  const modal = document.getElementById('levelup-modal');
  if (!modal) return;
  const emEl = document.getElementById('levelup-emoji');
  const subEl = document.getElementById('levelup-subtitle');
  if (emEl) emEl.textContent = emoji || '🏆';
  if (subEl) subEl.textContent = 'You reached Level ' + level + '!';
  modal.style.display = 'flex';
}

function closeLevelUp() {
  const modal = document.getElementById('levelup-modal');
  if (modal) modal.style.display = 'none';
}

// ============================================
// UPGRADE / PAYWALL MODAL
// ============================================
function showUpgradeModal(reason) {
  const modal = document.getElementById('upgrade-modal');
  if (!modal) return;
  const reasonEl = document.getElementById('upgrade-reason');
  if (reasonEl && reason) reasonEl.textContent = reason;
  modal.style.display = 'flex';
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.style.display = 'none';
}

// ============================================
// ONBOARDING TOUR SPOTLIGHT
// ============================================
const TOUR_STEPS = [
  { selector: '.sidebar',            title: 'Navigation',        desc: 'Use the sidebar to navigate between all pages of the app.' },
  { selector: '#header-search-wrapper', title: 'Smart Search',   desc: 'Search for any topic, subject, or page instantly.' },
  { selector: '#theme-toggle-btn',   title: 'Theme Toggle',      desc: 'Switch between dark and light mode to suit your preference.' },
  { selector: '.page.active',        title: 'Main Content',      desc: 'Your current page content is shown here. Each page is fully interactive.' },
  { selector: '#float-ai-btn',       title: 'AI Assistant',      desc: 'Click this anytime to open the AI chat and ask questions.' },
  { selector: '#mobile-bottom-nav',  title: 'Mobile Navigation', desc: 'On mobile, use the bottom bar for quick access to key features.' },
];

const TourState = { step: 0, active: false };

function startTour() {
  TourState.step = 0;
  TourState.active = true;
  _renderTourStep();
}

function _renderTourStep() {
  const spotlight = document.getElementById('tour-spotlight');
  const tooltip = document.getElementById('tour-tooltip');
  if (!spotlight || !tooltip) return;

  const step = TOUR_STEPS[TourState.step];
  const target = document.querySelector(step.selector);

  spotlight.style.display = 'block';
  tooltip.style.display = 'block';

  if (target) {
    const r = target.getBoundingClientRect();
    const pad = 8;
    spotlight.style.top = (r.top - pad + window.scrollY) + 'px';
    spotlight.style.left = (r.left - pad) + 'px';
    spotlight.style.width = (r.width + pad * 2) + 'px';
    spotlight.style.height = (r.height + pad * 2) + 'px';
    tooltip.style.top = (r.bottom + 16 + window.scrollY) + 'px';
    tooltip.style.left = Math.min(r.left, window.innerWidth - 320) + 'px';
  }

  const stepLbl = document.getElementById('tour-step-label');
  const titleEl = document.getElementById('tour-title');
  const descEl = document.getElementById('tour-desc');
  const nextBtn = tooltip.querySelector('.btn-primary');
  if (stepLbl) stepLbl.textContent = 'Step ' + (TourState.step + 1) + ' of ' + TOUR_STEPS.length;
  if (titleEl) titleEl.textContent = step.title;
  if (descEl) descEl.textContent = step.desc;
  if (nextBtn) nextBtn.textContent = TourState.step === TOUR_STEPS.length - 1 ? 'Finish ✓' : 'Next →';
}

function nextTourStep() {
  TourState.step++;
  if (TourState.step >= TOUR_STEPS.length) {
    endTour();
    showToast('Tour complete! You\'re all set. 🎉', 'success', 4000);
  } else {
    _renderTourStep();
  }
}

function endTour() {
  TourState.active = false;
  const spotlight = document.getElementById('tour-spotlight');
  const tooltip = document.getElementById('tour-tooltip');
  if (spotlight) spotlight.style.display = 'none';
  if (tooltip) tooltip.style.display = 'none';
}

// ============================================
// EXTEND _extraTitles FOR NEW PAGES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof _extraTitles !== 'undefined') {
    Object.assign(_extraTitles, {
      pomodoro:   { title: 'Focus Timer',     breadcrumb: 'AI Tutor / Focus Timer' },
      flashcards: { title: 'Flashcards',      breadcrumb: 'AI Tutor / Flashcards' },
      challenge:  { title: 'Daily Challenge', breadcrumb: 'AI Tutor / Daily Challenge' },
    });
  }
});

// ============================================
// INTERVIEW BOT
// ============================================

const IVState = {
  questions: [],
  current: 0,
  answers: [],
  scores: [],
  level: 'fresher',
  position: '',
  company: '',
  type: 'mixed',
  timerInterval: null,
  timeLeft: 120
};

const IV_QUESTIONS = {
  technical: {
    general: [
      { q: 'Can you walk me through your most technically challenging project?', tip: 'Use STAR method: Situation, Task, Action, Result.', difficulty: 'Medium' },
      { q: 'How do you approach debugging a complex problem you\'ve never seen before?', tip: 'Mention systematic approach: isolate, reproduce, research, fix.', difficulty: 'Medium' },
      { q: 'What version control system do you use and how do you handle merge conflicts?', tip: 'Be specific about Git workflows (Git Flow, trunk-based).', difficulty: 'Easy' },
      { q: 'How do you ensure code quality in your projects?', tip: 'Mention code reviews, testing, linting, documentation.', difficulty: 'Medium' },
      { q: 'Explain a time you had to learn a new technology quickly to complete a project.', tip: 'Show adaptability and self-learning skills.', difficulty: 'Medium' },
    ],
    developer: [
      { q: 'What is the difference between REST and GraphQL? When would you use each?', tip: 'REST = simple CRUD; GraphQL = complex, nested data needs.', difficulty: 'Medium' },
      { q: 'How do you handle state management in large frontend applications?', tip: 'Mention tools like Redux, Zustand, Context API.', difficulty: 'Hard' },
      { q: 'Explain the concept of database indexing and when you would use it.', tip: 'Focus on read performance vs write overhead tradeoff.', difficulty: 'Hard' },
      { q: 'What strategies do you use to optimize web application performance?', tip: 'Lazy loading, code splitting, caching, CDN, image optimization.', difficulty: 'Medium' },
      { q: 'How do you approach designing a scalable system architecture?', tip: 'Mention microservices, load balancing, caching layers.', difficulty: 'Hard' },
    ],
    data: [
      { q: 'Explain the difference between supervised and unsupervised learning with examples.', tip: 'Supervised = labeled data (classification); Unsupervised = patterns (clustering).', difficulty: 'Medium' },
      { q: 'How do you handle missing data in a dataset?', tip: 'Imputation, deletion, or model-based approaches.', difficulty: 'Easy' },
      { q: 'What metrics do you use to evaluate a machine learning model?', tip: 'Accuracy, precision, recall, F1 — explain when each matters.', difficulty: 'Medium' },
      { q: 'Describe a situation where your data analysis led to a business decision.', tip: 'Focus on impact and how you communicated findings.', difficulty: 'Hard' },
    ],
    marketing: [
      { q: 'How do you measure the ROI of a digital marketing campaign?', tip: 'Mention CAC, LTV, ROAS, conversion rates.', difficulty: 'Medium' },
      { q: 'What tools do you use for SEO and how do you track performance?', tip: 'Google Analytics, Search Console, Ahrefs, Semrush.', difficulty: 'Easy' },
      { q: 'How do you approach A/B testing for campaigns?', tip: 'Hypothesis, control/variant, statistical significance.', difficulty: 'Medium' },
    ]
  },
  behavioral: [
    { q: 'Tell me about a time you had a conflict with a team member. How did you resolve it?', tip: 'Focus on communication and the positive outcome.', difficulty: 'Medium' },
    { q: 'Describe a situation where you had to meet a very tight deadline. What did you do?', tip: 'Show prioritization and time management skills.', difficulty: 'Medium' },
    { q: 'Tell me about a time you failed at something. What did you learn?', tip: 'Honesty is key. Focus heavily on the learning and what you changed.', difficulty: 'Hard' },
    { q: 'Describe a time when you went above and beyond your job responsibilities.', tip: 'Show initiative and ownership mindset.', difficulty: 'Medium' },
    { q: 'Tell me about a time you had to lead a team without formal authority.', tip: 'Show influence through expertise and communication.', difficulty: 'Hard' },
    { q: 'Describe a situation where you had to deal with a difficult client or stakeholder.', tip: 'Show empathy, active listening, and professionalism.', difficulty: 'Medium' },
    { q: 'Tell me about a time you received critical feedback. How did you react?', tip: 'Show growth mindset and emotional intelligence.', difficulty: 'Medium' },
    { q: 'Describe a project where you had to work with incomplete or ambiguous requirements.', tip: 'Show proactive clarification and decision-making.', difficulty: 'Hard' },
  ],
  hr: [
    { q: 'Why are you leaving your current position?', tip: 'Be honest but professional. Focus on growth, not complaints.', difficulty: 'Easy' },
    { q: 'Where do you see yourself in 5 years?', tip: 'Align your goals with the company\'s growth. Show ambition.', difficulty: 'Easy' },
    { q: 'What is your expected salary range for this position?', tip: 'Research market rates first. Give a range, not a single number.', difficulty: 'Medium' },
    { q: 'Why do you want to work at our company specifically?', tip: 'Research the company beforehand. Mention specific products, culture, mission.', difficulty: 'Easy' },
    { q: 'What are your greatest strengths and weaknesses?', tip: 'For weakness: pick a real one and show how you\'re working on it.', difficulty: 'Easy' },
    { q: 'How soon can you join if selected?', tip: 'Be specific and honest about your notice period.', difficulty: 'Easy' },
    { q: 'Are you open to relocation or remote work?', tip: 'Be clear about your preferences and flexibility.', difficulty: 'Easy' },
  ],
  situational: [
    { q: 'If you disagreed with your manager\'s technical decision, what would you do?', tip: 'Show you can voice concerns respectfully, then commit to the team decision.', difficulty: 'Hard' },
    { q: 'How would you prioritize if you had three urgent tasks due at the same time?', tip: 'Mention impact assessment, communication with stakeholders.', difficulty: 'Medium' },
    { q: 'If you joined and noticed the team had poor coding practices, what would you do?', tip: 'Lead by example, suggest improvements gradually, avoid blame.', difficulty: 'Hard' },
  ]
};

const IV_STRENGTH_COMMENTS = [
  'You provided a clear, structured response using a logical flow.',
  'Good use of a specific example from your experience.',
  'You demonstrated strong problem-solving thinking.',
  'Your answer showed genuine self-awareness and reflection.',
  'You connected your experience directly to the role requirements.',
  'Good use of quantifiable results — hiring managers love numbers.',
  'You showed ownership and accountability in your answer.',
];
const IV_IMPROVE_COMMENTS = [
  'Add a specific metric or number to show the impact (e.g., "increased efficiency by 30%").',
  'Use the STAR method: Situation → Task → Action → Result.',
  'Your answer could be more concise — aim for 1.5–2 minutes when speaking.',
  'Mention what you learned or how you would do it differently now.',
  'Try to relate the answer more specifically to the job you\'re applying for.',
  'Add more detail about your personal contribution vs the team\'s contribution.',
  'Include a brief context/background before jumping into the solution.',
];
const IV_RESUME_SUGGESTIONS = [
  { icon: '📊', bg: 'rgba(59,130,246,0.15)', title: 'Quantify Your Achievements', desc: 'Replace vague statements with numbers. "Improved performance" → "Improved API response time by 45%, handling 2M+ requests/day".' },
  { icon: '🎯', bg: 'rgba(139,92,246,0.15)', title: 'Add a Strong Summary Section', desc: 'A 3-line professional summary at the top dramatically increases recruiter interest. Tailor it to the specific role.' },
  { icon: '🔑', bg: 'rgba(6,182,212,0.15)', title: 'Use Keywords from Job Description', desc: 'Many companies use ATS (Applicant Tracking System). Match keywords from the job posting to pass automated screening.' },
  { icon: '⚡', bg: 'rgba(245,158,11,0.15)', title: 'Use Strong Action Verbs', desc: '"Responsible for managing" → "Led", "Engineered", "Architected", "Optimized". Start every bullet with a powerful verb.' },
  { icon: '📐', bg: 'rgba(16,185,129,0.15)', title: 'Keep it to 1–2 Pages Maximum', desc: 'Recruiters spend avg 7 seconds on first scan. Trim irrelevant experience. Only keep the last 10 years.' },
  { icon: '🔗', bg: 'rgba(236,72,153,0.15)', title: 'Add Links to Proof of Work', desc: 'Include GitHub, Portfolio, LinkedIn, or live project URLs. Let recruiters see your work, not just read about it.' },
  { icon: '🏆', bg: 'rgba(251,191,36,0.15)', title: 'Add a Skills Section with Proficiency', desc: 'Organize skills by category (Languages, Frameworks, Tools). Mention proficiency level where relevant.' },
  { icon: '📅', bg: 'rgba(99,102,241,0.15)', title: 'Consistent Date Formatting', desc: 'Use "Jan 2022 – Present" or "2022–Present" consistently. Inconsistent formats look unprofessional.' },
  { icon: '🎓', bg: 'rgba(59,130,246,0.12)', title: 'Highlight Certifications', desc: 'Add relevant certifications (AWS, Google, Microsoft, HubSpot, etc.) — they significantly strengthen a resume.' },
  { icon: '💬', bg: 'rgba(139,92,246,0.12)', title: 'Tailor for Each Application', desc: 'One-size-fits-all resumes underperform. Spend 10 minutes customizing the summary and top bullet points for each job.' },
];

function ivSelectLevel(btn, level) {
  document.querySelectorAll('.iv-level-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  IVState.level = level;
}
function ivClearResume() {
  document.getElementById('iv-resume-input').value = '';
  document.getElementById('iv-word-count').textContent = '0 words';
}
function ivResumePreview(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('iv-word-count').textContent = words + ' words';
}
function ivCountWords(el, targetId) {
  const words = el.value.trim() ? el.value.trim().split(/\s+/).length : 0;
  document.getElementById(targetId).textContent = words + ' words';
}
function _ivDetectRole(position, resume) {
  const text = (position + ' ' + resume).toLowerCase();
  if (/data|analyst|machine learning|ml|ai|python|pandas|numpy|tableau/.test(text)) return 'data';
  if (/market|seo|content|brand|campaign|social media|ads|growth/.test(text)) return 'marketing';
  if (/developer|engineer|programmer|frontend|backend|fullstack|react|node|java|php/.test(text)) return 'developer';
  return 'general';
}
function ivGenerateQuestions() {
  const resume = document.getElementById('iv-resume-input').value.trim();
  const position = document.getElementById('iv-position').value.trim();
  if (!position) { showToast('Please enter the job position!', 'error', 3000); document.getElementById('iv-position').focus(); return; }
  if (resume.length < 50) { showToast('Please paste your resume (at least a few lines)', 'error', 3000); return; }
  const btn = document.querySelector('#iv-setup .btn-primary');
  btn.classList.add('iv-generating');
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI is analyzing your resume...';
  IVState.position = position;
  IVState.company = document.getElementById('iv-company').value.trim();
  IVState.type = document.querySelector('input[name="iv-type"]:checked').value;
  const role = _ivDetectRole(position, resume);
  setTimeout(() => {
    btn.classList.remove('iv-generating');
    btn.innerHTML = '<i class="fas fa-robot"></i> Analyze Resume & Generate Questions';
    IVState.questions = _ivBuildQuestionSet(role, IVState.type, IVState.level);
    IVState.current = 0;
    IVState.answers = [];
    IVState.scores = [];
    _ivShowPractice();
    showToast('✅ ' + IVState.questions.length + ' questions generated! Let\'s start.', 'success', 3000);
  }, 2200);
}
function _ivBuildQuestionSet(role, type, level) {
  let pool = [];
  const techGeneral = IV_QUESTIONS.technical.general;
  const techRole = IV_QUESTIONS.technical[role] || IV_QUESTIONS.technical.developer;
  const behavioral = IV_QUESTIONS.behavioral;
  const hr = IV_QUESTIONS.hr;
  const situational = IV_QUESTIONS.situational;
  if (type === 'mixed')          pool = [...techGeneral.slice(0,2), ...techRole.slice(0,2), ...behavioral.slice(0,3), ...hr.slice(0,1), ...situational.slice(0,1)];
  else if (type === 'technical') pool = [...techGeneral, ...techRole];
  else if (type === 'behavioral')pool = [...behavioral, ...situational];
  else if (type === 'hr')        pool = [...hr, ...behavioral.slice(0,2)];
  const count = level === 'senior' ? 10 : level === 'mid' ? 8 : 6;
  const cats  = { mixed: ['Technical','Technical','Technical','Technical','Behavioral','Behavioral','Behavioral','HR','Situational','Situational'], technical: Array(10).fill('Technical'), behavioral: Array(5).fill('Behavioral').concat(Array(5).fill('Situational')), hr: Array(7).fill('HR').concat(Array(3).fill('Behavioral')) };
  return pool.sort(() => Math.random() - 0.5).slice(0, count).map((q, i) => ({ ...q, category: (cats[type] || cats.mixed)[i] || 'General' }));
}
function _ivShowPractice() {
  document.getElementById('iv-setup').style.display = 'none';
  document.getElementById('iv-results').style.display = 'none';
  document.getElementById('iv-practice').style.display = 'block';
  _ivRenderQuestion();
}
function _ivRenderQuestion() {
  const q = IVState.questions[IVState.current];
  if (!q) return;
  const total = IVState.questions.length;
  const idx = IVState.current;
  document.getElementById('iv-q-counter').textContent = 'Question ' + (idx+1) + ' of ' + total;
  document.getElementById('iv-q-progress').style.width = ((idx / total) * 100) + '%';
  document.getElementById('iv-question-text').textContent = q.q;
  document.getElementById('iv-tip-text').textContent = q.tip;
  document.getElementById('iv-q-num-badge').textContent = 'Q' + (idx+1);
  const cat = q.category || 'Technical';
  const badge = document.getElementById('iv-q-type-badge');
  const bar   = document.getElementById('iv-q-accent-bar');
  const diff  = document.getElementById('iv-q-difficulty');
  const badgeClass  = { Technical:'badge-blue', Behavioral:'badge-purple', HR:'badge-green', Situational:'badge-orange', General:'badge-blue' };
  const accentClass = { Technical:'iv-accent-technical', Behavioral:'iv-accent-behavioral', HR:'iv-accent-hr', Situational:'iv-accent-situational', General:'iv-accent-technical' };
  badge.className = 'badge ' + (badgeClass[cat] || 'badge-blue');
  badge.textContent = cat;
  bar.className = accentClass[cat] || 'iv-accent-technical';
  diff.textContent = q.difficulty || 'Medium';
  diff.className   = 'badge ' + (q.difficulty === 'Hard' ? 'badge-red' : q.difficulty === 'Easy' ? 'badge-green' : 'badge-orange');
  document.getElementById('iv-answer-input').value = '';
  document.getElementById('iv-ans-wc').textContent = '0 words';
  document.getElementById('iv-answer-area').style.display = 'block';
  document.getElementById('iv-feedback-area').style.display = 'none';
  _ivStartTimer();
}
function _ivStartTimer() {
  clearInterval(IVState.timerInterval);
  IVState.timeLeft = 120;
  const display = document.getElementById('iv-timer-display');
  if (display) { display.textContent = '2:00'; display.style.color = 'var(--neon-cyan)'; }
  IVState.timerInterval = setInterval(() => {
    IVState.timeLeft--;
    const m = Math.floor(IVState.timeLeft / 60);
    const s = IVState.timeLeft % 60;
    if (display) {
      display.textContent = m + ':' + String(s).padStart(2,'0');
      if (IVState.timeLeft <= 30) display.style.color = '#f59e0b';
      if (IVState.timeLeft <= 10) display.style.color = '#ef4444';
    }
    if (IVState.timeLeft <= 0) { clearInterval(IVState.timerInterval); showToast('⏰ Time\'s up! Submitting answer.','info',2000); ivSubmitAnswer(); }
  }, 1000);
}
function ivSubmitAnswer() {
  clearInterval(IVState.timerInterval);
  const answer = document.getElementById('iv-answer-input').value.trim();
  const wc = answer ? answer.split(/\s+/).length : 0;
  IVState.answers.push(answer);
  let score = wc >= 80 ? 8 + Math.floor(Math.random()*3) : wc >= 50 ? 6 + Math.floor(Math.random()*3) : wc >= 25 ? 4 + Math.floor(Math.random()*3) : wc >= 5 ? 2 + Math.floor(Math.random()*3) : 1;
  score = Math.min(10, score);
  IVState.scores.push(score);
  _ivShowFeedback(score, wc);
}
function _ivShowFeedback(score) {
  document.getElementById('iv-answer-area').style.display = 'none';
  document.getElementById('iv-feedback-area').style.display = 'block';
  const tier = score >= 9 ? 'great' : score >= 7 ? 'good' : score >= 5 ? 'avg' : 'poor';
  const titles = { great:['Excellent Answer! 🌟','Outstanding Response! 💎'], good:['Good Answer! 👍','Solid Response! ⚡'], avg:['Needs More Detail 📝','Room to Improve 💪'], poor:['Keep Practicing! 🔄','Let\'s Work on This 💪'] };
  const iconMap = { great:'🌟', good:'✅', avg:'🤔', poor:'💪' };
  const bgMap   = { great:'rgba(16,185,129,0.2)', good:'rgba(6,182,212,0.2)', avg:'rgba(245,158,11,0.2)', poor:'rgba(239,68,68,0.2)' };
  const colorMap= { great:'#10b981', good:'var(--neon-cyan)', avg:'#f59e0b', poor:'#ef4444' };
  document.getElementById('iv-feedback-card').style.borderColor = bgMap[tier];
  document.getElementById('iv-fb-icon').textContent = iconMap[tier];
  document.getElementById('iv-fb-icon').style.background = bgMap[tier];
  document.getElementById('iv-fb-title').textContent = titles[tier][Math.floor(Math.random()*2)];
  document.getElementById('iv-fb-score-label').textContent = 'Score: ' + score + '/10';
  const sb = document.getElementById('iv-fb-score-badge');
  sb.textContent = score + '/10';
  sb.style.color = colorMap[tier];
  const strengths = [...IV_STRENGTH_COMMENTS].sort(() => Math.random()-0.5).slice(0, score > 5 ? 2 : 1);
  const improves  = [...IV_IMPROVE_COMMENTS].sort(() => Math.random()-0.5).slice(0, score < 9 ? 2 : 1);
  document.getElementById('iv-fb-strengths').innerHTML = '✅ <strong>What you did well:</strong><br>' + strengths.map(s=>'• '+s).join('<br>');
  document.getElementById('iv-fb-improve').innerHTML  = (score < 7 ? '🟡' : '💡') + ' <strong>' + (score < 7 ? 'Improvements:' : 'To make it perfect:') + '</strong><br>' + improves.map(i=>'• '+i).join('<br>');
  const q = IVState.questions[IVState.current];
  document.getElementById('iv-fb-sample').innerHTML = '💡 <strong>Tip for this question:</strong><br><span style="color:var(--text-muted);font-size:13px;">' + q.tip + '</span>';
  if (score >= 9) launchConfetti();
}
function ivNextQuestion() {
  IVState.current++;
  IVState.current >= IVState.questions.length ? _ivShowResults() : _ivRenderQuestion();
}
function ivRetryAnswer() {
  IVState.scores.pop();
  IVState.answers.pop();
  document.getElementById('iv-feedback-area').style.display = 'none';
  document.getElementById('iv-answer-area').style.display = 'block';
  document.getElementById('iv-answer-input').value = '';
  document.getElementById('iv-ans-wc').textContent = '0 words';
  _ivStartTimer();
}
function ivSkipQuestion() { IVState.answers.push(''); IVState.scores.push(0); ivNextQuestion(); }
function ivBackToSetup() {
  clearInterval(IVState.timerInterval);
  document.getElementById('iv-practice').style.display = 'none';
  document.getElementById('iv-results').style.display = 'none';
  document.getElementById('iv-setup').style.display = 'block';
}
function _ivShowResults() {
  clearInterval(IVState.timerInterval);
  document.getElementById('iv-practice').style.display = 'none';
  document.getElementById('iv-results').style.display = 'block';
  const scores = IVState.scores;
  const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10) : 0;
  document.getElementById('iv-final-score').textContent = avg + '%';
  document.getElementById('iv-final-emoji').textContent = avg >= 85 ? '🏆' : avg >= 70 ? '🌟' : avg >= 55 ? '💪' : '📚';
  document.getElementById('iv-final-label').textContent  = avg >= 85 ? 'Outstanding Performance' : avg >= 70 ? 'Strong Performance' : avg >= 55 ? 'Good Effort — Keep Practicing' : 'Keep Studying — You\'ll Get There!';
  document.getElementById('iv-score-breakdown').innerHTML = scores.map((s,i) => {
    const q = IVState.questions[i];
    const color = s>=9?'#10b981':s>=7?'var(--neon-cyan)':s>=5?'#f59e0b':'#ef4444';
    return `<div class="iv-score-row"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;"><span style="color:var(--text-secondary);">Q${i+1}: ${(q&&q.category)||'General'}</span><span style="color:${color};font-weight:700;">${s}/10</span></div><div class="iv-score-bar-wrap"><div class="iv-score-bar-fill" style="width:${s*10}%;background:${color};"></div></div></div>`;
  }).join('');
  const suggestions = [...IV_RESUME_SUGGESTIONS].sort(()=>Math.random()-0.5).slice(0,5);
  document.getElementById('iv-resume-suggestions').innerHTML = suggestions.map(s=>`<div class="iv-suggestion-item"><div class="iv-suggestion-icon" style="background:${s.bg};">${s.icon}</div><div><div class="iv-suggestion-title">${s.title}</div><div class="iv-suggestion-desc">${s.desc}</div></div></div>`).join('');
  if (avg >= 80) { launchConfetti(); showLevelUp(Math.ceil(avg/25), '🎤'); }
  else if (avg >= 60) launchConfetti();
}
function ivPracticeAgain() {
  document.getElementById('iv-results').style.display = 'none';
  IVState.current = 0; IVState.answers = []; IVState.scores = [];
  IVState.questions = [...IVState.questions].sort(()=>Math.random()-0.5);
  _ivShowPractice();
}

// Register page title
document.addEventListener('DOMContentLoaded', () => {
  if (typeof _extraTitles !== 'undefined') _extraTitles['interview'] = { title: '🎤 Interview Bot', breadcrumb: 'AI Tutor / Interview Bot' };
});

// ============================================
// WIRE UP QUIZ COMPLETION → CELEBRATION
// ============================================
(function _patchQuizCelebration() {
  const _origShowResult = window.showQuizResult;
  if (typeof _origShowResult === 'function') {
    window.showQuizResult = function(...args) {
      _origShowResult.apply(this, args);
      const score = AppState.quizState.score;
      const total = 5;
      if (score >= total * 0.8) { launchConfetti(); showLevelUp(score, '🎯'); }
    };
  }
})();

