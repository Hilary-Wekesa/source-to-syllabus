# Interactive Elements Reference

Implementation patterns for every interactive element type used in courses. Pick the elements that best serve each module's teaching goal.

> **Architecture note:** All CSS and JavaScript for these elements live in `references/styles.css` and `references/main.js`, which are copied verbatim into every course directory. When writing module HTML files, use only the HTML patterns below — do **not** inline `<style>` or `<script>` tags for these elements. The engines in `main.js` auto-initialize on page load by scanning for the relevant class names and `data-*` attributes described here.

## Table of Contents
1. [Code ↔ English Translation Blocks](#code--english-translation-blocks)
2. [Multiple-Choice Quizzes](#multiple-choice-quizzes)
3. [Drag-and-Drop Matching](#drag-and-drop-matching)
4. [Group Chat Animation](#group-chat-animation)
5. [Message Flow / Data Flow Animation](#message-flow--data-flow-animation)
6. [Interactive Architecture Diagram](#interactive-architecture-diagram)
7. [Layer Toggle Demo](#layer-toggle-demo)
8. ["Spot the Bug" Challenge](#spot-the-bug-challenge)
9. [Scenario Quiz](#scenario-quiz)
10. [Callout Boxes](#callout-boxes)
11. [Pattern/Feature Cards](#patternfeature-cards)
12. [Flow Diagrams](#flow-diagrams)
13. [Permission/Config Badges](#permissionconfig-badges)
14. [Glossary Tooltips](#glossary-tooltips)
15. [Visual File Tree](#visual-file-tree)
16. [Icon-Label Rows](#icon-label-rows)
17. [Numbered Step Cards](#numbered-step-cards)
18. **Annotated Source Walkthrough** → see `references/annotated-code.md`
19. **Evolution Diff Card** (`.diff-card`) → see `references/git-archaeology.md` §6
20. **Progress Summary** (`.progress-summary`) — drop an empty `<div class="progress-summary"></div>` on the index page; `main.js` fills it with pages-completed, cumulative quiz score, and concepts flagged for revisiting.
21. **Comprehension checkpoints** — explain-back, predict-before-reveal, retrieval practice, execution tracer, Ask Claude, confidence calibration, remediation, mastery checklist → see `references/comprehension.md`. These are mandatory, not optional garnish.

> **Inline `onclick` is now optional (v5):** `main.js` binds `.quiz-option`,
> `.quiz-check-btn`, and `.quiz-reset-btn` by event delegation, and
> `.bug-line` via `data-bug="true|false"`. The `onclick="selectOption(this)"`
> form in the patterns below still works and takes precedence when
> present — but omitting it no longer leaves the element silently inert,
> which was a real failure mode. Prefer the attribute-free form in new
> pages; it's one less thing to forget.

> **Auto-highlighting (v4):** any `<pre data-lang="python">` or
> `<code data-lang="ts">` containing raw code is tokenized at runtime by
> `main.js` — no hand-written `<span class="code-keyword">` needed.
> Blocks that already contain manual `.code-*` spans are left untouched,
> so the patterns below still work as written. Prefer `data-lang` for new
> code; it's less error-prone and keeps snippets byte-identical to source.

---

## Code ↔ English Translation Blocks

The most important teaching element. Shows real code from the project on the left and a plain English translation on the right, line by line.

**HTML:**
```html
<div class="translation-block animate-in">
  <div class="translation-code">
    <span class="translation-label">CODE</span>
    <pre><code>
<span class="code-line"><span class="code-keyword">const</span> response = <span class="code-keyword">await</span> <span class="code-function">fetch</span>(url, {</span>
<span class="code-line">  <span class="code-property">method</span>: <span class="code-string">'POST'</span>,</span>
<span class="code-line">  <span class="code-property">headers</span>: { <span class="code-string">'Authorization'</span>: apiKey }</span>
<span class="code-line">});</span>
    </code></pre>
  </div>
  <div class="translation-english">
    <span class="translation-label">PLAIN ENGLISH</span>
    <div class="translation-lines">
      <p class="tl">Send a request to the URL and wait for a response...</p>
      <p class="tl">We're sending data (POST), not just asking for it (GET)...</p>
      <p class="tl">Include our API key so the server knows who we are...</p>
      <p class="tl">End of the request setup.</p>
    </div>
  </div>
</div>
```

**CSS:**
```css
.translation-block {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  margin: var(--space-8) 0;
}
.translation-code {
  background: var(--color-bg-code);
  color: #CDD6F4;
  padding: var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.7;
  position: relative;
  overflow-x: hidden;  /* NO horizontal scrollbar — ever */
}
.translation-code pre,
.translation-code code {
  white-space: pre-wrap;       /* wrap long lines instead of scrolling */
  word-break: break-word;      /* break mid-word if needed */
  overflow-x: hidden;
}
.translation-english {
  background: var(--color-surface-warm);
  padding: var(--space-6);
  font-size: var(--text-sm);
  line-height: 1.7;
  border-left: 3px solid var(--color-accent);
}
.translation-label {
  position: absolute;
  top: var(--space-2);
  right: var(--space-3);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
}
.translation-english .translation-label {
  color: var(--color-text-muted);
}
/* Responsive: stack vertically on mobile */
@media (max-width: 768px) {
  .translation-block { grid-template-columns: 1fr; }
  .translation-english { border-left: none; border-top: 3px solid var(--color-accent); }
}
```

**Rules:**
- Each English line should correspond to 1-2 code lines
- Use conversational language, not technical jargon
- Highlight the "why" not just the "what" — e.g., "Include our API key so the server knows who we are" not "Set the Authorization header"

---

## Multiple-Choice Quizzes

For testing understanding with instant feedback. Each question has options, one correct answer, and per-question explanations.

**Wiring:** `main.js` exposes `window.selectOption(btn)`, `window.checkQuiz(containerId)`, and `window.resetQuiz(containerId)`. Call them via `onclick`. Per-question explanations go in `data-explanation-right` and `data-explanation-wrong` on the `.quiz-question-block`.

**HTML:**
```html
<div class="quiz-container" id="quiz-module3">
  <div class="quiz-question-block"
       data-correct="option-b"
       data-explanation-right="Exactly — because X is responsible for Y in this architecture."
       data-explanation-wrong="Not quite. Think about where Y lives in the codebase...">
    <h3 class="quiz-question">Question text here?</h3>
    <div class="quiz-options">
      <button class="quiz-option" data-value="option-a" onclick="selectOption(this)">
        <div class="quiz-option-radio"></div>
        <span>Answer A</span>
      </button>
      <button class="quiz-option" data-value="option-b" onclick="selectOption(this)">
        <div class="quiz-option-radio"></div>
        <span>Answer B (correct)</span>
      </button>
      <button class="quiz-option" data-value="option-c" onclick="selectOption(this)">
        <div class="quiz-option-radio"></div>
        <span>Answer C</span>
      </button>
    </div>
    <div class="quiz-feedback"></div>
  </div>

  <button class="quiz-check-btn" onclick="checkQuiz('quiz-module3')">Check Answers</button>
  <button class="quiz-reset-btn" onclick="resetQuiz('quiz-module3')">Try Again</button>
</div>
```

**CSS for quiz states:**
```css
.quiz-option {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer; width: 100%;
  transition: border-color var(--duration-fast), background var(--duration-fast);
}
.quiz-option:hover { border-color: var(--color-accent-muted); }
.quiz-option.selected { border-color: var(--color-accent); background: var(--color-accent-light); }
.quiz-option.correct { border-color: var(--color-success); background: var(--color-success-light); }
.quiz-option.incorrect { border-color: var(--color-error); background: var(--color-error-light); }
.quiz-option-radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid var(--color-border);
  transition: all var(--duration-fast);
}
.quiz-option.selected .quiz-option-radio {
  border-color: var(--color-accent);
  background: var(--color-accent);
  box-shadow: inset 0 0 0 3px white;
}
.quiz-feedback {
  max-height: 0; overflow: hidden; opacity: 0;
  transition: max-height var(--duration-normal), opacity var(--duration-normal);
}
.quiz-feedback.show { max-height: 200px; opacity: 1; padding: var(--space-3); margin-top: var(--space-2); border-radius: var(--radius-sm); }
.quiz-feedback.success { background: var(--color-success-light); color: var(--color-success); }
.quiz-feedback.error { background: var(--color-error-light); color: var(--color-error); }
```

---

## Drag-and-Drop Matching

For matching concepts to descriptions. Supports both mouse (HTML5 Drag API) and touch.

**HTML:**
```html
<div class="dnd-container">
  <div class="dnd-chips">
    <div class="dnd-chip" draggable="true" data-answer="actor-a">Actor A</div>
    <div class="dnd-chip" draggable="true" data-answer="actor-b">Actor B</div>
    <div class="dnd-chip" draggable="true" data-answer="actor-c">Actor C</div>
  </div>
  <div class="dnd-zones">
    <div class="dnd-zone" data-correct="actor-a">
      <p class="dnd-zone-label">Description for Actor A</p>
      <div class="dnd-zone-target">Drop here</div>
    </div>
    <!-- more zones -->
  </div>
  <button onclick="checkDnD()">Check Matches</button>
  <button onclick="resetDnD()">Reset</button>
</div>
```

**JS (mouse + touch):**
```javascript
// MOUSE: HTML5 Drag API
chips.forEach(chip => {
  chip.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', chip.dataset.answer);
    chip.classList.add('dragging');
  });
  chip.addEventListener('dragend', () => chip.classList.remove('dragging'));
});

zones.forEach(zone => {
  const target = zone.querySelector('.dnd-zone-target');
  target.addEventListener('dragover', (e) => { e.preventDefault(); target.classList.add('drag-over'); });
  target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
  target.addEventListener('drop', (e) => {
    e.preventDefault();
    target.classList.remove('drag-over');
    const answer = e.dataTransfer.getData('text/plain');
    const chip = document.querySelector(`[data-answer="${answer}"]`);
    target.textContent = chip.textContent;
    target.dataset.placed = answer;
    chip.classList.add('placed');
  });
});

// TOUCH: Custom implementation (HTML5 drag doesn't work on mobile)
chips.forEach(chip => {
  chip.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const clone = chip.cloneNode(true);
    clone.classList.add('touch-ghost');
    clone.style.cssText = `position:fixed; z-index:1000; pointer-events:none;
      left:${touch.clientX - 40}px; top:${touch.clientY - 20}px;`;
    document.body.appendChild(clone);
    chip._ghost = clone;
    chip._answer = chip.dataset.answer;
  }, { passive: false });

  chip.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (chip._ghost) {
      chip._ghost.style.left = (touch.clientX - 40) + 'px';
      chip._ghost.style.top = (touch.clientY - 20) + 'px';
    }
    // Highlight zone under finger
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    zones.forEach(z => z.querySelector('.dnd-zone-target').classList.remove('drag-over'));
    if (el && el.closest('.dnd-zone-target')) {
      el.closest('.dnd-zone-target').classList.add('drag-over');
    }
  }, { passive: false });

  chip.addEventListener('touchend', (e) => {
    if (chip._ghost) { chip._ghost.remove(); chip._ghost = null; }
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.closest('.dnd-zone-target')) {
      const target = el.closest('.dnd-zone-target');
      target.textContent = chip.textContent;
      target.dataset.placed = chip._answer;
      chip.classList.add('placed');
    }
  });
});
```

---

## Group Chat Animation

iMessage/WeChat-style chat showing components "talking" to each other. Messages appear one by one with typing indicators.

**Wiring:** `main.js` auto-initializes every `.chat-window` on page load. Give each chat window a unique `id`. Control buttons need these classes: `.chat-next-btn`, `.chat-all-btn`, `.chat-reset-btn`. The typing indicator avatar element should have `id="{chatWindowId}-typing-avatar"` or simply be the first `.chat-avatar` inside `.chat-typing`.

**HTML:**
```html
<div class="chat-window" id="chat-module2">
  <div class="chat-messages">
    <div class="chat-message" data-msg="0" data-sender="actor-a" style="display:none">
      <div class="chat-avatar" style="background: var(--color-actor-1)">A</div>
      <div class="chat-bubble">
        <span class="chat-sender" style="color: var(--color-actor-1)">Actor A</span>
        <p>Hey Background, I need the data for this item.</p>
      </div>
    </div>
    <!-- more messages... -->
  </div>

  <div class="chat-typing" id="chat-typing" style="display:none">
    <div class="chat-avatar" id="typing-avatar">?</div>
    <div class="chat-typing-dots">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
  </div>

  <div class="chat-controls">
    <button class="btn chat-next-btn">Next Message</button>
    <button class="btn chat-all-btn">Play All</button>
    <button class="btn chat-reset-btn">Replay</button>
    <span class="chat-progress"></span>
  </div>
</div>
```

**CSS for typing dots:**
```css
.typing-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--color-text-muted);
  animation: typingBounce 1.4s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}
```

---

## Message Flow / Data Flow Animation

Step-by-step visualization of data moving between components. User clicks "Next Step" to advance.

**Wiring:** `main.js` auto-initializes every `.flow-animation` on page load. Pass steps as JSON in `data-steps`. Each step object: `{ highlight: "flow-actor-id", label: "description", packet: true, from: "actor-id-suffix", to: "actor-id-suffix" }`. Actor element IDs must be `flow-actor-1`, `flow-actor-2`, etc. Control buttons need classes `.flow-next-btn` and `.flow-reset-btn`.

> **⚠️ Single quotes in step labels will break parsing.** The `data-steps` attribute is delimited by single quotes (`data-steps='[...]'`), so any single quote inside a label (e.g. `"the user's request"`) will terminate the attribute early and cause `JSON.parse` to fail silently — the entire animation will stop working. Either avoid apostrophes in labels, replace them with `&apos;`, or rewrite the attribute using double-quote delimiters with escaped inner quotes (`data-steps="[{\"label\":\"...\"}]"`).

**HTML:**
```html
<div class="flow-animation" data-steps='[
  {"highlight":"flow-actor-1","label":"User clicks the button"},
  {"highlight":"flow-actor-1","label":"Frontend sends request","packet":true,"from":"actor-1","to":"actor-2"},
  {"highlight":"flow-actor-2","label":"Backend calls the database","packet":true,"from":"actor-2","to":"actor-3"}
]'>
  <div class="flow-actors">
    <div class="flow-actor" id="flow-actor-1">
      <div class="flow-actor-icon">A</div>
      <span>Actor 1</span>
    </div>
    <div class="flow-actor" id="flow-actor-2">
      <div class="flow-actor-icon">B</div>
      <span>Actor 2</span>
    </div>
    <div class="flow-actor" id="flow-actor-3">
      <div class="flow-actor-icon">C</div>
      <span>Actor 3</span>
    </div>
  </div>

  <div class="flow-packet" id="flow-packet"></div>

  <div class="flow-step-label" id="flow-label">Click "Next Step" to begin</div>

  <div class="flow-controls">
    <button class="btn flow-next-btn">Next Step</button>
    <button class="btn flow-reset-btn">Restart</button>
    <span class="flow-progress"></span>
  </div>
</div>
```

**CSS for active actor glow:**
```css
.flow-actor.active {
  box-shadow: 0 0 0 3px var(--color-accent), 0 0 20px rgba(217, 79, 48, 0.2);
  transform: scale(1.05);
  transition: all var(--duration-normal) var(--ease-out);
}
```

---

## Interactive Architecture Diagram

Full-system diagram where hovering/clicking a component shows a description tooltip.

**HTML:**
```html
<div class="arch-diagram">
  <div class="arch-zone arch-zone-browser">
    <h4 class="arch-zone-label">Browser</h4>
    <div class="arch-component" data-desc="Injects UI into the web page, reads DOM, captures user actions"
         onclick="showArchDesc(this)">
      <div class="arch-icon">📄</div>
      <span>Component A</span>
    </div>
    <!-- more components -->
  </div>
  <div class="arch-zone arch-zone-external">
    <h4 class="arch-zone-label">External Services</h4>
    <!-- API cards -->
  </div>
  <div class="arch-description" id="arch-desc">Click any component to learn what it does</div>
</div>
```

---

## Layer Toggle Demo

Shows how different layers (e.g., HTML/CSS/JS, or data/logic/UI) build on each other. Three tabs switch between views.

**HTML:**
```html
<div class="layer-demo">
  <div class="layer-tabs">
    <button class="layer-tab active" onclick="showLayer('html')">HTML</button>
    <button class="layer-tab" onclick="showLayer('css')">+ CSS</button>
    <button class="layer-tab" onclick="showLayer('js')">+ JS</button>
  </div>
  <div class="layer-viewport">
    <div class="layer" id="layer-html" style="display:block">
      <!-- Raw unstyled version -->
    </div>
    <div class="layer" id="layer-css" style="display:none">
      <!-- Styled version -->
    </div>
    <div class="layer" id="layer-js" style="display:none">
      <!-- Interactive version -->
    </div>
  </div>
  <p class="layer-description" id="layer-desc">This is the raw HTML...</p>
</div>
```

---

## "Spot the Bug" Challenge

Show code with a deliberate bug. User clicks the buggy line. Reveal explains the issue.

**HTML:**
```html
<div class="bug-challenge">
  <h3>Find the bug in this code:</h3>
  <div class="bug-code">
    <div class="bug-line" data-line="1" onclick="checkBugLine(this, false)">
      <span class="line-num">1</span>
      <code>chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {</code>
    </div>
    <div class="bug-line" data-line="2" onclick="checkBugLine(this, false)">
      <span class="line-num">2</span>
      <code>  if (msg.action === 'fetchData') {</code>
    </div>
    <div class="bug-line bug-target" data-line="3" onclick="checkBugLine(this, true)">
      <span class="line-num">3</span>
      <code>    fetch(url).then(r => r.json()).then(data => sendResponse(data));</code>
    </div>
    <div class="bug-line" data-line="4" onclick="checkBugLine(this, false)">
      <span class="line-num">4</span>
      <code>  }</code>
    </div>
    <div class="bug-line" data-line="5" onclick="checkBugLine(this, false)">
      <span class="line-num">5</span>
      <code>});</code>
    </div>
  </div>
  <div class="bug-feedback" id="bug-feedback"></div>
</div>
```

**JS:**
```javascript
window.checkBugLine = function(el, isCorrect) {
  const feedback = el.closest('.bug-challenge').querySelector('.bug-feedback');
  if (isCorrect) {
    el.classList.add('correct');
    feedback.innerHTML = '<strong>Found it!</strong> The listener uses an async operation (fetch) but doesn\'t return true. Chrome closes the message channel before the response can be sent. Fix: add <code>return true;</code> at the end.';
    feedback.className = 'bug-feedback show success';
  } else {
    el.classList.add('incorrect');
    feedback.innerHTML = 'Not this line — look for where the async timing might cause problems...';
    feedback.className = 'bug-feedback show error';
    setTimeout(() => { el.classList.remove('incorrect'); feedback.className = 'bug-feedback'; }, 2000);
  }
};
```

---

## Scenario Quiz

"What would a senior engineer do?" — situational questions with explanations.

Same HTML/CSS/JS pattern as Multiple-Choice Quizzes, but with longer scenario descriptions and more detailed explanations. Wrap each question in a scenario context block:

```html
<div class="scenario-block">
  <div class="scenario-context">
    <span class="scenario-label">Scenario</span>
    <p>Your app processes a 3-hour podcast transcript. The API has a 16,000 token limit. What do you do?</p>
  </div>
  <!-- quiz-options here -->
</div>
```

---

## Callout Boxes

"Aha!" moments — universal CS insights. Max 2 per module.

```html
<div class="callout callout-accent">
  <div class="callout-icon">💡</div>
  <div class="callout-content">
    <strong class="callout-title">Key Insight</strong>
    <p>This pattern — splitting responsibilities into focused roles — is one of the most important ideas in software engineering. Engineers call it "separation of concerns."</p>
  </div>
</div>
```

**Variants:**
- `callout-accent`: vermillion left border, light accent background (for CS insights)
- `callout-info`: teal left border, light info background (for "good to know")
- `callout-warning`: red left border, light error background (for common mistakes)

---

## Pattern/Feature Cards

Grid of cards highlighting engineering patterns, tech stack components, or key concepts.

```html
<div class="pattern-cards">
  <div class="pattern-card" style="border-top: 3px solid var(--color-actor-1)">
    <div class="pattern-icon" style="background: var(--color-actor-1)">🔄</div>
    <h4 class="pattern-title">Caching</h4>
    <p class="pattern-desc">Store results to avoid redundant work — like keeping leftovers instead of cooking a new meal every time.</p>
  </div>
  <!-- more cards -->
</div>
```

```css
.pattern-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-4);
}
.pattern-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal);
}
.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
```

---

## Flow Diagrams

**Horizontal flow (desktop):**
```html
<div class="flow-steps">
  <div class="flow-step">
    <div class="flow-step-num">1</div>
    <p>User clicks button</p>
  </div>
  <div class="flow-arrow">→</div>
  <div class="flow-step">
    <div class="flow-step-num">2</div>
    <p>Component A detects click</p>
  </div>
  <div class="flow-arrow">→</div>
  <!-- more steps -->
</div>
```

Arrows rotate to `↓` on mobile via CSS transform.

---

## Permission/Config Badges

For annotating config files, permissions, or settings:

```html
<div class="badge-list">
  <div class="badge-item">
    <code class="badge-code">storage</code>
    <span class="badge-desc">Save data between sessions (like browser bookmarks)</span>
  </div>
  <div class="badge-item">
    <code class="badge-code">activeTab</code>
    <span class="badge-desc">Access the currently open tab (only when the user clicks)</span>
  </div>
</div>
```

```css
.badge-item {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  transition: border-color var(--duration-fast);
}
.badge-item:hover { border-color: var(--color-accent-muted); }
.badge-code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  background: var(--color-bg-code);
  color: #CBA6F7;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
```

---

## Glossary Tooltips

The most important accessibility feature for non-technical learners. Any technical term in the course text should be wrapped in a tooltip that shows a plain-English definition on hover (desktop) or tap (mobile). The learner never has to leave the page or Google anything.

**HTML — mark up terms inline:**
```html
<p>The extension uses a
  <span class="term" data-definition="A service worker is a background script that runs independently of the web page — like a behind-the-scenes assistant that's always on, even when you're not looking at the page.">service worker</span>
  to handle API calls.
</p>
```

**CSS:**
```css
.term {
  border-bottom: 1.5px dashed var(--color-accent-muted);
  cursor: pointer;    /* NOT cursor: help — pointer feels clickable and inviting */
  position: relative;
}
.term:hover, .term.active {
  border-bottom-color: var(--color-accent);
  color: var(--color-accent);
}

/* The tooltip bubble — uses position: fixed and is appended to document.body
   via JS so it is NEVER clipped by ancestor overflow: hidden containers
   (like translation blocks). See JS section below for positioning logic. */
.term-tooltip {
  position: fixed;        /* CRITICAL: fixed, not absolute — prevents clipping */
  background: var(--color-bg-code);
  color: #CDD6F4;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-family: var(--font-body);
  line-height: var(--leading-normal);
  width: max(200px, min(320px, 80vw));
  box-shadow: var(--shadow-lg);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-fast);
  z-index: 10000;        /* Above everything, including nav */
}
/* Arrow pointing down */
.term-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--color-bg-code);
}
.term-tooltip.visible {
  opacity: 1;
}

/* If tooltip goes off-screen top, flip to below */
.term-tooltip.flip {
  bottom: auto;
  top: calc(100% + 8px);
}
.term-tooltip.flip::after {
  top: auto;
  bottom: 100%;
  border-top-color: transparent;
  border-bottom-color: var(--color-bg-code);
}
```

**JS — position: fixed tooltips appended to body (never clipped by overflow):**
```javascript
// Tooltip container — appended to body so it's never clipped
let activeTooltip = null;

function positionTooltip(term, tip) {
  const rect = term.getBoundingClientRect();
  const tipWidth = 300; // approximate
  let left = rect.left + rect.width / 2 - tipWidth / 2;
  // Clamp to viewport
  left = Math.max(8, Math.min(left, window.innerWidth - tipWidth - 8));

  // Try above first
  let top = rect.top - 8;
  tip.style.left = left + 'px';

  // Position above by default, flip below if no room
  document.body.appendChild(tip);
  const tipHeight = tip.offsetHeight;
  if (rect.top - tipHeight - 8 < 0) {
    // Flip below
    tip.style.top = (rect.bottom + 8) + 'px';
    tip.classList.add('flip');
  } else {
    tip.style.top = (rect.top - tipHeight - 8) + 'px';
    tip.classList.remove('flip');
  }
}

document.querySelectorAll('.term').forEach(term => {
  const tip = document.createElement('span');
  tip.className = 'term-tooltip';
  tip.textContent = term.dataset.definition;

  // Hover for desktop
  term.addEventListener('mouseenter', () => {
    if (activeTooltip && activeTooltip !== tip) {
      activeTooltip.classList.remove('visible');
      activeTooltip.remove();
    }
    positionTooltip(term, tip);
    requestAnimationFrame(() => tip.classList.add('visible'));
    activeTooltip = tip;
  });

  term.addEventListener('mouseleave', () => {
    tip.classList.remove('visible');
    setTimeout(() => { if (!tip.classList.contains('visible')) tip.remove(); }, 150);
    activeTooltip = null;
  });

  // Tap for mobile
  term.addEventListener('click', (e) => {
    e.stopPropagation();
    if (activeTooltip && activeTooltip !== tip) {
      activeTooltip.classList.remove('visible');
      activeTooltip.remove();
    }
    if (tip.classList.contains('visible')) {
      tip.classList.remove('visible');
      tip.remove();
      activeTooltip = null;
    } else {
      positionTooltip(term, tip);
      requestAnimationFrame(() => tip.classList.add('visible'));
      activeTooltip = tip;
    }
  });
});

// Close tooltips when clicking elsewhere
document.addEventListener('click', () => {
  if (activeTooltip) {
    activeTooltip.classList.remove('visible');
    activeTooltip.remove();
    activeTooltip = null;
  }
});
```

**Rules:**
- Mark up EVERY technical term on first use in each module (API, DOM, callback, async, endpoint, middleware, etc.)
- Keep definitions to 1-2 sentences max, in everyday language
- Use a metaphor in the definition when it helps — e.g., "A **callback** is like leaving your phone number at a restaurant so they can call you when your table is ready"
- Don't mark the same term twice within the same screen — only on first appearance per module
- The dashed underline should be subtle enough not to distract but visible enough that curious learners discover it

---

## Visual File Tree

Use instead of paragraphs listing "this folder does X, that folder does Y." Much easier to scan.

```html
<div class="file-tree">
  <div class="ft-folder open">
    <span class="ft-name">app/</span>
    <span class="ft-desc">Pages and API routes</span>
    <div class="ft-children">
      <div class="ft-folder">
        <span class="ft-name">api/</span>
        <span class="ft-desc">Backend endpoints the frontend calls</span>
      </div>
      <div class="ft-file">
        <span class="ft-name">layout.tsx</span>
        <span class="ft-desc">The shell that wraps every page</span>
      </div>
    </div>
  </div>
  <div class="ft-folder">
    <span class="ft-name">components/</span>
    <span class="ft-desc">Reusable UI building blocks</span>
  </div>
  <div class="ft-folder">
    <span class="ft-name">lib/</span>
    <span class="ft-desc">Shared logic and utilities</span>
  </div>
</div>
```

```css
.file-tree { font-family: var(--font-mono); font-size: var(--text-sm); }
.ft-folder, .ft-file {
  padding: var(--space-2) var(--space-3);
  border-left: 2px solid var(--color-border-light);
  margin-left: var(--space-4);
}
.ft-folder > .ft-name { color: var(--color-accent); font-weight: 600; }
.ft-folder > .ft-name::before { content: '📁 '; }
.ft-file > .ft-name::before { content: '📄 '; }
.ft-desc {
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  margin-left: var(--space-2);
  font-size: var(--text-xs);
}
.ft-children { margin-left: var(--space-4); }
```

---

## Icon-Label Rows

For listing components, features, or concepts visually. Replaces bullet-point paragraphs.

```html
<div class="icon-rows">
  <div class="icon-row">
    <div class="icon-circle" style="background: var(--color-actor-1)">🖥️</div>
    <div>
      <strong>Frontend (Next.js)</strong>
      <p>What the user sees and interacts with</p>
    </div>
  </div>
  <div class="icon-row">
    <div class="icon-circle" style="background: var(--color-actor-2)">⚡</div>
    <div>
      <strong>API Routes</strong>
      <p>Backend logic that runs on the server</p>
    </div>
  </div>
  <div class="icon-row">
    <div class="icon-circle" style="background: var(--color-actor-3)">🗄️</div>
    <div>
      <strong>Database (Supabase)</strong>
      <p>Where all the data is stored permanently</p>
    </div>
  </div>
</div>
```

```css
.icon-rows { display: flex; flex-direction: column; gap: var(--space-4); }
.icon-row {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}
.icon-row p { margin: 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
.icon-circle {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.25rem; flex-shrink: 0;
}
```

---

## Numbered Step Cards

For sequences that would otherwise be a numbered paragraph list. Visual, scannable, and each step stands alone.

```html
<div class="step-cards">
  <div class="step-card">
    <div class="step-num">1</div>
    <div class="step-body">
      <strong>User pastes a YouTube URL</strong>
      <p>The frontend captures the URL and extracts the video ID</p>
    </div>
  </div>
  <div class="step-card">
    <div class="step-num">2</div>
    <div class="step-body">
      <strong>API fetches the transcript</strong>
      <p>A server-side route calls an external service to get the video's text</p>
    </div>
  </div>
  <div class="step-card">
    <div class="step-num">3</div>
    <div class="step-body">
      <strong>AI analyzes the content</strong>
      <p>The transcript is sent to an AI model that extracts key moments</p>
    </div>
  </div>
</div>
```

```css
.step-cards { display: flex; flex-direction: column; gap: var(--space-3); }
.step-card {
  display: flex; align-items: flex-start; gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-accent);
  box-shadow: var(--shadow-sm);
}
.step-num {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--color-accent);
  color: white; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  flex-shrink: 0;
}
.step-body p { margin: var(--space-1) 0 0; color: var(--color-text-secondary); font-size: var(--text-sm); }
```

---

# v2 Elements — Dual-Track Build Journey

The elements below are the backbone of the dual-track / build-journey course. Their CSS and JS live in `styles.css` and `main.js` (copied verbatim) — use only the HTML patterns here. Do not inline `<style>` or `<script>`.

## TL;DR Badge

Every module opens with one; every build-step contains a compact inline one.

**Module-level (top of each `<section class="module">`, right after the heading):**
```html
<div class="tldr">
  <span class="tldr-tag">TL;DR</span>
  <p>In this stage we build the <strong>URL-shortening engine</strong> — the code that turns a long link into a short code and back. It's the heart of the app; everything else is plumbing around it.</p>
</div>
```

**Inline (inside a build-step):**
```html
<p class="tldr-inline">We hash the URL, take the first 7 characters, and store the mapping so we can reverse it later.</p>
```

**Rules:** 1-3 sentences, plain English, no jargon (that's what the Technically track is for). The module TL;DR states *what this stage is and why it matters*. The inline TL;DR compresses one build-step to a single sentence.

## Dual-Track Block (Simply / Technically)

The signature element. Two tabs over the same concept: `Simply` (intuition) and `Technically` (mechanics). Auto-initializes; the global nav switch flips all blocks at once. Exactly two tabs and two panes; mark one tab **and** its pane `active`.

```html
<div class="dual-track">
  <div class="dt-tabs">
    <button class="dt-tab active" data-track="simply"><span class="dt-tab-icon">🌱</span> Simply</button>
    <button class="dt-tab" data-track="technically"><span class="dt-tab-icon">⚙️</span> Technically</button>
  </div>
  <div class="dt-panes">
    <div class="dt-pane active" data-track="simply">
      <p>Think of the short code like a coat-check ticket. You hand over a bulky coat (the long URL) and get a tiny numbered stub. Later you show the stub and get your exact coat back — the stub itself is meaningless, it's just a lookup key.</p>
    </div>
    <div class="dt-pane" data-track="technically">
      <p>We generate a deterministic key by hashing the normalized URL with SHA-256 and base62-encoding the first 42 bits, yielding a 7-char slug. Collisions are resolved by probing with an incrementing salt. The slug→URL mapping is the single source of truth; lookups are O(1) against the primary key.</p>
      <p>Tradeoff: hashing gives idempotency (same URL → same slug) but leaks nothing about ordering; a monotonic counter would be shorter but enumerable.</p>
    </div>
  </div>
</div>
```

**Rules:**
- **Both panes describe the SAME concept** — not two different concepts. Simply = the metaphor + why-you-care. Technically = the real mechanics, data structures, complexity, protocols, and tradeoffs.
- The Simply pane must be understandable with zero background. The Technically pane must be correct and precise enough that a working engineer nods.
- Put the concept's **metaphor** in the Simply pane and the **tradeoff/failure mode** in the Technically pane.
- Default the visible tab to `Simply` (the global switch also defaults to Simply), so a first-time reader lands on intuition.
- Do NOT overuse: one or two per module on the *central* concepts. Not every paragraph needs a toggle.

## Build-Step Card (What / Why / How)

The unit of the build journey. Represents one concrete implementation step. Contains a number, a stage label, a title, an inline TL;DR, and the What/Why/How grid.

```html
<div class="build-step">
  <div class="build-step-head">
    <div class="build-step-num">1</div>
    <div>
      <span class="build-step-stage">Stage 2 · Foundations</span>
      <h3 class="build-step-title">Define the link data model</h3>
    </div>
  </div>
  <p class="tldr-inline">One table: a short code, the original URL, and a click counter.</p>
  <div class="build-step-body">
    <p>Before any routing or UI, we decide what a "link" actually <em>is</em> in storage.</p>
    <div class="wwh">
      <div class="wwh-cell what">
        <span class="wwh-label">What</span>
        <p>A <span class="term" data-definition="A schema is the blueprint for how data is shaped and stored — the columns of a table and their types.">schema</span> with three fields: <code>code</code>, <code>url</code>, <code>clicks</code>.</p>
      </div>
      <div class="wwh-cell why">
        <span class="wwh-label">Why</span>
        <p>Modeling data first forces every later decision to be concrete. Get this wrong and every feature inherits the mistake.</p>
      </div>
      <div class="wwh-cell how">
        <span class="wwh-label">How</span>
        <p>Declared as a table with <code>code</code> as the primary key, so lookups are indexed and unique by construction.</p>
      </div>
    </div>
  </div>
</div>
```

**Rules:**
- **What** = the artifact you create in this step (a file, a function, a table, an endpoint). **Why** = the reason it exists / what breaks without it — connect to a transferable principle. **How** = the concrete mechanism, grounded in the real code.
- Keep each cell to 1-3 sentences. If How needs real code, follow the card with a Code↔English translation block.
- Number steps sequentially within their stage; the number tells the story of build order.
- Aggressive tooltips on technical terms inside the cells.

## Level Up Card (transferable engineering concept)

Closes every module. Dark "graduation" panel: names the concept the way engineers name it, then best practices vs. pitfalls, then curated resources. This is what turns project knowledge into durable skill.

```html
<div class="levelup">
  <span class="levelup-tag">🎓 Level Up</span>
  <h4 class="levelup-title">Idempotency &amp; deterministic keys</h4>
  <p>The trick you just saw — same input always produces the same short code — is called <strong>idempotency</strong>. It shows up everywhere in serious systems: payment APIs, message queues, deploy pipelines. An idempotent operation can be safely retried without doubling its effect, which is the foundation of reliable distributed systems.</p>
  <div class="levelup-grid">
    <div class="levelup-col practices">
      <h5>Best practices</h5>
      <ul>
        <li>Make write operations idempotent so retries are safe after a timeout.</li>
        <li>Derive keys deterministically when you want dedup for free.</li>
        <li>Return the existing resource on a duplicate request, not an error.</li>
      </ul>
    </div>
    <div class="levelup-col pitfalls">
      <h5>Common pitfalls</h5>
      <ul>
        <li>Assuming a network call succeeded when the response was lost — the classic double-charge bug.</li>
        <li>Using a random key where a deterministic one would have prevented duplicates.</li>
        <li>Ignoring hash collisions because "they're rare" — rare isn't never at scale.</li>
      </ul>
    </div>
  </div>
  <!-- Resource list goes here (see next element). See references/resource-curation.md. -->
  <div class="resource-list">
    <a class="resource-item" href="https://stripe.com/docs/api/idempotent_requests" target="_blank" rel="noopener">
      <span class="resource-type docs">Docs</span>
      <span class="resource-body">
        <span class="resource-title">Idempotent Requests</span>
        <span class="resource-src">stripe.com</span>
        <p class="resource-why">How a production payments API uses idempotency keys — the canonical real-world example.</p>
      </span>
      <span class="resource-arrow">↗</span>
    </a>
  </div>
</div>
```

**Rules:**
- Name the concept precisely (idempotency, separation of concerns, back-pressure, memoization, denormalization, etc.) — the vocabulary IS part of the learning.
- Best practices and pitfalls are 2-4 items each, concrete and transferable (not repo-specific).
- Always include a `.resource-list` with verified links — see `references/resource-curation.md`.

## Resource List (curated external links)

Used inside Level Up cards (and standalone when a module warrants a "go deeper" break). Each item is a real, working link with a type badge, source, and a one-line "why this."

```html
<div class="resource-list">
  <a class="resource-item" href="https://REAL-URL" target="_blank" rel="noopener">
    <span class="resource-type video">Video</span>
    <span class="resource-body">
      <span class="resource-title">Hashing, explained visually</span>
      <span class="resource-src">youtube.com · Computerphile</span>
      <p class="resource-why">A 10-minute visual intuition for what a hash function does and why collisions matter.</p>
    </span>
    <span class="resource-arrow">↗</span>
  </a>
  <a class="resource-item" href="https://REAL-URL" target="_blank" rel="noopener">
    <span class="resource-type article">Article</span>
    <span class="resource-body">
      <span class="resource-title">Designing a URL shortener</span>
      <span class="resource-src">example.com</span>
      <p class="resource-why">Walks the same design decisions at production scale — a good "what changes when this grows" read.</p>
    </span>
    <span class="resource-arrow">↗</span>
  </a>
</div>
```

**Type badges:** `video` · `article` · `docs` · `repo` · `course`. Always set `target="_blank" rel="noopener"`. Never invent a URL — verify every link per `references/resource-curation.md`.
