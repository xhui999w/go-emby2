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
  const multiple = options.multiple === true;
  const selections = new Set(options.selected || []);
  d.classList.add('go-emby2-directory-picker');
  d.querySelector('.sheet-heading h2').textContent = multiple ? '勾选媒体库目录' : '选择目录';
  if (!document.querySelector('#go-emby2-directory-choice-style')) {
    const style = document.createElement('style');
    style.id = 'go-emby2-directory-choice-style';
    style.textContent = '.go-emby2-directory-picker input:is([type=checkbox],[type=radio]){appearance:auto!important;-webkit-appearance:auto!important;position:static!important;opacity:1!important;width:22px!important;height:22px!important;min-width:22px!important;margin:0 10px 0 0!important;padding:0!important;accent-color:#0a84ff!important}.go-emby2-directory-picker .directory-selection-status{flex-basis:100%;margin:0 0 8px;font-size:13px}.go-emby2-directory-picker .picker-actions{flex-wrap:wrap}';
    document.head.append(style);
  }
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
      const status = UI.el('p', {class:'directory-selection-status', role:'status'});
      d.querySelector('.picker-actions').prepend(status);
      const update = () => {
        status.textContent = multiple ? `已勾选 ${selections.size} 个目录，跨页保留；每个目录分别创建媒体库` : `选择整个目录：${selection}`;
        confirm.textContent = multiple ? `使用所选目录（${selections.size}）` : '选择此目录';
        confirm.disabled = multiple ? !selections.size : blocked(selection);
      };
      b.Directories.forEach((directory, i) => {
        const disabled = blocked(directory.Path);
        const entry = UI.DirectoryRow({name:directory.Name, path:directory.Path, single:!multiple, checked:multiple && selections.has(directory.Path),
          select:checked => {
            if (blocked(directory.Path)) return;
            if (multiple) {
              if (checked) selections.add(directory.Path); else selections.delete(directory.Path);
            } else {
              selection = directory.Path;
              rows.forEach(({input, path}) => input.checked = path === selection);
            }
            update();
          }, expand:() => loader.navigate(directory.Path)});
        entry.input.setAttribute('aria-label', '选择 ' + directory.Name);
        entry.input.disabled = disabled;
        entry.row.classList.toggle('directory-unavailable', disabled);
        entry.input.title = disabled ? '此目录已被选择或已被媒体库使用' : '';
        entry.expand.dataset.index = i;
        rows.push({input:entry.input, path:directory.Path});
        d.querySelector('.directory-list').insertBefore(entry.row, d.querySelector('.directory-list').children[i + 1] || null);
      });
      UI.sheetLevel(d.querySelector(".directory-list"), previousPath.startsWith(b.Path + "/") ? -1 : 1);
      previousPath = b.Path;
      update();
      confirm.onclick = run(async () => {
        if (multiple ? !selections.size : blocked(selection)) return;
        d.close();
        await select(multiple ? [...selections] : selection);
      });
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
