let resumeMenuAbort = new AbortController();
let wallObserver = null;
let browseGeneration = 0,
  wallCursors = [""],
  wallKey = "",
  browseType = "",
  browseTitle = "",
  browseKind = "",
  browseSeries = "",
  librarySort = {key:"LatestAdded", order:"Descending", seed:""},
  browseTrail = [];
const listParams = {
  Fields: "PrimaryImageAspectRatio,CommunityRating,RunTimeTicks",
  Limit: 18,
  Recursive: true,
  EnableTotalRecordCount: false,
  SortBy: "DateCreated",
  SortOrder: "Descending",
};
// Store the actual browse destination, not an empty all-media wall. Hashes
// survive reloads; history state retains the parent trail for nested folders.
function browseSnapshot() {
  return {parent, title:browseTitle, type:browseType, kind:browseKind,
    series:browseSeries, term, page, sort:{...librarySort}};
}
function setBrowseRoute(root = false) {
  const state = root ? null : browseSnapshot();
  const params = new URLSearchParams();
  if (state) {
    for (const key of ['parent','title','type','kind','series','term'])
      if (state[key]) params.set(key, state[key]);
    params.set('sort', librarySort.key);
    params.set('sortMode', librarySort.manual ? 'manual' : 'default');
    params.set('order', librarySort.order);
    if (librarySort.seed) params.set('seed', librarySort.seed);
  }
  const hash = '#browse' + (state ? '?' + params : '');
  const next = {page:'browse', browse:state, trail:root ? [] : browseTrail};
  const previous = history.state?.browse;
  const sameCollection = state && previous && history.state.page === 'browse' &&
    ['parent','term','type','kind','series'].every(key => state[key] === previous[key]);
  if (location.hash !== hash && !sameCollection) {
    history.pushState(next, '', '/' + hash);
  } else history.replaceState(next, '', '/' + hash);
}
async function restoreBrowseRoute() {
  if (!location.hash.startsWith('#browse?')) return browseRoot();
  const params = new URLSearchParams(location.hash.slice(8));
  parent = params.get('parent') || '';
  term = params.get('term') || '';
  browseTitle = params.get('title') || '';
  browseType = params.get('type') || '';
  browseKind = params.get('kind') || '';
  browseSeries = params.get('series') || '';
  page = 0;
  librarySort = {key:params.get('sort') || 'LatestAdded', order:params.get('order') || 'Descending', seed:params.get('seed') || '', manual:params.has('sort') && params.get('sortMode') !== 'default'};
  if (browseKind === 'CollectionFolder' && !librarySort.manual) librarySort.key = 'LatestAdded';
  browseTrail = history.state?.page === 'browse' ? (history.state.trail || []) : [];
  if (browseKind === 'AllLibraries') return openAllLibraries(false);
  if (!parent && !term && !browseType) return browseRoot();
  await loadWall();
}
// Share the authorized, ordered Views response with the libraries destination.
let browseLibraries = null;
function getBrowseLibraries(refresh = false) {
  const key = token + ':' + settingsRevision;
  if (refresh || browseLibraries?.key !== key) {
    const pending = api.getViews().catch(error => { if (browseLibraries?.pending === pending) browseLibraries = null; throw error; });
    browseLibraries = {key, pending};
  }
  return browseLibraries.pending;
}
async function openAllLibraries(reset = true) {
  if (!Themes.has('AllLibraries')) {
    history.replaceState({page:'browse', browse:null, trail:[]}, '', '/#browse');
    return browseRoot();
  }
  if (reset && view === 'browse' && browseKind === 'AllLibraries') return;
  if (reset) {
    browseTrail = [browseSnapshot()];
    parent = term = browseType = browseSeries = '';
    browseTitle = '全部媒体库'; browseKind = 'AllLibraries'; page = 0;
  }
  setBrowseRoute();
  wallObserver?.disconnect();
  resumeMenuAbort.abort(); resumeMenuAbort = new AbortController();
  view = 'browse'; nav();
  const generation = ++browseGeneration;
  const app = $('#app'); app.replaceChildren(UI.LoadingSkeleton());
  try {
    const result = await getBrowseLibraries();
    if (generation !== browseGeneration || view !== 'browse' || !Themes.has('AllLibraries')) return;
    app.replaceChildren(Themes.render('AllLibraries', result.Items || []));
    bindPosterMenus();
  } catch (error) {
    if (generation !== browseGeneration || view !== 'browse') return;
    app.replaceChildren(UI.el('p', {class:'empty'}, '加载失败：' + error.message),
      UI.el('button', {onclick:run(() => openAllLibraries(false))}, '重试'));
  }
}
function refreshBrowsePresentation() {
  if (view !== 'browse') return;
  if (browseKind === 'AllLibraries' && !Themes.has('AllLibraries')) return openAllLibraries(false);
  UI.refreshPresentation($('#app'));
}
async function browseRoot() {
  if(user?.MustChangePassword){password();return}
  setBrowseRoute(true);
  resumeMenuAbort.abort();
  resumeMenuAbort = new AbortController();
  page = 0;
  parent = "";
  term = "";
  browseType = "";
  browseKind = "";
  browseSeries = "";
  browseTitle = "";
  librarySort = {key:"LatestAdded", order:"Descending", seed:""};
  browseTrail = [];
  await browse();
}
async function browse() {
  wallObserver?.disconnect();
  view = "browse";
  nav();
  const generation = ++browseGeneration;
  const app = $("#app");
  app.replaceChildren();
  const alive = () => generation === browseGeneration && view === "browse";
  const titles = ["继续观看", "最近添加", "我的媒体库"];
  const holders = titles.map(title => UI.el("section", {class:"shelf-section"}, [UI.el("h2", {}, title), UI.LoadingSkeleton()]));
  const categories = UI.el("div", {class:"library-categories"});
  app.prepend(holders[2]);
  app.append(holders[0], categories);
  let latestVisible = false, latestItems = null, latestError = null;
  const renderLatest = () => {
    if (!alive() || !latestVisible) return;
    if (latestItems) { holders[1].replaceWith(UI.MediaShelf(titles[1], latestItems, openMedia, () => openMedia({Id:"virtual-latest", Name:titles[1], Type:"CollectionFolder"}))); bindPosterMenus(); }
    else if (latestError) failure(holders[1], titles[1], latestError);
  };
  const failure = (host, title, error) => host.replaceChildren(UI.el("h2", {}, title), UI.el("p", {class:"muted"}, "加载失败：" + error.message), UI.el("button", {class:"secondary", onclick:run(browse)}, "重试"));
  // Latest and the independent shelves load concurrently.
  const latestTask = (async () => {
    try {
      const items = await api.getLatest({Limit:18, IncludeItemTypes:"Movie,Series", Fields:listParams.Fields, EnableTotalRecordCount:false});
      if (!alive()) return;
      latestItems = items;
      renderLatest();
      bindPosterMenus();
    } catch (e) { if (alive()) { latestError = e; renderLatest(); } }
  })();
  await Promise.allSettled([
    latestTask,
    (async () => {
      try {
        const result = await api.getResume();
        if (!alive()) return;
        const items = await Promise.all((result.Items||[]).map(async item => {
          if (item.Type !== 'Episode' || !item.UserData?.Played || !item.SeriesId) return item;
          try { return (await api.getNextUp(item.SeriesId)).Items?.[0] || item; }
          catch { return item; }
        }));
        if (!alive()) return;
        if (items.length) holders[0].replaceWith(resumeShelf(items, openMedia));
        else holders[0].remove();
      } catch (e) { if (alive()) failure(holders[0], titles[0], e); }
    })(),
    (async () => {
      try {
        const result = await getBrowseLibraries(true);
        if (!alive()) return;
        const libraries = result.Items || [];
        latestVisible = libraries.some(library => library.Id === 'virtual-latest');
        if (latestVisible) { categories.before(holders[1]); renderLatest(); }
        holders[2].replaceWith(UI.MediaShelf(titles[2], libraries, openMedia, null, true));
        await Promise.allSettled(libraries.filter(library => !["virtual-latest", "favorites"].includes(library.Id)).slice(0, 4).map(async library => {
          const host = UI.el("section", {class:"shelf-section"}, [UI.el("h2", {}, library.Name), UI.LoadingSkeleton()]);
          categories.append(host);
          try {
            const result = await api.getItems({...listParams, LibrarySortMode:"Default", SortBy:"", SortOrder:"", ParentId:library.Id, IncludeItemTypes:"Movie,Series"});
            if (!alive()) return;
            host.replaceWith(UI.MediaShelf(library.Name, result.Items || [], openMedia, () => openMedia(library)));
            bindPosterMenus();
          } catch (e) { if (alive()) failure(host, library.Name, e); }
        }));
      } catch (e) { if (alive()) failure(holders[2], titles[2], e); }
    })(),
  ]);
  if (alive()) bindPosterMenus();
}
async function openMedia(item, browseFolder = false) {
  if (item.Type === "Series" && !browseFolder) return detail(item.Id);
  if (
    item.IsFolder ||
    ["Series", "Season", "CollectionFolder", "Folder"].includes(item.Type)
  ) {
    browseTrail.push({
      parent,
      title: browseTitle,
      type: browseType,
      kind: browseKind,
      series: browseSeries,
      term,
      page,
      sort: {...librarySort},
    });
    await openCollection(
      item.Id,
      item.Name,
      "",
      false,
      item.Type,
      item.ParentId,
    );
  } else await detail(item.Id);
}
async function openCollection(
  id,
  title,
  type = "",
  reset = true,
  kind = "",
  series = "",
) {
  if (reset) browseTrail = [];
  parent = id;
  browseTitle = title;
  browseType = type;
  browseKind = kind;
  browseSeries = series;
  page = 0;
  term = "";
  if (kind === "CollectionFolder") librarySort = {key:"LatestAdded", order:"Descending", seed:""};
  await loadWall();
}
function openSearch() {
  UI.SearchOverlay(async (value) => {
    browseTrail = [];
    parent = "";
    browseKind = "";
    browseSeries = "";
    browseType = "Movie,Series";
    browseTitle = "搜索结果";
    term = value;
    page = 0;
    await loadWall();
  });
}
async function browseBack() {
  if (history.state?.page === 'browse' && history.state.trail?.length) {
    history.back();
    return;
  }
  const previous = browseTrail.pop();
  if (!previous) return browseRoot();
  ({
    parent,
    title: browseTitle,
    type: browseType,
    kind: browseKind,
    series: browseSeries,
    term,
    page,
    sort: librarySort,
  } = previous);
  if (browseKind === 'AllLibraries') return openAllLibraries(false);
  if (!parent && !term && !browseType) return browseRoot();
  await loadWall();
}
async function refreshBrowse() {
  if (view !== "browse") return;
  if (browseKind === 'AllLibraries') return openAllLibraries(false);
  if (!parent && !term && !browseType) return browse();
  return loadWall();
}
function librarySortControl() {
  const options = [
    ["LatestAdded","最新入库或更新"], ["DateCreated","添加日期"], ["PremiereDate","发行日期"], ["ProductionYear","年份"],
    ["CommunityRating","TMDB评分"], ["CriticRating","影评人评分"], ["DatePlayed","播放日期"],
    ["SeriesDateLastContentAdded","最后一集添加日期"], ["SeriesDateLastReleased","最后一集发行日期"],
    ["PlayCount","播放次数"], ["Random","随机"], ["OfficialRating","分级"],
  ];
  if (parent === "virtual-douban-top250") options.unshift(["DoubanRank","TOP250 排名"]);
  const details = UI.el("details", {class:"library-sort"});
  const summary = UI.el("summary", {class:"library-sort-trigger", title:"排序", "aria-label":"选择排序方式"});
  summary.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4v16M4 8l4-4 4 4M16 20V4m-4 12 4 4 4-4"/></svg><span>排序</span>';
  const menu = UI.el("div", {class:"library-sort-menu", role:"menu"});
  for (const [key,label] of options) {
    const selected = librarySort.key === key;
    const button = UI.Choice(UI.el("button", {type:"button", role:"menuitemradio", "aria-checked":String(selected)}), {compact:true});
    const direction = librarySort.order === "Ascending" ? "升序" : "降序";
    button.innerHTML = `<span>${label}</span>${selected?`<svg class="library-sort-direction" data-order="${librarySort.order}" viewBox="0 0 24 24" aria-label="${direction}"><path d="M6 15l6-6 6 6"/></svg>`:""}`;
    button.onclick = run(async()=>{
      librarySort.manual = true;
      if (selected) librarySort.order = librarySort.order === "Ascending" ? "Descending" : "Ascending";
      else {
        librarySort.key = key;
        librarySort.order = ["LatestAdded","DateCreated","PremiereDate","CommunityRating","CriticRating","DatePlayed","SeriesDateLastContentAdded","SeriesDateLastReleased","PlayCount","Random"].includes(key) ? "Descending" : "Ascending";
        librarySort.seed = key === "Random" ? `${parent}-${Date.now()}-${Math.random()}` : "";
      }
      page = 0; wallCursors = [""]; wallKey = ""; details.open = false;
      await loadWall();
    });
    menu.append(button);
  }
  details.append(summary, menu);
  return details;
}

// Use the same native-scroller gesture controller as the horizontal shelves.
function bindWallDrag(grid) {
  UI.bindPointerScroll(grid, "y");
}

async function loadWall() {
  if (parent === "virtual-douban-top250" && !librarySort.manual) { librarySort.key="DoubanRank"; librarySort.order="Ascending"; }
  setBrowseRoute();
  wallObserver?.disconnect();
  view = "browse";
  nav();
  const generation = ++browseGeneration;
  const key = [parent, term, browseType, browseKind === "CollectionFolder" ? librarySort.key : "", browseKind === "CollectionFolder" ? librarySort.order : "", librarySort.key === "Random" ? librarySort.seed : ""].join("|");
  if (page === 0 || key !== wallKey) {
    wallCursors = [""];
    wallKey = key;
  }
  const app = $("#app");
  const libraryWall = browseKind === "CollectionFolder" && !!parent && !term;
  const headingActions = UI.el("div", {class:"library-heading-actions"}, [
    UI.el("button", {class:"text-button", onclick:run(browseRoot)}, "首页"),
    ...(libraryWall && parent !== "virtual-latest" ? [librarySortControl()] : []),
  ]);
  app.replaceChildren(
    UI.el("div", { class: "section-heading library-wall-heading" }, [
      UI.IconButton("返回", "back", run(browseBack)),
      UI.el("h2", {}, term ? `搜索：${term}` : browseTitle || "媒体"),
      headingActions,
    ]),
    UI.LoadingSkeleton(),
  );
  const params = {
    Fields: "PrimaryImageAspectRatio,CommunityRating,RunTimeTicks",
    Limit: libraryWall ? 100 : 60,
    Cursor: wallCursors[page] || "",
    StartIndex: wallCursors[page] ? 0 : page * (libraryWall ? 100 : 60),
    EnableTotalRecordCount: false,
    ParentId: parent,
  };
  if (browseType) params.IncludeItemTypes = browseType;
  if (libraryWall) {
    params.Recursive = true;
    params.IncludeItemTypes = browseType || "Movie,Series";
    params.LibrarySortMode = librarySort.manual ? "Manual" : "Default";
    if (librarySort.manual) {
      params.SortBy = librarySort.key;
      params.SortOrder = librarySort.order;
    }
    if (librarySort.key === "Random") params.RandomSeed = librarySort.seed || (librarySort.seed = `${parent}-${Date.now()}-${Math.random()}`);
  }
  if (!parent) {
    params.Recursive = true;
    params.SortBy = "DateCreated";
    params.SortOrder = "Descending";
    if (!browseType) params.IncludeItemTypes = "Movie,Series";
  }
  const fetchPage = params => (term
    ? api.search(term, params)
    : browseKind === "Series"
      ? api.getSeasons(parent, params)
      : browseKind === "Season"
        ? api.getEpisodes(browseSeries || parent, {
            ...params,
            SeasonId: parent,
          })
        : api.getItems(params));
  const b = await fetchPage(params);
  if (generation !== browseGeneration || view !== "browse") return;
  wallCursors[page + 1] = b.NextCursor || "";
  app.querySelector("[role=status]")?.remove();
  app.append(
    UI.el(
      "div",
      { id: "wall", class: "poster-grid" },
      b.Items.length
        ? b.Items.map((x) => UI.PosterCard(x, openMedia))
        : [UI.el("p", { class: "empty" }, "暂无媒体")],
    ),
  );
  bindWallDrag(app.querySelector("#wall"));
  if (libraryWall) {
    const grid = app.querySelector("#wall");
    let loaded = b.Items.length, cursor = b.NextCursor || "", loading = false;
    const more = (result) => {
      const hasTotal = result.TotalRecordCount != null && Number.isFinite(Number(result.TotalRecordCount));
      if (result.HasMore === false || (hasTotal && loaded >= Number(result.TotalRecordCount))) return false;
      return result.HasMore === true || !!result.NextCursor ||
        (hasTotal ? loaded < Number(result.TotalRecordCount) : result.Items.length === params.Limit);
    };
    let hasMore = more(b);
    const button = UI.el("button", {class:"secondary", type:"button"}, "加载更多");
    const sentinel = UI.el("div", {class:"paging"}, [button]);
    app.append(sentinel);
    const alive = () => generation === browseGeneration && view === "browse" && grid.isConnected;
    const update = () => {
      button.disabled = loading || !hasMore;
      button.textContent = loading ? "加载中…" : hasMore ? "加载更多" : "已全部加载";
    };
    const loadMore = async () => {
      if (loading || !hasMore || !alive()) return;
      loading = true; update();
      try {
        const result = await fetchPage({...params, Cursor:cursor, StartIndex:cursor ? 0 : loaded});
        if (!alive()) return;
        grid.append(...result.Items.map(item => UI.PosterCard(item, openMedia)));
        loaded += result.Items.length;
        cursor = result.NextCursor || "";
        hasMore = more(result);
        bindPosterMenus();
        observer.disconnect();
        if (hasMore) observer.observe(sentinel);
      } catch (error) {
        if (!alive()) return;
        observer.disconnect();
        toast("加载下一页失败", {type:"error", message:error.message});
      } finally {
        loading = false;
        if (alive()) update();
      }
    };
    button.onclick = run(loadMore);
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) loadMore();
    }, {rootMargin:"200px"});
    wallObserver = observer;
    update();
    if (hasMore) observer.observe(sentinel);
    bindPosterMenus();
    return;
  }
  const prev = UI.el(
      "button",
      {
        class: "secondary",
        onclick: run(async () => {
          page--;
          await loadWall();
        }),
      },
      "上一页",
    ),
    next = UI.el(
      "button",
      {
        class: "secondary",
        onclick: run(async () => {
          page++;
          await loadWall();
        }),
      },
      "下一页",
    );
  prev.disabled = page === 0;
  next.disabled = !(typeof b.HasMore === "boolean" ? b.HasMore :
    Number(b.StartIndex ?? page * 60) + b.Items.length < Number(b.TotalRecordCount));
  app.append(
    UI.el("div", { class: "paging" }, [
      prev,
      UI.el("span", { class: "muted" }, `第 ${page + 1} 页`),
      next,
    ]),
  );
  bindPosterMenus();
}

function resumeShelf(items, open) {
  const section = UI.MediaShelf("继续观看", items, open, null, false, true);
  section.querySelectorAll('.card').forEach(card => {
    card.dataset.resumeCard = "true";
    bindResumeMenu(card, run(event => posterMenu(card, [
      {label:"删除继续播放记录", icon:fmIcon("trash"), danger:true, action:async () => {
        const result = await confirmDialogOptions("删除继续播放记录", "删除这条继续播放记录？", "删除全部播放记录", "删除全部继续播放记录？");
        if (!result) return;
        try {
          if (result.checked) await api.deleteAllResume();
          else await api.deleteResume(card.dataset.id);
        } catch (error) {
          toast("删除继续播放记录失败", {type:"error", message:"原因：" + error.message});
          return;
        }
        if (result.checked) section.querySelectorAll('.card').forEach(item => item.remove());
        else card.remove();
        if (!section.querySelector('.card')) {
          section.querySelector('.shelf-track')?.remove();
          section.append(UI.el("p", {class:"empty"}, "暂无继续播放记录"));
        }
        toast(result.checked ? "全部继续播放记录已删除" : "继续播放记录已删除");
      }},
    ], event)));
  });
  return section;
}

function bindResumeMenu(card, show, ignore = "", options = {}) {
  const signal = options.signal || resumeMenuAbort.signal;
  const listen = (type, handler, config = {}) => card.addEventListener(type, handler, {...(typeof config==='boolean'?{capture:config}:config), signal});
  let timer = null, pointerId = null, start = null, held = false;
  const cancel = () => {
    clearTimeout(timer); timer = null; pointerId = null; start = null;
    document.removeEventListener("scroll", cancel, true);
  };
  const open = () => {
    if (!card.isConnected || !timer) { cancel(); return; }
    cancel(); held = true; show();
  };
  listen("pointerdown", e => {
    if (ignore && e.target.closest(ignore)) { held = false; cancel(); return; }
    if (e.pointerType === "mouse" && !matchMedia("(max-width: 600px)").matches) { held = false; cancel(); return; }
    if (!e.isPrimary || e.button !== 0) { if (e.button === 2) held = false; return; }
    cancel(); held = false; pointerId = e.pointerId;
    start = {x:e.clientX, y:e.clientY};
    timer = setTimeout(open, 550);
    // Only a pending hold needs scroll cancellation, even in a 1000-card wall.
    document.addEventListener("scroll", cancel, {capture:true, passive:true, signal});
  });
  listen("pointermove", e => {
    if (e.pointerId === pointerId && start &&
        Math.hypot(e.clientX-start.x, e.clientY-start.y) >= 5) cancel();
  });
  for (const event of ["pointerup","pointercancel","pointerleave","lostpointercapture"])
    listen(event, e => { if (e.pointerId === pointerId) cancel(); });
  // The released long press can otherwise synthesize a click on the new
  // sheet backdrop, immediately dismissing the menu.
  listen("touchend", e => { if (held && e.cancelable) e.preventDefault(); }, {passive:false});
  listen("click", e => {
    if (held) { e.preventDefault(); e.stopImmediatePropagation(); held = false; }
  }, true);
  listen("contextmenu", e => {
    if (ignore && e.target.closest(ignore)) return;
    e.preventDefault();
    if (held) return;
    if (options.allowSheet || !document.querySelector("dialog.bottom-sheet[open]")) {
      cancel(); held = true; show(e);
    } else cancel();
  });
  listen("keydown", e => {
    if (ignore && e.target.closest(ignore)) return;
    if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
      e.preventDefault(); cancel(); held = true; show(e);
    }
  });
  signal.addEventListener("abort", cancel, {once:true});
}
