/**
 * SOURCE-TO-SYLLABUS — COMPLETE JS ENGINE
 * Copy this file verbatim into the course output directory.
 * Never regenerate it. It handles all interactivity generically.
 *
 * Engines included:
 *  - Navigation & progress bar
 *  - Scroll-triggered reveal animations
 *  - Keyboard navigation
 *  - Glossary tooltips
 *  - Quiz (multiple-choice & scenario)
 *  - Drag-and-drop matching
 *  - Group chat animation
 *  - Data flow / message flow animation
 *  - Architecture diagram
 *  - "Spot the bug" challenge
 *  - Layer toggle
 */
(function () {
  'use strict';

  /* ── HELPERS ──────────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  /* ── NAVIGATION & PROGRESS BAR ────────────────────────────── */
  const progressBar = $('#progress-bar');
  const navDots     = $$('.nav-dot');
  const modules     = $$('.module');

  function updateProgress() {
    if (!progressBar) return;
    const scrollTop    = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(pct));
    updateNavDots();
  }

  function updateNavDots() {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    modules.forEach((mod, i) => {
      const dot = navDots[i];
      if (!dot) return;
      const top    = mod.offsetTop;
      const bottom = top + mod.offsetHeight;
      if (scrollMid >= top && scrollMid < bottom) {
        dot.classList.add('active');
        dot.classList.remove('visited');
      } else if (window.scrollY + window.innerHeight > top) {
        dot.classList.remove('active');
        dot.classList.add('visited');
      } else {
        dot.classList.remove('active', 'visited');
      }
    });
  }

  window.addEventListener('scroll', () => requestAnimationFrame(updateProgress), { passive: true });
  updateProgress();

  // Nav dot click → scroll to module
  navDots.forEach(dot => {
    dot.addEventListener('click', () => {
      const target = $('#' + dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ── KEYBOARD NAVIGATION ───────────────────────────────────── */
  function currentModuleIndex() {
    const scrollMid = window.scrollY + window.innerHeight / 2;
    for (let i = 0; i < modules.length; i++) {
      const top    = modules[i].offsetTop;
      const bottom = top + modules[i].offsetHeight;
      if (scrollMid >= top && scrollMid < bottom) return i;
    }
    return 0;
  }

  document.addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      const next = modules[currentModuleIndex() + 1];
      if (next) { next.scrollIntoView({ behavior: 'smooth' }); e.preventDefault(); }
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      const prev = modules[currentModuleIndex() - 1];
      if (prev) { prev.scrollIntoView({ behavior: 'smooth' }); e.preventDefault(); }
    }
  });

  /* ── SCROLL-TRIGGERED REVEAL ───────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  $$('.animate-in').forEach(el => revealObserver.observe(el));

  // Stagger children
  $$('.stagger-children').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.setProperty('--stagger-index', i);
    });
  });

  /* ── GLOSSARY TOOLTIPS ─────────────────────────────────────── */
  let activeTooltip = null;

  function positionTooltip(term, tip) {
    const rect     = term.getBoundingClientRect();
    const tipWidth = Math.min(320, Math.max(200, window.innerWidth * 0.8));
    let left = rect.left + rect.width / 2 - tipWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipWidth - 8));
    tip.style.left  = left + 'px';
    tip.style.width = tipWidth + 'px';
    document.body.appendChild(tip);
    const tipHeight = tip.offsetHeight;
    if (rect.top - tipHeight - 12 < 0) {
      tip.style.top = (rect.bottom + 8) + 'px';
      tip.classList.add('flip');
    } else {
      tip.style.top = (rect.top - tipHeight - 8) + 'px';
      tip.classList.remove('flip');
    }
  }

  function showTooltip(term, tip) {
    if (activeTooltip && activeTooltip !== tip) {
      activeTooltip.classList.remove('visible');
      activeTooltip.remove();
    }
    positionTooltip(term, tip);
    requestAnimationFrame(() => tip.classList.add('visible'));
    activeTooltip = tip;
  }

  function hideTooltip(tip) {
    tip.classList.remove('visible');
    setTimeout(() => { if (!tip.classList.contains('visible')) tip.remove(); }, 150);
    if (activeTooltip === tip) activeTooltip = null;
  }

  $$('.term').forEach(term => {
    const tip = document.createElement('span');
    tip.className = 'term-tooltip';
    tip.textContent = term.dataset.definition;

    term.addEventListener('mouseenter', () => showTooltip(term, tip));
    term.addEventListener('mouseleave', () => hideTooltip(tip));
    term.addEventListener('click', e => {
      e.stopPropagation();
      tip.classList.contains('visible') ? hideTooltip(tip) : showTooltip(term, tip);
    });
  });

  document.addEventListener('click', () => {
    if (activeTooltip) { activeTooltip.classList.remove('visible'); activeTooltip.remove(); activeTooltip = null; }
  });

  /* ── QUIZ ENGINE ───────────────────────────────────────────── */
  window.selectOption = function (btn) {
    const block = btn.closest('.quiz-question-block');
    $$('.quiz-option', block).forEach(o => o.classList.remove('selected'));
    btn.classList.add('selected');
  };

  window.checkQuiz = function (containerId) {
    const container = $('#' + containerId);
    if (!container) return;
    let right = 0, total = 0;
    $$('.quiz-question-block', container).forEach(q => {
      const selected  = $('.quiz-option.selected', q);
      const feedback  = $('.quiz-feedback', q);
      const correct   = q.dataset.correct;
      const rightExp  = q.dataset.explanationRight  || '';
      const wrongExp  = q.dataset.explanationWrong  || '';

      if (!selected) {
        feedback.textContent = 'Pick an answer first!';
        feedback.className = 'quiz-feedback show warning';
        return;
      }
      $$('.quiz-option', q).forEach(o => o.disabled = true);
      total++;

      if (selected.dataset.value === correct) {
        right++;
        selected.classList.add('correct');
        feedback.innerHTML = '<strong>Exactly!</strong> ' + rightExp;
        feedback.className = 'quiz-feedback show success';
      } else {
        selected.classList.add('incorrect');
        const correctBtn = $(`.quiz-option[data-value="${correct}"]`, q);
        if (correctBtn) correctBtn.classList.add('correct');
        feedback.innerHTML = '<strong>Not quite.</strong> ' + wrongExp;
        feedback.className = 'quiz-feedback show error';
      }
    });
    if (total && window.stsRecordQuiz) window.stsRecordQuiz(right, total);
  };

  /* Delegated quiz binding. The onclick="selectOption(this)" /
     onclick="checkQuiz('id')" attributes in the docs still work; this
     makes them optional, so a fragment that omits them isn't silently
     inert. Guarded against double-firing when both are present. */
  document.addEventListener('click', function (e) {
    const t = e.target;
    if (!t || !t.closest) return;
    const opt = t.closest('.quiz-option');
    if (opt && !opt.getAttribute('onclick')) { window.selectOption(opt); return; }
    const check = t.closest('.quiz-check-btn');
    if (check && !check.getAttribute('onclick')) {
      const c = check.closest('.quiz-container');
      if (c && c.id) window.checkQuiz(c.id);
      return;
    }
    const reset = t.closest('.quiz-reset-btn');
    if (reset && !reset.getAttribute('onclick')) {
      const c = reset.closest('.quiz-container');
      if (c && c.id) window.resetQuiz(c.id);
    }
  });

  window.resetQuiz = function (containerId) {
    const container = $('#' + containerId);
    if (!container) return;
    $$('.quiz-option', container).forEach(o => {
      o.classList.remove('selected', 'correct', 'incorrect');
      o.disabled = false;
    });
    $$('.quiz-feedback', container).forEach(f => { f.className = 'quiz-feedback'; f.textContent = ''; });
  };

  /* ── DRAG-AND-DROP ENGINE ──────────────────────────────────── */
  function initDnD(containerEl) {
    if (!containerEl) return;
    const chips = $$('.dnd-chip', containerEl);
    const zones = $$('.dnd-zone', containerEl);

    // Mouse (HTML5 Drag API)
    chips.forEach(chip => {
      chip.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', chip.dataset.answer);
        chip.classList.add('dragging');
      });
      chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
    });

    zones.forEach(zone => {
      const target = $('.dnd-zone-target', zone);
      if (!target) return;
      target.addEventListener('dragover',  e => { e.preventDefault(); target.classList.add('drag-over'); });
      target.addEventListener('dragleave', ()  => target.classList.remove('drag-over'));
      target.addEventListener('drop', e => {
        e.preventDefault();
        target.classList.remove('drag-over');
        const answer = e.dataTransfer.getData('text/plain');
        const chip   = $(`.dnd-chip[data-answer="${answer}"]`, containerEl);
        if (!chip) return;
        target.textContent    = chip.textContent;
        target.dataset.placed = answer;
        chip.classList.add('placed');
      });
    });

    // Touch
    chips.forEach(chip => {
      chip.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.touches[0];
        const ghost = chip.cloneNode(true);
        ghost.classList.add('touch-ghost');
        ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;left:${touch.clientX - 40}px;top:${touch.clientY - 20}px;`;
        document.body.appendChild(ghost);
        chip._ghost  = ghost;
        chip._answer = chip.dataset.answer;
      }, { passive: false });

      chip.addEventListener('touchmove', e => {
        e.preventDefault();
        const touch = e.touches[0];
        if (chip._ghost) {
          chip._ghost.style.left = (touch.clientX - 40) + 'px';
          chip._ghost.style.top  = (touch.clientY - 20) + 'px';
        }
        zones.forEach(z => { const t = $('.dnd-zone-target', z); if (t) t.classList.remove('drag-over'); });
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        const zt = el && el.closest('.dnd-zone-target');
        if (zt) zt.classList.add('drag-over');
      }, { passive: false });

      chip.addEventListener('touchend', e => {
        if (chip._ghost) { chip._ghost.remove(); chip._ghost = null; }
        const touch = e.changedTouches[0];
        const el    = document.elementFromPoint(touch.clientX, touch.clientY);
        const zt    = el && el.closest('.dnd-zone-target');
        if (zt) {
          zt.textContent    = chip.textContent;
          zt.dataset.placed = chip._answer;
          chip.classList.add('placed');
        }
        zones.forEach(z => { const t = $('.dnd-zone-target', z); if (t) t.classList.remove('drag-over'); });
      });
    });
  }

  window.checkDnD = function (containerId) {
    const container = $('#' + containerId);
    if (!container) return;
    $$('.dnd-zone', container).forEach(zone => {
      const target  = $('.dnd-zone-target', zone);
      if (!target || !target.dataset.placed) return;
      if (target.dataset.placed === zone.dataset.correct) {
        target.classList.add('correct-placed');
      } else {
        target.classList.add('incorrect-placed');
      }
    });
  };

  window.resetDnD = function (containerId) {
    const container = $('#' + containerId);
    if (!container) return;
    $$('.dnd-zone-target', container).forEach(t => {
      t.textContent = 'Drop here';
      delete t.dataset.placed;
      t.classList.remove('correct-placed', 'incorrect-placed');
    });
    $$('.dnd-chip', container).forEach(c => c.classList.remove('placed', 'dragging'));
  };

  // Auto-init all dnd containers
  $$('.dnd-container').forEach(el => initDnD(el));

  /* ── GROUP CHAT ENGINE ─────────────────────────────────────── */
  function initChat(containerEl) {
    if (!containerEl) return;
    const messages    = $$('.chat-message', containerEl);
    const typingEl    = $('.chat-typing', containerEl);
    const typingAvEl  = $('#' + containerEl.id + '-typing-avatar') || $('.chat-avatar', typingEl);
    const progressEl  = $('.chat-progress', containerEl);
    let index = 0;

    // Build actor map from messages
    const actors = {};
    messages.forEach(msg => {
      const sender = msg.dataset.sender;
      const avatar = $('.chat-avatar', msg);
      if (avatar && !actors[sender]) {
        actors[sender] = { initial: avatar.textContent.trim(), style: avatar.style.background };
      }
    });

    function updateProgress() {
      if (progressEl) progressEl.textContent = index + ' / ' + messages.length + ' messages';
    }

    function showNext() {
      if (index >= messages.length) return;
      const msg    = messages[index];
      const sender = msg.dataset.sender;

      if (typingEl && actors[sender]) {
        if (typingAvEl) {
          typingAvEl.textContent       = actors[sender].initial;
          typingAvEl.style.background  = actors[sender].style;
        }
        typingEl.style.display = 'flex';
      }

      setTimeout(() => {
        if (typingEl) typingEl.style.display = 'none';
        msg.style.display = 'flex';
        msg.style.animation = 'fadeSlideUp 0.3s var(--ease-out)';
        index++;
        updateProgress();
      }, 800);
    }

    function showAll() {
      const iv = setInterval(() => {
        if (index >= messages.length) { clearInterval(iv); return; }
        showNext();
      }, 1200);
    }

    function reset() {
      index = 0;
      messages.forEach(m => { m.style.display = 'none'; m.style.animation = ''; });
      if (typingEl) typingEl.style.display = 'none';
      updateProgress();
    }

    // Bind controls
    const nextBtn  = $('.chat-next-btn',  containerEl);
    const allBtn   = $('.chat-all-btn',   containerEl);
    const resetBtn = $('.chat-reset-btn', containerEl);
    if (nextBtn)  nextBtn.addEventListener('click',  showNext);
    if (allBtn)   allBtn.addEventListener('click',   showAll);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    updateProgress();
  }

  $$('.chat-window').forEach(el => initChat(el));

  /* ── FLOW ANIMATION ENGINE ─────────────────────────────────── */
  function initFlow(containerEl) {
    if (!containerEl) return;
    const stepsData  = JSON.parse(containerEl.dataset.steps || '[]');
    const labelEl    = $('.flow-step-label', containerEl);
    const progressEl = $('.flow-progress',   containerEl);
    const packet     = $('.flow-packet',     containerEl);
    let step = 0;

    function updateProgress() {
      if (progressEl) progressEl.textContent = 'Step ' + step + ' / ' + stepsData.length;
    }

    function animatePacket(fromId, toId) {
      if (!packet) return;
      const fromEl = $('#' + fromId);
      const toEl   = $('#' + toId);
      if (!fromEl || !toEl) return;
      const fromR = fromEl.getBoundingClientRect();
      const toR   = toEl.getBoundingClientRect();
      const contR = containerEl.getBoundingClientRect();
      const fx = fromR.left + fromR.width / 2  - contR.left;
      const fy = fromR.top  + fromR.height / 2 - contR.top;
      const tx = toR.left   + toR.width / 2    - contR.left;
      const ty = toR.top    + toR.height / 2   - contR.top;
      packet.style.setProperty('--packet-from-x', fx + 'px');
      packet.style.setProperty('--packet-from-y', fy + 'px');
      packet.style.setProperty('--packet-to-x',   tx + 'px');
      packet.style.setProperty('--packet-to-y',   ty + 'px');
      packet.style.display    = 'block';
      packet.style.animation  = 'none';
      packet.offsetHeight; // reflow
      packet.style.animation  = 'packetMove 0.8s var(--ease-in-out) forwards';
      setTimeout(() => { packet.style.display = 'none'; }, 850);
    }

    function next() {
      if (step >= stepsData.length) return;
      const s = stepsData[step];
      $$('.flow-actor', containerEl).forEach(a => a.classList.remove('active'));
      if (s.highlight) {
        const hEl = $('#' + s.highlight, containerEl) || $('#flow-' + s.highlight);
        if (hEl) hEl.classList.add('active');
      }
      if (s.packet && s.from && s.to) animatePacket('flow-' + s.from, 'flow-' + s.to);
      if (labelEl) labelEl.textContent = s.label || '';
      step++;
      updateProgress();
    }

    function reset() {
      step = 0;
      $$('.flow-actor', containerEl).forEach(a => a.classList.remove('active'));
      if (labelEl) labelEl.textContent = 'Click "Next Step" to begin';
      if (packet)  packet.style.display = 'none';
      updateProgress();
    }

    const nextBtn  = $('.flow-next-btn',  containerEl);
    const resetBtn = $('.flow-reset-btn', containerEl);
    if (nextBtn)  nextBtn.addEventListener('click',  next);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    updateProgress();
  }

  $$('.flow-animation').forEach(el => initFlow(el));

  /* ── ARCHITECTURE DIAGRAM ──────────────────────────────────── */
  $$('.arch-component').forEach(comp => {
    comp.addEventListener('click', function () {
      const diagram = this.closest('.arch-diagram');
      $$('.arch-component', diagram).forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const descEl = $('.arch-description', diagram);
      if (descEl) descEl.textContent = this.dataset.desc || '';
    });
  });

  /* ── BUG CHALLENGE ─────────────────────────────────────────── */
  window.checkBugLine = function (el, isCorrect) {
    const challenge = el.closest('.bug-challenge');
    if (!challenge) return;
    // Tolerate a missing .bug-feedback rather than throwing — an author
    // omitting it should degrade, not break the whole page's scripting.
    let feedback = $('.bug-feedback', challenge);
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'bug-feedback';
      challenge.appendChild(feedback);
    }
    if (isCorrect) {
      el.classList.add('correct');
      feedback.innerHTML  = '<strong>Found it!</strong> ' + (el.dataset.explanation || '');
      feedback.className  = 'bug-feedback show success';
      $$('.bug-line', challenge).forEach(l => l.style.pointerEvents = 'none');
    } else {
      el.classList.add('incorrect');
      feedback.innerHTML  = (el.dataset.hint || 'Not this line — keep looking...');
      feedback.className  = 'bug-feedback show error';
      setTimeout(() => {
        el.classList.remove('incorrect');
        feedback.className = 'bug-feedback';
      }, 1800);
    }
  };

  /* ── LAYER TOGGLE ──────────────────────────────────────────── */
  window.showLayer = function (layerId, btn) {
    const demo = btn ? btn.closest('.layer-demo') : null;
    if (!demo) return;
    $$('.layer', demo).forEach(l => l.style.display = 'none');
    $$('.layer-tab', demo).forEach(t => t.classList.remove('active'));
    const layer = $('#' + layerId);
    if (layer) layer.style.display = 'block';
    btn.classList.add('active');
  };

  /* ── DUAL-TRACK TOGGLE (Simply / Technically) ──────────────
     Each .dual-track has two .dt-tab buttons (data-track="simply"
     | "technically") and matching .dt-pane[data-track]. Clicking a
     tab shows its pane. A page-level .track-switch (in the nav) sets
     the preferred track for ALL blocks at once. Auto-initializes. */
  function setTrack(root, track) {
    $$('.dt-tab', root).forEach(t => t.classList.toggle('active', t.dataset.track === track));
    $$('.dt-pane', root).forEach(p => p.classList.toggle('active', p.dataset.track === track));
  }
  $$('.dual-track').forEach(dt => {
    // default: whichever tab is marked active, else first
    const initial = ($('.dt-tab.active', dt) || $('.dt-tab', dt));
    if (initial) setTrack(dt, initial.dataset.track);
    $$('.dt-tab', dt).forEach(tab => {
      tab.addEventListener('click', () => setTrack(dt, tab.dataset.track));
    });
  });

  // Global switch: flips every dual-track block on the page at once.
  window.setGlobalTrack = function (track, btn) {
    $$('.dual-track').forEach(dt => {
      if ($(`.dt-tab[data-track="${track}"]`, dt)) setTrack(dt, track);
    });
    if (btn) $$('.track-switch-btn').forEach(b => b.classList.toggle('active', b === btn));
  };

  /* ── MULTI-PAGE NAV ENGINE (v3) ────────────────────────────
     Each page is a standalone file sharing this script and a
     common sidebar. This engine: (1) highlights the sidebar link
     for the current file, (2) drives a slim top reading-progress
     bar, (3) maps ArrowLeft/ArrowRight to the .pager prev/next
     links, (4) toggles the sidebar on mobile. All single-page
     engines above still run; they simply no-op when their markup
     is absent on a given page. */
  (function initMultiPage() {
    const here = (location.pathname.split('/').pop() || 'index.html');

    // 1) Sidebar active state
    $$('.sidebar a[href]').forEach(a => {
      const target = a.getAttribute('href').split('/').pop().split('#')[0];
      if (target === here) a.classList.add('active');
    });

    // 2) Reading progress (per page)
    const rp = $('.reading-progress');
    if (rp) {
      const onScroll = () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        rp.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
      };
      window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
      onScroll();
    }

    // 3) Keyboard prev/next via the pager
    document.addEventListener('keydown', e => {
      if (e.target.matches('input, textarea, select')) return;
      if (e.key === 'ArrowLeft') { const p = $('.pager a.prev'); if (p) location.href = p.getAttribute('href'); }
      if (e.key === 'ArrowRight') { const n = $('.pager a.next'); if (n) location.href = n.getAttribute('href'); }
    });

    // 4) Mobile sidebar toggle
    const toggle = $('.sidebar-toggle'), sidebar = $('.sidebar');
    if (toggle && sidebar) {
      toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
      $$('.sidebar a').forEach(a => a.addEventListener('click', () => sidebar.classList.remove('open')));
    }
  })();

  /* ── LIGHT / DARK MODE TOGGLE ─────────────────────────────
     The .theme-toggle button flips .theme-dark on <html> and stores
     the choice in localStorage. A tiny inline script in _head.html
     applies the stored choice before paint (no flash). This runs
     on every page, so the toggle stays in sync site-wide. */
  (function initThemeToggle() {
    const KEY = 'sts-theme';
    const root = document.documentElement;
    const btn = $('.theme-toggle');
    function paint(dark) {
      root.classList.toggle('theme-dark', dark);
      if (btn) {
        const ic = $('.theme-toggle-icon', btn), lb = $('.theme-toggle-label', btn);
        if (ic) ic.textContent = dark ? '\u2600\uFE0F' : '\u{1F319}';
        if (lb) lb.textContent = dark ? 'Light mode' : 'Dark mode';
        btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      }
    }
    paint(root.classList.contains('theme-dark'));
    if (btn) btn.addEventListener('click', () => {
      const dark = !root.classList.contains('theme-dark');
      try { localStorage.setItem(KEY, dark ? 'dark' : 'light'); } catch (e) {}
      paint(dark);
    });
  })();

  /* ═══════════════════════════════════════════════════════════
     v4 ENGINES — tokenizer · annotated walkthrough · search ·
     progress tracking
     ═══════════════════════════════════════════════════════════ */

  /* ── SYNTAX TOKENIZER ─────────────────────────────────────
     Replaces hand-authored <span class="code-keyword"> tagging.
     Author raw code; this classifies it at runtime. Emits the same
     .code-* class names the stylesheet already knows, so hand-tagged
     legacy blocks and tokenized blocks look identical.

     Usage: any element with [data-lang] whose text is raw code.
     Blocks that already contain .code-keyword spans are left alone. */
  const LANGS = {
    js: { line: ['//'], block: [['/*', '*/']], str: ['"', "'", '`'],
      kw: 'const let var function return if else for while do switch case break continue new class extends super this async await import export from default try catch finally throw typeof instanceof delete in of null undefined true false yield static get set void' },
    ts: { inherit: 'js', kw: 'interface type enum implements public private protected readonly abstract namespace declare as satisfies keyof infer unknown never any string number boolean' },
    jsx: { inherit: 'js' }, tsx: { inherit: 'ts' },
    python: { line: ['#'], block: [['"""', '"""'], ["'''", "'''"]], str: ['"', "'"],
      kw: 'def class return if elif else for while break continue pass import from as with try except finally raise lambda yield global nonlocal assert del in is not and or None True False async await self match case' },
    go: { line: ['//'], block: [['/*', '*/']], str: ['"', '`'],
      kw: 'func package import type struct interface map chan var const return if else for range switch case default break continue go defer select nil true false make new len cap append panic recover error string int int64 float64 bool byte rune' },
    rust: { line: ['//'], block: [['/*', '*/']], str: ['"'],
      kw: 'fn let mut const static struct enum impl trait for while loop if else match return pub use mod crate self super where as ref move box dyn async await unsafe type Some None Ok Err true false usize u8 u32 u64 i32 i64 f64 bool str String Vec Option Result' },
    java: { line: ['//'], block: [['/*', '*/']], str: ['"', "'"],
      kw: 'public private protected class interface extends implements static final void return if else for while do switch case break continue new this super try catch finally throw throws import package abstract synchronized volatile transient native enum instanceof null true false int long double float boolean char byte short String var record sealed' },
    c: { line: ['//'], block: [['/*', '*/']], str: ['"', "'"],
      kw: 'int char float double void long short unsigned signed struct union enum typedef static const extern return if else for while do switch case break continue goto sizeof NULL include define ifdef ifndef endif pragma' },
    cpp: { inherit: 'c', kw: 'class public private protected virtual override final template typename namespace using new delete this nullptr true false auto constexpr noexcept try catch throw operator friend inline explicit mutable std' },
    ruby: { line: ['#'], block: [['=begin', '=end']], str: ['"', "'"],
      kw: 'def class module end return if elsif else unless while until for in do begin rescue ensure raise yield require require_relative attr_accessor attr_reader attr_writer self nil true false and or not then case when lambda proc new' },
    php: { line: ['//', '#'], block: [['/*', '*/']], str: ['"', "'"],
      kw: 'function class interface trait extends implements public private protected static final abstract return if else elseif foreach for while do switch case break continue new this parent self try catch finally throw namespace use echo print isset unset null true false array' },
    sql: { line: ['--'], block: [['/*', '*/']], str: ["'", '"'], nocase: true,
      kw: 'select from where join inner left right outer full on group by order having limit offset insert into values update set delete create table alter drop index view as and or not null is distinct union all case when then else end with returning primary key foreign references default constraint unique cascade begin commit rollback' },
    sh: { line: ['#'], block: [], str: ['"', "'"],
      kw: 'if then else elif fi for while do done case esac function return exit echo export local source set unset shift trap read cd mkdir rm cp mv cat grep sed awk curl git npm python3 bash sudo' },
    bash: { inherit: 'sh' }, shell: { inherit: 'sh' }, zsh: { inherit: 'sh' },
    yaml: { line: ['#'], block: [], str: ['"', "'"], kw: 'true false null yes no on off' },
    json: { line: [], block: [], str: ['"'], kw: 'true false null' },
    css: { line: [], block: [['/*', '*/']], str: ['"', "'"],
      kw: 'import media supports keyframes font-face root var calc important hover focus active before after not nth-child' },
    html: { line: [], block: [['<!--', '-->']], str: ['"', "'"], kw: '' },
    swift: { line: ['//'], block: [['/*', '*/']], str: ['"'],
      kw: 'func var let class struct enum protocol extension import return if else guard for while switch case default break continue in is as try catch throw throws async await self init deinit static private public internal open final lazy weak unowned nil true false Int String Double Bool Optional' },
    kotlin: { line: ['//'], block: [['/*', '*/']], str: ['"'],
      kw: 'fun val var class object interface data sealed enum companion return if else when for while do break continue in is as try catch finally throw import package private public internal protected override open abstract suspend null true false It' },
    plain: { line: [], block: [], str: [], kw: '' }
  };

  function langSpec(name) {
    let spec = LANGS[(name || 'plain').toLowerCase()] || LANGS.plain;
    if (spec.inherit) {
      const base = langSpec(spec.inherit);
      spec = Object.assign({}, base, spec, {
        kw: (base.kw || '') + ' ' + (spec.kw || '')
      });
    }
    if (!spec._set) {
      spec._set = new Set((spec.kw || '').split(/\s+/).filter(Boolean)
        .map(k => spec.nocase ? k.toLowerCase() : k));
    }
    return spec;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* Tokenize raw source into an array of {cls, text} tokens.
     Tokens may span newlines (block comments, template strings);
     splitPerLine() below re-wraps them so each line is standalone. */
  function tokenize(src, langName) {
    const L = langSpec(langName);
    const out = [];
    let i = 0, buf = '';
    const flush = () => { if (buf) { out.push({ cls: null, text: buf }); buf = ''; } };
    const starts = (s) => src.startsWith(s, i);

    while (i < src.length) {
      // Block comments (incl. python docstrings)
      let matched = false;
      for (const [open, close] of (L.block || [])) {
        if (starts(open)) {
          const end = src.indexOf(close, i + open.length);
          const stop = end === -1 ? src.length : end + close.length;
          flush(); out.push({ cls: 'code-comment', text: src.slice(i, stop) });
          i = stop; matched = true; break;
        }
      }
      if (matched) continue;

      // Line comments
      for (const open of (L.line || [])) {
        if (starts(open)) {
          let end = src.indexOf('\n', i); if (end === -1) end = src.length;
          flush(); out.push({ cls: 'code-comment', text: src.slice(i, end) });
          i = end; matched = true; break;
        }
      }
      if (matched) continue;

      // Strings (with backslash escapes)
      const q = (L.str || []).find(q => starts(q));
      if (q) {
        let j = i + q.length;
        while (j < src.length) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src.startsWith(q, j)) { j += q.length; break; }
          j++;
        }
        flush(); out.push({ cls: 'code-string', text: src.slice(i, j) });
        i = j; continue;
      }

      // Numbers
      const num = /^0[xXbBoO][0-9a-fA-F_]+|^\d[\d_]*(\.\d+)?([eE][+-]?\d+)?/.exec(src.slice(i));
      if (num && !/[A-Za-z0-9_$]/.test(src[i - 1] || '')) {
        flush(); out.push({ cls: 'code-number', text: num[0] });
        i += num[0].length; continue;
      }

      // Identifiers
      const id = /^[A-Za-z_$@#][A-Za-z0-9_$]*/.exec(src.slice(i));
      if (id) {
        const word = id[0];
        const key = L.nocase ? word.toLowerCase() : word;
        const after = src.slice(i + word.length);
        const prev = src[i - 1];
        let cls = null;
        if (L._set.has(key)) cls = 'code-keyword';
        else if (/^\s*\(/.test(after)) cls = 'code-function';
        else if (prev === '.') cls = 'code-property';
        else if (/^[A-Z]/.test(word)) cls = 'code-class';
        if (cls) { flush(); out.push({ cls: cls, text: word }); }
        else buf += word;
        i += word.length; continue;
      }

      buf += src[i]; i++;
    }
    flush();
    return out;
  }

  /* Convert tokens into an array of per-line HTML strings. */
  function tokensToLines(tokens) {
    const lines = [''];
    tokens.forEach(t => {
      const parts = t.text.split('\n');
      parts.forEach((part, k) => {
        if (k > 0) lines.push('');
        if (!part) return;
        lines[lines.length - 1] += t.cls
          ? '<span class="' + t.cls + '">' + esc(part) + '</span>'
          : esc(part);
      });
    });
    return lines;
  }

  function highlightToLines(src, lang) { return tokensToLines(tokenize(src, lang)); }
  window.stsHighlight = function (src, lang) { return highlightToLines(src, lang).join('\n'); };

  /* Auto-highlight standalone code blocks that opted in via data-lang.
     Skipped if the block already carries manual .code-* spans. */
  (function initAutoHighlight() {
    $$('pre[data-lang], code[data-lang]').forEach(el => {
      if (el.closest('.walkthrough')) return;
      if ($('.code-keyword, .code-string, .code-comment', el)) return;
      const raw = el.textContent.replace(/^\n/, '').replace(/\s+$/, '');
      el.innerHTML = highlightToLines(raw, el.getAttribute('data-lang')).join('\n');
    });
  })();

  /* ── ANNOTATED SOURCE WALKTHROUGH ─────────────────────────
     Line-by-line teaching element. Markup:

     <div class="walkthrough" data-lang="python" data-src="app/cache.py"
          data-start="40" data-sha="a1b2c3d" data-repo="https://github.com/u/r"
          data-fold="45-51:imports and setup">
       <pre class="wt-source">RAW SOURCE, VERBATIM</pre>
       <div class="wt-notes">
         <div class="wt-note" data-lines="40-41">...</div>
       </div>
     </div>

     The engine numbers each line from data-start, tokenizes it,
     vertically aligns each note with its anchor line, wires
     hover/click pairing, and builds fold regions. The raw text in
     .wt-source is what verify_snippets.py byte-compares against the
     real file — so it must never be edited for presentation. */
  function initWalkthrough(root) {
    const pre = $('.wt-source', root);
    if (!pre || root.dataset.wtReady) return;
    root.dataset.wtReady = '1';

    const start = parseInt(root.getAttribute('data-start') || '1', 10);
    const lang  = root.getAttribute('data-lang') || 'plain';
    const raw   = pre.textContent.replace(/^\n/, '').replace(/\s+$/, '');
    const html  = highlightToLines(raw, lang);

    // Fold spec: "45-51:label; 60-64:label"
    const folds = (root.getAttribute('data-fold') || '').split(';')
      .map(s => s.trim()).filter(Boolean).map(s => {
        const [range, ...rest] = s.split(':');
        const [a, b] = range.split('-').map(n => parseInt(n, 10));
        return { from: a, to: b === undefined ? a : b, label: (rest.join(':') || 'collapsed').trim() };
      });

    const code = document.createElement('div');
    code.className = 'wt-code';

    let n = start, idx = 0, openFold = null;
    while (idx < html.length) {
      const fold = folds.find(f => f.from === n);
      if (fold && !openFold) {
        // `el` is captured per-fold; `openFold` is reassigned to null when
        // the region ends, so the click handler must not close over it.
        const el = document.createElement('div');
        el.className = 'wt-fold';
        const btn = document.createElement('button');
        btn.className = 'wt-fold-btn';
        btn.type = 'button';
        btn.innerHTML = '<span class="wt-fold-caret">▸</span> ' + esc(fold.label) +
          ' <span class="wt-fold-count">' + (fold.to - fold.from + 1) + ' lines</span>';
        btn.addEventListener('click', () => openFoldToggle(el));
        const wrap = document.createElement('div');
        wrap.className = 'wt-fold-lines';
        el.appendChild(btn);
        el.appendChild(wrap);
        code.appendChild(el);
        el._lines = wrap;
        el._to = fold.to;
        openFold = el;
      }

      const line = document.createElement('div');
      line.className = 'wt-line';
      line.setAttribute('data-n', String(n));
      line.innerHTML = '<span class="wt-num">' + n + '</span>' +
        '<span class="wt-text">' + (html[idx] || '&nbsp;') + '</span>';
      (openFold ? openFold._lines : code).appendChild(line);

      if (openFold && n === openFold._to) openFold = null;
      n++; idx++;
    }

    function openFoldToggle(el) { el.classList.toggle('open'); requestAnimationFrame(align); }

    pre.style.display = 'none';
    const body = document.createElement('div');
    body.className = 'wt-body';
    body.appendChild(code);

    const notesCol = $('.wt-notes', root) || document.createElement('div');
    notesCol.className = 'wt-notes';
    body.appendChild(notesCol);
    root.appendChild(body);

    // Header with provenance
    if (root.getAttribute('data-src') && !$('.wt-head', root)) {
      const head = document.createElement('div');
      head.className = 'wt-head';
      const last = start + html.length - 1;
      const src  = root.getAttribute('data-src');
      const sha  = root.getAttribute('data-sha') || '';
      const repo = root.getAttribute('data-repo') || '';
      let link = '';
      if (repo) {
        const base = repo.replace(/\/$/, '') + '/blob/' + (sha || 'HEAD') + '/' + src;
        link = '<a class="wt-open" href="' + base + '#L' + start + '-L' + last +
               '" target="_blank" rel="noopener">view source ↗</a>';
      }
      head.innerHTML = '<span class="wt-file">' + esc(src) + '</span>' +
        '<span class="wt-range">L' + start + '–L' + last + '</span>' +
        (sha ? '<span class="wt-sha">@' + esc(sha.slice(0, 7)) + '</span>' : '') + link;
      root.insertBefore(head, body);
    }

    // Pair notes to lines
    const notes = $$('.wt-note', notesCol);
    const pairs = notes.map(note => {
      const spec = note.getAttribute('data-lines') || '';
      const [a, b] = spec.split('-').map(x => parseInt(x, 10));
      const from = isNaN(a) ? start : a;
      const to   = isNaN(b) ? from : b;
      const lines = [];
      for (let k = from; k <= to; k++) {
        const el = $('.wt-line[data-n="' + k + '"]', code);
        if (el) lines.push(el);
      }
      note.setAttribute('data-from', String(from));
      if (!$('.wt-note-ref', note)) {
        const ref = document.createElement('span');
        ref.className = 'wt-note-ref';
        ref.textContent = from === to ? 'L' + from : 'L' + from + '–' + to;
        note.insertBefore(ref, note.firstChild);
      }
      return { note, lines, from };
    });

    function setActive(p, on) {
      p.note.classList.toggle('active', on);
      p.lines.forEach(l => l.classList.toggle('active', on));
    }
    pairs.forEach(p => {
      const enter = () => { if (!root.dataset.pinned) setActive(p, true); };
      const leave = () => { if (!root.dataset.pinned) setActive(p, false); };
      const pin = () => {
        const already = root.dataset.pinned === String(p.from);
        pairs.forEach(q => setActive(q, false));
        if (already) { delete root.dataset.pinned; }
        else { root.dataset.pinned = String(p.from); setActive(p, true); }
      };
      p.note.addEventListener('mouseenter', enter);
      p.note.addEventListener('mouseleave', leave);
      p.note.addEventListener('click', pin);
      p.lines.forEach(l => {
        l.addEventListener('mouseenter', enter);
        l.addEventListener('mouseleave', leave);
        l.addEventListener('click', pin);
      });
    });

    // Vertical alignment: each note's top matches its first anchor line.
    function align() {
      if (window.innerWidth <= 900) {
        pairs.forEach(p => { p.note.style.marginTop = ''; });
        return;
      }
      const base = code.getBoundingClientRect().top;
      let cursor = 0;
      pairs.forEach(p => {
        const anchor = p.lines.find(l => l.offsetParent !== null);
        if (!anchor) { p.note.style.display = 'none'; return; }
        p.note.style.display = '';
        p.note.style.marginTop = '0px';
        const want = anchor.getBoundingClientRect().top - base;
        const have = p.note.getBoundingClientRect().top - notesCol.getBoundingClientRect().top;
        const delta = Math.max(0, want - Math.max(have, cursor));
        p.note.style.marginTop = delta + 'px';
        cursor = (p.note.getBoundingClientRect().top - notesCol.getBoundingClientRect().top)
                 + p.note.offsetHeight + 8;
      });
    }
    root._wtAlign = align;
    requestAnimationFrame(() => requestAnimationFrame(align));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => requestAnimationFrame(align));
  }

  $$('.walkthrough').forEach(initWalkthrough);
  let alignTimer;
  window.addEventListener('resize', () => {
    clearTimeout(alignTimer);
    alignTimer = setTimeout(() => $$('.walkthrough').forEach(w => w._wtAlign && w._wtAlign()), 120);
  });

  /* Density control: "notes only for flagged lines" vs "every line".
     A .wt-density toggle (if present) hides low-priority notes. */
  window.setWalkthroughDensity = function (level, btn) {
    document.body.setAttribute('data-wt-density', level);
    if (btn) $$('.wt-density button', btn.parentElement).forEach(b => b.classList.toggle('active', b === btn));
    $$('.walkthrough').forEach(w => w._wtAlign && requestAnimationFrame(w._wtAlign));
  };

  /* ── COURSE SEARCH ────────────────────────────────────────
     build.sh emits search-index.json next to the pages. The sidebar
     input filters it client-side. Fails silently (and hides itself)
     if the index is absent — e.g. when opened via file:// where
     fetch of a local JSON is blocked. */
  (function initSearch() {
    const box = $('.sidebar-search');
    if (!box) return;
    const input = $('input', box);
    const results = $('.search-results', box);
    let index = null;

    fetch('search-index.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { index = d; })
      .catch(() => { box.classList.add('search-unavailable'); });

    function render(q) {
      if (!index || q.length < 2) { results.innerHTML = ''; results.classList.remove('open'); return; }
      const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
      const hits = index.map(entry => {
        const hay = (entry.t + ' ' + entry.h.join(' ') + ' ' + entry.b).toLowerCase();
        let score = 0;
        terms.forEach(t => {
          if (entry.t.toLowerCase().includes(t)) score += 8;
          if (entry.h.some(h => h.toLowerCase().includes(t))) score += 4;
          const m = hay.split(t).length - 1;
          score += Math.min(m, 6);
        });
        return { entry, score };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 8);

      if (!hits.length) { results.innerHTML = '<div class="search-empty">No matches</div>'; results.classList.add('open'); return; }
      results.innerHTML = hits.map(({ entry }) => {
        const i = entry.b.toLowerCase().indexOf(terms[0]);
        const snip = i === -1 ? entry.b.slice(0, 90) : entry.b.slice(Math.max(0, i - 35), i + 60);
        return '<a class="search-hit" href="' + entry.u + '">' +
               '<span class="search-hit-title">' + esc(entry.t) + '</span>' +
               '<span class="search-hit-snip">…' + esc(snip) + '…</span></a>';
      }).join('');
      results.classList.add('open');
    }

    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => render(input.value.trim()), 120); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { input.value = ''; render(''); input.blur(); }
      if (e.key === 'Enter') { const f = $('.search-hit', results); if (f) location.href = f.getAttribute('href'); }
    });
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !e.target.matches('input, textarea, select')) { e.preventDefault(); input.focus(); }
    });
    document.addEventListener('click', e => { if (!box.contains(e.target)) results.classList.remove('open'); });
  })();

  /* ── PROGRESS TRACKING ACROSS PAGES ───────────────────────
     Multi-page loses the sense of progression, so we persist it:
     a page counts as visited on load and as completed once the
     reader reaches the bottom. Quiz scores are stored per page.
     Sidebar links get a ✓; the index shows a summary if it has a
     .progress-summary element. */
  (function initProgress() {
    const KEY = 'sts-progress';
    const here = (location.pathname.split('/').pop() || 'index.html');
    let state = {};
    try { state = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };

    state[here] = Object.assign({ visited: true, done: false, checkpoints: {} }, state[here]);
    if (!state[here].checkpoints) state[here].checkpoints = {};
    save();

    /* Shared state API for the comprehension engines (v5). They register
       checkpoints on load and mark them met as the reader works. A page
       counts as complete when every checkpoint on it is met — scrolling
       to the bottom no longer counts as learning. */
    let required = [];
    // Nothing may be marked complete until the comprehension engines have
    // declared what this page requires. Without this seal, a page shorter
    // than the viewport completes instantly via the scroll fallback —
    // before its checkpoints even exist.
    let sealed = false;
    window.stsProgress = {
      page: here,
      all: () => state,
      get: (k, d) => (state[here][k] === undefined ? d : state[here][k]),
      set: (k, v) => { state[here][k] = v; save(); paint(); },
      require: (ids) => { required = ids.slice(); paint(); },
      seal: () => { sealed = true; markDone(); paint(); },
      meet: (id, met) => {
        state[here].checkpoints[id] = !!met;
        save(); markDone(); paint();
      },
      isMet: (id) => !!state[here].checkpoints[id],
      outstanding: () => required.filter(id => !state[here].checkpoints[id]),
      save: save
    };

    function paint() {
      $$('.sidebar a[href]').forEach(a => {
        const f = a.getAttribute('href').split('/').pop().split('#')[0];
        const s = state[f];
        a.classList.toggle('visited', !!(s && s.visited));
        a.classList.toggle('done', !!(s && s.done));
      });
      const sum = $('.progress-summary');
      if (sum) {
        const links = $$('.sidebar a.sb-link, .sidebar a.sb-top-link')
          .map(a => a.getAttribute('href').split('/').pop());
        const uniq = Array.from(new Set(links));
        const done = uniq.filter(f => state[f] && state[f].done).length;
        const scores = Object.values(state).filter(s => s && s.quiz);
        const right = scores.reduce((n, s) => n + s.quiz.right, 0);
        const total = scores.reduce((n, s) => n + s.quiz.total, 0);
        // Concepts the reader self-rated as shaky during retrieval practice.
        const shaky = [];
        Object.keys(state).forEach(p => {
          const r = state[p] && state[p].recall;
          if (r) Object.keys(r).forEach(k => { if (r[k] !== 'got') shaky.push(r[k + '|label'] || k); });
        });
        sum.innerHTML =
          '<span class="ps-stat"><strong>' + done + '</strong> / ' + uniq.length + ' pages completed</span>' +
          (total ? '<span class="ps-stat"><strong>' + right + '</strong> / ' + total + ' quiz answers correct</span>' : '') +
          (shaky.length ? '<span class="ps-stat ps-shaky"><strong>' + shaky.length + '</strong> concept(s) to revisit</span>' : '') +
          '<button class="ps-reset" type="button">Reset progress</button>';
        const rb = $('.ps-reset', sum);
        if (rb) rb.addEventListener('click', () => { state = {}; save(); location.reload(); });
      }
      const out = $('.page-checkpoints');
      if (out) {
        const left = required.filter(id => !state[here].checkpoints[id]).length;
        out.textContent = left === 0
          ? 'All checkpoints on this page are complete.'
          : left + ' checkpoint' + (left === 1 ? '' : 's') + ' left on this page.';
        out.classList.toggle('complete', left === 0);
      }
    }

    /* Completion: every registered checkpoint met. Pages with no
       checkpoints (index, analysis) fall back to reaching the bottom. */
    function markDone() {
      if (state[here].done || !sealed) return;
      let done;
      if (required.length) {
        done = required.every(id => state[here].checkpoints[id]);
      } else {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        done = h <= 0 || window.scrollY / h > 0.92;
      }
      if (done) { state[here].done = true; save(); paint(); }
    }
    window.addEventListener('scroll', markDone, { passive: true });
    setTimeout(markDone, 1200);
    // Fallback seal: if the comprehension engines never ran (a page with no
    // checkpoints at all), don't leave the page permanently incomplete.
    setTimeout(() => { if (!sealed) { sealed = true; markDone(); } }, 60);

    window.stsRecordQuiz = function (right, total) {
      state[here] = Object.assign({}, state[here], { quiz: { right: right, total: total } });
      save(); paint();
    };
    paint();
  })();

  /* ═══════════════════════════════════════════════════════════
     v5 COMPREHENSION ENGINES

     The course's goal is not "was read" but "can be explained".
     Everything below asks the reader to produce something before it
     gives anything away: predict before reveal, retrieve before
     re-read, explain before comparing.

     Soft-gate contract: a checkpoint may hide content, but never
     blocks navigation, and the sidebar "Reading mode" toggle opens
     every gate at once (body[data-gates="off"]). A reader who wants
     a reference gets one; a reader who wants to learn gets taught.
     ═══════════════════════════════════════════════════════════ */
  (function initComprehension() {
    const P = window.stsProgress;
    if (!P) return;
    const checkpoints = [];
    const reg = (id) => { if (id && checkpoints.indexOf(id) === -1) checkpoints.push(id); };
    const gatesOff = () => document.body.getAttribute('data-gates') === 'off';

    /* Declare requirements BEFORE wiring anything. The engines below call
       P.meet() during setup (restoring saved state), and a meet() that
       lands before require() would let the page complete with checkpoints
       still outstanding. */
    $$('.explain-back[data-id], .predict[data-id], .recall[data-id], .tracer[data-id], ' +
       '.bug-challenge[data-id], .mastery-checklist[data-id], .quiz-container[data-checkpoint]')
      .forEach(el => reg(el.getAttribute('data-id') || el.getAttribute('data-checkpoint')));
    $$('.mastery-checklist:not([data-id])').forEach(() => reg('mastery'));
    P.require(checkpoints);

    /* ── Reading-mode escape hatch ───────────────────────────
       One toggle opens every gate on the page and remembers the
       choice. This is the pressure valve that keeps the course
       usable as a reference. */
    (function initGateToggle() {
      const KEY = 'sts-gates';
      const btn = $('.gates-toggle');
      let off = false;
      try { off = localStorage.getItem(KEY) === 'off'; } catch (e) {}
      function paint() {
        document.body.setAttribute('data-gates', off ? 'off' : 'on');
        if (btn) {
          $('.gates-toggle-label', btn).textContent = off ? 'Guided mode' : 'Reading mode';
          btn.setAttribute('aria-pressed', off ? 'true' : 'false');
          btn.title = off
            ? 'Everything is revealed. Switch back to answer checkpoints as you go.'
            : 'Reveal every answer and skip the checkpoints.';
        }
        if (off) $$('[data-gated]').forEach(el => { el.hidden = false; });
      }
      paint();
      if (btn) btn.addEventListener('click', () => {
        off = !off;
        try { localStorage.setItem(KEY, off ? 'off' : 'on'); } catch (e) {}
        paint();
        $$('.walkthrough').forEach(w => w._wtAlign && requestAnimationFrame(w._wtAlign));
      });
    })();

    /* ── EXPLAIN-BACK ────────────────────────────────────────
       The flagship. The reader writes an explanation in their own
       words, THEN sees a model answer and a rubric they score
       themselves against. Self-explanation followed by comparison
       is the only thing in this course that trains the actual
       target skill: being able to explain the codebase.

       <div class="explain-back" data-id="m3-explain">
         <h4>Explain it back</h4>
         <p class="eb-prompt">In your own words: …</p>
         <textarea rows="6" placeholder="…"></textarea>
         <button class="eb-reveal">I've written mine — compare</button>
         <div class="eb-body" data-gated hidden>
           <div class="eb-model"><h5>One good answer</h5><p>…</p></div>
           <div class="eb-rubric">
             <h5>Did you cover these?</h5>
             <label><input type="checkbox"> Named the problem it solves</label>
             …
           </div>
         </div>
       </div>                                                    */
    $$('.explain-back').forEach(root => {
      const id = root.getAttribute('data-id');
      reg(id);
      const ta     = $('textarea', root);
      const btn    = $('.eb-reveal', root);
      const body   = $('.eb-body', root);
      const boxes  = $$('.eb-rubric input[type="checkbox"]', root);
      const store  = P.get('explain', {});

      if (ta && store[id] && store[id].text) ta.value = store[id].text;
      const persist = () => {
        const s = P.get('explain', {});
        s[id] = {
          text: ta ? ta.value : '',
          revealed: !!(s[id] && s[id].revealed),
          points: boxes.map(b => b.checked)
        };
        P.set('explain', s);
      };

      // A checkpoint is met once they've written something real AND
      // compared it. Scoring themselves badly still counts — honesty
      // about a gap is the learning, not a high score.
      const met = () => {
        const s = P.get('explain', {})[id] || {};
        return !!(s.revealed && (s.text || '').trim().split(/\s+/).length >= 15);
      };

      function score() {
        const el = $('.eb-score', root);
        if (!el) return;
        const n = boxes.filter(b => b.checked).length;
        el.innerHTML = boxes.length
          ? '<strong>' + n + ' / ' + boxes.length + '</strong> points covered' +
            (n === boxes.length ? ' — you can explain this one.'
             : n === 0 ? ' — worth re-reading this module before moving on.'
             : ' — go back for the ones you missed; they are the ones you will be asked about.')
          : '';
      }

      function reveal(force) {
        const words = ta ? ta.value.trim().split(/\s+/).filter(Boolean).length : 99;
        if (!force && !gatesOff() && words < 15) {
          btn.textContent = words === 0
            ? 'Try writing something first — then click again to compare'
            : 'That is ' + words + ' word' + (words === 1 ? '' : 's') + '. Click again to compare anyway';
          btn.classList.add('eb-nudge');
          btn.dataset.nudged = '1';
          return;
        }
        if (body) body.hidden = false;
        btn.classList.remove('eb-nudge');
        btn.textContent = 'Model answer shown';
        btn.disabled = true;
        const s = P.get('explain', {});
        s[id] = Object.assign({ text: ta ? ta.value : '', points: [] }, s[id], { revealed: true });
        P.set('explain', s);
        P.meet(id, met());
        score();
      }

      if (store[id] && store[id].revealed) {
        if (body) body.hidden = false;
        if (btn) { btn.textContent = 'Model answer shown'; btn.disabled = true; }
        (store[id].points || []).forEach((v, i) => { if (boxes[i]) boxes[i].checked = v; });
        score();
      }
      if (ta) ta.addEventListener('input', () => { persist(); P.meet(id, met()); });
      if (btn) btn.addEventListener('click', () => reveal(btn.dataset.nudged === '1'));
      boxes.forEach(b => b.addEventListener('change', () => { persist(); score(); }));
      P.meet(id, met());
    });

    /* ── PREDICT BEFORE REVEAL ───────────────────────────────
       Showing the answer first feels efficient and teaches much
       less. Committing to a guess — even a wrong one — is what
       makes the explanation stick.

       <div class="predict" data-id="m2-predict" data-answer="b">
         <span class="predict-tag">◆ Predict first</span>
         <h4>What do you think happens inside?</h4>
         <p>…signature and call site…</p>
         <div class="predict-options">
           <button class="predict-option" data-value="a">…</button>
           <button class="predict-option" data-value="b">…</button>
         </div>
         <button class="predict-commit">Lock in my answer</button>
         <div class="predict-reveal" data-gated hidden>…</div>
       </div>

       Omit data-answer for an open-ended prediction (a textarea);
       there is then no right answer, only the act of committing. */
    $$('.predict').forEach(root => {
      const id = root.getAttribute('data-id');
      reg(id);
      const answer  = root.getAttribute('data-answer');
      const opts    = $$('.predict-option', root);
      const ta      = $('textarea', root);
      const commit  = $('.predict-commit', root);
      const reveal  = $('.predict-reveal', root);
      const verdict = $('.predict-verdict', root) || (() => {
        const d = document.createElement('div');
        d.className = 'predict-verdict';
        if (commit) commit.parentNode.insertBefore(d, commit.nextSibling);
        return d;
      })();
      const store = P.get('predict', {});
      let picked = (store[id] || {}).pick || null;

      opts.forEach(o => o.addEventListener('click', () => {
        if (o.disabled) return;
        opts.forEach(x => x.classList.remove('selected'));
        o.classList.add('selected');
        picked = o.getAttribute('data-value');
      }));

      function open(state) {
        if (reveal) reveal.hidden = false;
        if (commit) { commit.disabled = true; commit.textContent = 'Answer locked in'; }
        opts.forEach(o => {
          o.disabled = true;
          if (answer && o.getAttribute('data-value') === answer) o.classList.add('correct');
          if (answer && o.classList.contains('selected') && o.getAttribute('data-value') !== answer) o.classList.add('incorrect');
        });
        if (ta) ta.readOnly = true;
        if (answer) {
          const right = state.pick === answer;
          verdict.className = 'predict-verdict show ' + (right ? 'success' : 'error');
          verdict.innerHTML = right
            ? '<strong>You called it.</strong> Now read why — the reasoning matters more than the guess.'
            : '<strong>Not what happens.</strong> That gap is the useful part: read on and notice exactly where your model was wrong.';
        } else {
          verdict.className = 'predict-verdict show neutral';
          verdict.innerHTML = '<strong>Locked in.</strong> Compare your guess to what the code actually does.';
        }
      }

      if (store[id] && store[id].done) {
        picked = store[id].pick;
        if (picked) { const o = opts.find(x => x.getAttribute('data-value') === picked); if (o) o.classList.add('selected'); }
        if (ta && store[id].text) ta.value = store[id].text;
        open(store[id]);
        P.meet(id, true);
      }

      if (commit) commit.addEventListener('click', () => {
        const text = ta ? ta.value.trim() : '';
        if (!picked && !text && !gatesOff()) {
          commit.classList.add('eb-nudge');
          commit.textContent = opts.length ? 'Pick one first — a wrong guess still works' : 'Write a guess first — a wrong one still works';
          return;
        }
        const s = P.get('predict', {});
        s[id] = { done: true, pick: picked, text: text };
        P.set('predict', s);
        open(s[id]);
        P.meet(id, true);
      });
    });

    /* ── RETRIEVAL PRACTICE ──────────────────────────────────
       Re-reading feels like learning; retrieving actually is. Each
       module opens with questions about EARLIER modules. Grading is
       self-rated — honest, given the course has no model attached —
       and anything below "got it" surfaces on the index as a
       concept to revisit.

       <div class="recall" data-id="m4-recall">
         <span class="recall-tag">↺ From earlier</span>
         <div class="recall-q" data-concept="Ring buffer vs list"
              data-source="02-deep-dive.html#tradeoffs">
           <p>Why a ring buffer and not a list?</p>
           <button class="recall-show">Show the answer</button>
           <div class="recall-a" data-gated hidden>…</div>
         </div>
       </div>                                                   */
    $$('.recall').forEach(root => {
      const id = root.getAttribute('data-id');
      reg(id);
      const qs = $$('.recall-q', root);
      const rated = P.get('recall', {});

      qs.forEach((q, i) => {
        const key     = id + '#' + i;
        const concept = q.getAttribute('data-concept') || ('question ' + (i + 1));
        const source  = q.getAttribute('data-source');
        const show    = $('.recall-show', q);
        const ans     = $('.recall-a', q);

        const rate = document.createElement('div');
        rate.className = 'recall-rate';
        rate.innerHTML = '<span>How did that go?</span>' +
          '<button type="button" data-rate="got">I had it</button>' +
          '<button type="button" data-rate="fuzzy">Fuzzy</button>' +
          '<button type="button" data-rate="no">No idea</button>';
        rate.hidden = true;

        if (source && ans && !$('.recall-source', ans)) {
          const a = document.createElement('a');
          a.className = 'recall-source';
          a.href = source;
          a.textContent = 'Revisit where this was taught →';
          ans.appendChild(a);
        }

        function open() { if (ans) ans.hidden = false; rate.hidden = false; if (show) show.disabled = true; }
        if (show) {
          show.addEventListener('click', open);
          show.parentNode.insertBefore(rate, show.nextSibling);
        }

        $$('button', rate).forEach(b => b.addEventListener('click', () => {
          $$('button', rate).forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          const s = P.get('recall', {});
          s[key] = b.getAttribute('data-rate');
          s[key + '|label'] = concept;
          P.set('recall', s);
          const answered = qs.every((_, j) => P.get('recall', {})[id + '#' + j]);
          P.meet(id, answered);
        }));

        if (rated[key]) {
          open();
          const b = $('button[data-rate="' + rated[key] + '"]', rate);
          if (b) b.classList.add('active');
        }
      });
      P.meet(id, qs.every((_, j) => rated[id + '#' + j]));
    });

    /* ── ASK CLAUDE ──────────────────────────────────────────
       The course runs offline, so it cannot grade free text. The
       reader almost certainly has a model, though — so hand them a
       Socratic prompt on the clipboard and let the grading happen
       there. Cheapest possible fix for the one thing static HTML
       genuinely cannot do.

       <button class="ask-claude" data-prompt="…">Get quizzed on this module</button> */
    $$('.ask-claude').forEach(btn => {
      const original = btn.textContent;
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-prompt') || '';
        const done = () => {
          btn.textContent = 'Copied — paste it into Claude';
          btn.classList.add('copied');
          setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 3200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(prompt).then(done).catch(() => fallback(prompt, done));
        } else fallback(prompt, done);
      });
      function fallback(text, done) {
        const t = document.createElement('textarea');
        t.value = text;
        t.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = 'Copy failed — select the prompt manually'; }
        document.body.removeChild(t);
      }
    });

    /* ── CONFIDENCE CALIBRATION ──────────────────────────────
       Add data-confidence to a .quiz-container. Confident-and-wrong
       is the single most valuable moment in a course; it deserves to
       be named rather than buried under a generic "not quite".      */
    $$('.quiz-container[data-confidence]').forEach(container => {
      $$('.quiz-question-block', container).forEach(q => {
        if ($('.confidence-row', q)) return;
        const row = document.createElement('div');
        row.className = 'confidence-row';
        row.innerHTML = '<span>How sure are you?</span>' +
          '<button type="button" data-c="guess">Guessing</button>' +
          '<button type="button" data-c="fairly">Fairly sure</button>' +
          '<button type="button" data-c="certain">Certain</button>';
        $$('button', row).forEach(b => b.addEventListener('click', () => {
          $$('button', row).forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          q.dataset.confidence = b.getAttribute('data-c');
        }));
        const opts = $('.quiz-options', q);
        if (opts) opts.parentNode.insertBefore(row, opts.nextSibling);
      });
    });

    /* Post-process quiz feedback: calibration callout + remediation
       link. Wraps the existing checkQuiz rather than replacing it. */
    const baseCheck = window.checkQuiz;
    window.checkQuiz = function (containerId) {
      baseCheck(containerId);
      const container = $('#' + containerId);
      if (!container) return;
      $$('.quiz-question-block', container).forEach(q => {
        const fb = $('.quiz-feedback', q);
        if (!fb || !fb.classList.contains('show')) return;
        const wrong = fb.classList.contains('error');

        if (wrong && q.dataset.confidence === 'certain' && !$('.calibration', fb)) {
          const c = document.createElement('div');
          c.className = 'calibration';
          c.innerHTML = '<strong>You were certain, and wrong.</strong> That is the most useful thing that can happen in a course — it means your mental model has a specific hole rather than a vague one. Read the explanation twice before moving on.';
          fb.appendChild(c);
        }
        // Adaptive remediation: send them to the exact section that teaches it.
        const to = q.getAttribute('data-remediate');
        if (wrong && to && !$('.remediate', fb)) {
          const a = document.createElement('a');
          a.className = 'remediate';
          a.href = to;
          a.textContent = (q.getAttribute('data-remediate-label') || 'Re-read the section that covers this') + ' →';
          fb.appendChild(a);
        }
      });
      const id = container.getAttribute('data-checkpoint');
      if (id) P.meet(id, true);
    };
    $$('.quiz-container[data-checkpoint]').forEach(c => {
      const id = c.getAttribute('data-checkpoint');
      reg(id);
      if (P.isMet(id)) return;
    });

    /* ── EXECUTION TRACER ────────────────────────────────────
       The strongest single activity for grasping a system: follow
       one real input through the code and, at each hop, predict
       what runs next. Watching an animation is recognition; this is
       reconstruction.

       <div class="tracer" data-id="m1-trace">
         <div class="tracer-input">POST /jobs {"n": 3}</div>
         <div class="tracer-step" data-answer="b" data-frame="validate()" data-op="push"
              data-state="queue=[] · inflight=0">
           <p class="tracer-q">The router has the request. What runs next?</p>
           <button class="tracer-opt" data-value="a">db.write()</button>
           <button class="tracer-opt" data-value="b">validate(payload)</button>
           <div class="tracer-why" data-gated hidden>Because …</div>
         </div>
         …
       </div>                                                    */
    $$('.tracer').forEach(root => {
      const id = root.getAttribute('data-id');
      reg(id);
      const steps = $$('.tracer-step', root);
      if (!steps.length) return;

      const stack = document.createElement('div');
      stack.className = 'tracer-stack';
      stack.innerHTML = '<div class="tracer-stack-title">Call stack</div><div class="tracer-frames"></div>' +
                        '<div class="tracer-statebar"></div>';
      root.insertBefore(stack, steps[0]);
      const frames = $('.tracer-frames', stack);
      const statebar = $('.tracer-statebar', stack);

      let at = 0;
      const done = P.get('tracer', {})[id];

      function paintStack(upto) {
        const list = [];
        for (let i = 0; i < upto; i++) {
          const s = steps[i];
          const f = s.getAttribute('data-frame');
          if (!f) continue;
          if (s.getAttribute('data-op') === 'pop') list.pop();
          else list.push(f);
        }
        frames.innerHTML = list.length
          ? list.map((f, i) => '<div class="tracer-frame" style="margin-left:' + (i * 14) + 'px">' + esc(f) + '</div>').join('')
          : '<div class="tracer-frame empty">(empty)</div>';
        const st = upto > 0 ? steps[upto - 1].getAttribute('data-state') : null;
        statebar.textContent = st || '';
        statebar.style.display = st ? '' : 'none';
      }

      function show(i) {
        steps.forEach((s, k) => { s.hidden = !gatesOff() && k > i; });
        paintStack(i + (steps[i] && steps[i].classList.contains('answered') ? 1 : 0));
      }

      steps.forEach((step, i) => {
        const want = step.getAttribute('data-answer');
        $$('.tracer-opt', step).forEach(o => o.addEventListener('click', () => {
          if (step.classList.contains('answered')) return;
          const right = o.getAttribute('data-value') === want;
          o.classList.add(right ? 'correct' : 'incorrect');
          if (!right) {
            let m = $('.tracer-miss', step);
            if (!m) { m = document.createElement('div'); m.className = 'tracer-miss'; step.appendChild(m); }
            m.textContent = o.getAttribute('data-why') ||
              'Not that one. Look at what the previous frame actually returns before it hands off.';
            return;   // retry: no penalty, the point is to converge on a correct model
          }
          step.classList.add('answered');
          $$('.tracer-opt', step).forEach(x => { x.disabled = true; });
          const why = $('.tracer-why', step);
          if (why) why.hidden = false;
          const miss = $('.tracer-miss', step); if (miss) miss.remove();
          at = i + 1;
          if (at < steps.length) show(at);
          else {
            paintStack(steps.length);
            if (!$('.tracer-done', root)) {
              const d = document.createElement('div');
              d.className = 'tracer-done';
              d.innerHTML = '<strong>You just traced a real request end to end.</strong> If you can do that from memory, you can explain this system to someone else.';
              root.appendChild(d);
            }
            const s = P.get('tracer', {}); s[id] = true; P.set('tracer', s);
            P.meet(id, true);
          }
        }));
      });

      if (done || gatesOff()) {
        steps.forEach(s => {
          s.hidden = false; s.classList.add('answered');
          $$('.tracer-opt', s).forEach(o => {
            o.disabled = true;
            if (o.getAttribute('data-value') === s.getAttribute('data-answer')) o.classList.add('correct');
          });
          const w = $('.tracer-why', s); if (w) w.hidden = false;
        });
        paintStack(steps.length);
        if (done) P.meet(id, true);
      } else show(0);
    });

    /* ── REAL-BUG CHALLENGE ──────────────────────────────────
       The existing spot-the-bug, but built from an actual bug-fix
       commit found in Phase 1. Finding a bug that really shipped
       lands differently from finding an invented one.

       <div class="bug-challenge" data-id="m5-bug" data-commit="a91f3c2"
            data-repo="https://github.com/u/r">
         …existing .bug-line markup…
         <div class="bug-reveal" data-gated hidden>
           <p>This is the real thing — fixed in <code>a91f3c2</code>, …</p>
         </div>
       </div>                                                    */
    $$('.bug-challenge').forEach(root => {
      const id = root.getAttribute('data-id');
      reg(id);
      const reveal = $('.bug-reveal', root);
      const sha    = root.getAttribute('data-commit');
      const repo   = root.getAttribute('data-repo');

      if (reveal && sha && repo && !$('.bug-commit-link', reveal)) {
        const a = document.createElement('a');
        a.className = 'bug-commit-link';
        a.href = repo.replace(/\/$/, '') + '/commit/' + sha;
        a.target = '_blank'; a.rel = 'noopener';
        a.textContent = 'Read the actual fix (' + sha + ') ↗';
        reveal.appendChild(a);
      }
      // Bind our own handling from data-bug rather than relying on the
      // legacy inline onclick="checkBugLine(this, …)" having fired. The
      // inline form still works — this just no longer depends on it.
      $$('.bug-line', root).forEach(line => {
        if (line.dataset.bugBound) return;
        line.dataset.bugBound = '1';
        line.addEventListener('click', () => {
          const isBug = line.getAttribute('data-bug') === 'true';
          if (line.hasAttribute('data-bug')) window.checkBugLine(line, isBug);
          // Either path (data-bug or legacy onclick) marks the line .correct.
          setTimeout(() => {
            if ($('.bug-line.correct', root)) {
              if (reveal) reveal.hidden = false;
              P.meet(id, true);
            }
          }, 0);
        });
      });
      if (P.isMet(id) && reveal) reveal.hidden = false;
    });

    /* ── MASTERY CHECKLIST (capstone) ────────────────────────
       The course should end with the reader deciding, item by item,
       whether they can actually do the thing it promised.          */
    $$('.mastery-checklist').forEach(root => {
      const id = root.getAttribute('data-id') || 'mastery';
      reg(id);
      const boxes = $$('input[type="checkbox"]', root);
      const out = $('.mastery-score', root) || (() => {
        const d = document.createElement('div'); d.className = 'mastery-score';
        root.appendChild(d); return d;
      })();
      const saved = P.get('mastery', {});
      boxes.forEach((b, i) => { if (saved[id + '#' + i]) b.checked = true; });

      function paint() {
        const n = boxes.filter(b => b.checked).length;
        out.innerHTML = '<strong>' + n + ' / ' + boxes.length + '</strong> ' +
          (n === boxes.length
            ? '— you set out not knowing what was going on. You can now explain this codebase.'
            : n === 0 ? '— tick these honestly. Unticked boxes are a reading list, not a failure.'
            : '— the unticked ones tell you exactly which modules to revisit.');
        P.meet(id, n > 0);
      }
      boxes.forEach((b, i) => b.addEventListener('change', () => {
        const s = P.get('mastery', {}); s[id + '#' + i] = b.checked; P.set('mastery', s); paint();
      }));
      paint();
    });

    /* ── PROGRESSIVE-REVEAL WALKTHROUGHS ─────────────────────
       data-reveal="progressive" on a .walkthrough hides the notes
       until the reader clicks a line to ask about it. Code you have
       to interrogate beats code that explains itself at you.        */
    $$('.walkthrough[data-reveal="progressive"]').forEach(root => {
      if (gatesOff()) return;
      root.classList.add('wt-progressive');
      const notes = $$('.wt-note', root);
      notes.forEach(n => n.classList.add('wt-hidden'));
      const hint = document.createElement('div');
      hint.className = 'wt-hint';
      hint.textContent = 'Click any line to ask what it does.';
      const body = $('.wt-body', root);
      if (body) root.insertBefore(hint, body);
      $$('.wt-line', root).forEach(line => line.addEventListener('click', () => {
        const n = parseInt(line.getAttribute('data-n'), 10);
        notes.forEach(note => {
          const spec = (note.getAttribute('data-lines') || '').split('-').map(Number);
          const lo = spec[0], hi = spec.length > 1 ? spec[1] : spec[0];
          if (n >= lo && n <= hi) note.classList.remove('wt-hidden');
        });
        if (hint && notes.every(x => !x.classList.contains('wt-hidden'))) hint.remove();
        if (root._wtAlign) requestAnimationFrame(root._wtAlign);
      }));
    });

    /* Requirements were declared before wiring; seal now so the progress
       engine can decide whether the page is genuinely complete. */
    P.require(checkpoints);
    P.seal();
  })();

})();
