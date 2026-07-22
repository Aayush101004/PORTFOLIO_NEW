(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mouse glow ---------- */
  var glow = document.getElementById('glow');
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    var gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
    document.addEventListener('mousemove', function (e) { gx = e.clientX; gy = e.clientY; });
    (function loop() {
      cx += (gx - cx) * 0.12; cy += (gy - cy) * 0.12;
      glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';
      requestAnimationFrame(loop);
    })();
  } else { glow.style.display = 'none'; }

  /* ---------- typing tagline ---------- */
  var lines = [
    "I build the tools that catch what breaks before it ships.",
    "80+ bugs automated. 6 raised before they reached production.",
    "Currently interning at HPE — systems, networks, automation."
  ];
  var tEl = document.getElementById('tagline');
  var li = 0, ci = 0, deleting = false;
  function typeLoop() {
    var full = lines[li];
    if (!deleting) {
      ci++;
      tEl.childNodes[0].textContent = full.slice(0, ci);
      if (ci === full.length) { deleting = true; setTimeout(typeLoop, 1800); return; }
    } else {
      ci--;
      tEl.childNodes[0].textContent = full.slice(0, ci);
      if (ci === 0) { deleting = false; li = (li + 1) % lines.length; }
    }
    setTimeout(typeLoop, deleting ? 22 : 38);
  }
  if (reduceMotion) { tEl.childNodes[0].textContent = lines[0]; }
  else { typeLoop(); }

  /* ---------- waveform reacts to cursor ---------- */
  var svg = document.getElementById('traceSvg');
  var path = document.getElementById('tracePath');
  var basePath = "M0,40 L60,40 L80,40 L95,8 L110,72 L125,40 L160,40 L180,40 L195,20 L210,60 L225,40 L640,40";
  if (!reduceMotion) {
    var N = 40, W = 640, BASE_Y = 40;
    svg.addEventListener('mousemove', function (e) {
      var r = svg.getBoundingClientRect();
      var mx = (e.clientX - r.left) / r.width * W;
      var myFrac = (e.clientY - r.top) / r.height; // 0 top .. 1 bottom
      var dir = myFrac < 0.5 ? -1 : 1;             // bump up if cursor is above the line, down if below
      var amp = 12 + (1 - Math.abs(myFrac - 0.5) * 2) * 26; // stronger bump the closer to the line
      var sigma = 55;
      var pts = [];
      for (var i = 0; i <= N; i++) {
        var x = i / N * W;
        var g = Math.exp(-((x - mx) * (x - mx)) / (2 * sigma * sigma));
        var y = BASE_Y + dir * amp * g;
        pts.push(x.toFixed(1) + ',' + y.toFixed(1));
      }
      path.setAttribute('d', 'M' + pts.join(' L'));
    });
    svg.addEventListener('mouseleave', function () { path.setAttribute('d', basePath); });
  }

  /* ---------- terminal ---------- */
  var termLog = document.getElementById('termLog');
  var termInput = document.getElementById('termInput');
  var responses = {
    help: "Available commands: <b>about</b>, <b>experience</b>, <b>skills</b>, <b>projects</b>, <b>contact</b>, <b>whoami</b>, <b>clear</b>",
    about: "Final-year CS student at VIT (CGPA 9.18/10). Currently interning at HPE, building automation that finds bugs before customers do.",
    experience: "HPE — Intern (Mar 2026–Present), Bengaluru. CapGemini — Connectivity &amp; Network Intern (May–Jul 2025), Chennai.",
    skills: "Python, C, C++, Java, JavaScript · React, Node.js, Express · PyTest, CMocka, Valgrind · Docker, Git, MongoDB, MySQL",
    projects: "StepWise (MERN resume feedback tool) · PurpleBot (React + Gemini/GNews chatbot) · Smart Rental Website (React + Flask + TensorFlow forecasting) · F1 Telemetry Dashboard (React Three Fiber 3D car explorer)",
    contact: "aayush.khanna2602@gmail.com · linkedin.com/in/aayush-khanna · github.com/Aayush101004",
    whoami: "guest — but you already knew that. Try 'about' to learn who I am.",
    sudo: "Nice try. Permission denied — email me instead."
  };
  function addLine(html, cls) {
    var d = document.createElement('div');
    d.className = 'term-line' + (cls ? ' ' + cls : '');
    d.innerHTML = html;
    termLog.appendChild(d);
    termLog.scrollTop = termLog.scrollHeight;
  }
  function runCmd(raw) {
    var cmd = raw.trim().toLowerCase();
    addLine('<span class="prompt">$</span> ' + (raw || '&nbsp;'), 'echo');
    if (!cmd) return;
    if (cmd === 'clear') { termLog.innerHTML = ''; return; }
    if (responses[cmd]) { addLine(responses[cmd]); }
    else { addLine("command not found: " + cmd + " — type <b>help</b> to see available commands"); }
  }
  termInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { runCmd(termInput.value); termInput.value = ''; }
  });
  document.querySelectorAll('.tchip').forEach(function (chip) {
    chip.addEventListener('click', function () { runCmd(chip.dataset.cmd); termInput.focus(); });
  });

  /* ---------- impact count-up ---------- */
  var counted = false;
  function countUp() {
    if (counted) return; counted = true;
    document.querySelectorAll('.impact-num').forEach(function (el) {
      var target = parseInt(el.dataset.count, 10);
      var suffix = el.dataset.suffix || '';
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 1100, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- scroll reveal + nav active + count trigger ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function (el) { io.observe(el); });

  var impactSection = document.querySelector('.impact');
  var io2 = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) countUp(); });
  }, { threshold: 0.3 });
  io2.observe(impactSection);

  var navLinks = document.querySelectorAll('.navlinks a');
  var indicator = document.getElementById('navIndicator');
  var navUl = document.getElementById('navlinks');
  function setIndicator(link) {
    if (!link) return;
    var lr = link.getBoundingClientRect(), ur = navUl.getBoundingClientRect();
    indicator.style.left = (lr.left - ur.left) + 'px';
    indicator.style.width = lr.width + 'px';
  }
  var sections = ['about', 'experience', 'skills', 'projects', 'extracurricular', 'contact'].map(function (id) { return document.getElementById(id); });
  var io3 = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        var active = document.querySelector('.navlinks a[data-sec="' + en.target.id + '"]');
        if (active) { active.classList.add('active'); setIndicator(active); }
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(function (s) { if (s) io3.observe(s); });
  window.addEventListener('resize', function () { setIndicator(document.querySelector('.navlinks a.active')); });

  /* ---------- expandable experience entries ---------- */
  document.querySelectorAll('.entry-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var entry = btn.closest('.entry');
      var open = entry.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- skill -> project filter ---------- */
  var activeSkill = null;
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var skill = chip.dataset.skill;
      var cards = document.querySelectorAll('.card');
      if (activeSkill === skill) {
        activeSkill = null;
        document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
        cards.forEach(function (c) { c.classList.remove('dim', 'match'); });
        return;
      }
      activeSkill = skill;
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('active', c === chip); });
      cards.forEach(function (c) {
        var tags = (c.dataset.tags || '').split(',');
        var hit = tags.indexOf(skill) !== -1;
        c.classList.toggle('match', hit);
        c.classList.toggle('dim', !hit);
      });
      document.getElementById('projects').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ---------- card tilt ---------- */
  if (!reduceMotion && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateY(' + (px * 6) + 'deg) rotateX(' + (-py * 6) + 'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- live GitHub repo stats ---------- */
  function timeAgo(dateStr) {
    var diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    var units = [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']];
    for (var i = 0; i < units.length; i++) {
      var v = Math.floor(diff / units[i][0]);
      if (v >= 1) return v + units[i][1] + ' ago';
    }
    return 'just now';
  }
  document.querySelectorAll('[data-repo]').forEach(function (card) {
    var repo = card.dataset.repo;
    var slot = card.querySelector('[data-repo-stats]');
    if (!repo || !slot) return;
    fetch('https://api.github.com/repos/' + repo)
      .then(function (r) { if (!r.ok) throw new Error('repo fetch failed'); return r.json(); })
      .then(function (data) {
        var dot = slot.querySelector('.rs-dot');
        dot.classList.add('live');
        var parts = [];
        if (data.stargazers_count > 0) parts.push('<span style="color:var(--text-secondary)">&#9733; ' + data.stargazers_count + '</span>');
        if (data.language) parts.push(data.language);
        parts.push('updated ' + timeAgo(data.pushed_at));
        slot.querySelector('.rs-text').innerHTML = parts.join(' · ');
      })
      .catch(function () {
        var dot = slot.querySelector('.rs-dot');
        dot.classList.add('err');
        slot.querySelector('.rs-text').textContent = 'live stats unavailable — view on GitHub';
      });
  });

  /* ---------- command palette ---------- */
  var cmdkItems = [
    { label: 'About', cat: 'section', action: function () { scrollToId('about'); } },
    { label: 'Experience', cat: 'section', action: function () { scrollToId('experience'); } },
    { label: 'Skills', cat: 'section', action: function () { scrollToId('skills'); } },
    { label: 'Projects', cat: 'section', action: function () { scrollToId('projects'); } },
    { label: 'Extracurricular', cat: 'section', action: function () { scrollToId('extracurricular'); } },
    { label: 'Contact', cat: 'section', action: function () { scrollToId('contact'); } },
    { label: 'StepWise — GitHub', cat: 'project', action: function () { openUrl('https://github.com/Aayush101004/career-tracker'); } },
    { label: 'StepWise — Live site', cat: 'project', action: function () { openUrl('https://career-tracker-two.vercel.app/'); } },
    { label: 'PurpleBot — GitHub', cat: 'project', action: function () { openUrl('https://github.com/Aayush101004/gen_chatbot_next'); } },
    { label: 'PurpleBot — Live site', cat: 'project', action: function () { openUrl('https://gen-chatbot-next.vercel.app/'); } },
    { label: 'Smart Rental Website — GitHub', cat: 'project', action: function () { openUrl('https://github.com/Aayush101004/SmartRentalMaachine-main'); } },
    { label: 'F1 Telemetry Dashboard — GitHub', cat: 'project', action: function () { openUrl('https://github.com/Aayush101004/F1-Telemetry-Dashboard'); } },
    { label: 'F1 Telemetry Dashboard — Live site', cat: 'project', action: function () { openUrl('https://f1-telemetry-dashboard-nine.vercel.app/'); } },
    { label: 'Email', cat: 'contact', action: function () { openUrl('https://mail.google.com/mail/?view=cm&fs=1&to=aayush.khanna2602@gmail.com'); } },
    { label: 'LinkedIn', cat: 'contact', action: function () { openUrl('https://linkedin.com/in/aayush-khanna-87275824b'); } },
    { label: 'GitHub profile', cat: 'contact', action: function () { openUrl('https://github.com/Aayush101004'); } },
    { label: 'LeetCode', cat: 'contact', action: function () { openUrl('https://leetcode.com/u/Aayush1010'); } }
  ];
  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  function openUrl(url) { window.open(url, '_blank', 'noopener'); }

  var overlay = document.getElementById('cmdkOverlay');
  var cmdkInput = document.getElementById('cmdkInput');
  var cmdkList = document.getElementById('cmdkList');
  var activeIndex = 0, filtered = cmdkItems.slice();

  function renderList() {
    cmdkList.innerHTML = '';
    if (filtered.length === 0) {
      cmdkList.innerHTML = '<div class="cmdk-empty">No matches — try "about", "github", "contact"…</div>';
      return;
    }
    filtered.forEach(function (item, i) {
      var row = document.createElement('div');
      row.className = 'cmdk-item' + (i === activeIndex ? ' active' : '');
      row.innerHTML = '<span class="cmdk-label"><span class="cmdk-idx">' + String(i + 1).padStart(2, '0') + '</span> ' + item.label + '</span><span class="cmdk-cat">' + item.cat + '</span>';
      row.addEventListener('click', function () { runItem(item); });
      row.addEventListener('mousemove', function () { if (activeIndex !== i) { activeIndex = i; renderList(); } });
      cmdkList.appendChild(row);
    });
  }
  function runItem(item) { closeCmdk(); item.action(); }
  function openCmdk() {
    overlay.classList.add('open');
    cmdkInput.value = '';
    filtered = cmdkItems.slice();
    activeIndex = 0;
    renderList();
    setTimeout(function () { cmdkInput.focus(); }, 50);
  }
  function closeCmdk() { overlay.classList.remove('open'); }

  document.getElementById('cmdkTrigger').addEventListener('click', openCmdk);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCmdk(); });

  cmdkInput.addEventListener('input', function () {
    var q = cmdkInput.value.trim().toLowerCase();
    filtered = q ? cmdkItems.filter(function (it) { return it.label.toLowerCase().indexOf(q) !== -1 || it.cat.toLowerCase().indexOf(q) !== -1; }) : cmdkItems.slice();
    activeIndex = 0;
    renderList();
  });
  cmdkInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); renderList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); renderList(); }
    else if (e.key === 'Enter') { if (filtered[activeIndex]) runItem(filtered[activeIndex]); }
    else if (e.key === 'Escape') { closeCmdk(); }
  });
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('open') ? closeCmdk() : openCmdk(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); openCmdk(); }
    else if (e.key === 'Escape' && overlay.classList.contains('open')) { closeCmdk(); }
  });
  /* ---------- project case-study modal ---------- */
  var projectDetails = {
    stepwise: {
      problem: "Job seekers send the same generic resume to every posting and rarely know why it isn't landing interviews.",
      approach: "Built a MERN app that parses an uploaded resume with pdf-parse and compares it against a specific job description, returning targeted feedback instead of generic tips. Client and server run as separate Docker services via Docker Compose, so the app deploys the same way locally and in production.",
      outcome: "Live app with a working end-to-end pipeline: upload → parse → job-specific feedback, backed by MongoDB and secured with JWT auth."
    },
    purplebot: {
      problem: "Most chat assistants only do one thing — either conversation or live info — forcing the user to switch tools or specify a mode.",
      approach: "Combined Google's Gemini API for open-ended conversation with the GNews API for real-time headlines from 50+ sources, then wrote a custom intent-parsing layer in the React UI that automatically routes each message to the right API based on what's being asked.",
      outcome: "A single chat interface that handles both casual conversation and 'what's happening right now' queries without the user needing to pick a mode."
    },
    smartrental: {
      problem: "Rental businesses need to anticipate demand and catch unusual booking patterns early, not react to them after the fact.",
      approach: "Built a Flask backend with a proper data science pipeline — scikit-learn and Prophet for demand forecasting, plus anomaly detection on booking data — powering a React frontend that turns the model output into something usable.",
      outcome: "Full-stack app where the frontend visualizes forecasts and anomalies live with Recharts and maps listings geographically with React-Leaflet."
    },
    f1telemetry: {
      problem: "Static specs and exploded diagrams don't really convey how an F1 car's components fit together in 3D space, or what each part actually does.",
      approach: "Built a real-time 3D F1 car model with React Three Fiber, with orbit and scale controls plus an interactive exploded-view slider. Individual parts — front wing, halo, sidepods, suspension — are selectable and surface technical descriptions and specs on click. Custom HTML overlays are scaled to canvas depth so labels track the 3D geometry instead of breaking the layout.",
      outcome: "An explorable 3D dashboard with camera controls and canvas styling tuned specifically for studying the car's structure, not just looking at a render of it."
    }
  };

  var projectModal = document.getElementById('projectModal');
  var modalBody = document.getElementById('modalBody');

  function openProjectModal(card) {
    var key = card.dataset.project;
    var d = projectDetails[key];
    if (!d || !modalBody) return;
    var titleEl = card.querySelector('h3');
    var stackEl = card.querySelector('.stack');
    var title = titleEl ? titleEl.textContent : 'Project';
    var stack = stackEl ? stackEl.textContent : '';
    var links = Array.prototype.slice.call(card.querySelectorAll('.card-links a')).map(function (a) {
      return '<a href="' + a.getAttribute('href') + '" target="_blank" rel="noopener">' + a.textContent + '</a>';
    }).join('');
    modalBody.innerHTML =
      '<h3>' + title + '</h3>' +
      '<div class="modal-stack">' + stack + '</div>' +
      '<div class="modal-section"><div class="modal-label">// problem</div><p>' + d.problem + '</p></div>' +
      '<div class="modal-section"><div class="modal-label">// approach</div><p>' + d.approach + '</p></div>' +
      '<div class="modal-section"><div class="modal-label">// outcome</div><p>' + d.outcome + '</p></div>' +
      '<div class="modal-links">' + links + '</div>';
    projectModal.classList.add('open');
  }
  function closeProjectModal() { if (projectModal) projectModal.classList.remove('open'); }

  document.querySelectorAll('[data-project]').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      openProjectModal(card);
    });
  });
  var modalCloseBtn = document.getElementById('modalClose');
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (projectModal) projectModal.addEventListener('click', function (e) { if (e.target === projectModal) closeProjectModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeProjectModal(); });
})();