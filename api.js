// 使用更現代的 Set 來記錄折疊狀態，查詢與刪除效率更高
let collapsedSections = new Set(JSON.parse(localStorage.getItem('portal_collapsed')) || []);

// 切換深色模式
function toggleDarkMode() {
 const isDark = document.documentElement.classList.toggle('dark');
 localStorage.theme = isDark ? 'dark' : 'light';
}

// 區塊點擊處理（修正：移除標題層的 pointer-events-none，改用精準的事件阻斷）
function handleSectionClick(e, category) {
 // 如果點擊的是卡片（a 標籤）或卡片內部的任何東西，直接結束，不觸發折疊
 if (e.target.closest('a')) return;
 toggleSection(category);
}

// 切換區塊折疊狀態
function toggleSection(category) {
 if (collapsedSections.has(category)) {
  collapsedSections.delete(category);
 } else {
  collapsedSections.add(category);
 }

 localStorage.setItem('portal_collapsed', JSON.stringify([...collapsedSections]));

 // 優化：不需要整頁重繪，直接透過切換 Class 實現流暢折疊
 const sectionEl = document.querySelector(`section[data-category="${category}"]`);
 if (sectionEl) {
  const gridEl = sectionEl.querySelector('.cards-grid-container');
  const arrowEl = sectionEl.querySelector('.arrow-icon');

  gridEl.classList.toggle('hidden');
  gridEl.classList.toggle('cards-grid');
  arrowEl.classList.toggle('-rotate-180');
 }
}

// 渲染入口網站主結構
function renderPortal(lang) {
 const config = portalConfig[lang];
 document.getElementById('ui-main-title').innerText = config.title;

 const container = document.getElementById('portal-container');

 container.innerHTML = config.sections.map((section, index) => {
  const isCollapsed = collapsedSections.has(section.category);
  const theme = sectionThemes[index % sectionThemes.length];

  return `
   <section data-category="${section.category}" onclick="handleSectionClick(event, '${section.category}')"
     class="section-bar ${theme.bg} ${theme.border} rounded-3xl md:rounded-r-[40px] shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300 cursor-pointer hover:bg-white/40 dark:hover:bg-white/5">
     
     <!-- 標題欄（移除 pointer-events-none，確保能正確辨識點擊範圍） -->
     <div class="p-5 md:p-8 flex items-center justify-between">
       <div class="flex items-center gap-4 md:gap-6">
         <div class="p-3.5 bg-slate-900 dark:bg-slate-800 rounded-2xl text-white shadow-xl">
           ${icons[section.icon] || icons.code}
         </div>
         <h2 class="text-xl md:text-3xl font-black ${theme.text} tracking-tight">
           ${section.category}
         </h2>
       </div>
       <div class="arrow-icon transition-transform duration-500 ${isCollapsed ? '-rotate-180' : 'rotate-0'}">
         <svg class="w-8 h-8 md:w-10 md:h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"/>
         </svg>
       </div>
     </div>

     <!-- 卡片內容區 -->
     <div class="cards-grid-container ${isCollapsed ? 'hidden' : 'cards-grid'} grid gap-3 md:gap-5 p-5 md:p-8 pt-0">
       ${section.items.map(item => `
         <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="group">
           <div class="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center h-full transition-all duration-300">
             <div class="w-14 h-14 md:w-16 md:h-16 rounded-2xl ${item.color} flex items-center justify-center text-white font-black text-xl md:text-2xl mb-3 shadow-lg">
               ${item.name}
             </div>
             <h3 class="text-sm md:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
               ${item.label}
             </h3>
             <p class="text-[10px] md:text-xs text-slate-400 mt-1">${item.sub}</p>
           </div>
         </a>
       `).join('')}
     </div>
   </section>
 `;
 }).join('');
}

// ===================== 初始化 =====================
document.addEventListener('DOMContentLoaded', () => {
 // 1. 初始化主題（深色/淺色模式）
 if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
 } else {
  document.documentElement.classList.remove('dark');
 }

 // 2. 初始化語系與渲染
 const langSelect = document.getElementById('lang-select');
 const savedLang = localStorage.getItem('portal_lang') || 'zh';

 langSelect.value = savedLang;
 renderPortal(savedLang);

 // 3. 綁定語系切換事件
 langSelect.addEventListener('change', (e) => {
  const newLang = e.target.value;
  renderPortal(newLang);
  localStorage.setItem('portal_lang', newLang);
 });
});