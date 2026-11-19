const $ = (s) => document.querySelector(s),
  esc = (s) => String(s ?? "").replace(/[&<>"']/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const authTokenKey="go-emby-auth-token",authUserKey="go-emby-auth-user";
if(!sessionStorage.getItem(authTokenKey))sessionStorage.setItem(authTokenKey,sessionStorage.token||localStorage.getItem(authTokenKey)||"");
if(!sessionStorage.getItem(authUserKey))sessionStorage.setItem(authUserKey,sessionStorage.user||localStorage.getItem(authUserKey)||"");
localStorage.removeItem(authTokenKey);localStorage.removeItem(authUserKey);
sessionStorage.removeItem("token");sessionStorage.removeItem("user");
let token=sessionStorage.getItem(authTokenKey)||"",user=null,authVerified=false,device=localStorage.device||(localStorage.device=globalThis.crypto?.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)),page=0,parent="",term="",view="browse",heartbeat,current;
try{user=JSON.parse(sessionStorage.getItem(authUserKey)||"null")}catch{sessionStorage.removeItem(authUserKey)}
function clearAuth(){window.TaskStream?.stop();userMenuSheet?.close();userMenuTraktCache=null;settingsCache.clear();token="";user=null;authVerified=false;sessionStorage.removeItem(authTokenKey);sessionStorage.removeItem(authUserKey);sessionStorage.removeItem("go-emby-trakt-pending");localStorage.removeItem(authTokenKey);localStorage.removeItem(authUserKey);sessionStorage.removeItem("token");sessionStorage.removeItem("user");avatarForUser();syncMediaHeader();if(typeof Themes!=="undefined")Themes.navigation()}
async function verifyAuth(){const verifyingToken=token;try{const fresh=await api("/Users/Me");if(token!==verifyingToken)return;user=fresh;authVerified=true;sessionStorage.setItem(authUserKey,JSON.stringify(fresh));nav();routeFromLocation();resumeTraktAuthorization()}catch(e){if(token!==verifyingToken)return;if(e.status===401){clearAuth();login()}else{$("#app").innerHTML='<div class="panel login glass-card" data-glass-variant="surface"><p>连接失败，请稍后重试。</p><button onclick="verifyAuth()">重试</button></div>'}}}
function toast(title, options){ return UI.Toast(title, options); }
function run(fn){return async(...args)=>{try{await fn(...args)}catch(e){if(e.name!=="AbortError")toast(e.message,{type:"error"})}}}
const buildVersion = "__GO_EMBY_BUILD_VERSION__";
function renderBuildFooter(){
 return `<div class="build-footer">${UI.githubRevisionLink(buildVersion)}</div>`;
}
function themeIcon(){return document.documentElement.dataset.theme==="light"?'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5"/></svg>':'<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"/></svg>'}
function toggleTheme(){const r=document.documentElement;r.dataset.theme=r.dataset.theme==="light"?"dark":"light";localStorage.setItem("go-emby-theme",r.dataset.theme);const button=document.querySelector('#nav [data-theme-toggle]');if(button)button.innerHTML=themeIcon()}
function initTheme(){const r=document.documentElement;r.dataset.theme=localStorage.getItem("go-emby-theme")||"dark"}
initTheme();
let renderedView = null, mediaHeaderScroll = null;
function syncMediaHeader() {
 const header=document.querySelector("body > header");
 if(mediaHeaderScroll) { window.removeEventListener("scroll", mediaHeaderScroll.onScroll); cancelAnimationFrame(mediaHeaderScroll.frame); mediaHeaderScroll=null; }
 header?.classList.remove("media-header-hidden");
 const navigation=document.querySelector('[data-theme-navigation]');
 navigation?.classList.remove("media-navigation-hidden");
 if(!header) return;
 header.hidden=!token || !authVerified || view==="login";
 if(header.hidden) return;
 const setHidden=hidden=>{header.classList.toggle("media-header-hidden",hidden);navigation?.classList.toggle("media-navigation-hidden",hidden);};
 const state={last:window.scrollY, pending:window.scrollY, frame:0, onScroll:null};
 state.onScroll=()=>{
  state.pending=Math.max(0,Math.min(window.scrollY,document.documentElement.scrollHeight-innerHeight));
  if(state.frame) return;
  state.frame=requestAnimationFrame(()=>{
   state.frame=0;
   const y=state.pending, delta=y-state.last;
   if(y<20) { state.last=y; setHidden(false); return; }
   if(document.querySelector("dialog[open], .user-menu[open], .context-menu:popover-open, .fm-pop:popover-open") || document.body.classList.contains("drawer-open") || header.querySelector(":focus-visible:not([data-pointer-focus])")) { state.last=y; setHidden(false); return; }
   if(Math.abs(delta)<=10) return;
   state.last=y;
   setHidden(delta>10);
  });
 };
 mediaHeaderScroll=state;
 window.addEventListener("scroll", state.onScroll, {passive:true});
}
function navigateAdminSection(n){
 return run(async()=>{
  if(user?.Policy?.IsAdministrator) await admin(true,n);
 })();
}
function drawerIcon(name) {
 if (name === 'trakt') return `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><g transform="translate(2 2) scale(.0132275132)">${['m350 548 57-58 274 274-57 57z','m279 622 57-57 272 272-57 57z','m208 694 57-57 286 287 547-547 57 57-547 547 145 145-57 57z','m639 980 529-530 57 57-472 473 72 72-57 57z','m780 980 457-457 57 57-457 457z'].map(d => `<path style="fill:currentColor;stroke:none" d="${d}"/>`).join('')}</g></svg>`;
 const paths={dashboard:'M3 13a9 9 0 0 1 18 0M12 13l4-4M5 17h14M8 20h8',back:'M15 5 8 12l7 7M8 12h13',media:'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',files:'M3 7h7l2 2h9v11H3z',scraper:'M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z',users:'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-2a6 6 0 0 1 12 0v2M17 12a4 4 0 0 0-1-8M17 15a5 5 0 0 1 5 5',sort:'M5 5h14M5 12h10M5 19h6',info:'M12 11v7M12 6v1M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0',settings:'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0',sub:'M4 15h16M7 10h10M10 5h4',chapter:'M4 5h16M4 12h16M4 19h16M9 3v4M15 10v4M9 17v4',network:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c-4 4-4 14 0 18M12 3c4 4 4 14 0 18',api:'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',refresh:'M20 11a8 8 0 1 0-2 6M20 4v7h-7',lock:'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',logout:'M10 4H4v16h6M14 7l5 5-5 5M9 12h10'};
 return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
}
const drawerSubmenuState = new Map();
function renderDrawerSubmenu(id, title, icon, items, note = '') {
 const heading = `${UI.DecorativeIcon(drawerIcon(icon), title)}<span>${title}${note ? `<small>${note}</small>` : ''}</span>`;
 const expanded = drawerSubmenuState.get(id) || false;
 return `<details class="drawer-submenu" id="${id}"${expanded?' open':''}><summary aria-label="展开或收起${title}">${heading}<svg class="drawer-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg></summary><div class="drawer-submenu-items">${items}</div></details>`;
}
function renderAdminDrawer(variant){
 const target=(n)=>variant==="files"?`navigateAdminSection(${n})`:n===0?"mediaPage()":`adminSection(${n})`;
 const link=(name,icon,action,current=false)=>`<button class="${UI.Choice.className}"${current?' aria-current="page"':''} onclick="${action}">${UI.DecorativeIcon(drawerIcon(icon), name)}<span>${name}</span></button>`;
 const users = link('用户管理','users',target(1))+link('权限组管理','users',target(13));
 const enhancements = renderDrawerSubmenu('drawer-enhancements', '增强功能', 'settings', link('增强设置','settings',target(4))+link('字幕增强','sub',target(9))+link('TMDB','scraper',target(6))+link('Telegram Bot','users',target(7))+link('片头片尾','chapter',target(10))+link('代理设置','network',target(11)), '设置 · 字幕 · TMDB · Bot · 片头片尾 · 代理');
 const permissions = renderDrawerSubmenu('drawer-permissions', '用户权限', 'users', users);
 return `<button id="drawer-backdrop" type="button" aria-label="关闭功能菜单" onclick="toggleDrawer(false)"></button><aside id="drawer" class="glass-card" data-glass-variant="nav">${link('返回影库','back','browseRoot()')}${link('控制台','dashboard',target(12))}${link('工具箱','settings',target(14))}${link('媒体管理','media',target(0))}${link('文件管理','files','filesPage()',variant==='files')}${link('刮削管理','scraper',target(8))}${link('媒体排序','sort',target(2))}${link('媒体信息','info',target(3))}${permissions}${enhancements}${link('API','api',target(5))}${renderBuildFooter()}</aside>`;
}
let drawerScrollY = null, drawerScrollView = null;
function toggleDrawer(open) {
 const hamburger=$("#hamburger");
 const wasOpen = document.body.classList.contains('drawer-open');
 if (open && !wasOpen) { drawerScrollY = window.scrollY; drawerScrollView = view; }
 if (open !== wasOpen) { const panel=$('#drawer'); if(panel) { UI.menuMotion(panel); void panel.getBoundingClientRect(); } }
 document.body.classList.toggle('drawer-open',open);
 UI.syncOverlays();
 if (!open && wasOpen && drawerScrollY !== null) {
  const y = drawerScrollY, restore = drawerScrollView === view;
  drawerScrollY = null; drawerScrollView = null;
  if (restore) requestAnimationFrame(() => window.scrollTo(0, y));
 }
 hamburger?.setAttribute('aria-expanded',String(open));
 hamburger?.setAttribute('aria-label',open?'收起功能菜单':'展开功能菜单');
}
// Delegation also covers media library menus rendered after navigation.
let mediaMenuTouch = null;
document.addEventListener('pointerdown', e => {
 mediaMenuTouch = null;
 const menu = e.target.closest('.fm-pop');
 if (menu && e.pointerType === 'touch' && matchMedia('(max-width: 600px)').matches)
  mediaMenuTouch = {menu, id:e.pointerId, x:e.clientX, y:e.clientY, moved:false};
}, true);
document.addEventListener('pointermove', e => {
 if (mediaMenuTouch?.id === e.pointerId && Math.hypot(e.clientX-mediaMenuTouch.x,e.clientY-mediaMenuTouch.y)>8)
  mediaMenuTouch.moved = true;
}, true);
document.addEventListener('pointercancel', e => {
 if (mediaMenuTouch?.id === e.pointerId) mediaMenuTouch.moved = true;
}, true);
document.addEventListener('click', e => {
 if (mediaMenuTouch?.moved && mediaMenuTouch.menu.contains(e.target) && e.detail>0) {
  e.preventDefault(); e.stopImmediatePropagation(); mediaMenuTouch = null;
 }
}, true);
const avatarState={userId:null,blob:null,objectURL:null,generation:0,loading:null,listeners:new Set()};
function clearAvatar(){
 avatarState.generation++;
 avatarState.loading=null;
 avatarState.blob=null;
 const old=avatarState.objectURL;
 avatarState.objectURL=null;
 avatarState.listeners.forEach(fn=>fn(null));
 if(old)URL.revokeObjectURL(old);
}
function avatarForUser(){
 const id=user?.Id||null;
 if(avatarState.userId!==id){clearAvatar();avatarState.userId=id}
 return avatarState;
}
function setAvatar(blob){
 const state=avatarForUser();
 state.generation++;
 const old=state.objectURL;
 state.blob=blob;
 state.objectURL=blob?URL.createObjectURL(blob):null;
 paintTopAvatar(state.objectURL);
 state.listeners.forEach(fn=>fn(state.objectURL));
 if(old)URL.revokeObjectURL(old);
}
function paintTopAvatar(url){
 const trigger=document.querySelector('.user-menu-trigger');
 if(!trigger)return;
 if(url){const img=document.createElement('img');img.className='user-menu-trigger-image';img.alt='';img.src=url;trigger.replaceChildren(img)}
}
async function loadAvatar(){
 const state=avatarForUser(),id=state.userId,generation=state.generation;
 if(!id||state.blob)return state.blob;
 if(state.loading)return state.loading;
 const request=(async()=>{
  const res=await fetch(`/Users/${encodeURIComponent(id)}/Avatar`,{headers:{'X-Emby-Token':token}});
  if(!res.ok)return null;
  const blob=await res.blob();
  if(avatarState.userId===id&&avatarState.generation===generation)setAvatar(blob);
  return blob;
 })();
 state.loading=request;
 try{return await request}finally{if(state.loading===request)state.loading=null}
}
let userMenuSheet=null,userMenuTraktCache=null;
function openUserMenu(event) {
 event.preventDefault();
 event.currentTarget.closest('.user-menu').open=false;
 if(!authVerified || userMenuSheet?.isConnected) return;
 const profileUserId=user?.Id,profileToken=token;
 const isAdmin=user?.Policy?.IsAdministrator === true && !user?.MustChangePassword;
 let traktStatus=userMenuTraktCache&&userMenuTraktCache.owner===profileUserId&&userMenuTraktCache.auth===profileToken
  ? userMenuTraktCache.status : {Enabled:false,Authorized:false};
 const entries=[
  {label:"同步Trakt",key:'trakt',hidden:!traktStatus.Enabled,action:()=>syncTraktMenu(traktStatus),icon:'trakt'},
  ...(isAdmin?[{label:'文件管理',action:filesPage,icon:'files'},
    {label:'更新设置',action:checkUpdates,icon:'refresh'}]:[]),
  {label:'修改密码',action:password,icon:'lock'},
  {label:'退出登录',action:logout,icon:'logout',danger:true}
 ];
 let sheet;
 sheet=UI.ActionSheet('账户',entries.map(x=>({...x,icon:drawerIcon(x.icon),action:()=>{if(sheet.classList.contains('is-closing'))return;sheet.addEventListener('close',()=>run(x.action)(),{once:true});sheet.close()}})),null,{
  variant:'account-menu',profile:{name:user?.Name||'用户',server:serverName||'MACA',version:buildVersion,avatar:avatarForUser(),loadAvatar,uploadAvatar:user?.MustChangePassword?null:async file=>{await api(`/Users/${encodeURIComponent(profileUserId)}/Avatar`,'POST',file,{raw:true});if(user?.Id===profileUserId&&token===profileToken)setAvatar(file)}}
 });
 userMenuSheet=sheet;
 sheet.addEventListener('close',()=>{if(userMenuSheet===sheet)userMenuSheet=null},{once:true});
 const valid=()=>userMenuSheet===sheet&&sheet.open&&!sheet.classList.contains('is-closing')&&sheet.isConnected&&authVerified&&user?.Id===profileUserId&&token===profileToken;
 // The dialog is already visible before starting either status I/O or its continuation.
 api('/trakt/status').then(status=>{
  if(!valid()) return;
  traktStatus=status;
  userMenuTraktCache={owner:profileUserId,auth:profileToken,status};
  sheet.setActionHidden('trakt',!status.Enabled);
 }).catch(()=>{});
}

const settingsDesktop = matchMedia('(min-width:1000px)');
const settingsStyle = document.createElement('style');
settingsStyle.textContent = '@media(min-width:1000px){body.settings-pinned #drawer{top:88px;bottom:12px;left:12px;width:260px;padding:16px 8px;opacity:1!important;visibility:visible!important;transform:none!important;border-radius:20px}body.settings-pinned #drawer-backdrop,body.settings-pinned #hamburger{display:none!important}body.settings-pinned main{margin-left:284px!important;margin-right:24px!important;width:calc(100% - 308px)!important;max-width:none!important}}';
document.head.append(settingsStyle);
function syncSettingsEntry(){
 const navigation=$('#nav'),avatar=navigation?.querySelector('.user-menu');
 let button=navigation?.querySelector('[data-settings-entry]');
 if(!authVerified||!user?.Policy?.IsAdministrator||user?.MustChangePassword||!avatar){button?.remove();return}
 if(!button){
  button=document.createElement('button');
  button.type='button';button.className='secondary icon-button';button.dataset.settingsEntry='';
  button.title='设置';button.setAttribute('aria-label','设置');
  button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.5 2-2 1-2-.5-2 3 1.5 1.5v3L2.5 15l2 3 2-.5 2 1 .5 2h4l.5-2 2-1 2 .5 2-3-1.5-2v-3l1.5-1.5-2-3-2 .5-2-1L13 3Z"/><circle cx="11" cy="12" r="3"/></svg>';
  button.onclick=run(()=>admin());
 }
 if(avatar.nextElementSibling!==button)avatar.after(button);
 button.style.setProperty('order',getComputedStyle(avatar).order,'important');
 button.setAttribute('aria-current',view==='admin'?'page':'false');
}
new MutationObserver(syncSettingsEntry).observe($('#nav'),{childList:true,subtree:true});
settingsDesktop.addEventListener('change',()=>{if(view==='admin'||view==='files')nav()});
function nav(){
 window.TaskStream?.sync();
 if(view!=="admin"){
  stopAdminPolling();
  if(renderedView==='admin') {
   adminSnapshot=document.createDocumentFragment();
   adminSnapshot.append(...$('#app').childNodes);
  }
 }
 if(renderedView!==view){$("#app")?.replaceChildren();renderedView=view; if(view!=="browse" && typeof resumeMenuAbort!=="undefined") { resumeMenuAbort.abort(); resumeMenuAbort=new AbortController(); }}
 document.body.classList.toggle('settings-pinned',(view==='admin'||view==='files')&&settingsDesktop.matches);
 document.body.classList.toggle("media-view",view==="browse");document.body.classList.toggle("admin-view",view==="admin");toggleDrawer(false);const n=$("#nav");if(!n)return;
 const navContext=JSON.stringify([!!token,view,user?.Id,user?.Name]);
 if(n.dataset.context!==navContext){WebUI.mountTemplate(n, 'navigation-template');n.dataset.context=navContext;}
 const themeButton=n.querySelector('[data-theme-toggle]');if(themeButton)themeButton.innerHTML=themeIcon();
 paintTopAvatar(avatarForUser().objectURL);
 if(!user?.MustChangePassword)loadAvatar().catch(()=>{});
 document.querySelectorAll("#drawer .drawer-submenu").forEach(menu=>drawerSubmenuState.set(menu.id,menu.open));
 $("#hamburger")?.remove();$("#drawer")?._menuGestureCleanup?.();$("#drawer")?.remove();$("#drawer-backdrop")?.remove();
 if((view==="admin"||view==="files")&&authVerified&&user?.Policy?.IsAdministrator){document.querySelector("header").insertAdjacentHTML("afterbegin",'<button id="hamburger" aria-label="展开功能菜单" aria-expanded="false"><span></span><span></span><span></span></button>');const drawer=renderAdminDrawer(view);document.body.insertAdjacentHTML("beforeend",drawer);UI.bindMenuGesture($("#drawer"),{axis:"x",close:()=>toggleDrawer(false),backdrop:$("#drawer-backdrop")});$("#drawer").addEventListener("click",e=>{if(e.target.closest("button")){toggleDrawer(false)}});$("#hamburger").onclick=()=>{toggleDrawer($("#hamburger").getAttribute("aria-expanded")!=="true")}}
 if (view === "admin" && typeof syncAdminDrawer === "function") syncAdminDrawer();
 if (typeof Themes !== "undefined") { Themes.navigation(); Themes.sampleEffects?.(); }
 syncMediaHeader();
 syncSettingsEntry();
}
let serverName="MACA";
function renderLoginMark(){
 const mark=$(".login-mark");if(view!=="login"||!mark)return;
 const name=serverName||"MACA";
 // Keep the complete static server name in flow.
 if(mark.getAttribute("aria-label")===name&&mark.childElementCount)return;
 mark.setAttribute("aria-label",name);
 const text=document.createElement("span");text.setAttribute("aria-hidden","true");text.textContent=name;
 mark.replaceChildren(text);
}
function login(){closeLogs();view="login";nav();WebUI.mountTemplate($("#app"),'login-template');renderLoginMark();loadServerName()}
async function submitLogin(form){
 const f=new FormData(form),b=await api.login(f.get("username"),f.get("pw"));
 token=b.AccessToken;user=b.User;authVerified=true;
 sessionStorage.setItem(authTokenKey,token);sessionStorage.setItem(authUserKey,JSON.stringify(user));
 nav();if(user.MustChangePassword){password();return}browseRoot();
}

async function logout(){authVerified=false;syncMediaHeader();if(typeof Themes!=="undefined")Themes.navigation();await stop();try{await api.logout()}catch{}clearAuth();login()}
function password(){if(user?.MustChangePassword && location.hash!=="#admin/users")history.replaceState({page:"admin",section:1},"","/#admin/users");view="password";nav();WebUI.mountTemplate($("#app"),'password-template')}
async function submitPassword(form){const f=new FormData(form);await api(`/Users/${user.Id}/Password`,"POST",{CurrentPw:f.get("old"),NewPw:f.get("new")});await logout();toast("密码已修改")}

// Existing hash routing, with a stable name for every admin section.
const adminSectionNames = ['', 'users', 'order', 'media-info', 'enhancements', 'api', 'tmdb', 'telegram', 'scraper', 'subtitles', 'intro-credits', 'proxy', 'console', 'permission-groups', 'toolbox'];
// A legacy encoded entry gets HTML without redirecting. Correct its address
// before authentication restores the hash route; a literal # is already valid.
const legacyEntry = /^\/%23(admin(?:\/([^/]+))?|browse|files)$/i.exec(location.pathname);
if(legacyEntry && (legacyEntry[2] === undefined || adminSectionNames.includes(legacyEntry[2].toLowerCase())))
 history.replaceState(history.state, '', '/' + (location.search || '') + '#' + legacyEntry[1].toLowerCase());
function adminSectionFromLocation(){
 if(!location.hash && /^\/admin\/?$/.test(location.pathname)) return 0;
 const match = /^#admin(?:\/([^/]+))?$/.exec(location.hash);
 if(!match) return null;
 const section = adminSectionNames.indexOf(match[1] || '');
 return section < 0 ? 0 : section;
}
function setAdminSectionRoute(n){
  const name = adminSectionNames[n];
  if(name === undefined) return;
  const hash = '#admin' + (name ? '/' + name : '');
  if(location.pathname !== '/' || location.hash !== hash)
    history[location.pathname === '/' ? 'pushState' : 'replaceState']({page:'admin',section:n}, '', '/' + hash);
}
function routeFromLocation(){
 if(!token || !user || !authVerified) return;
 if(user.MustChangePassword){password();return}
 const section = adminSectionFromLocation();
 if(location.hash.startsWith('#files') && user.Policy?.IsAdministrator){filesPage();return}
 if(section !== null && user.Policy?.IsAdministrator){
  if(view === 'admin' && document.querySelector('.admin-section')){
   if(section === 0) mediaPage(); else adminSection(section);
  }else run(() => admin(false, section))();
  return;
 }
 if(location.hash.startsWith('#browse?')){run(restoreBrowseRoute)();return}
 browseRoot();
}
let lastPopstateURL = '';
window.addEventListener('popstate',()=>{lastPopstateURL=location.href;routeFromLocation()});
window.addEventListener('hashchange',event=>{
 if(event.newURL===lastPopstateURL){lastPopstateURL='';return}
 routeFromLocation();
});
document.addEventListener("DOMContentLoaded",async()=>{if(typeof Themes !== "undefined")await Themes.ready;window.addEventListener("unhandledrejection",(e)=>{toast(e.reason?.message||"请求失败",{type:"error"});e.preventDefault()});if(token){$("#app").innerHTML='<div class="panel login glass-card" data-glass-variant="surface">正在验证登录状态…</div>';loadServerName();verifyAuth()}else login()});

async function checkUpdates(){
 if(!user?.Policy?.IsAdministrator || checkUpdates.pending)return;
 checkUpdates.pending=true;
 const abort=new AbortController();
 let polling=false, busy=false, info=null;
 const status=UI.el('p', {role:'status', 'aria-live':'polite'}, '正在读取更新设置…');
 const versions=UI.el('p', {class:'picker-path'}, '当前版本：'+buildVersion);
 const checked=UI.el('p', {class:'settings-field-help'});
 function showChecked(value){checked.textContent='上次检查：'+(value?new Date(value*1000).toLocaleString():'尚未检查')}
 const automatic=UI.Switch(false, async enabled=>{
  automatic.disabled=true;
  try {
   const saved=await api('/System/Updates/Settings','PUT',{Enabled:enabled},{signal:abort.signal});
   automatic.checked=saved.Enabled;
   status.textContent=enabled?'自动更新已开启，每 24 小时检测一次':'自动更新已关闭';
  }catch(e){automatic.checked=!enabled;status.textContent='保存失败：'+e.message}
  finally{automatic.disabled=false}
 });
 automatic.disabled=true;
 automatic.setAttribute('aria-label','自动更新');
 const content=UI.el('div', {class:'settings-list'}, [
  UI.SettingsRow('自动更新',automatic,'每 24 小时检测并通过受控服务安全更新，默认关闭。'),versions,checked,status
 ]);
 const sheet=UI.ActionSheet('更新设置',[
  {label:'手动更新',icon:UI.icons.refresh,action:detect},
  {label:'更新',icon:UI.icons.refresh,action:update},
  {label:'关闭',action:()=>sheet.close()}
 ],content);
 const [manual,apply]=sheet.querySelectorAll('.action-sheet-item');
 manual.disabled=true;apply.hidden=true;
 sheet.addEventListener('close',()=>{abort.abort();checkUpdates.pending=false},{once:true});
 function message(error){return error.name==='TimeoutError'?'请求超时，请稍后重试':error.message}
 async function poll(){
  if(polling)return;
  polling=true;busy=true;manual.disabled=true;apply.disabled=true;
  const deadline=Date.now()+180000;
  try{
   while(!abort.signal.aborted){
    const task=await api('/System/Updates/Status','GET',undefined,{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(15000)])});
    if(task.State==='succeeded'){status.textContent='更新成功，请刷新页面';return}
    if(task.State==='failed'){status.textContent=task.Message||'更新失败';return}
    if(task.State==='unknown'||Date.now()>=deadline){status.textContent=task.Message||'更新状态暂不可用，请检查受控更新服务';return}
    status.textContent='正在更新…';
    await new Promise(resolve=>{
     const done=()=>{clearTimeout(timer);abort.signal.removeEventListener('abort',done);resolve()};
     const timer=setTimeout(done,2000);abort.signal.addEventListener('abort',done,{once:true});
    });
   }
  }catch(e){if(!abort.signal.aborted)status.textContent='更新状态查询失败：'+message(e)}
  finally{polling=false;busy=false;if(!abort.signal.aborted){manual.disabled=false;apply.hidden=true}}
 }
 async function detect(){
  if(busy)return;
  busy=true;manual.disabled=true;apply.hidden=true;status.textContent='正在检测更新…';
  try{
   info=await api('/System/Updates','GET',undefined,{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(30000)])});
   if(abort.signal.aborted)return;
   showChecked(info.LastChecked);
   versions.textContent=`当前版本：${info.CurrentVersion}；最新版本：${info.LatestVersion}`;
   status.textContent=!info.VersionKnown?'当前版本无法识别，已停止安全更新':!info.CanUpdate?'受控更新服务不可用，已停止更新':info.UpdateAvailable?'发现新版本，可点击更新':'已是最新版本';
   apply.hidden=!(info.VersionKnown&&info.CanUpdate&&info.UpdateAvailable);apply.disabled=false;
  }catch(e){if(!abort.signal.aborted){showChecked(Math.floor(Date.now()/1000));status.textContent='检测更新失败：'+message(e)}}
  finally{busy=false;manual.disabled=false}
 }
 async function update(){
  if(busy||!info?.VersionKnown||!info.UpdateAvailable)return;
  busy=true;apply.disabled=true;manual.disabled=true;status.textContent='正在提交更新…';
  try{
   await api('/System/Updates','POST',undefined,{signal:AbortSignal.any([abort.signal,AbortSignal.timeout(20000)])});
   await poll();
  }catch(e){
   if(!abort.signal.aborted){status.textContent='更新失败：'+message(e);apply.hidden=true;manual.disabled=false}
  }finally{busy=false}
 }
 try{
  const [settingsResult,taskResult]=await Promise.allSettled([
   api('/System/Updates/Settings','GET',undefined,{signal:abort.signal}),
   api('/System/Updates/Status','GET',undefined,{signal:abort.signal})
  ]);
  if(abort.signal.aborted)return;
  if(settingsResult.status==='fulfilled'){
   const config=settingsResult.value;
   showChecked(config.LastChecked);
   automatic.checked=config.Enabled;automatic.disabled=false;
  }else status.textContent='读取自动更新设置失败：'+message(settingsResult.reason);
  manual.disabled=false;
  const task=taskResult.status==='fulfilled'?taskResult.value:null;
  if(task?.State==='running')await poll();
  else if(task?.State==='failed'||task?.State==='succeeded')status.textContent=task.State==='succeeded'?'更新成功':task.Message||'更新失败';
  else await detect();
 }catch(e){if(!abort.signal.aborted)status.textContent='读取更新设置失败：'+message(e)}
}

// Keep only the user-bound polling handle in this tab, never OAuth credentials.
function pendingTraktAuthorization() {
 try {
  const pending = JSON.parse(sessionStorage.getItem('go-emby-trakt-pending') || 'null');
  if (pending?.Owner === user?.Id && typeof pending.Transaction === 'string' &&
      Date.parse(pending.Expires) > Date.now()) return pending;
 } catch {}
 sessionStorage.removeItem('go-emby-trakt-pending');
 return null;
}
let traktResuming = false;
async function resumeTraktAuthorization() {
 if (!authVerified || traktResuming || !pendingTraktAuthorization()) return;
 traktResuming = true;
 try { await syncTraktMenu({Authorized:false}); } finally { traktResuming = false; }
}
window.addEventListener('pageshow', event => {
 if (event.persisted) resumeTraktAuthorization();
});

async function syncTraktMenu(status) {
 const owner = user?.Id, auth = token;
 const content = UI.el('div', {class:'scraper-sheet-body'}, UI.LoadingSkeleton());
 const sheet = UI.BottomSheet('同步Trakt', content, {variant:'scraper-settings'});
 let cancelled = false;
 sheet.addEventListener('close', () => { cancelled = true; }, {once:true});
 const valid = () => !cancelled && owner === user?.Id && auth === token && sheet.isConnected;
 const progress = text => content.replaceChildren(UI.el('p', {role:'status'}, text), UI.LoadingSkeleton());
 try {
  if (!status.Authorized) {
   let transaction = pendingTraktAuthorization();
   if (!transaction) {
    progress('正在准备 Trakt 授权…');
    transaction = await api('/trakt/authorize', 'POST', {});
    if (!valid()) return;
    // Same-tab navigation avoids WebKit's no-referrer popup inheritance.
    // Keep the site policy intact and resume polling when the user returns.
    const target = new URL(transaction.URL);
    if (target.origin !== 'https://auth.trakt.tv' || target.pathname !== '/oauth/authorize' ||
        target.username || target.password || target.hash) throw new Error('Trakt 授权地址无效');
    sessionStorage.setItem('go-emby-trakt-pending', JSON.stringify({Owner:owner, Transaction:transaction.Transaction, Expires:transaction.Expires}));
    HTMLDialogElement.prototype.close.call(sheet);
    sheet.remove();
    location.assign(target.href);
    return;
   }
   progress('正在等待 Trakt 授权完成…');
   const deadline = Date.parse(transaction.Expires);
   let authorized = false;
   while (valid() && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    if (!valid()) return;
    const result = await api('/trakt/poll', 'POST', {Transaction:transaction.Transaction});
    if (!result.Pending && result.Authorized) { authorized = true; break; }
   }
   if (!valid()) return;
   if (!authorized) throw new Error('Trakt 授权已过期，请重新授权');
   sessionStorage.removeItem('go-emby-trakt-pending');
   toast('Trakt 授权成功', {type:'success'});
  }
  sessionStorage.removeItem('go-emby-trakt-pending');
  progress('正在同步继续播放进度…');
  const result = await api('/trakt/sync', 'POST', {});
  if (!valid()) return;
  const message = `同步成功：${result.Success}项\n跳过：${result.Skipped}项\n失败：${result.Failed}项`;
  content.replaceChildren(...message.split('\n').map(text => UI.el('p', {}, text)));
  toast('Trakt 同步完成', {type:result.Failed ? 'warning':'success', message});
  if (view === 'browse') await browse();
 } catch (error) {
  if (owner === user?.Id && auth === token) sessionStorage.removeItem('go-emby-trakt-pending');
  if (!valid()) return;
  content.replaceChildren(UI.el('p', {role:'status'}, error.message));
  toast(error.message, {type:'error'});
 }
}
