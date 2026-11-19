// Small DOM factories. No virtual DOM or component lifecycle.
const UI = (() => {
  const icons = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>',
    download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>',
    restart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></svg>',
    versions: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6"/></svg>',
    subtitles: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M6 11h4M14 11h4M6 15h7M16 15h2"/></svg>',

    search:
      '<svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M10 18h4"/></svg>',
    tablet: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M10 18h4"/></svg>',
    television: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8m-4-4v4"/></svg>',
    computer: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M7 22h10m-5-5v5"/></svg>',
    device: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></svg>',
    library: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 4v16M3 9h5M3 15h5M16 4v16M16 9h5M16 15h5"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>',
    scan: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 12h10"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1"/></svg>',
    image: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/></svg>',
    folder: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.5 2-2 1-2-.5-2 3 1.5 1.5v3L2.5 15l2 3 2-.5 2 1 .5 2h4l.5-2 2-1 2 .5 2-3-1.5-2v-3l1.5-1.5-2-3-2 .5-2-1L13 3Z"/><circle cx="11" cy="12" r="3"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    hidden: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10 5a12 12 0 0 1 12 7 17 17 0 0 1-4 5M6 6a17 17 0 0 0-4 6s3.5 7 10 7a12 12 0 0 0 4-1M10 10a3 3 0 0 0 4 4"/></svg>',
    rename: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15Z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>',
  };
  const githubIcon = '<svg class="github-brand-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';
  function SettingsChevron() {
    return icons.back.replace('<svg ', '<svg class="settings-chevron" aria-hidden="true" ');
  }
  function githubRevisionLink(version, menu = false) {
    return `<a class="github-revision-link${menu ? ' github-revision-link--menu' : ''}" href="https://github.com/sd87671067/go-emby" target="_blank" rel="noopener noreferrer" aria-label="Go Emby GitHub，版本 ${esc(version)}">${githubIcon}${menu ? `<span class="github-revision-text"><strong>Go Emby</strong><small>${esc(version)}</small></span>` : `<small>${esc(version)}</small>`}</a>`;
  }
  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (v !== undefined) n.setAttribute(k, String(v));
    }
    for (const c of [].concat(children))
      if (c != null)
        n.append(c instanceof Node ? c : document.createTextNode(String(c)));
    // Factories use the same material contract as string templates, in place.
    const variant = tag === "dialog" || n.matches('.fm-pop, .context-menu, .confirm-dialog-card') ? "dialog"
      : n.matches('.files-toolbar') ? "nav"
      : n.matches('.task-progress-card, .dashboard-playing-card') ? "ios"
      : n.matches('.panel, .settings-group, .dashboard-stat, .task-progress-card, .dashboard-playing-card, .scraper-settings-list, .scraper-task-card, .scraper-log-card, .access-device-card, .files-list') ? "surface" : null;
    return variant ? GlassCard(n, variant) : n;
  }
  // Enhance in place; string templates share the class/data attribute contract.
  function GlassCard(node, variant = "card") {
    if (variant === "selected") return Choice(node);
    if (!["surface", "card", "nav", "dialog", "artwork", "ios"].includes(variant)) throw new TypeError("Unknown glass variant");
    node.classList.add("glass-card");
    node.dataset.glassVariant = variant;
    return node;
  }
  // Enhance the existing node: native inputs/ARIA own state, no wrapper or observer.
  // String templates may use Choice.className for the same component contract.
  function Choice(node, {compact = false} = {}) {
    node.classList.add(Choice.className);
    node.dataset.glassVariant = 'selected';
    if (compact) node.classList.add('ui-choice--compact');
    return node;
  }
  Choice.className = 'ui-choice';
  Choice.selected = '[aria-pressed="true"], [aria-selected="true"], [aria-checked="true"], [aria-current="page"], [aria-current="location"], :has(input:checked)';
  // Pointer focus also covers dynamically rendered menu triggers and sheet items.
  // Keep the marker through programmatic focus restoration (notably in Safari).
  const pointerFocusSelector = 'button, input, select, textarea, summary, [role=button], [role=tab], .icon-button, .action-sheet-item, .user-menu-item, .account-menu-item, .account-menu-avatar, .context-menu-item, .fm-pop button, .scraper-setting-row';
  let pointerFocus = false, menuTrigger = null;
  document.addEventListener('pointerdown', event => {
    pointerFocus = true;
    menuTrigger = event.target.closest(pointerFocusSelector);
    event.target.closest(pointerFocusSelector)?.setAttribute('data-pointer-focus', '');
  }, {capture:true});
  document.addEventListener('focusin', event => {
    if (pointerFocus && event.target.matches(pointerFocusSelector)) event.target.setAttribute('data-pointer-focus', '');
  }, {capture:true});
  document.addEventListener('keydown', event => {
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
    pointerFocus = false;
    menuTrigger = null;
    document.querySelectorAll('[data-pointer-focus]').forEach(element => element.removeAttribute('data-pointer-focus'));
  }, {capture:true});
  // Modal dialogs occupy the browser top layer. Put notifications in that same
  // layer and within the active modal's DOM so their controls are not inert.
  const promptDialogs = [];
  let toastStack;
  function mountToastStack() {
    const stack = toastStack;
    const active = promptDialogs.filter(dialog => dialog.isConnected && dialog.matches(":modal"));
    const top = active.at(-1);
    for (const dialog of active) dialog.toggleAttribute("data-background-modal", dialog !== top);
    const drawerBackdrop = document.querySelector("#drawer-backdrop");
    if (drawerBackdrop) {
      drawerBackdrop.style.setProperty("--drawer-backdrop-blur", top ? "none" : "var(--sheet-backdrop-blur)");
      drawerBackdrop.style.background = top ? "transparent" : "";
    }
    const menu = document.querySelector('.context-menu:popover-open, .fm-pop:popover-open');
    const foreground = menu || top || (document.body.classList.contains('drawer-open') ? document.querySelector('#drawer') : null);
    window.LiquidChrome?.setOverlay(foreground);
    if (foreground) {
      document.querySelector('body > header')?.classList.remove('media-header-hidden');
      document.querySelector('[data-theme-navigation]')?.classList.remove('media-navigation-hidden');
    }
    if (!stack) return;
    const host = top || [...document.querySelectorAll("dialog:modal")].at(-1) || document.body;
    if (stack.parentElement !== host) {
      if (stack.matches(":popover-open")) stack.hidePopover();
      host.append(stack);
    }
    if (stack.childElementCount) {
      // Reinsert above a dialog that was opened after an existing toast.
      if (stack.matches(":popover-open")) stack.hidePopover();
      stack.showPopover();
    } else if (stack.matches(":popover-open")) stack.hidePopover();
  }
  const promptObserver = new MutationObserver(records => {
    let changed = false;
    for (const record of records) {
      if (record.type === "attributes" && record.target.tagName === "DIALOG") {
        const dialog = record.target;
        const index = promptDialogs.indexOf(dialog);
        if (index >= 0) promptDialogs.splice(index, 1);
        if (dialog.matches(":modal")) promptDialogs.push(dialog);
        changed = true;
      }
      if (record.type === "childList" && [...record.removedNodes].some(node => node instanceof Element && (node === toastStack || node.contains(toastStack) || node.tagName === "DIALOG" || node.matches(".liquid-filter") || node.querySelector("dialog")))) changed = true;
    }
    if (changed) mountToastStack();
  });
  document.addEventListener("DOMContentLoaded", () => promptObserver.observe(document.body, {attributes:true, attributeFilter:["open"], childList:true, subtree:true}), {once:true});
  document.addEventListener("close", event => {
    if (event.target.tagName === "DIALOG") mountToastStack();
  }, true);
  const toastTimers = new WeakMap();
  function dismissToast(item) {
    if (!item) return;
    clearTimeout(toastTimers.get(item));
    item.remove();
    mountToastStack();
  }
  function Toast(title, options = {}) {
    if (typeof options === "string") options = {type: options};
    title = String(title || "操作完成");
    const type = options.type || (/失败|错误|无效|不支持|不能|无法|超时|拒绝/.test(title) ? "error" : "success");
    const message = String(options.message || "");
    let stack = toastStack;
    if (!stack) {
      stack = el("div", {class:"toast-stack", popover:"manual", "aria-live":"polite", "aria-relevant":"additions removals"});
      toastStack = stack;
      document.body.append(stack);
    }
    const duplicate = [...stack.children].find(item => item.dataset.key === `${type}:${title}:${message}`);
    if (duplicate) { mountToastStack(); return duplicate; }
    while (stack.childElementCount >= 3) dismissToast(stack.firstElementChild);
    const icon = {success:"✓", info:"i", warning:"!", error:"×"}[type] || "i";
    const item = el("div", {class:`toast-item toast-item--${type}`, role:type === "error" ? "alert" : "status"});
    item.dataset.key = `${type}:${title}:${message}`;
    const close = el("button", {type:"button", class:"toast-close", "aria-label":"关闭提示"}, "×");
    close.addEventListener("click", () => dismissToast(item));
    item.append(el("span", {class:"toast-icon", "aria-hidden":"true"}, icon),
      el("div", {class:"toast-content"}, [el("strong", {class:"toast-title"}, title), el("small", {class:"toast-message"}, message)]),
      close);
    stack.append(item);
    mountToastStack();
    toastTimers.set(item, setTimeout(() => dismissToast(item), 3600));
    return item;
  }
  function IconButton(label, icon, action, variant = "") {
    const b = el("button", {
      class: "secondary icon-button" + (variant ? " icon-button--" + variant : ""),
      type: "button",
      "aria-label": label,
      title: label,
      onclick: action,
    });
    b.innerHTML = icons[icon] || icons.close;
    return b;
  }
  // One lifecycle for static forms, external submit buttons and dynamic sheets.
  // Start the handler before disabling so its existing validation and FormData
  // semantics remain intact; the lock is acquired synchronously before either.
  const savingButtons = new WeakSet();
  function saveAction(handler, resolveButton) {
    return async function(event) {
      event?.preventDefault();
      const form = event?.currentTarget;
      const button = resolveButton ? resolveButton(event) :
        event?.submitter || (form?.tagName === 'FORM' ?
          [...form.elements].find(el => el.tagName === 'BUTTON' && el.type === 'submit') : form);
      if (!button || button.disabled || savingButtons.has(button)) return;
      savingButtons.add(button);
      const disabled = button.disabled, busy = button.getAttribute('aria-busy');
      const spinner = el('span', {class:'action-spinner button-spinner', 'aria-hidden':'true'});
      spinner.style.color = getComputedStyle(button).color;
      try {
        const pending = handler.call(this, event);
        button.disabled = true;
        button.classList.add('button-saving');
        button.setAttribute('aria-busy', 'true');
        button.append(spinner);
        await pending;
      } catch (error) {
        Toast(error.message || '保存失败', {type:'error'});
      } finally {
        spinner.remove();
        button.classList.remove('button-saving');
        if (busy === null) button.removeAttribute('aria-busy');
        else button.setAttribute('aria-busy', busy);
        button.disabled = disabled;
        savingButtons.delete(button);
      }
    };
  }
  const deferredImages = new WeakMap();
  function startShelfImage(img) {
    const start = deferredImages.get(img);
    deferredImages.delete(img);
    // IntersectionObserver already gates visibility; native lazy loading would
    // add a second scheduling gate (especially inside transformed shelves).
    img.loading = "eager";
    if (img.getAttribute("fetchpriority") !== "high") img.setAttribute("fetchpriority", "auto");
    if (start) start();
  }
  const posterObserver = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      posterObserver.unobserve(entry.target);
      startShelfImage(entry.target);
    }
  }, { rootMargin: "120px 0px" });
  function deferShelfImage(img, url) {
    deferredImages.set(img, typeof url === "function" ? url : () => { img.src = url; });
    img.dataset.posterSrc = typeof url === "string" ? url : "";
    if (posterObserver) posterObserver.observe(img);
    else startShelfImage(img);
    return img;
  }
  // Short-lived, bounded failure memory shared by cards and heroes. Image error
  // events do not expose HTTP status; allow transient failures to recover too.
  // Keep auth and revision in the key, but share failures across rendition sizes.
  const failedImages = new Map();
  function mediaImage(img, item, kinds, width, deferred = false) {
    const sources = kinds.filter(kind => kind === "Primary" ||
      (kind === "Backdrop" ? item.BackdropImageTags?.length : item.ImageTags?.[kind]))
      .map(kind => {
        const tag = kind === "Backdrop" ? item.BackdropImageTags[0] : item.ImageTags?.[kind];
        const url = api.image(item.Id, kind, typeof width === "function" ? width(kind) : width) +
          (tag ? "&tag=" + encodeURIComponent(tag) : "");
        const key = new URL(url, document.baseURI);
        key.searchParams.delete("MaxWidth");
        return {url, key:key.href};
      });
    let index = 0, current;
    const advance = () => {
      while (index < sources.length) {
        current = sources[index++];
        const expires = failedImages.get(current.key);
        if (expires > Date.now()) continue;
        failedImages.delete(current.key);
        img.src = current.url;
        return;
      }
      img.onload = img.onerror = null;
      img.removeAttribute("src");
      img.classList.add("image-missing");
    };
    img.onload = () => {
      failedImages.delete(current.key);
      img.classList.add("image-loaded");
    };
    img.onerror = () => {
      if (failedImages.size >= 512) failedImages.delete(failedImages.keys().next().value);
      failedImages.set(current.key, Date.now() + 60000);
      advance();
    };
    if (deferred) {
      deferShelfImage(img, () => {
        advance();
        api.prefetchItem?.(item, () => img.isConnected && img.getBoundingClientRect().bottom >= -120 && img.getBoundingClientRect().top <= innerHeight + 120);
      });
      img.dataset.posterSrc = sources[0]?.url || "";
    } else advance();
    return img;
  }
  document.addEventListener("media-metadata", ({detail:item}) => {
    for (const card of document.querySelectorAll(".card[data-id]")) {
      if (card.dataset.id !== item.Id) continue;
      card.setAttribute("aria-label", item.Name);
      const title = card.querySelector(".poster-caption strong");
      if (title) title.textContent = item.Name;
      const meta = card.querySelector(".poster-caption .muted");
      if (meta && ["Movie", "Series"].includes(item.Type)) meta.textContent = [item.ProductionYear, item.CommunityRating ? "★ " + item.CommunityRating : ""].filter(Boolean).join(" · ");
    }
  });
  const removalObserver = new MutationObserver(records => {
    for (const record of records) for (const node of record.removedNodes) {
      if (!(node instanceof Element) || node.isConnected) continue;
      if (node.matches("img[data-poster-src]")) posterObserver?.unobserve(node);
      node.querySelectorAll("img[data-poster-src]").forEach(img => posterObserver?.unobserve(img));
    }
  });
  document.addEventListener("DOMContentLoaded", () => removalObserver.observe(document.body, {childList:true, subtree:true}), {once:true});
  function ShelfArrow(direction, action) {
    const button = IconButton(direction < 0 ? "向左滚动" : "向右滚动", "back", action);
    button.classList.add("shelf-arrow", direction < 0 ? "shelf-prev" : "shelf-next");
    return button;
  }
  // One shared controller owns document walls and transform-based horizontal shelves.
  // Horizontal touch/pen use axis-locked Pointer Events; document touch stays native.
  const HORIZONTAL_SCROLL_PHYSICS = Object.freeze({
    damping: 0.95,
    velocityMultiplier: 1.5,
    minVelocity: 0.1,
    springFactor: 0.2,
  });
  const scrollPhysics = Object.freeze({
    x: Object.freeze({...HORIZONTAL_SCROLL_PHYSICS, dragThreshold:5, velocitySampleWindow:80}),
    y: Object.freeze({damping:0.93, velocityMultiplier:1.2, boundaryDamping:0.3, minVelocity:0.2, dragThreshold:5, velocitySampleWindow:80, maxMomentumDuration:1500}),
  });
  let pointerScroll = null;
  const shelfBindings = new WeakMap();
  function bindPointerScroll(target, axis = "x") {
    if (!pointerScroll) pointerScroll = createPointerScroll();
    return pointerScroll.bind(target, axis);
  }
  function createPointerScroll() {
    const targets = new Map(), reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let active = null, drag = null, inertia = null, frame = 0, position = 0, maximum = 0, dirty = false, rebound = 0;
    const overlayOpen = () => !!document.querySelector('dialog[open], .user-menu[open], .fm-menu[open] .fm-pop, .fm-pop:popover-open, .context-menu:popover-open, body.drawer-open');
    let suspended = overlayOpen(), inFrame = false;
    const sampleTimes = new Float64Array(128), samplePositions = new Float64Array(128);
    let sampleStart = 0, sampleCount = 0;
    const overlayBlocks = record => {
      if (!suspended) return false;
      const owner = record?.target.closest('dialog[open]');
      return !owner || [...document.querySelectorAll('dialog[open]')].at(-1) !== owner ||
        !!document.querySelector('.user-menu[open], .fm-menu[open] .fm-pop, .fm-pop:popover-open, .context-menu:popover-open, body.drawer-open');
    };
    const blocked = () => !active?.target.isConnected || document.hidden || overlayBlocks(active);
    const clamp = value => Math.max(0, Math.min(maximum, value));
    const physics = () => scrollPhysics[active.axis];
    const coordinate = event => active.axis === "x" ? event.clientX : event.clientY;
    const read = () => active.axis === "x" ? active.position : window.scrollY;
    const rubber = value => clamp(value) + Math.max(-48, Math.min(48, (value - clamp(value)) * physics().springFactor));
    function render(record) {
      if (!inFrame) {
        if (!record.renderFrame) record.renderFrame = requestAnimationFrame(() => {
          record.renderFrame = 0;
          if (record.target.isConnected) { inFrame = true; try { render(record); } finally { inFrame = false; } }
        });
        return;
      }
      cancelAnimationFrame(record.renderFrame); record.renderFrame = 0;
      if (record.mountMeasure) {
        record.mountMeasure = false;
        record.maximum = Math.max(0, record.target.scrollWidth - record.target.parentElement.clientWidth);
        record.position = Math.max(0, Math.min(record.maximum, record.position));
      }
      if (record.renderedPosition !== record.position) {
        record.target.style.transform = `translateX(${-record.position}px)`;
        record.renderedPosition = record.position;
      }
      if (record.mode !== record.renderedMode) {
        record.target.classList.toggle("is-dragging", record.mode === "dragging");
        record.target.classList.toggle("is-coasting", record.mode === "coasting");
        record.target.style.willChange = record.mode ? "transform" : "";
        record.renderedMode = record.mode;
      }
      const atStart = record.position <= 2, atEnd = record.position >= record.maximum - 2;
      if (atStart !== record.atStart || atEnd !== record.atEnd) {
        record.atStart = atStart; record.atEnd = atEnd;
        record.positionEvent.detail.position = record.position;
        record.positionEvent.detail.maximum = record.maximum;
        record.target.dispatchEvent(record.positionEvent);
      }
    }
    const write = () => {
      if (active.axis === "x") { active.position = position; render(active); }
      else window.scrollTo({top:position, behavior:"instant"});
    };
    function stop() {
      cancelAnimationFrame(frame); frame = 0; inertia = null;
      const previous = drag, record = active, target = record?.target; drag = null;
      if (record?.axis === "x") { position = clamp(position); record.mode = ""; write(); }
      if (record?.axis === "y") target.classList.remove("is-dragging", "is-coasting");
      rebound = 0; active = null;
      if (previous && target.hasPointerCapture(previous.id)) target.releasePointerCapture(previous.id);
    }
    function measureRecord(record) {
      record.maximum = Math.max(0, record.target.scrollWidth - record.target.parentElement.clientWidth);
      if (record !== active) { record.position = Math.max(0, Math.min(record.maximum, record.position)); render(record); }
    }
    function measure() {
      if (active.axis === "x") measureRecord(active);
      maximum = active.axis === "x" ? active.maximum
        : Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      dirty = false;
    }
    const schedule = () => {
      // The physics frame also renders; do not enqueue a second render for it.
      if (active?.renderFrame) { cancelAnimationFrame(active.renderFrame); active.renderFrame = 0; }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    function tick(now) {
      inFrame = true;
      try {
        frame = 0;
        if (blocked()) { stop(); return; }
        // Geometry is cached; only explicit layout changes invalidate it.
        if (dirty) measure();
        if (drag?.active) {
          position = active.axis === "x" ? rubber(drag.pending) : drag.pending; write();
        } else if (inertia) {
          const config = physics(), elapsed = Math.max(0, now - inertia.last);
          const dt = active.axis === "x" ? elapsed
            : Math.min(elapsed, Math.max(0, config.maxMomentumDuration - (inertia.last - inertia.start)));
          const decay = Math.pow(config.damping, dt / (1000 / 60));
          if (rebound) {
            position = clamp(position) + (position - clamp(position)) * Math.pow(1 - config.springFactor, dt / (1000 / 60));
          } else {
            const velocity = inertia.velocity;
            inertia.velocity *= decay;
            // Integrate exponential velocity over elapsed time so 60/90/120Hz
            // produce the same distance. Velocity is measured in px/ms.
            const rate = -Math.log(config.damping) / (1000 / 60);
            const next = position + velocity * (1 - decay) / rate;
            if (next !== clamp(next)) {
              if (active.axis === "x") { position = rubber(next); rebound = 1; inertia.velocity = 0; }
              else { position = clamp(next); inertia.velocity = velocity * decay * config.boundaryDamping; }
            } else position = next;
          }
          inertia.last = now; write();
          if ((rebound ? Math.abs(position - clamp(position)) < 0.5 : Math.abs(inertia.velocity) < config.minVelocity) ||
              (config.maxMomentumDuration && now - inertia.start >= config.maxMomentumDuration)) stop();
          else schedule();
        }
      } finally { inFrame = false; }
    }
    function sample(event) {
      const cutoff = event.timeStamp - physics().velocitySampleWindow;
      while (sampleCount && sampleTimes[sampleStart] < cutoff) { sampleStart = (sampleStart + 1) % 128; sampleCount--; }
      if (sampleCount === 128) { sampleStart = (sampleStart + 1) % 128; sampleCount--; }
      const index = (sampleStart + sampleCount++) % 128;
      sampleTimes[index] = event.timeStamp; samplePositions[index] = coordinate(event);
    }
    document.addEventListener("pointerdown", event => {
      stop();
      // A fresh physical gesture re-enables ordinary poster clicks immediately.
      for (const record of targets.values()) record.suppressClick = false;
      if (!event.isPrimary || event.button !== 0 ||
          event.target.closest('button, a, input, select, textarea, summary')) return;
      for (let node = event.target; node; node = node.parentElement) {
        if (targets.has(node)) { active = targets.get(node); break; }
      }
      if (!active || blocked()) { stop(); return; }
      maximum = active.axis === "x" ? active.maximum : Math.max(0, document.documentElement.scrollHeight - innerHeight); position = read();
      drag = {id:event.pointerId, native:active.axis === "y" && event.pointerType !== "mouse", x:event.clientX, y:event.clientY,
        last:coordinate(event), origin:position, pending:position, active:false};
      sampleStart = sampleCount = 0;
      sample(event);
    }, true);
    document.addEventListener("pointermove", event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (drag.native) {
        if (Math.hypot(dx,dy) >= physics().dragThreshold) active.suppressClick = true;
        return; // Preserve the platform compositor pan, including pen and rebound.
      }
      if (!drag.active) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < physics().dragThreshold) return;
        // Decide once, after the slop threshold. Small initial jitter must not
        // surrender an X gesture, and later Y drift must not unlock it.
        if (active.axis === "x") {
          if (Math.abs(dy) > Math.abs(dx) * 1.2) { stop(); return; }
          if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
        } else if (Math.abs(dx) >= Math.abs(dy)) { stop(); return; }
        drag.active = true; active.suppressClick = true;
        if (event.isTrusted) active.target.setPointerCapture(event.pointerId);
        if (active.axis === "x") active.mode = "dragging";
        else active.target.classList.add("is-dragging");
      }
      event.preventDefault();
      // Use the full gesture displacement. Rubber band is applied once at
      // render time, never recursively to the next pointer sample.
      drag.pending = active.axis === "x" ? drag.origin - dx : clamp(drag.pending - (coordinate(event) - drag.last));
      drag.last = coordinate(event); sample(event); schedule();
    }, {capture:true, passive:false});
    // Pointer capture does not cancel a browser pan-y default. Cancel that
    // default only after this same controller has committed a one-finger X drag.
    function preventNativePan(event) {
      if (drag?.active && active?.target === event.currentTarget && event.touches.length === 1 && event.cancelable) event.preventDefault();
    }
    function finish(event) {
      // Touch starts with implicit capture on the poster. Transferring capture
      // to its scroller emits a descendant lostpointercapture, not a cancellation.
      if (event.type === "lostpointercapture" && event.target !== active?.target) return;
      if (!drag || drag.id !== event.pointerId) return;
      if (event.type !== "pointerup" || !drag.active || blocked()) { stop(); return; }
      sample(event);
      const config = physics();
      let meanT = 0, meanP = 0;
      for (let n = 0; n < sampleCount; n++) { const i = (sampleStart + n) % 128; meanT += sampleTimes[i]; meanP += samplePositions[i]; }
      meanT /= sampleCount; meanP /= sampleCount;
      let numerator = 0, denominator = 0;
      for (let n = 0; n < sampleCount; n++) { const i = (sampleStart + n) % 128; numerator += (sampleTimes[i] - meanT) * (meanP - samplePositions[i]); denominator += (sampleTimes[i] - meanT) ** 2; }
      const lastIndex = (sampleStart + sampleCount - 1) % 128, duration = sampleTimes[lastIndex] - sampleTimes[sampleStart];
      const speed = active.axis === "x" ? (denominator ? numerator / denominator : 0)
        : (duration > 0 ? (samplePositions[sampleStart] - samplePositions[lastIndex]) / duration : 0);
      const sampledVelocity = Math.max(-3, Math.min(3, speed));
      const velocity = sampledVelocity * config.velocityMultiplier;
      const pending = active.axis === "x" ? rubber(drag.pending) : drag.pending, record = active;
      stop(); active = record; maximum = record.axis === "x" ? record.maximum : maximum;
      position = reduced.matches ? clamp(pending) : pending;
      if (active.axis === "x") active.mode = "coasting";
      else active.target.classList.add("is-coasting");
      write();
      rebound = position !== clamp(position) ? 1 : 0;
      const now = performance.now();
      inertia = {velocity:!reduced.matches && Math.abs(velocity) >= config.minVelocity ? velocity : 0, last:now, start:now};
      schedule();
    }
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) document.addEventListener(type, finish, true);
    for (const type of ["wheel", "keydown", "contextmenu", "pagehide", "popstate", "hashchange"])
      window.addEventListener(type, stop, {capture:true, passive:true});
    // Element focus changes during pointerdown must not cancel a poster drag.
    window.addEventListener("blur", event => { if (event.target === window) stop(); });
    document.addEventListener("visibilitychange", stop);
    reduced.addEventListener("change", stop);
    window.addEventListener("resize", () => { if (active) dirty = true; });
    const refresh = record => {
      if (record.axis !== "x" || !record.target.isConnected) return;
      if (record === active) { dirty = true; schedule(); }
      else measureRecord(record);
    };
    let appWidth;
    const resize = new ResizeObserver(entries => {
      for (const entry of entries) {
        const record = targets.get(entry.target) || targets.get(entry.target.parentElement);
        if (record) refresh(record);
      }
      // Page height changes (lazy images, pagination, menus) do not change
      // horizontal bounds. Only an actual viewport width change invalidates all.
      const app = entries.find(entry => entry.target.id === "app");
      if (app && app.contentRect.width !== appWidth) {
        appWidth = app.contentRect.width;
        for (const record of targets.values()) refresh(record);
      }
    });
    resize.observe(document.querySelector("#app"));
    const lifecycle = new MutationObserver(mutations => {
      for (const [target, record] of targets) if (!target.isConnected) {
        if (active === record) stop();
        cancelAnimationFrame(record.renderFrame); record.renderFrame = 0;
        record.abort.abort(); resize.unobserve(target); if (record.first) resize.unobserve(record.first); targets.delete(target);
      }
      for (const mutation of mutations) {
        const record = targets.get(mutation.target);
        if (record) {
          if (record.first !== record.target.firstElementChild) {
            if (record.first) resize.unobserve(record.first);
            record.first = record.target.firstElementChild;
            if (record.first) resize.observe(record.first);
          }
          refresh(record);
        }
      }
      suspended = overlayOpen(); if (active && blocked()) stop();
    });
    lifecycle.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["open"]});
    const drawer = new MutationObserver(() => { suspended = overlayOpen(); if (active && blocked()) stop(); });
    drawer.observe(document.body, {attributes:true, attributeFilter:["class"]});
    return {reveal(target, child) {
      const record = targets.get(target);
      if (!record) return;
      const left = child.offsetLeft, right = left + child.offsetWidth, width = target.parentElement.clientWidth;
      if (left < record.position) this.scrollTo(target, left);
      else if (right > record.position + width) this.scrollTo(target, right - width);
    }, scrollBy(target, amount) { this.move(target, amount);
    }, scrollTo(target, amount) { this.move(target, amount, true);
    }, move(target, amount, absolute = false) {
      stop();
      const record = targets.get(target);
      if (!record || record.axis !== "x" || !target.isConnected || overlayBlocks(record)) return;
      active = record; maximum = record.maximum; position = clamp(absolute ? amount : record.position + amount); write(); active = null;
    }, bind(target, axis) {
      if (targets.has(target)) return targets.get(target).abort.signal;
      const abort = new AbortController(), signal = abort.signal;
      const record = {target, axis, abort, suppressClick:false, position:0, maximum:0, mode:"", renderedMode:"", renderFrame:0, positionEvent:new CustomEvent("shelfposition", {detail:{position:0, maximum:0}})}; targets.set(target, record); resize.observe(target);
      if (axis === "x") {
        target.addEventListener("touchmove", preventNativePan, {capture:true, passive:false, signal});
        record.mountMeasure = true; render(record);
        record.first = target.firstElementChild;
        if (record.first) resize.observe(record.first);
        // Browser focus must not introduce a native offset alongside position.
        const viewport = target.parentElement;
        viewport.addEventListener("scroll", () => { viewport.scrollLeft = 0; }, {passive:true, signal});
      }
      target.addEventListener("click", event => {
        if (record.suppressClick && event.detail > 0) {
          event.preventDefault(); event.stopImmediatePropagation(); record.suppressClick = false;
        }
      }, {capture:true, signal});
      target.addEventListener("dragstart", event => event.preventDefault(), {signal});
      target.addEventListener("selectstart", event => { if (active === record && drag) event.preventDefault(); }, {signal});
      return signal;
    }};
  }
  // Shared portrait structure for details and editorial credits.
  function PersonCard(person, imageURL) {
    const name = document.createTextNode(''), role = el('small');
    const caption = el('figcaption', {}, [name, role]);
    const card = el('figure', {class:'actor'}, caption);
    let previousURL;
    card.updatePerson = (person, imageURL) => {
      const url = imageURL === undefined ? (person.PrimaryImageTag ? api.image(person.Id, 'Primary', 200) : '') : imageURL;
      if (url !== previousURL) {
        const picture = url ? deferShelfImage(el('img', {loading:'lazy', decoding:'async', alt:person.Name, draggable:false}), url) : el('div', {class:'actor-placeholder', 'aria-label':'暂无头像'});
        if(imageURL!==undefined&&url)picture.addEventListener('error',()=>picture.replaceWith(el('div',{class:'actor-placeholder','aria-label':'暂无头像'})),{once:true});
        if (caption.previousElementSibling) caption.previousElementSibling.replaceWith(picture);
        else card.prepend(picture);
        previousURL = url;
      }
      if(name.nodeValue!==person.Name)name.nodeValue=person.Name;
      const description=person.Role || (person.Type==='Director'?'导演':'');
      if(role.textContent!==description)role.textContent=description;
      const picture=caption.previousElementSibling;if(picture?.tagName==='IMG'&&picture.alt!==person.Name)picture.alt=person.Name;
    };
    card.updatePerson(person, imageURL);
    return card;
  }
  function bindMediaShelf(shelf) {
    const previous = shelfBindings.get(shelf);
    if (previous && !previous.signal.aborted) return previous.track;
    const oldTrack = shelf.parentElement?.classList.contains("shelf-track") ? shelf.parentElement : null;
    const track = el("div", {class:"shelf-track"}, shelf);
    if (oldTrack) oldTrack.replaceWith(track);
    shelf.tabIndex = 0;
    const signal = bindPointerScroll(shelf);
    shelfBindings.set(shelf, {track, signal});
    const scroll = direction => pointerScroll.scrollBy(shelf, direction * track.clientWidth * .85);
    const prev = ShelfArrow(-1, () => scroll(-1));
    const next = ShelfArrow(1, () => scroll(1));
    track.append(prev, next);
    const update = ({detail:{position, maximum}}) => {
      const atStart = position <= 2, atEnd = position >= maximum - 2;
      if (prev.disabled !== atStart) prev.disabled = atStart;
      if (next.disabled !== atEnd) next.disabled = atEnd;
      track.classList.toggle("can-scroll-left", !prev.disabled);
      track.classList.toggle("can-scroll-right", !next.disabled);
    };
    shelf.addEventListener("shelfposition", update, {signal});
    prev.disabled = next.disabled = true;
    shelf.addEventListener("wheel", e => {
      // Vertical wheel gestures belong to the page, including diagonal trackpad input.
      if (e.ctrlKey || Math.abs(e.deltaY) >= Math.abs(e.deltaX)) return;
      const delta = e.deltaX;
      const record = delta < 0 ? prev : next;
      if (!delta || record.disabled) return;
      e.preventDefault();
      pointerScroll.scrollBy(shelf, delta * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? track.clientWidth : 1));
    }, {passive:false, signal});
    shelf.addEventListener("keydown", e => {
      if (e.target !== shelf || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      if (e.key === "Home" || e.key === "End") pointerScroll.scrollTo(shelf, e.key === "Home" ? 0 : Infinity);
      else scroll(e.key === "ArrowLeft" ? -1 : 1);
    }, {signal});
    shelf.addEventListener("focusin", e => {
      if (e.target === shelf) return;
      // Focus geometry is read only on keyboard focus, never on pointermove.
      const record = e.target.closest(".card, .fl-feature, .actor");
      if (!record) return;
      pointerScroll.reveal(shelf, record);
    }, {signal});
    return track;
  }
  function FeaturedHero(item) {
    const img = mediaImage(el("img", {class:"featured-backdrop", alt:"", decoding:"async", fetchpriority:"high"}),
      item, ["Backdrop", "Thumb", "Banner", "Primary"], kind => kind === "Backdrop" ? 1920 : 800);
    img.draggable = false;
    return el("section", {class:"featured-hero media-interactive", "aria-label":"精选推荐", "data-id":item.Id, "data-type":item.Type, ...(typeof item.UserData?.IsFavorite === "boolean" ? {"data-favorite":String(item.UserData.IsFavorite)} : {})}, [img,
      el("div", {class:"featured-content"}, [el("span", {class:"featured-label"}, "精选推荐"),
        el("h1", {}, item.Name),
        el("div", {class:"detail-meta"}, [item.ProductionYear, item.CommunityRating ? "★ " + item.CommunityRating : ""].filter(Boolean).join(" · ")),
        item.Overview ? el("p", {class:"featured-overview"}, item.Overview) : null,
        el("div", {class:"detail-actions"}, [
          el("button", {class:"media-primary", onclick:run(() => detail(item.Id, {play:true}))}, "▶ 播放"),
          el("button", {class:"secondary", onclick:run(() => detail(item.Id))}, "更多信息"),
          ...(typeof posterMenu === "function" ? [el("button", {class:"secondary", "aria-label":"收藏选项", onclick:run(event => posterMenu(event.currentTarget.closest('.featured-hero'), [], event))}, "♡ 收藏")] : [])])])]);
  }
  // Weak maps retain only mounted component data; presentation changes keep handlers.
  const featuredItems = new WeakMap(), cardLayouts = new WeakMap(), cardData = new WeakMap();
  function decorateCard(card, item, resume) {
    if (item) cardData.set(card, {item, resume});
    else ({item, resume} = cardData.get(card) || {});
    cardLayouts.get(card)?.();
    cardLayouts.delete(card);
    const cleanup = typeof Themes !== 'undefined' && Themes.decorate('PosterCard', card, item, resume);
    if (cleanup) cardLayouts.set(card, cleanup);
  }
  function refreshPresentation(root) {
    root.querySelectorAll('.featured-carousel, .fl-recommendation-section').forEach(host => {
      const items = featuredItems.get(host);
      if (items) host.replaceWith(FeaturedCarousel(items));
    });
    root.querySelectorAll('.card').forEach(card => decorateCard(card));
  }
  function FeaturedCarousel(items) {
    if (typeof Themes !== "undefined" && Themes.has("FeaturedCarousel")) {
      const host = Themes.render("FeaturedCarousel", items);
      featuredItems.set(host, items);
      return host;
    }
    const slides = items.slice(0, 5);
    const host = el("div", {class:"featured-carousel", "aria-label":"精选推荐"});
    host.addEventListener("dragstart", e => e.preventDefault());
    host.addEventListener("dblclick", e => e.preventDefault());
    host.addEventListener("contextmenu", e => e.preventDefault());
    let index = 0;
    const render = () => {
      const hero = FeaturedHero(slides[index]);
      if (slides.length > 1) {
        const controls = el("div", {class:"featured-controls", "aria-label":"切换推荐"});
        const move = step => { index = (index + step + slides.length) % slides.length; render(); };
        controls.append(el("button", {class:"secondary", onclick:() => move(-1), "aria-label":"上一张推荐"}, "‹"));
        slides.forEach((item, n) => controls.append(el("button", {class:"secondary", "aria-label":item.Name, "aria-current":String(n === index), onclick:() => { index = n; render(); }}, String(n + 1))));
        controls.append(el("button", {class:"secondary", onclick:() => move(1), "aria-label":"下一张推荐"}, "›"));
        hero.querySelector(".featured-content").append(controls);
      }
      host.replaceChildren(hero);
    };
    render();
    featuredItems.set(host, items);
    return host;
  }
  function DetailHero(item) {
    const image = mediaImage(el("img", {class:"detail-backdrop", decoding:"async", alt:"", fetchpriority:"high"}),
      item, ["Backdrop", "Thumb", "Banner", "Primary"], "original");
    return el("section", {class:"detail-hero"}, [image,
      el("div", {class:"detail-shell"}, el("h2", {class:"detail-title"}, item.Name))]);
  }
  function PosterCard(item, open, resume = false, imageWidth = resume ? 640 : undefined) {
    const kinds = resume ? [...(item.Type === "Episode" ? ["Thumb"] : []), "Banner", "Primary"] : ["Primary"];
    const img = mediaImage(el("img", {
      class: "media-poster", alt: "", decoding: "async",
    }), item, kinds, imageWidth, true);
    const card = el(
      "article",
      {
        class: "card media-interactive" + (resume ? " resume-card" : ""),
        role: "button",
        tabindex: 0,
        "data-id": item.Id,
        "data-type": item.Type,
        ...(typeof item.UserData?.IsFavorite === "boolean" ? {"data-favorite": String(item.UserData.IsFavorite)} : {}),
        "data-folder": !!item.IsFolder,
        "aria-label": item.Name,
      },
      [
        img,
        ...(item.ShowEpisodeCount !== false && ["Series", "Season"].includes(item.Type) && Number(item.RecursiveItemCount) > 0
          ? [el("span", {class:"episode-count", "aria-label":`${item.RecursiveItemCount} 集`}, `${item.RecursiveItemCount} 集`)] : []),
        el("div", {class: "poster-caption"}, [el("strong", {}, item.Name),
        el(
          "span",
          { class: "muted" },
          item.Type === "Season"
            ? `第 ${item.IndexNumber ?? ""} 季`
            : item.Type === "Episode"
              ? `第 ${item.IndexNumber ?? ""} 集`
              : [item.ProductionYear, item.CommunityRating ? "★ " + item.CommunityRating : ""].filter(Boolean).join(" · "),
        ),
        ]),
      ],
    );
    card.onclick = run(() => open(item));
    img.draggable = false;
    card.addEventListener("dragstart", e => e.preventDefault());
    card.addEventListener("dblclick", e => e.preventDefault());
    card.addEventListener("contextmenu", e => { e.preventDefault(); if (!matchMedia("(max-width: 600px)").matches) card.focus({preventScroll:true}); });
    card.onkeydown = (e) => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        card.click();
      }
    };
    const pct = item.UserData?.PlayedPercentage;
    if (pct > 0)
      card.append(
        el("progress", { max: 100, value: pct, "aria-label": "观看进度" }),
      );
    decorateCard(card, item, resume);
    return card;
  }
  function LibraryCard(item, open) {
    const c = PosterCard(item, open, false, 640);
    c.classList.add("library-card");
    c.setAttribute("x-glass-text", "");
    c.querySelector(".poster-caption")?.classList.add("glass-caption");
    return c;
  }
  function MediaShelf(title, items, open, more, library = false, resume = false) {
    if (typeof Themes !== "undefined" && Themes.has("MediaShelf")) return Themes.render("MediaShelf", title, items, open, more, library, resume);
    const head = el("div", { class: "section-heading" }, el("h2", {}, title));
    if (more)
      head.append(
        el("button", { class: "text-button", onclick: run(more) }, "查看全部"),
      );
    const shelf = el(
      "div",
      {
        class: "media-shelf" + (library ? " library-shelf" : ""),
        "aria-label": title,
      },
      items.map((x) => library ? LibraryCard(x, open) : PosterCard(x, open, resume)),
    );
    return el("section", { class: "shelf-section" }, [
      head,
      items.length ? bindMediaShelf(shelf) : el("p", { class: "empty" }, "暂无媒体"),
    ]);
  }
  function Modal(title, content) {
    const d = el("dialog", { "aria-label": title }, [
      el("div", { class: "section-heading" }, [
        el("h2", {}, title),
        IconButton("关闭", "close", () => d.close()),
      ]),
      content,
    ]);
    d.addEventListener("close", () => d.remove(), { once: true });
    document.body.append(d);
    d.showModal();
    return d;
  }
  // CSS owns motion; RAF only aligns the initial style with the browser frame.
  function menuMotion(panel, dragging = false) {
    panel._menuMotionRelease?.();
    panel.style.willChange = "transform, opacity";
    const release = event => {
      if (event && event.target !== panel) return;
      clearTimeout(timer); panel.style.removeProperty("will-change");
      panel.removeEventListener("transitionend", release);
      cancelAnimationFrame(checkFrame);
      delete panel._menuMotionRelease;
    };
    const timer = dragging ? null : setTimeout(release, 420);
    const checkFrame = dragging ? null : requestAnimationFrame(() => { if (!panel.getAnimations().some(a => a.transitionProperty)) release(); });
    panel._menuMotionRelease = release;
    panel.addEventListener("transitionend", release);
  }
  // Shared axis lock; touchmove reserves only downward dismissal, leaving native pan-y intact.
  function bindMenuGesture(panel, { axis = "y", close = () => panel.close(), backdrop = null } = {}) {
    if (panel._menuGestureCleanup) return panel._menuGestureCleanup;
    const horizontal = axis === "x";
    let drag = null, suppressClick = false;
    const reset = () => {
      menuMotion(panel);
      panel.classList.remove("is-dragging");
      panel.style.removeProperty("transform");
      panel.style.removeProperty("opacity");
      backdrop?.style.removeProperty("opacity");
      backdrop?.style.removeProperty("transition");
    };
    const coordinate = e => horizontal ? -e.clientX : e.clientY;
    const onDown = e => {
      if (!horizontal && (matchMedia("(min-width: 601px)").matches || (e.pointerType === "touch" && !e.sheetTouch))) return;
      suppressClick = false;
      if (e.pointerType === "mouse" || !e.isPrimary || drag || panel.classList.contains("is-closing")) return;
      if (horizontal && !document.body.classList.contains("drawer-open")) return;
      if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      const bounds = panel.getBoundingClientRect();
      if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) return;
      const top = !!e.target.closest(".sheet-heading, .sheet-drag-indicator, .account-menu-header");
      const scrollers = [];
      if (!horizontal && !top) {
        for (let node = e.target; node && panel.contains(node); node = node.parentElement) {
          if (/auto|scroll/.test(getComputedStyle(node).overflowY)) scrollers.push(node);
        }
      }
      if (scrollers.some(node => node.scrollTop > 0)) return;
      drag = { id: e.pointerId, start: coordinate(e), cross: horizontal ? e.clientY : e.clientX,
        last: coordinate(e), time: e.timeStamp, velocity: 0, distance: 0, active: false, lockedAxis: null, scrollers,
        size: horizontal ? bounds.width : bounds.height };
    };
    const onMove = e => {
      if (!horizontal && e.pointerType === "touch" && !e.sheetTouch) return;
      if (!drag || drag.id !== e.pointerId) return;
      const value = coordinate(e), distance = Math.max(0, value - drag.start);
      if (!drag.active) {
        if (drag.scrollers.some(node => node.scrollTop > 0)) {
          drag.start = drag.last = value;
          drag.cross = horizontal ? e.clientY : e.clientX;
          drag.time = e.timeStamp;
          return;
        }
        const cross = Math.abs((horizontal ? e.clientY : e.clientX) - drag.cross);
        const primary = value - drag.start;
        if (Math.max(Math.abs(primary), cross) < 8) return;
        if (!drag.lockedAxis) {
          if (cross >= Math.abs(primary) || primary < 0) { drag = null; return; }
          drag.lockedAxis = axis;
        }
        if (distance < 8) return;
        drag.active = true;
        menuMotion(panel, true);
        panel.classList.add("is-dragging");
        backdrop?.style.setProperty("transition", "none");
        if (!e.sheetTouch) panel.setPointerCapture(e.pointerId);
      }
      e.preventDefault();
      const elapsed = e.timeStamp - drag.time;
      if (elapsed > 0) drag.velocity = (value - drag.last) / elapsed;
      drag.last = value; drag.time = e.timeStamp;
      drag.distance = Math.min(distance, drag.size);
      panel.style.transform = horizontal ? `translate3d(${-drag.distance}px,0,0)` : `translate3d(0,${drag.distance}px,0)`;
      panel.style.opacity = String(1 - .04 * drag.distance / drag.size);
      backdrop?.style.setProperty("opacity", String(1 - drag.distance / drag.size));
    };
    const finish = (e, cancel = false) => {
      if (!drag || drag.id !== e.pointerId) return;
      if (!horizontal && e.pointerType === "touch" && !e.sheetTouch) return;
      const current = drag;
      drag = null;
      if (!e.sheetTouch && panel.hasPointerCapture(e.pointerId)) panel.releasePointerCapture(e.pointerId);
      if (!current.active) return;
      suppressClick = true;
      const dismiss = !cancel && (current.distance > current.size * .25 || current.distance > (horizontal ? 100 : 110) ||
        (current.distance > 24 && e.timeStamp - current.time < 100 && current.velocity > .6));
      if (dismiss) {
        // Keep the live drag position as the transition's start value.
        panel.classList.remove("is-dragging");
        void panel.getBoundingClientRect();
        close();
        panel.style.removeProperty("transform");
        panel.style.removeProperty("opacity");
        backdrop?.style.removeProperty("opacity");
        backdrop?.style.removeProperty("transition");
        menuMotion(panel);
      } else reset();
    };
    // Pointer events are cancelled when the browser takes native scrolling. Keep the
    // same state machine on touch events so content can use pan-y at every scroll position.
    const touchEvent = (event, touch) => ({
      sheetTouch: true, pointerType: "touch", pointerId: touch.identifier, isPrimary: true,
      clientX: touch.clientX, clientY: touch.clientY, target: event.target,
      timeStamp: event.timeStamp, preventDefault: () => event.preventDefault(),
    });
    const cancelTouch = e => {
      if (drag) finish({...touchEvent(e, e.touches[0]), pointerId:drag.id}, true);
    };
    const onTouchStart = e => {
      if (e.touches.length !== 1) { cancelTouch(e); return; }
      onDown(touchEvent(e, e.touches[0]));
    };
    const onTouchMove = e => {
      if (!e.cancelable) { cancelTouch(e); return; }
      for (const touch of e.changedTouches) onMove(touchEvent(e, touch));
    };
    const onTouchEnd = e => {
      for (const touch of e.changedTouches) finish(touchEvent(e, touch), e.type === "touchcancel");
    };
    if (!horizontal) {
      panel.addEventListener("touchstart", onTouchStart, {passive:true});
      panel.addEventListener("touchmove", onTouchMove, {passive:false});
      panel.addEventListener("touchend", onTouchEnd);
      panel.addEventListener("touchcancel", onTouchEnd);
    }
    const onUp = e => finish(e);
    const onCancel = e => finish(e, true);
    const onClick = e => {
      if (suppressClick && e.detail > 0) { suppressClick = false; e.preventDefault(); e.stopImmediatePropagation(); }
    };
    panel.addEventListener("pointerdown", onDown);
    panel.addEventListener("pointermove", onMove, { passive: false });
    panel.addEventListener("pointerup", onUp);
    panel.addEventListener("pointercancel", onCancel);
    panel.addEventListener("click", onClick, true);
    const cleanup = () => {
      drag = null; reset(); panel._menuMotionRelease?.();
      panel.removeEventListener("touchstart", onTouchStart);
      panel.removeEventListener("touchmove", onTouchMove);
      panel.removeEventListener("touchend", onTouchEnd);
      panel.removeEventListener("touchcancel", onTouchEnd);
      panel.removeEventListener("pointerdown", onDown);
      panel.removeEventListener("pointermove", onMove);
      panel.removeEventListener("pointerup", onUp);
      panel.removeEventListener("pointercancel", onCancel);
      panel.removeEventListener("click", onClick, true);
      panel.removeEventListener("close", onClose);
      delete panel._menuGestureCleanup;
    };
    panel._menuGestureCleanup = cleanup;
    const onClose = () => { if (!panel.open) cleanup(); };
    panel.addEventListener("close", onClose);
    return cleanup;
  }
  // One placement calculation for modal sheets and file/poster popovers.
  function positionMenu(panel, trigger, position = null) {
    const anchor = trigger?.isConnected && trigger !== document.body && trigger !== document.documentElement
      ? trigger.getBoundingClientRect() : position;
    const width = panel.offsetWidth, height = panel.offsetHeight;
    const x = position?.clientX ?? anchor?.left ?? (innerWidth - width) / 2;
    const y = position?.clientY ?? anchor?.bottom ?? (innerHeight - height) / 2;
    const left = Math.max(12, Math.min(x, innerWidth - width - 12));
    const below = y + 8;
    const top = Math.max(12, Math.min(below + height > innerHeight - 12 && anchor?.top >= height + 20
      ? anchor.top - height - 8 : below, innerHeight - height - 12));
    panel.style.left = left + "px";
    panel.style.top = top + "px";
    panel.style.transformOrigin = `${Math.max(0, Math.min(width, (position?.clientX ?? (anchor ? anchor.left + anchor.width / 2 : x + width / 2)) - left))}px ${Math.max(0, Math.min(height, y - top))}px`;
  }
  // Shared motion and gesture for both disposable sheets and #modal forms.
  function prepareBottomSheet(d, {reusable = false, trigger = null} = {}) {
    if (d._sheetMotionCleanup) return d;
    trigger ||= (pointerFocus && menuTrigger?.isConnected ? menuTrigger : document.activeElement);
    if (trigger === document.body || trigger === d || d.contains(trigger)) trigger = null;
    GlassCard(d, "dialog");
    d.classList.add("bottom-sheet");
    if (reusable && !d.querySelector(".sheet-heading")) {
      const heading = el("div", {class:"sheet-heading"});
      const title = d.querySelector("h2");
      if (title) { heading.append(title); d.setAttribute("aria-label", title.textContent); }
      d.prepend(el("span", {class:"sheet-drag-indicator", "aria-hidden":"true"}), heading);
    }
    const backgroundScroll = {left:scrollX, top:scrollY};
    const nativeClose = d.close.bind(d), nativeShow = d.showModal.bind(d);
    let closing = false, fallback, enterFrame;
    const place = () => {
      if (matchMedia("(min-width: 601px)").matches) {
        d._menuGestureCleanup?.(); positionMenu(d, trigger);
      } else {
        d.style.removeProperty("left"); d.style.removeProperty("top"); d.style.removeProperty("transform-origin");
        bindMenuGesture(d);
      }
    };
    const resize = new ResizeObserver(() => { if (d.open) place(); });
    resize.observe(d);
    window.addEventListener("resize", place);
    const enter = () => {
      place(); menuMotion(d); void d.getBoundingClientRect();
      enterFrame = requestAnimationFrame(() => { enterFrame = requestAnimationFrame(() => { d.classList.remove("is-entering"); menuMotion(d); }); });
    };
    d.showModal = () => { d.classList.add("is-entering"); nativeShow(); enter(); };
    const finish = () => { clearTimeout(fallback); nativeClose(); if (reusable) cleanup(); };
    d.close = () => {
      if (closing || !d.open) return;
      closing = true;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
      cancelAnimationFrame(enterFrame); d.classList.remove("is-entering");
      menuMotion(d); d.classList.add("is-closing");
      fallback = setTimeout(finish, 420);
    };
    const onAnimation = e => {
      if (closing && e.target === d && e.propertyName === "transform") finish();
    };
    const onCancel = e => { e.preventDefault(); if (reusable) e.stopImmediatePropagation(); d.close(); };
    const onClick = e => {
      if (closing) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      const bounds = d.getBoundingClientRect();
      if (e.target === d && (e.clientY < bounds.top || e.clientY > bounds.bottom || e.clientX < bounds.left || e.clientX > bounds.right)) d.close();
    };
    d.addEventListener("transitionend", onAnimation);
    d.addEventListener("cancel", onCancel, {capture:reusable});
    d.addEventListener("click", onClick, true);
    const cleanup = () => {
      clearTimeout(fallback);
      resize.disconnect(); window.removeEventListener("resize", place);
      d.style.removeProperty("left"); d.style.removeProperty("top"); d.style.removeProperty("transform-origin");
      cancelAnimationFrame(enterFrame); d._menuMotionRelease?.();
      d.close = nativeClose; d.showModal = nativeShow;
      d.removeEventListener("transitionend", onAnimation);
      d.removeEventListener("cancel", onCancel, {capture:reusable});
      d.removeEventListener("click", onClick, true);
      d.removeEventListener("close", onClose);
      d._menuGestureCleanup?.();
      delete d._sheetMotionCleanup;
      if (reusable) { d.className = ""; d.replaceChildren(); d.removeAttribute("aria-label"); } else d.remove();
      if (trigger?.isConnected && (!trigger.closest("dialog") || trigger.closest("dialog").open)) trigger.focus({preventScroll:true});
      // WebKit can scroll the background when native dialog focus is restored.
      if (scrollX !== backgroundScroll.left || scrollY !== backgroundScroll.top) window.scrollTo({...backgroundScroll, behavior:"instant"});
      // WebKit may apply native focus scrolling after the close event, especially
      // when reduced motion makes close synchronous. Restore before next paint.
      requestAnimationFrame(() => { if (!document.querySelector("dialog[open]")) window.scrollTo({...backgroundScroll, behavior:"instant"}); });
    };
    d._sheetMotionCleanup = cleanup;
    const onClose = () => { if (!d.open) cleanup(); };
    d.addEventListener("close", onClose);
    if (d.open) { d.classList.add("is-entering"); enter(); }
    else if (!matchMedia("(min-width: 601px)").matches) bindMenuGesture(d);
    return d;
  }
  function sheetLevel(content, direction = 1) {
    content._levelCleanup?.();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cleanup = event => {
      if (event && event.target !== content) return;
      content.classList.remove("sheet-level-enter");
      content.style.removeProperty("--sheet-level-offset");
      content.removeEventListener("animationend", cleanup);
      delete content._levelCleanup;
    };
    content._levelCleanup = cleanup;
    content.style.setProperty("--sheet-level-offset", `${direction * 22}px`);
    void content.getBoundingClientRect();
    content.classList.add("sheet-level-enter");
    content.addEventListener("animationend", cleanup);
  }
  function prepareScraperSheet(dialog, scope = false, trigger = null) {
    dialog.classList.add('settings-sheet', scope ? 'scraper-scope-sheet' : 'scraper-settings-sheet');
    const form = dialog.querySelector('.fm-form, .scraper-key-form');
    if (form) {
      const actions = form.querySelector('.form-actions');
      const body = el('div', {class:'scraper-sheet-body'});
      [...form.childNodes].filter(node => node !== actions).forEach(node => body.append(node));
      form.prepend(body);
    }
    if (!dialog.classList.contains('bottom-sheet')) {
      prepareBottomSheet(dialog, {reusable:true, trigger});
      const back = form?.querySelector('.form-actions button[type="button"]');
      if (back) { back.removeAttribute('onclick'); back.textContent = scope ? '返回' : '取消'; back.onclick = () => dialog.close(); }
    }
    dialog.setAttribute('aria-label', dialog.querySelector('h2').textContent);
    dialog.tabIndex = -1;
    if (!dialog.contains(document.activeElement)) {
      (dialog.querySelector('button:not(:disabled), input:not(:disabled), select') || dialog).focus({preventScroll:true});
    }
    if (trigger && dialog.id !== 'modal') dialog.addEventListener('close', () => {
      if (trigger.isConnected && (!trigger.closest('dialog') || trigger.closest('dialog').open)) trigger.focus({preventScroll:true});
    }, {once:true});
    return dialog;
  }
  function LinkedSettingsSwitch(title, note, attr, name, checked) {
    const button = el('button', {type:'button', class:'scraper-setting-main scraper-setting-link', [attr]:''},
      el('span', {class:'scraper-setting-title'}, title));
    button.querySelector('span').insertAdjacentHTML('beforeend', SettingsChevron());
    const control = Switch(checked, () => {});
    control.name = name; control.setAttribute('aria-label', title);
    if (checked) control.setAttribute('checked', '');
    return el('div', {class:'settings-option'}, [el('div', {class:'settings-option-row'}, [button, control]),
      el('p', {class:'settings-option-help'}, note)]).outerHTML;
  }
  function SettingsLink(title, note, attr, value = '', variant = '', action = null) {
    if (action) {
      const select = el('button', {type:'button', class:'secondary scraper-folder scraper-setting-title', [attr]:''}, title);
      select.insertAdjacentHTML('beforeend', SettingsChevron());
      const icon = IconButton(action.label, action.icon, () => {}, 'setting');
      icon.setAttribute(action.attr, '');
      return el('div', {class:'scraper-setting-row', 'data-settings-action-row':''}, [
        el('span', {class:'scraper-setting-main'}, [el('span', {class:'scraper-setting-title'}, [select, icon]), el('small', {class:'scraper-setting-note'}, note)]),
        el('span', {class:'scraper-setting-value'}, value),
        action.switch ? (() => { const toggle = Switch(action.switch.checked, () => {}); toggle.name = action.switch.name; toggle.setAttribute('aria-label', action.switch.label); if (action.switch.checked) toggle.setAttribute('checked', ''); return toggle; })() : null
      ]).outerHTML;
    }
    const button = el('button', {type:'button', class:'scraper-setting-row scraper-setting-link' + (variant ? ' scraper-setting-link--' + variant : ''), [attr]:''}, [
      el('span', {class:'scraper-setting-main'}, [el('span', {class:'scraper-setting-title'}, title), el('small', {class:'scraper-setting-note'}, note)]),
      el('span', {class:'scraper-setting-value'}, value)
    ]);
    const decoration = MenuIcon({label:title});
    button.prepend(decoration);
    button.querySelector('.scraper-setting-title').insertAdjacentHTML('beforeend', SettingsChevron());
    return button.outerHTML;
  }
  function SettingsToggle(title, note, name, checked) {
    const input = el('input', {class:'switch scraper-setting-control', role:'switch', 'aria-label':title, type:'checkbox', name});
    if (checked) input.setAttribute('checked', '');
    const decoration = MenuIcon({label:title});
    return el('label', {class:'scraper-setting-row'}, [decoration, el('span', {class:'scraper-setting-main'}, [el('span', {class:'scraper-setting-title'}, title), note ? el('small', {class:'scraper-setting-note'}, note) : null]), input]).outerHTML;
  }
  // Shared row for indexed scope trees and filesystem directory selection.
  function DirectoryRow({name, path, checked = false, single = false, choiceIcon = '', select, expand}) {
    const row = Choice(el('div', {class:'scraper-tree-line' + (choiceIcon ? ' scraper-tree-line--choice' : '')}));
    const input = el('input', {type:single ? 'radio' : 'checkbox', 'aria-label':'选择目录'});
    input.checked = checked;
    input.onchange = () => select(input.checked);
    const title = expand
      ? el('button', {type:'button', class:'secondary scraper-folder scraper-setting-title', 'aria-label':'展开子目录', 'aria-expanded':'false'}, [el('span', {}, name), el('small', {}, path)])
      : el('span', {}, name);
    if (expand) { title.insertAdjacentHTML('beforeend', SettingsChevron()); title.onclick = run(() => expand(title)); }
    const text = el('span', {class:'scraper-directory-text'}, expand ? [title] : [title, el('small', {}, path)]);
    const selection = el(expand ? 'div' : 'label', {class:'scraper-directory-selection'}, [input, text]);
    if (choiceIcon) {
      selection.insertAdjacentHTML('afterbegin', DecorativeIcon(choiceIcon, name));
    }
    row.append(selection);
    return {row, input, expand:title};
  }
  function BottomSheet(title, content, options = {}) {
    const variant = options.variant || "compact-list";
    const d = el("dialog", { class: "bottom-sheet bottom-sheet--" + variant, "aria-label": title });
    const heading = el("div", { class: "sheet-heading" }, [el("h2", {}, title)]);
    if (variant === "account-menu") d.append(content);
    else d.append(el("span", { class: "sheet-drag-indicator", "aria-hidden": "true" }), heading, content);
    if (variant === "user-menu" || variant === "account-menu") d.tabIndex = -1;
    document.body.append(d);
    prepareBottomSheet(d, {trigger:options.trigger});
    d.showModal();
    if (variant === "user-menu" || variant === "account-menu") d.focus({ preventScroll: true });
    return d;
  }
  function ImageCropper(file, options) {
    const avatar = options.variant === "avatar";
    const libraryCover = options.variant === "library-cover";
    const width = 320, height = libraryCover ? 160 : avatar ? 320 : 180;
    const crop = libraryCover ? {x:19,y:20,w:282,h:120} : avatar ? {x:32,y:32,w:256,h:256} : {x:16,y:9,w:288,h:162};
    const titleText = options.title || (avatar ? "上传头像" : "上传收藏封面");
    const d = el("dialog", {class:"image-cropper image-cropper--sheet", "aria-label":titleText});
    const title = el("h2", {}, titleText);
    const canvas = el("canvas", {width, height, class:"image-cropper-canvas image-cropper-mask", "aria-label":"拖动图片调整裁剪位置"});
    const stage = el("div", {class:"image-cropper-stage"}, canvas);
    const slider = el("input", {type:"range", min:"1", max:"3", step:"0.01", value:"1", "aria-label":"缩放图片"});
    const decrease = el("button", {type:"button", class:"secondary", "aria-label":"缩小图片"}, "−");
    const increase = el("button", {type:"button", class:"secondary", "aria-label":"放大图片"}, "+");
    const zoom = el("div", {class:"image-cropper-zoom"}, [decrease, slider, increase]);
    const rotate = el("button", {type:"button", class:"secondary"}, "旋转");
    const reset = el("button", {type:"button", class:"secondary"}, "重置");
    const tools = el("div", {class:"image-cropper-toolbar"}, avatar ? [reset] : [rotate,reset]);
    const cancel = el("button", {type:"button", class:"secondary"}, "取消");
    const remove = el("button", {type:"button", class:"image-cropper-remove"}, "移除封面");
    remove.disabled = !options.hasCover;
    const upload = el("button", {type:"button"}, avatar ? "上传头像" : "上传封面");
    const actions = el("div", {class:"image-cropper-actions"}, avatar || !options.onRemove ? [cancel,upload] : [upload,remove]);
    d.append(title,stage,zoom,tools,actions);
    let image = null, sourceURL = null, angle = 0, scale = 1, dx = 0, dy = 0, drag = null;
    const baseSize = () => {
      if (!image) return 1;
      const iw = angle % 180 ? image.naturalHeight : image.naturalWidth;
      const ih = angle % 180 ? image.naturalWidth : image.naturalHeight;
      return Math.max(crop.w / iw, crop.h / ih);
    };
    const drawImage = ctx => {
      const size = baseSize() * scale;
      ctx.save(); ctx.translate(width/2+dx,height/2+dy); ctx.rotate(angle*Math.PI/180);
      ctx.drawImage(image,-image.naturalWidth*size/2,-image.naturalHeight*size/2,image.naturalWidth*size,image.naturalHeight*size);
      ctx.restore();
    };
    const clamp = () => {
      if (!image) return;
      const size = baseSize()*scale;
      const iw = (angle%180 ? image.naturalHeight : image.naturalWidth)*size;
      const ih = (angle%180 ? image.naturalWidth : image.naturalHeight)*size;
      dx = Math.max(-(iw-crop.w)/2,Math.min((iw-crop.w)/2,dx));
      dy = Math.max(-(ih-crop.h)/2,Math.min((ih-crop.h)/2,dy));
    };
    const render = () => {
      const ctx = canvas.getContext("2d"); ctx.clearRect(0,0,width,height);
      if (!image) {
        ctx.fillStyle = getComputedStyle(d).getPropertyValue("--surface-2");ctx.fillRect(0,0,width,height);
        ctx.fillStyle = getComputedStyle(d).getPropertyValue("--text-secondary");ctx.font = "14px sans-serif";
        ctx.textAlign="center";ctx.fillText("点击上传封面选择图片",width/2,height/2);return;
      }
      clamp(); drawImage(ctx);
      ctx.fillStyle = "rgba(0,0,0,.56)";
      ctx.beginPath();ctx.rect(0,0,width,height);
      if (avatar) ctx.arc(width/2,height/2,crop.w/2,0,Math.PI*2,true);
      else ctx.rect(crop.x,crop.y,crop.w,crop.h);
      ctx.fill("evenodd");
      ctx.beginPath();
      if (avatar) ctx.arc(width/2,height/2,crop.w/2,0,Math.PI*2);
      else ctx.rect(crop.x,crop.y,crop.w,crop.h);
      ctx.strokeStyle="rgba(255,255,255,.92)";ctx.lineWidth=2;ctx.stroke();
    };
    const setFile = async selected => {
      if (!selected || !["image/jpeg","image/png","image/webp"].includes(selected.type) || selected.size > 5*1024*1024) throw Error("仅支持 5MB 内的 JPEG、PNG、WebP 图片");
      const url = URL.createObjectURL(selected), img = new Image(); img.src = url;
      try { await img.decode(); } catch { URL.revokeObjectURL(url); throw Error("图片无法读取"); }
      if (sourceURL) URL.revokeObjectURL(sourceURL);
      sourceURL=url; image=img; angle=0; scale=1; dx=dy=0; slider.value="1"; render();
    };
    const picker = el("input", {type:"file", accept:"image/jpeg,image/png,image/webp", hidden:""});
    picker.addEventListener("change", async () => { try { await setFile(picker.files?.[0]); } catch(e) { Toast(e.message, {type:"warning"}); } picker.value=""; });
    d.append(picker);
    stage.addEventListener("click",()=>{if(!image)picker.click();});
    const close = () => d.close();
    d.addEventListener("cancel", e => { e.preventDefault(); close(); });
    d.addEventListener("click", e => { if (e.target === d) close(); });
    d.addEventListener("close", () => { if (sourceURL) URL.revokeObjectURL(sourceURL); d.remove(); }, {once:true});
    cancel.onclick=close;
    decrease.onclick=()=>{slider.value=String(Math.max(1,Number(slider.value)-.1));scale=Number(slider.value);render();};
    increase.onclick=()=>{slider.value=String(Math.min(3,Number(slider.value)+.1));scale=Number(slider.value);render();};
    slider.oninput=()=>{scale=Number(slider.value);render();};
    rotate.onclick=()=>{angle=(angle+90)%360;dx=dy=0;render();};
    reset.onclick=()=>{angle=0;scale=1;dx=dy=0;slider.value="1";render();};
    canvas.addEventListener("pointerdown", e=>{if (!image) return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx,dy};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener("pointermove", e=>{if (!drag || drag.id!==e.pointerId)return;const factor=width/canvas.getBoundingClientRect().width;dx=drag.dx+(e.clientX-drag.x)*factor;dy=drag.dy+(e.clientY-drag.y)*factor;render();});
    for (const event of ["pointerup","pointercancel","lostpointercapture"]) canvas.addEventListener(event,()=>{drag=null;});
    upload.onclick=async()=>{
      if (!image) { picker.click(); return; }
      const output=el("canvas", {width:options.outputWidth||512,height:options.outputHeight||512});
      const ctx=output.getContext("2d"); ctx.fillStyle="#fff";ctx.fillRect(0,0,output.width,output.height);
      ctx.scale(output.width/crop.w,output.height/crop.h);ctx.translate(-crop.x,-crop.y);drawImage(ctx);
      const outputType=libraryCover ? "image/png" : "image/webp";
      const blob=await new Promise(resolve=>output.toBlob(resolve,outputType,.9));
      if (!blob) { Toast("图片处理失败", {type:"error"});return; }
      upload.disabled=true;
      try { await options.onUpload(new File([blob],libraryCover ? "image.png" : "image.webp",{type:outputType})); close(); }
      catch(e) { Toast(e.message, {type:"error"}); }
      finally { upload.disabled=false; }
    };
    remove.onclick=async()=>{remove.disabled=true;try{await options.onRemove();close();}catch(e){Toast(e.message,{type:"error"});remove.disabled=false;}};
    document.body.append(d);d.showModal();render();
    if (file) setFile(file).catch(e=>{Toast(e.message,{type:"warning"});close();});
    return d;
  }
  function menuActionIcon(action) {
    if (action.icon) return action.icon;
    const label = action.label || '';
    const name = /取消|返回/.test(label) ? 'back' : /删除|移除|清空|清除/.test(label) ? 'trash' : /重试|刷新|重新|同步/.test(label) ? 'refresh' : /暂停/.test(label) ? 'pause' : /停止/.test(label) ? 'stop' : /播放|开始|继续/.test(label) ? 'play' : /下载/.test(label) ? 'download' : /编辑|修改|重命名/.test(label) ? 'rename' : /目录|文件夹/.test(label) ? 'folder' : /用户|账户|个人/.test(label) ? 'user' : /设置|管理/.test(label) ? 'gear' : /详情|信息/.test(label) ? 'eye' : /复制/.test(label) ? 'copy' : /收藏/.test(label) ? 'star' : /关闭/.test(label) ? 'close' : 'versions';
    return icons[name] || icons.versions;
  }
  // Only text-leading decorations opt in; controls and business SVGs stay untouched.
  function MenuIcon(action, className = 'action-menu-icon') {
    const label = action.label || '';
    const tone = action.danger || /删除|移除|清空|清除|退出|注销|停止/.test(label) ? 'danger'
      : /成功|完成|确认|保存|启用/.test(label) ? 'success'
      : /刮削|TMDB|识别|元数据/.test(label) ? 'scraper'
      : /媒体|影库|播放|字幕|封面|下载|文件|目录|缓存/.test(label) ? 'media' : 'settings';
    const icon = el('span', {class:className + ' ui-setting-icon', 'data-icon-tone':tone, 'aria-hidden':'true'});
    icon.innerHTML = menuActionIcon(action);
    return icon;
  }
  function DecorativeIcon(svg, label, danger = false) {
    return MenuIcon({icon:svg, label, danger}).outerHTML;
  }
  function actionMenuButton(action, className) {
    const button = el("button", {type:"button", class:className, onclick:run(action.action)});
    button.disabled = !!action.disabled;
    {
      const icon = MenuIcon(action);
      button.append(icon);
    }
    button.append(el("span", {}, action.label));
    return button;
  }
  function ContextMenu(title, actions, position, existing = null, onClose = () => {}) {
    if (existing?.matches(":popover-open")) { existing._contextReopen?.(); return existing; }
    document.querySelectorAll('.context-menu, .fm-pop:popover-open').forEach(menu => menu.close());
    const menu = existing || el("div", {class:"context-menu", popover:"manual", role:"menu", "aria-label":title},
      actions.map(a => actionMenuButton(a, "context-menu-item" + (a.danger ? " context-menu-item--danger" : ""))));
    GlassCard(menu, "dialog");
    menu.querySelectorAll("button").forEach(button => button.setAttribute("role", "menuitem"));
    menu.setAttribute("popover", "manual");
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", title);
    const trigger = pointerFocus && menuTrigger?.isConnected ? menuTrigger : document.activeElement;
    const abort = new AbortController();
    let closed = false, closing = false, closeTimer, enterFrame;
    const observer = new MutationObserver(() => { if (!trigger?.isConnected || !menu.isConnected) menu.close(); });
    observer.observe(document.body, {childList:true, subtree:true});
    const cleanup = () => {
      if (closed) return;
      closed = true; clearTimeout(closeTimer); cancelAnimationFrame(enterFrame);
      menu.classList.remove("is-entering", "is-closing"); menu._menuMotionRelease?.();
      menu.style.removeProperty("transform-origin");
      delete menu._contextReopen;
      abort.abort(); observer.disconnect(); resize.disconnect(); onClose();
      mountToastStack();
      if (!existing) menu.remove();
      else {
        menu.removeAttribute("popover");
        menu.style.removeProperty("left"); menu.style.removeProperty("top");
      }
      if (trigger?.isConnected && menu.contains(document.activeElement)) trigger.focus({preventScroll:true});
    };
    const finish = () => { menu.hidePopover(); cleanup(); };
    menu._contextReopen = () => {
      if (!closing) return;
      closing = false; clearTimeout(closeTimer);
      menuMotion(menu); menu.classList.remove("is-closing");
      menu.querySelector('button')?.focus({preventScroll:true});
    };
    menu.addEventListener("transitionend", event => {
      if (closing && event.target === menu && event.propertyName === "transform") finish();
    }, {signal:abort.signal});
    menu.close = () => {
      if (closed || closing) return;
      closing = true;
      cancelAnimationFrame(enterFrame);
      menu.classList.remove("is-entering");
      // Restore focus before hiding/removing the focused menu, including reduced motion.
      if (menu.contains(document.activeElement) && trigger?.isConnected) trigger.focus({preventScroll:true});
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) { finish(); return; }
      menuMotion(menu); menu.classList.add("is-closing");
      closeTimer = setTimeout(finish, 300);
    };
    menu.addEventListener("click", event => {
      if (closing) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      if (event.target.closest('button')) menu.close();
    }, {capture:true, signal:abort.signal});
    document.addEventListener("pointerdown", event => { if (!menu.contains(event.target) && !(existing && trigger?.contains(event.target))) menu.close(); }, {capture:true, signal:abort.signal});
    document.addEventListener("keydown", event => { if (event.key === "Escape" || event.key === "Tab") { if (event.key === "Escape") event.preventDefault(); menu.close(); } }, {signal:abort.signal});
    menu.addEventListener("toggle", event => {
      if (event.newState === "closed" && !menu.matches(":popover-open")) cleanup();
    }, {signal:abort.signal});
    document.addEventListener("scroll", event => { if (!menu.contains(event.target)) menu.close(); }, {capture:true, passive:true, signal:abort.signal});
    const place = () => positionMenu(menu, trigger, position);
    const resize = new ResizeObserver(place); resize.observe(menu);
    window.addEventListener("resize", place, {signal:abort.signal});
    menu.addEventListener("keydown", event => {
      const buttons = [...menu.querySelectorAll('button')];
      const index = buttons.indexOf(document.activeElement);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); buttons[(index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length]?.focus();
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault(); buttons[event.key === "Home" ? 0 : buttons.length - 1]?.focus();
      }
    }, {signal:abort.signal});
    if (!existing) document.body.append(menu);
    menu.classList.add("is-entering");
    menu.showPopover(); mountToastStack(); place(); menuMotion(menu); void menu.offsetWidth;
    enterFrame = requestAnimationFrame(() => { enterFrame = requestAnimationFrame(() => menu.classList.remove("is-entering")); });
    menu.querySelector('button')?.focus({preventScroll:true});
    return menu;
  }
  function ActionSheet(title, actions, content = null, options = {}) {
    if (options.variant === "account-menu") {
      const profile = options.profile || {};
      const avatar = el("button", { class: "account-menu-avatar", type: "button", "aria-label": "上传头像", title: "上传头像" },
        String(profile.name || "用").trim().slice(0, 1).toUpperCase());
      const input = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp", hidden: "" });
      const showAvatar = url => {
        if (!url) { avatar.textContent=String(profile.name || "用").trim().slice(0, 1).toUpperCase(); return; }
        const img = el("img", { class: "account-menu-avatar-image", alt: "" });
        img.src = url;
        avatar.replaceChildren(img);
      };
      showAvatar(profile.avatar?.objectURL);
      profile.avatar?.listeners.add(showAvatar);
      avatar.addEventListener("click", () => input.click());
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error("仅支持 5MB 内的 JPEG、PNG、WebP 图片");
          ImageCropper(file, {variant:"avatar", onUpload:async cropped=>{
            await profile.uploadAvatar(cropped);
            Toast("头像上传成功", {type:"success", message:"已保存到 images-tx"});
          }});
        } catch (error) { Toast(error.message, {type:"warning"}); }
        input.value = "";
      });
      Promise.resolve(profile.loadAvatar?.()).catch(() => {});
      const identity = el("div", { class: "account-menu-identity" }, [
        el("strong", {}, profile.name || "用户"),
        el("small", {}, profile.server || "MACA"),
      ]);
      const header = el("div", { class: "account-menu-header" }, [avatar, identity, input]);
      const actionRows = new Map();
      const rows = actions.map(a => {
        const button = el("button", {
          type: "button",
          class: "account-menu-item" + (a.danger ? " account-menu-item--danger" : ""),
          'x-data': 'accountAction',
          'x-on:click': 'activate()',
          'x-bind:disabled': 'busy',
        });
        button._accountAction = a.action;
        button.hidden = !!a.hidden;
        if (a.key) actionRows.set(a.key, button);
        const icon = MenuIcon(a, "account-menu-icon");
        button.append(icon, el("span", { class: "account-menu-label" }, a.label));
        return button;
      });
      const version = el("div", { class: "account-menu-version" });
      version.innerHTML = githubRevisionLink(profile.version || "", true);
      const sheet = BottomSheet(title, el("div", { class: "account-menu-content" }, [
        header, el("div", { class: "account-menu-list" }, rows), version,
      ]), options);
      sheet.setActionHidden = (key, hidden) => { const row = actionRows.get(key); if (row) row.hidden = hidden; };
      const closeButton = IconButton("关闭用户菜单", "close", () => sheet.close());
      closeButton.classList.add("account-menu-close");
      header.append(closeButton);
      sheet.addEventListener("close", () => { profile.avatar?.listeners.delete(showAvatar); }, { once: true });
      return sheet;
    }
    if (options.variant === "user-menu") {
      const rows = actions.map(a => {
        const button = el("button", {
          type: "button",
          class: "user-menu-item" + (a.danger ? " user-menu-item--danger" : ""),
          onclick: run(a.action),
        });
        const icon = MenuIcon(a, "user-menu-icon");
        button.append(icon, el("span", { class: "user-menu-label" }, a.label));
        if (a.chevron) {
          const chevron = el("span", { class: "user-menu-chevron", "aria-hidden": "true" });
          chevron.innerHTML = icons.back;
          button.append(chevron);
        }
        return button;
      });
      return BottomSheet(title, el("div", { class: "user-menu-list" }, rows), options);
    }
    const ordered = options.preserveOrder ? [
      ...actions.filter(a => a.label !== "取消"),
      ...actions.filter(a => a.label === "取消"),
    ] : [
      ...actions.filter(a => !a.danger && a.label !== "取消"),
      ...actions.filter(a => !a.danger && a.label === "取消"),
      ...actions.filter(a => a.danger),
    ];
    return BottomSheet(title, el("div", { class: "action-sheet-content" + (options.preserveOrder ? " action-sheet-content--ordered" : "") }, [
      content,
      el("div", { class: "action-sheet-list" }, ordered.map(a => actionMenuButton(a,
        "action-sheet-item" + (a.danger ? " action-sheet-item--danger" : "") + (a.label === "取消" ? " action-sheet-item--cancel" : "")))),
    ].filter(Boolean)), { ...options, variant: "compact-list" });
  }
  function SegmentedControl(options, value, change) {
    return el(
      "div",
      { class: "segmented", role: "group" },
      options.map((o) =>
        Choice(el(
          "button",
          {type:"button", "aria-pressed": o.value === value, onclick: () => change(o.value) },
          o.label,
        ), {compact:true}),
      ),
    );
  }
  function SettingsRow(label, control, description) {
    return el("label", { class: "settings-row" }, [
      el("span", {}, [
        label,
        description ? el("small", {}, description) : null,
      ]),
      control,
    ]);
  }
  function SettingsGroup(title, rows) {
    return el("section", { class: "settings-group" }, [
      el("h3", {}, title),
      ...rows,
    ]);
  }
  function Switch(checked, change) {
    const n = el("input", {
      type: "checkbox",
      role: "switch",
      class: "switch",
    });
    n.checked = checked;
    n.onchange = () => change(n.checked);
    return n;
  }
  function SearchOverlay(submit) {
    const input = el("input", {
      type: "search",
      placeholder: "搜索片名或首字母",
      "aria-label": "搜索媒体",
      name: "query",
      autocomplete: "off",
    });
    const form = el("form", { class: "search-form" }, [
      input,
      el("button", { type: "submit" }, "搜索"),
    ]);
    const d = Modal("搜索", form);
    form.onsubmit = (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
        d.close();
        run(() => submit(value))();
      }
    };
    input.focus();
    return d;
  }
  function LoadingSkeleton(options = {}) {
    const overlay = options.variant === "overlay";
    const label = options.label || "正在加载";
    const content = el("div", {class:"page-loading", "aria-label":label, "aria-busy":"true", role:"status"}, label + "…");
    if (!overlay) return content;
    const dialog = el("dialog", {class:"page-loading--overlay", "aria-label":label, tabindex:"-1"});
    dialog.append(el("span", {class:"action-spinner", "aria-hidden":"true"}), content);
    dialog.addEventListener("cancel", event => event.preventDefault());
    return dialog;
  }
  return {
    el,
    icons,
    DecorativeIcon,
    GlassCard,
    githubRevisionLink,
    SettingsChevron,
    DirectoryRow,
    Choice,
    SettingsLink,
    LinkedSettingsSwitch,
    refreshPresentation,
    SettingsToggle,
    PosterCard,
    bindMediaShelf,
    PersonCard,
    bindPointerScroll, scrollPhysics, deferShelfImage, mediaImage,
    FeaturedHero,
    FeaturedCarousel,
    DetailHero,
    ShelfArrow,
    MediaShelf,
    LibraryCard,
    Modal,
    BottomSheet,
    bindMenuGesture, menuMotion, syncOverlays:mountToastStack,
    prepareBottomSheet,
    sheetLevel,
    prepareScraperSheet,
    ActionSheet,
    ContextMenu,
    SegmentedControl,
    SettingsGroup,
    SettingsRow,
    Switch,
    Toast,
    ImageCropper,
    IconButton,
    saveAction,
    SearchOverlay,
    LoadingSkeleton,
  };
})();
