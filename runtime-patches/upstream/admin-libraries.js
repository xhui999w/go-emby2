// Library rendering, artwork, ordering, CRUD, settings and folder operations.
// Classic script: retain existing global names; see docs/admin-frontend.md.
async function uploadCover(id) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp";
  input.hidden = true;
  document.body.append(input);
  input.oncancel = () => input.remove();
  input.onchange = run(async () => {
    const f = input.files[0];
    input.remove();
    if (!f) return;
    UI.ImageCropper(f, {
      variant:"library-cover", title:"插入媒体封面",
      outputWidth:940, outputHeight:400,
      onUpload:async cropped=>{
        const result = await api.uploadCover(id, cropped);
        if (result.ImageTags) updateLibraryArtwork(id, result.ImageTags);
        toast("封面已更新", {type:"info", message:"已保存到 images-sc"});
      }
    });
  });
  input.click();
}
function updateLibraryArtwork(id, tags) {
  const library = adminLibs.find(x => x.Id === id);
  if (!library) return;
  library.ImageTags = tags;
  const row = document.querySelector(`.fm-row--library[data-library-id="${CSS.escape(id)}"]`);
  row?.querySelector('.library-art')?.remove();
  if (row) row.insertAdjacentHTML("afterbegin", tags?.Primary ? libraryArtwork(library) : '<span class="library-art" aria-hidden="true"></span>');
}
async function removeLibraryCover(id) {
  try {
    await api("/admin/cover?Id=" + encodeURIComponent(id), "DELETE");
    updateLibraryArtwork(id, {});
    toast("封面已移除", {type:"success"});
  } catch (error) {
    toast("移除封面失败", {type:"error", message:"原因：" + error.message});
  }
}
const generatingLibraryCovers = new Set();
async function generateLibraryCover(id) {
  if (generatingLibraryCovers.has(id)) return;
  generatingLibraryCovers.add(id);
  toast("正在生成封面", {type:"info"});
  try {
    const path = "/admin/library-cover?Id=" + encodeURIComponent(id);
    const check = await api(path, "GET", undefined, {timeoutMs:45000});
    if (!check.CanGenerate) {
      toast(check.Reason || `当前有效且不同的海报：${check.PosterCount ?? 0} 张，至少需要 4 张`, {type:"info"});
      return;
    }
    const result = await api(path, "POST", undefined, {timeoutMs:60000});
    updateLibraryArtwork(id, result.ImageTags);
    toast("封面生成成功", {type:"success"});
  } catch (error) {
    if (error.message.includes("新缓存中至少需要4张")) {
      toast(error.message, {type:"info"});
    } else toast("封面生成失败", {type:"error", message:"原因：" + error.message});
  } finally { generatingLibraryCovers.delete(id); }
}
let adminOrder = [], adminOrderLoad = null;
async function loadLibraryOrder() {
  if (adminOrderLoad) return adminOrderLoad;
  const generation = adminGeneration;
  $('#saveOrder').disabled = true;
  adminOrderLoad = api('/admin/order').then(options => {
    if (view !== 'admin' || generation !== adminGeneration) return;
    adminOrder = options;
    renderOrder();
    $('#saveOrder').disabled = false;
  }).finally(() => { adminOrderLoad = null; });
  return adminOrderLoad;
}
function renderOrder() {
  const box = $("#order");
  box.innerHTML = adminOrder
    .map(
      (x) =>
        `<div class="row library-order-row" data-id="${esc(x.Id)}"><button class="drag-handle secondary" aria-label="拖动 ${x.Hidden ? "隐藏媒体库" : esc(x.Name)} 排序，键盘方向键调整" style="touch-action:none;cursor:grab">☰</button><strong class="info${x.Hidden ? " library-hidden" : ""}"><span class="library-name">${esc(x.Name)}</span></strong></div>`,
    )
    .join("");
  box.querySelectorAll(".drag-handle").forEach((h) => {
    h.onpointerdown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const row = h.closest(".row"),
        before = [...box.children];
      box.setPointerCapture(e.pointerId);
      row.style.opacity = ".5";
      box.onpointermove = (e) => {
        const y = e.clientY;
        for (const other of [...box.children]) {
          if (other === row) continue;
          const r = other.getBoundingClientRect();
          if (y >= r.top && y <= r.bottom) {
            box.insertBefore(
              row,
              y < r.top + r.height / 2 ? other : other.nextSibling,
            );
            break;
          }
        }
        if (y < 80) window.scrollBy(0, -20);
        if (y > innerHeight - 80) window.scrollBy(0, 20);
      };
      const finish = (cancel) => {
        box.onpointermove = null;
        box.onpointerup = null;
        box.onpointercancel = null;
        row.style.opacity = "";
        if (cancel) before.forEach((x) => box.appendChild(x));
        adminOrder = [...box.children].map((el) =>
          adminOrder.find((x) => x.Id === el.dataset.id),
        );
      };
      box.onpointerup = () => finish(false);
      box.onpointercancel = () => finish(true);
    };
    h.onkeydown = (e) => {
      if (!["ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      const row = h.closest(".row"),
        i = adminOrder.findIndex((x) => x.Id === row.dataset.id),
        j = i + (e.key === "ArrowUp" ? -1 : 1);
      if (j < 0 || j >= adminOrder.length) return;
      [adminOrder[i], adminOrder[j]] = [adminOrder[j], adminOrder[i]];
      renderOrder();
      box.children[j].querySelector("button").focus();
    };
  });
}
function libraryArtwork(x, source) {
  return `<span class="library-art" aria-hidden="true" x-data="libraryArtwork" data-source="${esc(source || "/Items/" + encodeURIComponent(x.Id) + "/Images/Primary?" + new URLSearchParams({tag:x.ImageTags?.Primary || "",api_key:token,Crop:"cover",Format:"webp",Quality:85}))}"><img :src="source" alt="" loading="lazy" decoding="async" :class="{ 'is-loaded': loaded }" @load="loaded=true" @error="loaded=false"></span>`;
}
// Both library and directory entries share the same banner frame and artwork lifecycle.
function libraryBannerCard(attributes, artwork, content, actions) {
  return `<div class="fm-row fm-row--library" x-glass-text ${attributes}>${artwork}${content}<div class="library-actions">${actions}</div></div>`;
}
function bindLibraryCard(row, open) {
  // Keep native button keyboard behavior. The shared hold handler runs in
  // capture before navigation and excludes operation controls at its source.
  const title = row.querySelector('.library-open');
  title.removeAttribute('onclick');
  title.onclick = open;
  row.tabIndex = 0;
  row.setAttribute('role', 'link');
  row.setAttribute('aria-label', title.getAttribute('aria-label') || title.textContent.trim());
  bindResumeMenu(row, event => openLibraryMenu(event || {preventDefault(){}}, row.querySelector('.fm-menu summary')), '.library-actions, .hidden-indicator');
  row.onclick = event => {
    if (event.target.closest('button, a, input, summary, details, .library-actions')) return;
    open();
  };
  row.onkeydown = event => {
    if (event.target === row && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); open(); }
  };
}

function librarySummary(x, directory) {
  if (directory) {
    const root = String(x.Path || '').replace(/\/+$/, '');
    return root && directory.startsWith(root + '/') ? directory.slice(root.length + 1) : directory;
  }
  const kind = {movies:'电影', tvshows:'电视剧', music:'音乐', mixed:'混合库'}[x.CollectionType] || '媒体库';
  return kind + (!['movies', 'tvshows'].includes(x.CollectionType) && Array.isArray(x.Locations) ? ` · ${x.Locations.length} 个父文件夹` : '');
}
function libraryDescription(x) {
  const counts = x.Counts;
  const valid = keys => keys.every(key => Number.isSafeInteger(counts?.[key]) && counts[key] >= 0);
  const count = key => counts[key];
  const status = x.CountsStatus === 'failed' ? '统计失败，稍后重试' : '统计中';
  const keys = x.CollectionType === 'movies' ? ['MovieCount'] : ['SeriesCount', 'EpisodeCount'];
  const summary = !['movies', 'tvshows'].includes(x.CollectionType) ? '' : x.CountsStatus === 'failed' || !valid(keys) ? status : x.CollectionType === 'movies' ? `共 ${count('MovieCount')} 部` : x.CollectionType === 'tvshows' ? `共 ${count('SeriesCount')} 部 · 共 ${count('EpisodeCount')} 集` : '';
  const path = (x.Locations || [x.Path]).filter(Boolean).join(' · ');
  return `<small>${librarySummary(x)}</small>${summary ? `<small>${summary}${valid(keys) && x.CountsStatus === 'pending' ? ' · 统计中' : ''}</small>` : ''}${path ? `<small class="library-path" title="${esc(path)}">${esc(path)}</small>` : ''}`;
}
function libraryStatusInfo(x) {
  const state =
    x.Error || x.Status === "error"
      ? "error"
      : x.Status === "idle"
        ? "ready"
        : x.Status === "interrupted"
          ? "interrupted"
          : "busy";
  const label =
    { ready: "就绪", error: "失败", busy: "处理中", interrupted: "已中断" }[
      state
    ] + (x.Error ? "：" + x.Error : "");
  return {state, label, icon:state === "error" ? "!" : state === "busy" ? "↻" : state === "interrupted" ? "!" : "●"};
}
function libraryStatus(x) {
  const {state, label, icon} = libraryStatusInfo(x);
  return `<span class="library-status ${state}" role="img" tabindex="0" aria-label="${esc(label)}" title="${esc(label)}">${state === "ready" ? '<span class="library-status-dot" aria-hidden="true"></span>' : icon}<span class="library-status-label">${esc(label.split("：")[0])}</span></span>`;
}
function mediaPage(add = false) {
  window.scrollTo({top:0, behavior:"instant"});
  fmLibrary = "";
  adminSection(0);
  if (!adminLibrariesLoaded && adminLibrariesLoad) return;
  renderMediaPage(add);
}
function renderMediaPage(add = false) {
  const section = document.querySelectorAll(".admin-section")[0];
  delete section.dataset.progressLibrary;
  section.innerHTML = `<div class="section-heading"><h2>媒体库管理</h2><button class="secondary icon-button" aria-label="媒体库设置" title="媒体库设置" onclick="run(librarySettingsDialog)()">${fmIcon("gear")}</button></div><div class="fm-toolbar minimal-toolbar library-toolbar"><p id="library-settings-status" class="muted library-settings-status"></p><div class="toolbar-actions"><button class="secondary icon-button round-add" title="新建媒体库" aria-label="新建媒体库" onclick="run(newLibrary)()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><button class="secondary icon-button" title="批量添加媒体库" aria-label="批量添加媒体库" onclick="run(batchLibraries)()">${fmIcon("folder")}</button><button id="library-scan-toggle" type="button" class="secondary icon-button" title="开始扫描" aria-label="开始扫描" disabled onclick="run(toggleLibraryScan)()">${fmIcon("play")}</button><button id="library-scan-refresh" type="button" class="secondary icon-button" title="刷新全部媒体库" aria-label="刷新全部媒体库" onclick="run(scanAllMedia)()">${fmIcon("refresh")}</button><button id="library-scan-stop" type="button" class="secondary icon-button" title="停止扫描" aria-label="停止扫描" disabled onclick="run(stopLibraryScan)()">${fmIcon("stop")}</button></div><div class="scan-circle" x-data="taskProgress" :data-task-state="state" :style="'--pct:' + (percent ?? 0) + '%'" :aria-valuenow="percent" :title="label + ' · ' + connection" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span x-text="state === 'error' ? '!' : percent === null ? '—' : Math.floor(percent) + '%'">—</span><small x-show="connection !== 'connected'" x-text="connection === 'unauthorized' ? '登录失效' : '重连中'" role="status"></small></div></div><div class="fm-list fm-list--libraries">${adminLibs.map((x) => libraryBannerCard(`data-library-id="${esc(x.Id)}"`, libraryArtwork(x), `<div class="fm-name${x.Hidden ? " library-hidden" : ""}"><div class="library-title"><button class="library-open" onclick="folderPage('${x.Id}')" ${x.Hidden ? 'aria-label="打开隐藏媒体库"' : ""}><span class="library-name" ${x.Hidden ? 'aria-hidden="true"' : ""}>${esc(x.Name)}</span></button>${x.Hidden ? `<button type="button" class="secondary icon-button hidden-indicator" aria-label="显示隐藏媒体库名称" title="显示名称" aria-pressed="false" onclick="revealLibraryName(this)">${fmIcon("eye")}</button>` : ""}</div>${libraryDescription(x)}</div>`, `${libraryStatus(x)}${fmMenu(fmButton("扫描媒体库", `await scanMedia('${x.Id}')`, false, "scan") + fmButton("开始刮削", `await openLibraryScraper('${x.Id}')`, false, "scan") + fmButton("添加媒体文件夹", `await pickFolder('${x.Id}')`, false, "folder") + fmButton("插入媒体封面", `await uploadCover('${x.Id}')`, false, "image", true) + fmButton("生成封面", `await generateLibraryCover('${x.Id}')`, false, "image") + fmButton("移除封面", `await removeLibraryCover('${x.Id}')`, false, "trash") + fmButton(x.Hidden ? "取消隐藏媒体库" : "隐藏媒体库", `await toggleLibraryHidden('${x.Id}')`, false, x.Hidden ? "eye" : "hidden") + fmButton("编辑媒体库", `renameLibrary('${x.Id}')`, false, "rename") + fmButton("删除媒体库", `await deleteLibrary('${x.Id}')`, true, "trash"))}`)).join("") || '<p class="empty">暂无媒体库，点击新建媒体库开始。</p>'}</div>`;
  section.querySelectorAll('[data-library-id]').forEach(row => bindLibraryCard(row, () => folderPage(row.dataset.libraryId)));
  updateLibraryScanButton();
  void refreshLibrarySettingsStatus();
  if (add) newLibrary();
}
async function refreshLibrarySettingsStatus() {
  const el = $("#library-settings-status");
  if (!el) return;
  try {
    const settings = await api.settings("/admin/library-settings");
    if (el.isConnected) el.textContent = "扫描并发：" + settings.ScanConcurrency;
  } catch (_) {
    if (el.isConnected) el.textContent = "媒体库设置状态读取失败";
  }
}
async function refreshLibraries() {
  adminLibs = await api("/admin/libraries");
  if (fmLibrary && adminLibs.some((x) => x.Id === fmLibrary))
    folderPage(fmLibrary, true);
  else mediaPage();
}
const deletingLibraries = new Set();
async function deleteLibrary(id) {
  if (deletingLibraries.has(id)) return;
  deletingLibraries.add(id);
  let loading;
  try {
    if (!(await confirmDialog("删除媒体库", "删除媒体库及索引？源文件保留。", "删除媒体库"))) return;
    loading = UI.LoadingSkeleton({variant:"overlay", label:"正在删除媒体库"});
    document.body.append(loading);
    loading.showModal();
    await api("/admin/libraries", "DELETE", { ID: id }, {signal: AbortSignal.timeout(35000)});
  } catch (error) {
    toast("媒体库删除失败", {type:"error", message:"原因：" + error.message});
    return;
  } finally {
    loading?.close();
    loading?.remove();
    deletingLibraries.delete(id);
  }
  adminLibs = adminLibs.filter(library => library.Id !== id);
  toast("媒体库删除成功", {type:"success"});
  if (scanActive(fmScanGeneration)) {
    if (fmLibrary === id) fmLibrary = "";
    if (!fmLibrary) mediaPage();
    void refreshLibraries().catch(error => toast("媒体库列表刷新失败", {type:"error", message:error.message}));
  }
}
async function scanMedia(id) {
  if (!(await confirmScan("扫描此媒体库？将处理新增、修改和删除的内容，跳过未变化内容。"))) return;
  const result = await api("/admin/scan", "POST", { ID: id });
  if (result.queued === false) throw new Error("媒体库已在扫描队列中，或扫描正在停止");
  document.querySelectorAll(".fm-menu[open]").forEach((x) => (x.open = false));
  toast("扫描已开始", {type:"success"});
  await pollScan();
}
function libraryTypeOptions(selected = "movies") {
  return [["movies", "电影"], ["tvshows", "电视剧"], ["mixed", "混合库"]].map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`).join("");
}
function libraryPenetrationSetting(checked = false) {
  return `<label class="toggle-label">穿透识别媒体目录<input class="switch" role="switch" name="penetrate" type="checkbox" ${checked ? "checked" : ""}></label>`;
}
function libraryPathRow() {
  return `<div class="row"><input name="path" required readonly role="button" aria-haspopup="dialog" aria-label="媒体目录" placeholder="点击选择媒体目录" onclick="run(()=>activeMediaBoundaryDialog.pick(this))()"><button type="button" class="secondary" aria-label="添加目录" onclick="this.closest('#library-paths').insertAdjacentHTML('beforeend',libraryPathRow())">＋ 添加</button><button type="button" class="secondary" aria-label="移除目录" onclick="if(this.closest('#library-paths').children.length>1){const paths=this.closest('#library-paths');this.parentElement.remove();paths.dispatchEvent(new Event('change',{bubbles:true}))}">−</button></div>`;
}
function newLibrary() {
  return mediaBoundaryLibraryDialog(false);
}
async function batchLibraries() {
  return mediaBoundaryLibraryDialog(true);
}
let activeMediaBoundaryDialog = null;
async function mediaBoundaryLibraryDialog(batch) {
  if ($("#modal").classList.contains("is-closing")) return;
  if (activeMediaBoundaryDialog?.form.isConnected && $("#modal").open) return;
  activeMediaBoundaryDialog?.dispose();
  const trigger = document.activeElement;
  let pathsReady = false, pathsError = "", pathsKey = "";
  let parent = "", generation = 0, loading = false, identified = 0, skipped = 0, submitting = false;
  const selected = new Set();
  const candidates = new Map();
  let successfulRoots = 0, failedRoots = 0, rootCount = 0;
  // Index configured paths once: ancestor lookups depend on path depth, not library count.
  const normalize = path => path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  const existingPaths = new Set(), existingAncestors = new Set(), eligible = new Set();
  let pickerUsedPaths = new Set();
  const ancestors = path => {
    const result = [path];
    while (path !== "/") { path = path.slice(0, path.lastIndexOf("/")) || "/"; result.push(path); }
    return result;
  };
  const indexPath = path => {
    const clean = normalize(path);
    existingPaths.add(clean);
    for (const ancestor of ancestors(clean)) existingAncestors.add(ancestor);
  };
  const overlaps = path => existingAncestors.has(normalize(path)) || ancestors(normalize(path)).some(path => existingPaths.has(path));
  const previewPageSize = 100;
  let previewPage = 0, previewEntries = [], discoveryAbort;
  const remainingPages = new Map();
  let directoryError = "";
  fmDialog(batch ? "批量添加媒体库" : "新建媒体库", `<label class="library-batch-type">媒体库类型<select name="kind">${libraryTypeOptions()}</select></label>${batch ? "" : '<label>媒体库名称<input name="name" required></label>'}${batch ? '<label>父目录<input class="library-batch-parent" readonly placeholder="点击选择识别起始目录" role="button" aria-label="选择识别起始目录"></label>' : ""}${libraryPenetrationSetting()}${batch ? "" : `<div id="library-paths">${libraryPathRow()}</div>`}<div class="bar" data-candidate-actions><button type="button" class="secondary" data-select-all>全选</button><button type="button" class="secondary" data-clear>取消选择</button></div><p class="library-batch-status" role="status"></p><button type="button" class="secondary" data-retry-paths hidden>重试加载路径</button><div class="fm-list library-batch-preview"></div><button type="button" class="secondary" data-more-directories hidden>加载更多目录</button><button type="button" class="secondary" data-retry-directories hidden>重试读取目录</button>`, async f => {
    if (!alive() || !pathsReady) throw Error("媒体库路径尚未加载，无法校验目录冲突");
    if (loading || !selected.size || !parent) throw Error("请选择媒体目录");
    submitting = true;
    const form = dialog.querySelector("form");
    form.inert = true;
    try {
      const counts = { Created: 0, Skipped: skipped + identified - selected.size, Failed: 0 };
      const errors = [];
      let libraryId = "", chunk = [], chunkParent = "";
      const submit = async () => {
        const entries = chunk;
        chunk = [];
        try {
          const result = await api("/admin/libraries/batch", "POST", {
            Kind: f.get("kind"), Parent: chunkParent, Paths: entries, Penetrate: deepDiscovery.checked,
            ...(!batch ? { Name: f.get("name"), LibraryId: libraryId, DeferScan: true } : {}),
          });
          libraryId = result.LibraryId || libraryId;
          for (const key of ["Created", "Skipped", "Failed"]) counts[key] += result[key].length;
          for (const entry of [...result.Skipped, ...result.Failed]) {
            if (errors.length < 100) errors.push(entry);
          }
        } catch (error) {
          counts.Failed += entries.length;
          for (const path of entries) if (errors.length < 100) errors.push({ Path: path, Error: error.message });
        }
        status.textContent = `发现 ${identified} 个，成功 ${counts.Created} 个，跳过 ${counts.Skipped} 个，失败 ${counts.Failed} 个`;
      };
      for (const path of selected) {
        const sourceRoot = candidates.get(path).SourceRoot;
        if (chunk.length && chunkParent !== sourceRoot) await submit();
        chunkParent = sourceRoot;
        chunk.push(path);
        if (chunk.length === 100) await submit();
      }
      if (chunk.length) await submit();
      if (!batch && libraryId) {
        try { await api("/admin/scan", "POST", { ID: libraryId, Mode: "scan" }); }
        catch (error) { toast("媒体库已添加，扫描入队失败", {type:"warning", message:error.message}); }
      }
      const summary = `发现 ${identified} 个，成功 ${counts.Created} 个，跳过 ${counts.Skipped} 个，失败 ${counts.Failed} 个`;
      toast(summary, {type: counts.Failed || errors.length ? "warning" : "success"});
      await refreshLibraries();
      selected.clear();
      if (errors.length || counts.Failed) {
        preview.replaceChildren();
        for (const entry of errors) {
          const row = document.createElement("p");
          row.textContent = `${entry.Path}：${entry.Error}`;
          preview.appendChild(row);
        }
        status.textContent = summary;
        return false;
      }
    } finally { submitting = false; form.inert = false; }
  });
  const dialog = $("#modal");
  const dialogForm = dialog.querySelector("form");
  const pathsAbort = new AbortController();
  const alive = () => dialog.open && dialog.querySelector("form") === dialogForm && !dialog.classList.contains("is-closing") && !pathsAbort.signal.aborted;
  const dispose = () => {
    ++generation;
    pathsAbort.abort();
    discoveryAbort?.abort();
    observer.disconnect();
    dialog.removeEventListener("close", onClose);
    if (activeMediaBoundaryDialog?.form === dialogForm) activeMediaBoundaryDialog = null;
  };
  // The shared modal can close with an animation or be reused by another dialog.
  const onClose = () => { if (!dialog.open) dispose(); };
  const observer = new MutationObserver(() => { if (!alive()) dispose(); });
  observer.observe(dialog, {childList:true, attributes:true, attributeFilter:["open", "class"]});
  dialog.addEventListener("close", onClose);
  activeMediaBoundaryDialog = {form:dialogForm, dispose, pick:input => {
    // A library may have changed since the last selection, including in another session.
    pathsKey = "";
    return pickDirectory(path => {
      if (blocked(path, input)) return;
      if (!input) return loadPage(path);
      input.value = path;
      input.dispatchEvent(new Event('change', {bubbles:true}));
    }, '/media', '', {
      checkLibraries:true, signal:pathsAbort.signal,
      prepare:(path, signal, page) => {
        if (signal.aborted || !alive()) return;
        if (!Array.isArray(page.UsedPaths)) throw Error('目录校验信息缺失，请刷新后重试');
        // This response owns the visible page; never accumulate deleted occupancy.
        pickerUsedPaths = new Set(page.UsedPaths.map(normalize));
      },
      blocked:path => blocked(path, input)
    });
  }};
  // Only exact duplicates block an input root. Ancestors must remain browsable
  // so discovery can still find legal children; candidate overlap rules stay below.
  const blocked = (path, input) => pickerUsedPaths.has(normalize(path)) ||
    [...dialogForm.querySelectorAll('#library-paths input[name="path"]')].some(other => other !== input && other.value && normalize(other.value) === normalize(path));
  dialog.classList.add("library-batch-dialog");
  if (matchMedia("(max-width: 600px)").matches) UI.prepareScraperSheet(dialog, false, trigger);
  const preview = dialog.querySelector(".library-batch-preview");
  const status = dialog.querySelector(".library-batch-status");
  const deepDiscovery = dialog.querySelector('[name="penetrate"]');
  const manualPaths = dialog.querySelector('#library-paths');
  const saveButton = dialog.querySelector('[type="submit"]');
  const renderPreview = () => {
    const kind = dialog.querySelector('[name="kind"]').value;
    const start = previewPage * previewPageSize;
    preview.innerHTML = previewEntries.slice(start, start + previewPageSize).map(entry => {
      const disabled = !eligible.has(entry.Path);
      return `<label class="fm-row library-batch-row ${UI.Choice.className}"><input type="checkbox" value="${esc(entry.Path)}" ${disabled ? "disabled" : selected.has(entry.Path) ? "checked" : ""}><span><strong>${esc(entry.Name)}</strong><small>${esc(entry.Path)}</small><small>${{movies:"电影", tvshows:"电视剧", mixed:"混合库"}[kind]}</small>${disabled ? "<small>已存在或与媒体库目录重叠</small>" : ""}</span></label>`;
    }).join("");
    if (previewEntries.length > previewPageSize) {
      preview.insertAdjacentHTML("beforeend", `<div class="bar"><button type="button" class="secondary" data-preview-prev ${previewPage ? "" : "disabled"}>上一页</button><span>${start + 1}–${Math.min(start + previewPageSize, previewEntries.length)} / ${previewEntries.length}</span><button type="button" class="secondary" data-preview-next ${start + previewPageSize < previewEntries.length ? "" : "disabled"}>下一页</button></div>`);
    }
    preview.scrollTop = 0;
  };
  preview.onclick = e => {
    if (e.target.closest('[data-preview-prev]')) { previewPage--; renderPreview(); }
    if (e.target.closest('[data-preview-next]')) { previewPage++; renderPreview(); }
  };
  const updateStatus = () => {
    if (manualPaths) {
      manualPaths.hidden = false;
      manualPaths.querySelectorAll('input').forEach(input => input.required = false);
    }
    dialog.querySelector('[data-candidate-actions]').hidden = false;
    preview.hidden = false;
    status.textContent = !inputRoots().length ? "请选择媒体目录" : !pathsReady ? pathsError || "正在加载媒体库路径，完成后可校验目录冲突…" : deepDiscovery.checked
      ? loading ? "正在穿透识别媒体目录…" : `已识别 ${identified} 个媒体目录${skipped ? `，跳过 ${skipped} 个无法访问目录` : ""}${rootCount > 1 || failedRoots ? `；成功 ${successfulRoots} 个根目录 / 失败 ${failedRoots} 个根目录` : ""}`
      : directoryError || (loading ? "正在读取下一层目录…" : `已加载 ${identified} 个下一层目录${remainingPages.size ? "，可继续加载；全选仅选择已加载目录" : ""}`);
    dialog.querySelector("[data-more-directories]").hidden = !remainingPages.size;
    dialog.querySelector("[data-more-directories]").disabled = loading;
    dialog.querySelector("[data-retry-directories]").hidden = !directoryError;
    dialog.querySelector("[data-retry-directories]").disabled = loading;
    dialog.querySelector("[data-retry-paths]").hidden = !pathsError;
    dialog.querySelector("[data-retry-paths]").disabled = loading;
    dialog.querySelectorAll("[data-candidate-actions] button").forEach(button => button.disabled = !pathsReady || loading);
    saveButton.disabled = !pathsReady || loading || !selected.size;
  };
  const inputRoots = () => manualPaths ? [...new Set([...manualPaths.querySelectorAll('input[name="path"]')].map(input => input.value).filter(Boolean))] : [parent].filter(Boolean);
  const loadPage = async (path, more = false) => {
    if (submitting || !alive()) return;
    const current = ++generation;
    discoveryAbort?.abort();
    discoveryAbort = new AbortController();
    const abort = discoveryAbort;
    if (!more) {
      selected.clear();
      eligible.clear();
      candidates.clear();
      remainingPages.clear();
    }
    directoryError = "";
    previewEntries = [];
    previewPage = 0;
    preview.replaceChildren();
    if (path !== undefined) {
      parent = path;
      if (manualPaths) manualPaths.querySelector('input').value = path;
    }
    const roots = more ? [...remainingPages.keys()] : inputRoots();
    parent = inputRoots()[0] || "";
    const parentInput = dialog.querySelector(".library-batch-parent");
    if (parentInput) parentInput.value = parent;
    identified = skipped = successfulRoots = failedRoots = 0;
    rootCount = roots.length;
    if (!roots.length) {
      pathsReady = false;
      pathsError = "";
      loading = false;
      updateStatus();
      return;
    }
    const key = JSON.stringify(inputRoots());
    pathsError = "";
    if (key !== pathsKey) pathsReady = false;
    loading = true;
    updateStatus();
    if (!pathsReady) {
      try {
        const requestAbort = new AbortController();
        const cancel = () => requestAbort.abort();
        abort.signal.addEventListener("abort", cancel, {once:true});
        const timer = setTimeout(cancel, 30000);
        let libraries;
        try {
          const query = new URLSearchParams({Locations:"ScanPaths"});
          for (const root of inputRoots()) query.append("Root", root);
          libraries = await api("/admin/libraries?" + query, "GET", undefined, {signal:requestAbort.signal});
        } catch (error) {
          throw Error(requestAbort.signal.aborted ? "请求超时，请重试" : error.message);
        } finally {
          clearTimeout(timer);
          abort.signal.removeEventListener("abort", cancel);
        }
        if (current !== generation || !alive()) return;
        existingPaths.clear();
        existingAncestors.clear();
        let processed = 0;
        for (const library of libraries) for (const path of library.Locations || []) {
          indexPath(path);
          if (++processed % 256 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
            if (current !== generation || !alive()) return;
          }
        }
        pathsKey = key;
        pathsReady = true;
      } catch (error) {
        if (current !== generation || !alive()) return;
        pathsError = "媒体库路径加载失败，无法校验目录冲突：" + error.message;
        loading = false;
        updateStatus();
        return;
      }
    }
    if (current !== generation || !alive()) return;
    const kind = dialog.querySelector('[name="kind"]').value;
    const recursive = deepDiscovery.checked;
    const endpoint = "/admin/media-boundaries?";
    const errors = [];
    for (const root of roots) {
      // Keep a root's results isolated until all of its responses have succeeded.
      const entries = new Map();
      let after = more ? remainingPages.get(root) || "" : "", rootSkipped = 0;
      try {
        do {
          // A failed or timed-out root must not prevent discovery of later roots.
          const requestAbort = new AbortController();
          const cancel = () => requestAbort.abort();
          abort.signal.addEventListener("abort", cancel, { once: true });
          const timer = setTimeout(cancel, 30000);
          let data;
          try {
            data = await api(endpoint + new URLSearchParams({ Path: root, Kind: kind, Recursive: String(recursive), After: after, Limit: "256" }), "GET", undefined, { signal: requestAbort.signal });
          } finally {
            clearTimeout(timer);
            abort.signal.removeEventListener("abort", cancel);
          }
          if (current !== generation || !alive()) return;
          rootSkipped += data.SkippedDirs || 0;
          for (const entry of data.Directories) entries.set(entry.Path, { ...entry, SourceRoot: data.Path });
          if (data.Next && data.Next === after) throw Error("分页游标没有前进");
          after = data.Next || "";
          if (!recursive) break; // Shallow creation never waits for the whole root listing.
        } while (after);
        if (after) remainingPages.set(root, after); else remainingPages.delete(root);
        for (const [path, entry] of entries) if (!candidates.has(path)) candidates.set(path, entry);
        skipped += rootSkipped;
        successfulRoots++;
      } catch (error) {
        if (current !== generation || !alive()) return;
        failedRoots++;
        errors.push(`${root}：${error.name === "AbortError" ? "请求超时，请重试" : error.message}`);
      }
    }
    if (current !== generation || !alive()) return;
    directoryError = errors.length ? "读取目录失败：" + errors.join("；") : "";
    identified = candidates.size;
    let processed = 0;
    for (const entry of candidates.values()) {
      if (!eligible.has(entry.Path) && !overlaps(entry.Path)) { eligible.add(entry.Path); selected.add(entry.Path); }
      if (++processed % 256 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
        if (current !== generation || !alive()) return;
      }
    }
    previewEntries = [...candidates.values()];
    renderPreview();
    if (!identified) preview.innerHTML = `<p class="empty">${recursive ? '未识别到媒体目录，请更换起始目录或媒体库类型' : '此目录没有子文件夹或媒体文件'}</p>`;
    for (const error of errors) {
      const row = document.createElement("p");
      row.textContent = (recursive ? "穿透识别失败：" : "读取目录失败：") + error;
      preview.appendChild(row);
    }
    preview.scrollTop = 0;
    loading = false;
    updateStatus();
  };
  if (manualPaths) manualPaths.onchange = run(event => {
    const input = event.target;
    if (input.matches('input[name="path"]') && input.value && blocked(input.value, input)) {
      input.value = '';
      toast('此目录已被选择或已被媒体库使用', {type:'warning'});
    }
    return loadPage();
  });
  deepDiscovery.onchange = run(() => loadPage());
  preview.onchange = e => {
    if (e.target.type !== "checkbox") return;
    if (!eligible.has(e.target.value)) { e.target.checked = false; return; }
    if (e.target.checked) selected.add(e.target.value); else selected.delete(e.target.value);
    updateStatus();
  };
  const parentInput = dialog.querySelector(".library-batch-parent");
  if (parentInput) parentInput.onclick = run(() => activeMediaBoundaryDialog.pick());
  dialog.querySelector("[data-more-directories]").onclick = run(() => loadPage(undefined, true));
  dialog.querySelector("[data-retry-directories]").onclick = run(() => loadPage(undefined, remainingPages.size > 0));
  dialog.querySelector('[name="kind"]').onchange = run(async () => { await loadPage(); });
  dialog.querySelector("[data-select-all]").onclick = () => { selected.clear(); for (const path of eligible) selected.add(path); renderPreview(); updateStatus(); };
  dialog.querySelector("[data-clear]").onclick = () => { selected.clear(); renderPreview(); updateStatus(); };
  dialog.querySelector("[data-retry-paths]").onclick = run(() => { if (!loading) return loadPage(); });
  updateStatus();
}
async function scanAllMedia() {
  if (!(await confirmScan("刷新全部媒体库？将更新新增、修改及删除的内容。")))
    return;
  const result = await api("/admin/scan-all", "POST", {});
  if (result.queued === false) throw new Error("没有可启动的扫描任务，或扫描正在停止");
  libraryScanState.ready = true;
  libraryScanState.running = true;
  updateLibraryScanButton();
  toast("扫描已开始", {type:"success"});
}
function revealLibraryName(button) {
  const host = button.closest(".library-hidden");
  if (!host) return;
  const revealed = host.classList.toggle("library-name-revealed");
  button.setAttribute("aria-pressed", String(revealed));
  button.setAttribute("aria-label", revealed ? "遮住隐藏媒体库名称" : "显示隐藏媒体库名称");
  button.title = revealed ? "遮住名称" : "显示名称";
  button.innerHTML = fmIcon(revealed ? "hidden" : "eye");
  const name = host.querySelector(".library-name");
  name?.setAttribute("aria-hidden", String(!revealed));
  host.querySelector("button:not(.hidden-indicator)")?.setAttribute("aria-label", revealed ? "打开媒体库 " + (name?.textContent || "") : "打开隐藏媒体库");
}
async function toggleLibraryHidden(id) {
  const library = adminLibs.find(x => x.Id === id);
  await api("/admin/library-visibility", "PUT", {ID: id, Hidden: !library.Hidden});
  await refreshLibraries();
  toast(library.Hidden ? "媒体库已取消隐藏" : "媒体库已隐藏");
}
function renameLibrary(id) {
  const library = adminLibs.find(x => x.Id === id);
  fmDialog("编辑媒体库", `<label>显示名称<input name="name" required maxlength="256" value="${esc(library.Name)}"></label><label class="library-batch-type">媒体库类型<select name="kind">${libraryTypeOptions(library.CollectionType)}</select></label><p>类型变更后，请扫描媒体库以更新电影和剧集识别。</p>`, async f => {
    await api("/admin/library-visibility", "PUT", {ID: id, Name: f.get("name"), ...(f.get("kind") !== library.CollectionType ? {Kind: f.get("kind")} : {})});
    await refreshLibraries();
    toast("媒体库设置已保存");
  });
}
async function librarySettingsDialog() {
  const trigger = document.activeElement;
  const settings = await api.settings("/admin/library-settings");
  const c = settings.Schedule;
  fmDialog("媒体库设置", `
    <label class="toggle-label">定时全量扫描<input class="switch" role="switch" name="enabled" type="checkbox" ${c.Enabled ? "checked" : ""}></label>
    <div class="schedule-options"><div class="segmented" role="group" aria-label="扫描周期">${[["daily","每日"],["weekly","每周"],["minutes","间隔"]].map(([v,label])=>`<button type="button" class="${UI.Choice.className} ui-choice--compact" data-frequency="${v}" aria-pressed="${c.Frequency===v}">${label}</button>`).join("")}</div><input type="hidden" name="frequency" value="${c.Frequency}"></div>
    <label id="schedule-week">星期<select name="weekday">${["周日","周一","周二","周三","周四","周五","周六"].map((v,i)=>`<option value="${i}" ${c.Weekday===i ? "selected" : ""}>${v}</option>`).join("")}</select></label>
    <label id="schedule-time">时间（UTC）<input type="time" name="time" value="${esc(c.Time)}" required></label>
    <label id="schedule-minutes">间隔分钟<input type="number" name="minutes" min="1" max="10080" value="${c.Minutes}" required></label>
    <section class="library-concurrency-section">
      <h3>媒体库并发设置</h3>
      <label>扫描并发<input name="scanConcurrency" type="number" min="1" max="64" required value="${settings.ScanConcurrency}"></label>
      <p>超额任务排队；降低上限不会中断正在运行的任务。</p>
    </section>
    <section class="library-concurrency-section" x-data="libraryCoverPanel()" data-cover-panel>
      <h3>媒体库批量封面生成</h3>
      <div class="media-automation-line">
        <button type="button" class="secondary library-cover-style" @click="chooseStyle($el)" :disabled="busy || running" aria-haspopup="dialog" aria-label="封面图样式"><span>封面图样式</span><small x-text="styleName">四图拼接</small></button>
        <div class="media-automation-actions">
          <button type="button" class="secondary icon-button" @click="preview()" :disabled="busy || running" title="预览封面样式" aria-label="预览封面样式">${fmIcon('eye')}</button>
          <button type="button" class="secondary icon-button" @click="start()" :disabled="busy || running" title="开始批量封面生成" aria-label="开始批量封面生成">${fmIcon('play')}</button>
        </div>
      </div>
      <p class="media-batch-status" role="status" aria-live="polite" x-text="statusText"></p>
      <p>逐库生成所选样式封面。</p>
    </section>`, async () => {
      const fields = $("#modal form").elements;
      const result = await api("/admin/library-settings", "PUT", {
        Schedule: {
          Enabled: fields.enabled.checked, Frequency: fields.frequency.value,
          Time: fields.time.value, Weekday: Number(fields.weekday.value),
          Minutes: Number(fields.minutes.value),
        },
        ScanConcurrency: Number(fields.scanConcurrency.value),
      });
      await refreshLibrarySettingsStatus();
      toast("媒体库设置已保存", {type:"success"});
      return result;
    }, "保存", "paired");
  if (matchMedia("(max-width: 600px)").matches) {
    UI.prepareScraperSheet($("#modal"), false, trigger);
  }
  $("#modal .form-actions button[type=button]").textContent = "关闭";
  const form = $("#modal form");
  form.querySelectorAll("[data-frequency]").forEach(button => button.onclick = () => {
    form.elements.frequency.value = button.dataset.frequency;
    form.querySelectorAll("[data-frequency]").forEach(b => b.setAttribute("aria-pressed", b === button));
    scheduleFields(button.dataset.frequency);
  });
  scheduleFields(c.Frequency);
}
function scheduleFields(v) {
  $("#schedule-week").hidden = v !== "weekly";
  $("#schedule-time").hidden = v === "minutes";
  $("#schedule-minutes").hidden = v !== "minutes";
  const form = $("#modal form");
  form.elements.weekday.disabled = v !== "weekly";
  form.elements.time.disabled = v === "minutes";
  form.elements.minutes.disabled = v !== "minutes";
}

function folderPage(id, refresh = false) {
  if (!refresh) window.scrollTo({top:0, behavior:"instant"});
  const section = document.querySelectorAll(".admin-section")[0];
  fmLibrary = id;
  const lib = adminLibs.find((x) => x.Id === id);
  if (!lib) return;
  adminSection(0);
  document.querySelectorAll(".admin-section")[0].dataset.progressLibrary = id;
  document.querySelectorAll(".admin-section")[0].innerHTML =
    `<button class="secondary icon-button " title="媒体列表" aria-label="媒体列表" onclick="mediaPage()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div class="fm-toolbar"><h2><span class="${lib.Hidden ? "library-hidden" : ""}"><span class="library-name" ${lib.Hidden ? 'aria-hidden="true"' : ""}>${esc(lib.Name)}</span>${lib.Hidden ? `<button type="button" class="secondary icon-button hidden-indicator" aria-label="显示隐藏媒体库名称" title="显示名称" aria-pressed="false" onclick="revealLibraryName(this)">${fmIcon("eye")}</button>` : ""}</span></h2><button class="secondary icon-button round-add" title="新建媒体文件夹" aria-label="新建媒体文件夹" onclick="run(()=>pickFolder('${id}'))()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><div class="scan-circle" x-data="taskProgress" :data-task-state="state" :style="'--pct:' + (percent ?? 0) + '%'" :aria-valuenow="percent" :title="label + ' · ' + connection" role="progressbar" aria-valuemin="0" aria-valuemax="100"><span x-text="state === 'error' ? '!' : percent === null ? '—' : Math.floor(percent) + '%'">—</span><small x-show="connection !== 'connected'" x-text="connection === 'unauthorized' ? '登录失效' : '重连中'" role="status"></small></div></div>${lib.PenetrationRoots ? '<p>显示识别起始目录。修改或移除目录会同步更新其下媒体索引。</p>' : ""}<div class="fm-list fm-list--libraries fm-list--folders">${(lib.Locations || []).map((p, i) => libraryBannerCard(`data-folder-path="${esc(p)}"`, libraryArtwork(lib, "/admin/dashboard-art?" + new URLSearchParams({card:i, library:id, path:p, api_key:token, Crop:"cover", Format:"webp", Quality:85})), `<div class="fm-name"><div class="library-title"><button class="library-open"><span class="library-name">${esc(p.split("/").pop() || "media")}</span></button></div><small title="${esc(p)}">${esc(librarySummary(lib, p))}</small></div>`, `${libraryStatus(lib)}${fmMenu(fmButton("修改目录", `await pickFolder('${id}',${i})`, false, "rename") + fmButton("移除目录", `await removeFolder('${id}',${i})`, true, "trash"))}`)).join("") || '<p class="empty">暂无媒体文件夹</p>'}</div>`;
  section.querySelectorAll('[data-folder-path]').forEach(row => {
    bindLibraryCard(row, () => filesPage(row.dataset.folderPath.replace(/^\/media(?:\/|$)/, "")));
  });
}
async function pickFolder(id, index) {
  const lib = adminLibs.find(x => x.Id === id);
  const old =
    index === undefined
      ? ""
      : adminLibs.find((x) => x.Id === id).Locations[index];
  const dialog = fmDialog(
    old ? "修改目录" : "添加媒体文件夹",
    `<label>目录<input name="path" id="fm-path" readonly required role="button" aria-haspopup="dialog" placeholder="点击选择媒体目录" value="${esc(old)}"></label>${libraryPenetrationSetting(lib.FolderPenetration?.[old] ?? !!lib.PenetrationRoots)}`,
    async (f) => {
      if (!f.get("path")) throw Error("请选择目录");
      await api("/admin/library-folders", old ? "PUT" : "POST", {
        ID: id,
        Path: f.get("path"),
        OldPath: old,
        Penetrate: f.get("penetrate") === "on",
      });
      fmLibrary = id;
      await refreshLibraries();
      toast("已加入队列，请在实时日志中查看");
    },
  );
  UI.prepareScraperSheet(dialog);
  $("#fm-path").onclick = run(() =>
    pickDirectory((p) => {
      $("#fm-path").value = p;
    }, old || lib.Locations?.[0] || "/media"),
  );
}
const removingFolders = new Set();
async function removeFolder(id, index) {
  const library = adminLibs.find(x => x.Id === id);
  const path = library?.Locations?.[index];
  if (!path) {
    toast("移除媒体目录失败", {type:"error", message:"原因：媒体目录不存在"});
    return;
  }
  const key = JSON.stringify([id, path]);
  if (removingFolders.has(key)) return;
  removingFolders.add(key);
  let loading, result;
  try {
    if (!(await confirmDialog("移除媒体目录", "确定移除此媒体目录？", "确认移除",
      "仅移除 go-emby 中的媒体库索引，不会删除源文件。"))) return;
    loading = UI.LoadingSkeleton({variant:"overlay", label:"正在移除媒体目录"});
    document.body.append(loading);
    loading.showModal();
    result = await api("/admin/library-folders", "DELETE", { ID: id, Path: path }, {signal: AbortSignal.timeout(35000)});
  } catch (error) {
    toast("移除媒体目录失败", {type:"error", message:"原因：" + error.message});
    return;
  } finally {
    loading?.close();
    loading?.remove();
    removingFolders.delete(key);
  }
  const current = adminLibs.find(x => x.Id === id);
  if (current) {
    current.Locations = Array.isArray(result?.Locations) ? result.Locations : current.Locations.filter(p => p !== path);
    if (current.Locations.length) current.Path = current.Locations[0];
  }
  if (view === "admin" && fmLibrary === id) folderPage(id);
  toast("媒体目录已移除", {type:"success"});
  void refreshLibraries().catch(error => toast("媒体库列表刷新失败", {type:"error", message:"原因：" + error.message}));
}

// Alpine owns dialog state; TaskStream remains the sole SSE connection owner.
function libraryCoverPanel() {
  return {
    style:'four-posters-v1', styleName:'四图拼接', styles:[],
    busy:true, task:null, connection:'connecting', release:null, alive:true, previewDialog:null,
    get running() { return this.task?.State === 'running'; },
    get statusText() {
      const p=this.task;
      if (!p?.ID) return this.busy ? '读取任务状态…' : '尚未开始';
      return `${mediaBatchStates[p.State] || p.State} · ${p.Library || '媒体库'} · ${p.Current}/${p.Total} · 成功 ${p.Success} · 跳过 ${p.Skipped} · 失败 ${p.Failed} · ${p.Cleanup || '等待预览清理'}${this.connection !== 'connected' ? ' · SSE 重连中' : ''}`;
    },
    accept(p) {
      if (!p?.ID || (this.task?.Updated && p.Updated < this.task.Updated)) return;
      const finished=this.task?.ID===p.ID && this.task.State==='running' && p.State==='complete';
      this.task=p;
      if(finished && document.querySelector('.fm-list--libraries')) void refreshLibraries().catch(error=>toast(error.message,{type:'warning'}));
    },
    async init() {
      this.release=TaskStream.subscribe((rows,state)=>{
        this.connection=state;
        for (const t of rows) if(t.type==='library-cover') this.accept(t.cover);
      });
      TaskStream.sync();
      try { const data=await api('/admin/library-cover-batch'); if(this.alive){this.styles=data.Styles;this.accept(data.Task);} }
      catch(error){toast(error.message,{type:'error'});}
      finally { if(this.alive)this.busy=false; }
      // The reusable modal persists in DOM while closed; release at close as well.
      this.$el.closest('dialog')?.addEventListener('close',()=>this.destroy(),{once:true});
    },
    destroy() { this.alive=false;this.release?.();this.release=null;this.previewDialog?.close(); },
    chooseStyle(trigger) {
      const menu=UI.ActionSheet('封面图样式',this.styles.map(s=>({label:s.Name,icon:UI.icons.check,action:()=>{this.previewDialog?.close();this.style=s.ID;this.styleName=s.Name;menu.close();}})),null,{trigger});
    },
    async preview() {
      if(this.busy||this.running)return;this.busy=true;
      let value='',url='';
      try {
        const data=await api('/admin/library-cover-preview','POST',{Style:this.style});value=data.ID;
        const blob=await api('/admin/library-cover-preview?Id='+encodeURIComponent(value),'GET',undefined,{response:'blob'});
        if(!this.alive){await api('/admin/library-cover-preview?Id='+value,'DELETE');return;}
        url=URL.createObjectURL(blob);
        const content=UI.el('div',{class:'library-cover-preview'},[
          UI.el('img',{src:url,alt:this.styleName+'预览'}),
          UI.el('p',{},'随机数据源：'+data.Library)
        ]);
        const dialog=UI.Modal('封面样式预览',content);this.previewDialog=dialog;
        UI.GlassCard(dialog,'dialog');
        dialog.addEventListener('close',()=>{
          URL.revokeObjectURL(url);this.previewDialog=null;
          void api('/admin/library-cover-preview?Id='+value,'DELETE').catch(error=>toast(error.message,{type:'warning'}));
        },{once:true});
      } catch(error) {
        if(url)URL.revokeObjectURL(url);
        if(value)void api('/admin/library-cover-preview?Id='+value,'DELETE').catch(()=>{});
        toast(error.message,{type:'error'});
      } finally { if(this.alive)this.busy=false; }
    },
    async start() {
      if(this.busy||this.running)return;this.busy=true;this.previewDialog?.close();
      try { const data=await api('/admin/library-cover-batch','POST',{Style:this.style});this.accept(data.Task);toast(data.Started?'封面任务已开始':'封面任务正在运行'); }
      catch(error){toast(error.message,{type:'error'});}
      finally { if(this.alive)this.busy=false; }
    }
  };
}

async function saveLibraryOrder(order) {
  return api('/admin/order', 'PUT', {IDs:order.map(x => x.Id)});
}
