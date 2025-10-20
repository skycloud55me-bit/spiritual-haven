// Main JS for Oasis full app (separated file)
(function(){
  // Elements
  const openBtn = document.getElementById('openPanelBtn');
  const sidePanel = document.getElementById('sidePanel');
  const closeBtn = document.getElementById('closePanelBtn');
  const backdrop = document.getElementById('backdrop');
  const navItems = document.querySelectorAll('.nav-item');
  const welcomeMsg = document.getElementById('welcomeMsg');
  const phrases = ["السلام عليكم ورحمة الله 🌿","مرحبا بكِ في رحاب الإيمان 💫","زادكِ الله نورًا وطمأنينة 💛","اللهم اجعل هذا اليوم بركةً وسعادة 🌸","يا الله اجعل قلوبنا عامرة بذكرك 🤍"];
  // UI sounds (use free examples or leave blank to disable)
  const click = new Audio('https://cdn.pixabay.com/download/audio/2021/08/04/audio_9f3f9f5f4b.mp3?filename=soft-click-6083.mp3');
  const breeze = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_8a1b7b6c5e.mp3?filename=soft-wind-111963.mp3');

  function playSafe(a){ try{ a.currentTime=0; a.play().catch(()=>{}); }catch(e){} }

  function openPanel(){
    sidePanel.classList.add('open'); backdrop.classList.add('show'); sidePanel.setAttribute('aria-hidden','false');
    playSafe(click);
    // welcome phrase
    welcomeMsg.textContent = phrases[Math.floor(Math.random()*phrases.length)];
    welcomeMsg.classList.add('show');
    playSafe(breeze);
    setTimeout(()=> welcomeMsg.classList.remove('show'), 2600);
  }
  function closePanel(){
    sidePanel.classList.remove('open'); backdrop.classList.remove('show'); sidePanel.setAttribute('aria-hidden','true');
    playSafe(click);
  }
  openBtn.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);
  // nav: switch pages and auto close
  navItems.forEach(btn=> btn.addEventListener('click', ()=>{
    const page = btn.getAttribute('data-page');
    showPage(page);
    setTimeout(closePanel, 220);
  }));

  function showPage(id){
    document.querySelectorAll('.page-content').forEach(p=> p.classList.add('d-none'));
    const target = document.getElementById(id);
    if(target) target.classList.remove('d-none');
    // small click sound
    playSafe(click);
  }

  // default page
  showPage('quran');

  // load welcome phrase list
  const phrasesList = document.getElementById('phrasesList');
  phrases.forEach(ph=>{
    const li = document.createElement('li'); li.style.padding='6px 0'; li.style.color='#6b4b0d'; li.textContent = ph; phrasesList.appendChild(li);
  });

  // --- Quran features ---
  const surahList = document.getElementById('surahList');
  const surahTitle = document.getElementById('surahTitle');
  const surahMeta = document.getElementById('surahMeta');
  const surahText = document.getElementById('surahText');
  const searchInSurah = document.getElementById('searchInSurah');
  const searchResults = document.getElementById('searchResults');
  let currentAyahs = [], fontSize = 20, readerDark=false;

  function escapeHtml(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  async function loadSurahIndex(){
    try{
      surahList.innerHTML = '<div class="text-muted">جاري تحميل فهرس السور...</div>';
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const json = await res.json();
      const list = json.data;
      surahList.innerHTML = '';
      list.forEach(s=>{
        const btn = document.createElement('button');
        btn.className = 'surah-list-btn';
        btn.innerHTML = `<strong>${s.number}.</strong> ${s.name} <span class="text-muted" style="float:left">${s.ayahs} آية</span>`;
        btn.addEventListener('click', ()=> loadSurah(s.number, s.englishName + ' — ' + s.name, s.ayahs));
        surahList.appendChild(btn);
      });
    }catch(err){
      surahList.innerHTML = '<div class="text-danger">فشل تحميل فهرس السور.</div>';
      console.error(err);
    }
  }

  async function loadSurah(num,title,ayahCount){
    try{
      surahTitle.textContent = 'تحميل السورة...';
      surahMeta.textContent = '';
      surahText.innerHTML = '';
      searchResults.innerHTML = '';
      const res = await fetch('https://api.alquran.cloud/v1/surah/' + num + '/quran-uthmani');
      const json = await res.json();
      const ayahs = json.data.ayahs;
      currentAyahs = ayahs;
      const html = ayahs.map(a=>`<div style="margin-bottom:10px"><span style="font-weight:700;color:var(--primary)">${a.numberInSurah}.</span> <span>${escapeHtml(a.text)}</span></div>`).join('');
      surahText.innerHTML = html;
      surahTitle.textContent = title + ` (${ayahCount} آية)`;
      surahMeta.textContent = `السورة رقم ${num} — عدد الآيات: ${ayahCount}`;
      if(searchInSurah) searchInSurah.value='';
      surahText.style.fontSize = fontSize + 'px';
      const container = document.querySelector('.surah-container'); if(container) container.scrollTop=0;
      playSafe(click);
    }catch(e){
      surahTitle.textContent = 'فشل التحميل';
      surahText.textContent = 'حدثت مشكلة أثناء تحميل السورة.';
      console.error(e);
    }
  }

  if(searchInSurah){
    searchInSurah.addEventListener('input', ()=>{
      const q = searchInSurah.value.trim();
      if(!q){ searchResults.innerHTML=''; return; }
      const results = [];
      currentAyahs.forEach(a=>{ if(a.text.includes(q)) results.push({num:a.numberInSurah,text:a.text}); });
      if(results.length===0){ searchResults.innerHTML = '<div class="text-muted">لا توجد نتائج</div>'; return; }
      searchResults.innerHTML = '<div class="text-muted">نتائج البحث:</div>' + results.map(r=>`<div style="padding:6px 8px;border-radius:6px;margin-top:6px;background:rgba(255,250,235,0.8)"><strong>${r.num}.</strong> ${r.text.replace(new RegExp(q,'g'),`<mark>${q}</mark>`)}</div>`).join('');
      playSafe(click);
    });
  }

  document.getElementById('increaseFont').addEventListener('click', ()=>{ fontSize = Math.min(30,fontSize+2); surahText.style.fontSize = fontSize+'px'; playSafe(click); });
  document.getElementById('decreaseFont').addEventListener('click', ()=>{ fontSize = Math.max(14,fontSize-2); surahText.style.fontSize = fontSize+'px'; playSafe(click); });
  document.getElementById('toggleReaderTheme').addEventListener('click', ()=>{ readerDark=!readerDark; const container=document.querySelector('.surah-container'); if(readerDark){ container.style.background='#0b2b2b'; container.style.color='#f1f1f1'; } else { container.style.background='rgba(255,255,255,0.98)'; container.style.color='#111'; } playSafe(click); });

  loadSurahIndex();

  // --- Quran Garden features (verse, duas, reading goal) ---
  const verses = [{text:'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',surah:'الرعد - 28',ex:'الذكر يطمئن القلب.'},{text:'وَقُلْ رَبِّ زِدْنِي عِلْمًا',surah:'طه - 114',ex:'دعاء لزيادة العلم.'},{text:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',surah:'الشرح - 5',ex:'التوكّل والصبر.'}];
  const duas = { knowledge:['اللهم أنفعنا بالعلم وعلّمنا ما ينفعنا','اللهم ارزقنا علمًا نافعًا وعملاً متقبلاً'], ease:['اللهم لا سهل إلا ما جعلته سهلاً','اللهم فكّ كربتي ويسّر أمري'], worries:['اللهم الطّمأنينة لقلبي','اللهم فرّج همّي واغفر لي'], general:['اللهم اغفر لنا وارحمنا','اللهم اهدنا واجعلنا من الصالحين'] };
  document.getElementById('newVerseBtn').addEventListener('click', ()=>{ const v=verses[Math.floor(Math.random()*verses.length)]; document.getElementById('dailyVerse').textContent='"'+v.text+'"'; document.getElementById('verseSurah').textContent=v.surah; document.getElementById('verseExplanation').textContent=v.ex; playSafe(click); });
  document.getElementById('newDuaBtn').addEventListener('click', ()=>{ const cat=document.getElementById('duaCategory').value; let list=[]; if(cat==='all'){ Object.values(duas).forEach(a=>list=list.concat(a)); } else list=duas[cat]||[]; const d=list[Math.floor(Math.random()*list.length)]; if(d){ document.getElementById('duaText').textContent=d; document.getElementById('duaCategoryText').textContent='نوع الدعاء: '+(cat==='all'?'عام':document.getElementById('duaCategory').selectedOptions[0].text); playSafe(click); } });

  // pages goal
  const pagesGoalEl = document.getElementById('pagesGoal');
  pagesGoalEl.addEventListener('input', ()=>{ document.getElementById('goalValue').textContent = pagesGoalEl.value; localStorage.setItem('oasis_pagesGoal', pagesGoalEl.value); playSafe(click); });
  document.getElementById('recordReadingBtn').addEventListener('click', ()=>{ const added = Math.max(1, Math.round(Math.random()* (parseInt(pagesGoalEl.value)||1))); state.quranPages += added; localStorage.setItem('oasis_pages', state.quranPages); document.getElementById('quranPages').textContent=state.quranPages; document.getElementById('achievementsList').insertAdjacentHTML('afterbegin','<li class=\"list-group-item\">قراءة: +'+added+' صفحة - '+new Date().toLocaleDateString()+'</li>'); playSafe(click); });

  // righteous deeds
  document.getElementById('recordDeedBtn').addEventListener('click', ()=>{ state.goodDeeds++; localStorage.setItem('oasis_deeds', state.goodDeeds); document.getElementById('goodDeeds').textContent = state.goodDeeds; playSafe(click); });
  document.getElementById('calculatePrayerBtn').addEventListener('click', ()=>{ const checks=document.querySelectorAll('.prayer-check'); let c=0; checks.forEach(ch=>{ if(ch.checked) c++; }); if(c===5){ state.prayerStreak++; localStorage.setItem('oasis_prayer', state.prayerStreak); document.getElementById('prayerStreak').textContent=state.prayerStreak; playSafe(click); alert('مبروك! سلسلة الصلاة زادت'); } else { playSafe(click); alert('تم احتساب الصلوات ('+c+'/5)'); } });

  // azkar counters
  function incAzkar(t){ const key='oasis_azkar_'+t; let v=parseInt(localStorage.getItem(key))||0; v++; if(v>33) v=0; localStorage.setItem(key,v); document.getElementById('count'+capitalize(t)).textContent = v; if(v===0) { playSafe(breeze); alert('انتهيت من 33 ذكرًا - بارك الله فيك'); } playSafe(click); }
  function resetAzkar(t){ localStorage.setItem('oasis_azkar_'+t,0); document.getElementById('count'+capitalize(t)).textContent = 0; playSafe(click); }
  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
  ['incMorning','incEvening','incAfter'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('click', ()=> incAzkar(el.getAttribute('data-counter'))); });
  ['resetMorning','resetEvening','resetAfter'].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener('click', ()=> { resetAzkar(el.getAttribute('data-counter')); }); });

  // memory game
  function createMemoryBoard(){ const board=document.getElementById('memoryBoard'); board.innerHTML=''; const symbols=['★','✿','☪','✦','❤','☀','✈','✧']; const cards=symbols.concat(symbols); cards.sort(()=>Math.random()-0.5); cards.forEach(s=>{ const col=document.createElement('div'); col.className='col-3'; const card=document.createElement('div'); card.className='memory-card islamic-card text-center'; card.dataset.symbol=s; card.textContent='?'; card.addEventListener('click', onFlip); col.appendChild(card); board.appendChild(col); }); }
  let first=null, second=null, lock=false;
  function onFlip(e){ if(lock) return; const el=e.currentTarget; if(el===first) return; el.textContent=el.dataset.symbol; el.classList.add('flipped'); if(!first){ first=el; return; } second=el; lock=true; setTimeout(()=>{ if(first.dataset.symbol===second.dataset.symbol){ first.style.visibility='hidden'; second.style.visibility='hidden'; state.gameScore += 10; localStorage.setItem('oasis_game', state.gameScore); document.getElementById('gameScore').textContent=state.gameScore; playSafe(click); } else { first.textContent='?'; second.textContent='?'; first.classList.remove('flipped'); second.classList.remove('flipped'); } first=null; second=null; lock=false; },800); }
  document.getElementById('newGameBtn').addEventListener('click', ()=>{ createMemoryBoard(); state.gameScore=0; localStorage.setItem('oasis_game', state.gameScore); document.getElementById('gameScore').textContent=state.gameScore; playSafe(click); });
  createMemoryBoard();

  // quiz system with rotation and riddle
  const quizPool = [
    {q:'كم عدد ركعات صلاة الفجر؟',opts:['2','4','3','1'],a:0},
    {q:'ما اسم آخر سورة في القرآن؟',opts:['الناس','الفاتحة','الكوثر','الاخلاص'],a:0},
    {q:'متى تكون صلاة الظهر؟',opts:['بعد منتصف النهار','مساءً','فجرًا','ليلًا'],a:0},
    {q:'كم عدد أجزاء القرآن؟',opts:['30','10','60','50'],a:0},
    {q:'ما فائدة الاستغفار؟',opts:['مغفرة الذنوب','زيادة الوزن','نوم عميق','كثرة الحديث'],a:0},
    {q:'أين أنزل القرآن؟',opts:['المدينة','مكة','القدس','بابل'],a:1},
    {q:'ما هي قبلة المسلمين؟',opts:['الكعبة','القدس','مكة المدينة','البحر'],a:0},
    {q:'ما الفائدة من الصدقة؟',opts:['بركة المال','نقصه','ألم','كراهية الناس'],a:0},
    {q:'ما هو وقت صلاة المغرب؟',opts:['بعد غروب الشمس','قبل الفجر','بعد الظهر','منتصف الليل'],a:0},
    {q:'ما عدد ركعات العشاء؟',opts:['4','2','3','1'],a:0}
  ];
  function startNewQuiz(){ const pool=[...quizPool]; pool.sort(()=>Math.random()-0.5); const chosen=pool.slice(0,Math.min(8,pool.length)); const stateQ={questions:chosen,index:0,score:0}; localStorage.setItem('oasis_quiz_state',JSON.stringify(stateQ)); loadQuiz(); playSafe(click); }
  function loadQuiz(){ const raw=localStorage.getItem('oasis_quiz_state'); if(!raw) return; const s=JSON.parse(raw); const q=s.questions[s.index]; document.getElementById('quizQuestion').textContent=(s.index+1)+'. '+q.q; const optsDiv=document.getElementById('quizOptions'); optsDiv.innerHTML=''; q.opts.forEach((op,i)=>{ const b=document.createElement('button'); b.className='btn btn-light btn-sm mb-1 w-100'; b.textContent=op; b.addEventListener('click', ()=>{ if(i===q.a){ s.score++; playSafe(click); } else playSafe(click); s.index=Math.min(s.questions.length-1,s.index+1); localStorage.setItem('oasis_quiz_state',JSON.stringify(s)); document.getElementById('quizScore').textContent=s.score; if(s.index>=s.questions.length){ alert('انتهى الاختبار - النتيجة: '+s.score+'/'+s.questions.length); } loadQuiz(); }); optsDiv.appendChild(b); }); }
  document.getElementById('startQuizBtn').addEventListener('click', startNewQuiz);
  document.getElementById('nextQBtn').addEventListener('click', ()=>{ const raw=localStorage.getItem('oasis_quiz_state'); if(!raw) return; const s=JSON.parse(raw); s.index=Math.min(s.questions.length-1,s.index+1); localStorage.setItem('oasis_quiz_state',JSON.stringify(s)); loadQuiz(); });

  // riddles simple rotation
  const riddles = [
    {q:'شيء كلما أخذت منه يكبر، ما هو؟',a:'الحفرة'},
    {q:'له أوراق وليس شجرة، ما هو؟',a:'الكتاب'},
    {q:'أنا أخضر في الربيع واصفر في الخريف، ما أنا؟',a:'الشجرة'}
  ];
  let currentRiddleIndex = 0;
  function loadRiddle(){ const r=riddles[currentRiddleIndex]; document.getElementById('riddleQuestion').textContent = 'لغز: '+r.q; document.getElementById('riddleResult').textContent=''; document.getElementById('riddleAnswer').value=''; }
  document.getElementById('submitRiddle').addEventListener('click', ()=>{ const ans=document.getElementById('riddleAnswer').value.trim(); if(!ans) return; const r=riddles[currentRiddleIndex]; if(ans.localeCompare(r.a,'ar',{sensitivity:'base'})===0){ document.getElementById('riddleResult').innerHTML='<div class=\"text-success\">إجابة صحيحة!</div>'; playSafe(click); } else { document.getElementById('riddleResult').innerHTML='<div class=\"text-danger\">خطأ — الإجابة: '+r.a+'</div>'; playSafe(click); } currentRiddleIndex = (currentRiddleIndex+1) % riddles.length; setTimeout(loadRiddle,800); });

  loadRiddle();

  // --- Persistence: stats
  let state = { prayerStreak: parseInt(localStorage.getItem('oasis_prayer'))||0, goodDeeds: parseInt(localStorage.getItem('oasis_deeds'))||0, quranPages: parseInt(localStorage.getItem('oasis_pages'))||0, gameScore: parseInt(localStorage.getItem('oasis_game'))||0 };
  document.getElementById('prayerStreak').textContent = state.prayerStreak;
  document.getElementById('goodDeeds').textContent = state.goodDeeds;
  document.getElementById('quranPages').textContent = state.quranPages;
  document.getElementById('gameScore').textContent = state.gameScore;

  // achievements list
  const achievementsEl = document.getElementById('achievementsList');

  // small helpers for azkar labels
  function loadAzkarCounts(){ ['morning','evening','after'].forEach(k=>{ const v=parseInt(localStorage.getItem('oasis_azkar_'+k))||0; const el=document.getElementById('count'+capitalize(k)); if(el) el.textContent = v; }); }
  loadAzkarCounts();

  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  // expose some functions (for debugging)
  window.Oasis = { openPanel: ()=> openPanel(), closePanel: ()=> closePanel(), loadSurahIndex: loadSurahIndex };

})();