// Existing directory-picker entry points and directoryLoader integration.
// Classic script: retain existing global names; see docs/admin-frontend.md.
async function folderPicker(id, path = "/media") {
  return selectDirectoryPath({path, select:async selected => {
    await api("/admin/library-folders", "POST", {ID:id, Path:selected});
    await admin();
    toast("媒体文件夹已添加，后台更新索引中");
  }});
}
async function chooseDirectory(path = "/media") {
  return selectDirectoryPath({path, select:selected => {
    $("#addlib [name=path]").value = selected;
    $("#directory").replaceChildren();
  }});
}
async function pickDirectory(select, path = "/media", after = "", options = {}) {
  if (options.signal?.aborted) return;
  let d = $("#fm-picker");
  if (!d) {
    d = UI.BottomSheet("选择目录", UI.el("div", {class:"picker-body"}), {variant:"scraper-settings"});
    d.id = "fm-picker";
  }
  if (d.classList.contains("is-closing")) {
    await new Promise(resolve => d.addEventListener("close", resolve, {once:true}));
    return pickDirectory(select, path, after, options);
  }
  d._directoryLoader?.cancel();
  const body = d.querySelector(".picker-body");
  let previousPath = "";
  const loader = directoryLoader({scope:options.scope || '', checkLibraries:options.checkLibraries, prepare:options.prepare,
    alive:() => d.open && !d.classList.contains("is-closing"),
    loading:path => { body.replaceChildren(); body.append(UI.el('p', {role:'status'}, '正在加载：' + path), UI.LoadingSkeleton(), UI.el('button', {type:'button', class:'secondary', onclick:() => d.close()}, '取消')); },
    error:(error, retry) => { body.replaceChildren(); body.append(UI.el('p', {role:'status'}, '加载失败：' + error.message), UI.el('button', {type:'button', onclick:retry}, '重试'), UI.el('button', {type:'button', class:'secondary', onclick:() => d.close()}, '取消')); },
    render:b => {
      body.innerHTML = `${b.Roots?.length > 1 ? `<label>目录位置<select data-picker-root>${b.Roots.map(root => `<option value="${esc(root)}" ${root === b.Root ? 'selected' : ''}>${esc(root)}</option>`).join('')}</select></label>` : ''}<div class="directory-list"><p class="picker-path">${esc(b.Path)}</p>${(b.Files || []).map(x => `<p class="settings-field-help">📄 ${esc(x.Name)}</p>`).join("")}${!b.Directories.length && !b.Files?.length ? '<p class="empty">此目录为空</p>' : ""}${b.Next ? '<button id="fm-next" class="secondary">下一页</button>' : ""}</div><footer class="picker-actions"><button id="fm-up" class="secondary" ${b.Path === (b.Root || "/media") ? "disabled" : ""}>上一级</button>${options.optional ? '<button type="button" id="fm-clear" class="secondary">保存到视频旁边</button>' : ''}<button id="fm-select" ${options.scope === "storage" && b.Path === b.Root ? "disabled" : ""}>选择此目录</button></footer>`;
      d.querySelector('[data-picker-root]')?.addEventListener('change', run(e => loader.navigate(e.target.value)));
      $('#fm-clear')?.addEventListener('click', () => { select(''); d.close(); });
      let selection = b.Path;
      const confirm = $("#fm-select");
      const blocked = path => Boolean(options.blocked?.(path)) || (options.scope === 'storage' && path === b.Root);
      confirm.disabled = blocked(selection);
      const rows = [];
      b.Directories.forEach((directory, i) => {
        const disabled = blocked(directory.Path);
        const entry = UI.DirectoryRow({name:directory.Name, path:directory.Path, single:true,
          select:() => {
            if (blocked(directory.Path)) return;
            selection = directory.Path;
            rows.forEach(({input, path}) => input.checked = path === selection);
            confirm.disabled = blocked(selection);
          }, expand:() => loader.navigate(directory.Path)});
        entry.input.disabled = disabled;
        entry.row.classList.toggle('directory-unavailable', disabled);
        entry.input.title = disabled ? '此目录已被选择或已被媒体库使用' : '';
        entry.expand.dataset.index = i;
        rows.push({input:entry.input, path:directory.Path});
        d.querySelector('.directory-list').insertBefore(entry.row, d.querySelector('.directory-list').children[i + 1] || null);
      });
      UI.sheetLevel(d.querySelector(".directory-list"), previousPath.startsWith(b.Path + "/") ? -1 : 1);
      previousPath = b.Path;
      confirm.onclick = () => {
        if (blocked(selection)) return;
        select(selection);
        d.close();
      };
      $("#fm-up").onclick = run(() =>
        loader.navigate(b.Path.slice(0, b.Path.lastIndexOf("/")) || b.Root || "/media"),
      );
      $("#fm-next")?.addEventListener(
        "click",
        run(() => loader.navigate(b.Path, b.Next)),
      );

    }
  });
  d._directoryLoader = loader;
  const onAbort = () => { loader.cancel(); if (d.open) d.close(); };
  d.onclose = () => { loader.cancel(); options.signal?.removeEventListener('abort', onAbort); };
  d.oncancel = loader.cancel;
  if (options.signal?.aborted) return;
  options.signal?.addEventListener('abort', onAbort, {once:true});
  await loader.navigate(options.current || path, after, options.current ? path : undefined);
}
