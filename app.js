// app.js — النسخة النهائية مع جميع التعديلات المطلوبة
(function(){
  "use strict";

  /* ---------- عناصر DOM ---------- */
  const openBtn = document.getElementById('openPanelBtn');
  const sidePanel = document.getElementById('sidePanel');
  const closeBtn = document.getElementById('closePanelBtn');
  const backdrop = document.getElementById('backdrop');
  const navItems = document.querySelectorAll('[data-page]');
  const wahaLang = document.getElementById('wahaLangSelect');
  const wahaTheme = document.getElementById('wahaThemeSelect');
  const colorOptions = document.querySelectorAll('.color-option');

  /* أصوات */
  const soundClick   = document.getElementById('soundClick');
  const soundPop     = document.getElementById('soundPop');
  const soundWhoosh  = document.getElementById('soundWhoosh');
  const soundAchievement = document.getElementById('soundAchievement');

  function playSound(el){
    try{
      if(!el) return;
      el.currentTime = 0;
      const p = el.play();
      if(p && typeof p.then === 'function') p.catch(()=>{});
    }catch(e){}
  }

  /* ---------- نظام الألوان المخصص ---------- */
  function initColorPicker() {
    const savedColor = localStorage.getItem('waha_color') || '#014d40';
    applyColor(savedColor);
    
    colorOptions.forEach(option => {
      if(option.dataset.color === savedColor) {
        option.classList.add('active');
      }
      
      option.addEventListener('click', function() {
        const color = this.dataset.color;
        applyColor(color);
        colorOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        playSound(soundClick);
      });
    });
  }

  function applyColor(color) {
    document.documentElement.style.setProperty('--primary', color);
    document.documentElement.style.setProperty('--primary-2', darkenColor(color, 20));
    localStorage.setItem('waha_color', color);
  }

  function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  /* ---------- نظام المستويات والإنجازات ---------- */
  const achievements = {
    beginner: { title: "المبتدئ", points: 0, icon: "🌱" },
    reader: { title: "القارئ", points: 100, icon: "📖" },
    worshiper: { title: "العابد", points: 300, icon: "🕌" },
    scholar: { title: "العالم", points: 600, icon: "🎓" },
    master: { title: "الأستاذ", points: 1000, icon: "👑" }
  };

  const badgeSystem = {
    prayer_streak_7: { name: "المحافظ", desc: "7 أيام متتالية من الصلاة", icon: "🕋", points: 50 },
    quran_reader: { name: "قارئ القرآن", desc: "قراءة 100 صفحة", icon: "📚", points: 30 },
    good_deeds: { name: "محسن", desc: "50 عمل خير", icon: "⭐", points: 40 },
    memory_master: { name: "سيد الذاكرة", desc: "فوز في لعبة الذاكرة", icon: "🧠", points: 20 },
    quiz_champion: { name: "بطل الاختبار", desc: "نتيجة 100% في الاختبار", icon: "🏆", points: 25 },
    daily_visitor: { name: "الزائر اليومي", desc: "زيارة 30 يوم متتالي", icon: "📅", points: 60 }
  };

  function calculateLevel(points) {
    if (points >= 1000) return { level: 5, title: "الأستاذ", nextLevel: 1500, progress: (points-1000)/500 };
    if (points >= 600) return { level: 4, title: "العالم", nextLevel: 1000, progress: (points-600)/400 };
    if (points >= 300) return { level: 3, title: "العابد", nextLevel: 600, progress: (points-300)/300 };
    if (points >= 100) return { level: 2, title: "القارئ", nextLevel: 300, progress: (points-100)/200 };
    return { level: 1, title: "المبتدئ", nextLevel: 100, progress: points/100 };
  }

  function updateUserLevel() {
    const userData = JSON.parse(localStorage.getItem('waha_user_data') || '{"points":0}');
    const levelInfo = calculateLevel(userData.points);
    
    document.getElementById('userLevel').textContent = levelInfo.level;
    document.getElementById('userLevelDisplay').textContent = levelInfo.level;
    document.getElementById('userTitle').textContent = levelInfo.title;
    document.getElementById('userPoints').textContent = userData.points;
    document.getElementById('levelBar').style.width = (levelInfo.progress * 100) + '%';
    document.getElementById('expProgress').style.width = (levelInfo.progress * 100) + '%';
  }

  function awardPoints(points, reason) {
    const userData = JSON.parse(localStorage.getItem('waha_user_data') || '{"points":0}');
    const oldLevel = calculateLevel(userData.points).level;
    userData.points += points;
    localStorage.setItem('waha_user_data', JSON.stringify(userData));
    
    const newLevel = calculateLevel(userData.points).level;
    if (newLevel > oldLevel) {
      showAchievement(`المستوى ${newLevel}!`, `تهانينا! لقد وصلت إلى ${calculateLevel(userData.points).title}`);
    }
    
    updateUserLevel();
    return userData.points;
  }

  function showAchievement(title, message) {
    const toast = document.getElementById('achievementToast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    
    toast.classList.add('show');
    playSound(soundAchievement);
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  /* ---------- نظام الفعاليات الإسلامية ---------- */
  const islamicEvents = {
    muharram: {
      name: "شهر الله المحرم",
      description: "أول أشهر الحرم، فيه يوم عاشوراء",
      rewards: "مضاعفة الحسنات",
      duration: "شهر كامل",
      icon: "🕌"
    },
    ramadan: {
      name: "شهر رمضان المبارك",
      description: "شهر الصيام والقيام والقرآن",
      rewards: "مضاعفة الحسنات 10 مرات",
      duration: "شهر كامل", 
      icon: "🌙"
    },
    shawwal: {
      name: "شهر شوال",
      description: "شهر الأجر والمغفرة، فيه عيد الفطر",
      rewards: "صيام 6 أيام كصيام الدهر",
      duration: "شهر كامل",
      icon: "🎉"
    },
    dhulHijjah: {
      name: "ذو الحجة",
      description: "أشهر الحج، فيه يوم عرفة وعيد الأضحى",
      rewards: "أعمال أفضل من الجهاد",
      duration: "أول 10 أيام",
      icon: "🕋"
    }
  };

  const hijriMonths = [
    "المحرم", "صفر", "ربيع الأول", "ربيع الآخر", 
    "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", 
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ];

  function getCurrentIslamicEvent() {
    const now = new Date();
    const month = now.getMonth() + 1;
    
    const events = {
      1: islamicEvents.muharram,
      9: islamicEvents.ramadan,
      10: islamicEvents.shawwal, 
      12: islamicEvents.dhulHijjah
    };
    
    return events[month] || null;
  }

  function updateIslamicEvents() {
    const currentEvent = getCurrentIslamicEvent();
    const eventElement = document.getElementById('currentEvent');
    const hijriCalendar = document.getElementById('hijriCalendar');
    
    if (currentEvent && eventElement) {
      eventElement.innerHTML = `
        <div style="text-align:center">
          <div style="font-size:2rem">${currentEvent.icon}</div>
          <h5>${currentEvent.name}</h5>
          <p>${currentEvent.description}</p>
          <small>${currentEvent.rewards}</small>
        </div>
      `;
    }
    
    if (hijriCalendar) {
      const today = new Date();
      const randomMonth = hijriMonths[Math.floor(Math.random() * hijriMonths.length)];
      const randomDay = Math.floor(Math.random() * 29) + 1;
      const randomYear = 1440 + Math.floor(Math.random() * 5);
      
      hijriCalendar.innerHTML = `
        <div class="hijri-date">${randomDay} ${randomMonth} ${randomYear}هـ</div>
        <div>${getRandomIslamicDate()}</div>
      `;
    }
  }

  function getRandomIslamicDate() {
    const dates = [
      "ليلة مباركة للدعاء والذكر",
      "يوم صيام مستحب", 
      "فضل كبير للصدقة",
      "ذكر الله يطمئن القلوب",
      "الاستغفار يمحو الذنوب"
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  /* ---------- نظام التذكيرات ---------- */
  function initReminders() {
    const reminders = [
      "⏰ وقت أذكار الصباح",
      "📖 خصصي وقتًا لقراءة القرآن", 
      "🤲 ادعي لنفسك ولوالديك",
      "💝 تصدقي ولو بشق تمرة",
      "🕌 حافظي على الصلوات في وقتها",
      "🌙 اذكري الله قبل النوم"
    ];
    
    const remindersElement = document.getElementById('dailyReminders');
    if (remindersElement) {
      remindersElement.innerHTML = reminders.map(reminder => 
        `<div class="interactive-card" style="margin-bottom:8px">${reminder}</div>`
      ).join('');
    }

    // تذكيرات الصلوات
    const prayerReminders = document.getElementById('prayerReminders');
    if (prayerReminders) {
      const prayerTimes = [
        "🌄 الصبح: أفضل وقت عند الفجر",
        "☀️ الظهر: عندما تزول الشمس",
        "🌅 العصر: حين يصبح ظل كل شيء مثله",
        "🌇 المغرب: بعد غروب الشمس مباشرة",
        "🌙 العشاء: بعد مغيب الشفق الأحمر"
      ];
      prayerReminders.innerHTML = prayerTimes.map(time => 
        `<div>${time}</div>`
      ).join('');
    }
  }

  /* ---------- نظام الرسوم البيانية ---------- */
  function initCharts() {
    const weeklyData = {
      labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
      prayers: [4, 5, 5, 3, 5, 4, 5],
      quran: [5, 8, 6, 7, 10, 9, 12],
      deeds: [2, 3, 1, 4, 2, 3, 5]
    };
    
    const weeklyCtx = document.getElementById('weeklyChart');
    if (weeklyCtx) {
      new Chart(weeklyCtx, {
        type: 'line',
        data: {
          labels: weeklyData.labels,
          datasets: [
            {
              label: 'الصلوات',
              data: weeklyData.prayers,
              borderColor: '#d9b44a',
              backgroundColor: 'rgba(217, 180, 74, 0.1)',
              tension: 0.4
            },
            {
              label: 'صفحات القرآن',
              data: weeklyData.quran,
              borderColor: '#6abf69', 
              backgroundColor: 'rgba(106, 191, 105, 0.1)',
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              rtl: true
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
    
    const progressCtx = document.getElementById('progressChart');
    if (progressCtx) {
      new Chart(progressCtx, {
        type: 'doughnut',
        data: {
          labels: ['الصلاة', 'القرآن', 'الأذكار', 'أعمال الخير'],
          datasets: [{
            data: [35, 25, 20, 20],
            backgroundColor: ['#d9b44a', '#6abf69', '#014d40', '#8B4513']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              rtl: true
            }
          }
        }
      });
    }
  }

  /* ---------- نظام الإنجازات ---------- */
  function initAchievements() {
    const userData = JSON.parse(localStorage.getItem('waha_user_data') || '{"points":0}');
    const achievementsGrid = document.getElementById('achievementsGrid');
    const recentAchievements = document.getElementById('recentAchievements');
    
    if (achievementsGrid) {
      let html = '';
      Object.entries(badgeSystem).forEach(([key, badge]) => {
        const unlocked = userData.points >= badge.points;
        html += `
          <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon">${badge.icon}</div>
            <h6>${badge.name}</h6>
            <p>${badge.desc}</p>
            <small>${badge.points} نقطة</small>
          </div>
        `;
      });
      achievementsGrid.innerHTML = html;
    }
    
    if (recentAchievements) {
      const recent = Object.entries(badgeSystem)
        .filter(([key, badge]) => userData.points >= badge.points)
        .slice(0, 3);
      
      if (recent.length > 0) {
        recentAchievements.innerHTML = recent.map(([key, badge]) => 
          `<div class="interactive-card" style="margin-bottom:8px">
            <div>${badge.icon} ${badge.name}</div>
            <small>${badge.desc}</small>
           </div>`
        ).join('');
      } else {
        recentAchievements.innerHTML = '<div class="text-muted">لا توجد إنجازات بعد</div>';
      }
    }
  }

  /* ---------- نظام القصص والحكم ---------- */
  const prophetStories = [
    {
      title: "نبي الله آدم",
      content: "أول البشر، خلقه الله بيديه ونفخ فيه من روحه، وسجد له الملائكة، وأسكنه الجنة.",
      moral: "التوبة تهدم ما قبلها"
    },
    {
      title: "نبي الله نوح",
      content: "دعا قومه 950 سنة، صنع السفينة بأمر الله، ونجى مع المؤمنين من الطوفان.",
      moral: "الصبر على الدعوة"
    },
    {
      title: "نبي الله إبراهيم",
      content: "أبو الأنبياء، حطم الأصنام، بنى الكعبة، وابتلاه الله بأعظم الابتلاءات.",
      moral: "التوحيد الخالص"
    }
  ];

  const dailyWisdom = [
    "خير الناس أنفعهم للناس",
    "الكلمة الطيبة صدقة", 
    "اتق الله حيثما كنت",
    "أفضل الجهاد كلمة حق عند سلطان جائر",
    "من حسن إسلام المرء تركه ما لا يعنيه",
    "لا تغضب ولك الجنة"
  ];

  const quranTreasures = [
    "آية الكرسي أعظم آية في القرآن",
    "سورة الإخلاص تعدل ثلث القرآن",
    "خيركم من تعلم القرآن وعلمه",
    "القرآن شفاء لما في الصدور",
    "حافظ القرآن مع السفرة الكرام البررة"
  ];

  function initStoriesAndWisdom() {
    const storyElement = document.getElementById('prophetStory');
    const wisdomElement = document.getElementById('dailyWisdom');
    const treasuresElement = document.getElementById('quranTreasures');
    
    if (storyElement) {
      const randomStory = prophetStories[Math.floor(Math.random() * prophetStories.length)];
      storyElement.innerHTML = `
        <h6>${randomStory.title}</h6>
        <p>${randomStory.content}</p>
        <small><strong>العبرة:</strong> ${randomStory.moral}</small>
      `;
    }
    
    if (wisdomElement) {
      wisdomElement.textContent = dailyWisdom[Math.floor(Math.random() * dailyWisdom.length)];
    }
    
    if (treasuresElement) {
      treasuresElement.textContent = quranTreasures[Math.floor(Math.random() * quranTreasures.length)];
    }
  }

  /* ---------- نظام التحديات ---------- */
  function initChallenges() {
    const weeklyChallenge = document.getElementById('weeklyChallenge');
    const activeChallenges = document.getElementById('activeChallenges');
    
    if (weeklyChallenge) {
      const challenges = [
        "اقرأ 50 صفحة من القرآن هذا الأسبوع",
        "حافظ على الصلوات في الجماعة",
        "أدِ 100 ركعة نافلة هذا الأسبوع", 
        "تصدق كل يوم ولو بقليل",
        "احفظ 10 آيات جديدة"
      ];
      
      weeklyChallenge.innerHTML = `
        <div class="interactive-card">
          <h6>${challenges[Math.floor(Math.random() * challenges.length)]}</h6>
          <small>مكافأة: 25 نقطة</small>
        </div>
      `;
    }
    
    if (activeChallenges) {
      activeChallenges.innerHTML = `
        <div class="interactive-card" style="margin-bottom:8px">
          <h6>سلسلة الصلاة</h6>
          <div class="progress" style="height:6px;margin:5px 0">
            <div class="progress-bar" style="width:60%"></div>
          </div>
          <small>3/5 أيام</small>
        </div>
        <div class="interactive-card">
          <h6>قراءة القرآن</h6>
          <div class="progress" style="height:6px;margin:5px 0">
            <div class="progress-bar" style="width:40%"></div>
          </div>
          <small>20/50 صفحة</small>
        </div>
      `;
    }
  }

  /* ---------- نظام الرحلة الإسلامية ---------- */
  function initIslamicJourney() {
    const journeyTopics = document.querySelectorAll('.journey-topic');
    const journeyContent = document.getElementById('journeyContent');
    
    const journeyData = {
      prophets: {
        title: "📖 رحلة في قصص الأنبياء",
        content: `
          <div class="journey-lesson">
            <h5>تعرف على أنبياء الله ورسله</h5>
            <div class="lesson-content">
              <p>• قصة آدم عليه السلام: أول البشر وأبو البشرية</p>
              <p>• قصة نوح عليه السلام: داعي التوحيد وصاحب السفينة</p>
              <p>• قصة إبراهيم عليه السلام: أبو الأنبياء وحطم الأصنام</p>
              <p>• قصة موسى عليه السلام: كليم الله ومناجاة الرب</p>
              <p>• قصة عيسى عليه السلام: روح الله وكلمته</p>
              <p>• قصة محمد ﷺ: خاتم الأنبياء والمرسلين</p>
            </div>
            <button class="btn btn-outline-light btn-sm mt-2" onclick="awardPoints(10, 'تعلم قصص الأنبياء')">🎯 اكسب 10 نقاط</button>
          </div>
        `
      },
      quran: {
        title: "🌙 عجائب القرآن الكريم",
        content: `
          <div class="journey-lesson">
            <h5>أسرار وإعجاز القرآن</h5>
            <div class="lesson-content">
              <p>• الإعجاز العلمي في القرآن الكريم</p>
              <p>• الإعجاز اللغوي والبلاغي</p>
              <p>• قصص القرآن وعبرها</p>
              <p>• آيات الشفاء والرحمة</p>
              <p>• أسرار ترتيب السور</p>
              <p>• فضائل سور القرآن</p>
            </div>
            <button class="btn btn-outline-light btn-sm mt-2" onclick="awardPoints(10, 'تعلم عجائب القرآن')">🎯 اكسب 10 نقاط</button>
          </div>
        `
      },
      islamicHistory: {
        title: "🏛️ رحلة في التاريخ الإسلامي",
        content: `
          <div class="journey-lesson">
            <h5>أمجاد الحضارة الإسلامية</h5>
            <div class="lesson-content">
              <p>• عصر النبوة والخلافة الراشدة</p>
              <p>• الدولة الأموية والإنجازات</p>
              <p>• الدولة العباسية وعصر الذهبي</p>
              <p>• الأندلس: درة العالم الإسلامي</p>
              <p>• الدولة العثمانية وحماية المقدسات</p>
              <p>• العلماء والمخترعون المسلمين</p>
            </div>
            <button class="btn btn-outline-light btn-sm mt-2" onclick="awardPoints(10, 'تعلم التاريخ الإسلامي')">🎯 اكسب 10 نقاط</button>
          </div>
        `
      },
      ethics: {
        title: "💫 الأخلاق الإسلامية الراقية",
        content: `
          <div class="journey-lesson">
            <h5>بناء الشخصية المسلمة</h5>
            <div class="lesson-content">
              <p>• الصدق والأمانة</p>
              <p>• التواضع وحسن الخلق</p>
              <p>• الصبر والاحتساب</p>
              <p>• الرحمة والتعاطف</p>
              <p>• العدل والإحسان</p>
              <p>• بر الوالدين وصلة الرحم</p>
            </div>
            <button class="btn btn-outline-light btn-sm mt-2" onclick="awardPoints(10, 'تعلم الأخلاق الإسلامية')">🎯 اكسب 10 نقاط</button>
          </div>
        `
      }
    };
    
    journeyTopics.forEach(topic => {
      topic.addEventListener('click', function() {
        const topicKey = this.dataset.topic;
        const topicData = journeyData[topicKey];
        
        if (topicData && journeyContent) {
          journeyContent.innerHTML = topicData.content;
          playSound(soundClick);
        }
      });
    });
  }

  /* ---------- باقي الكود الأساسي ---------- */
  const phrases = [
    "السلام عليكم ورحمة الله 🌿",
    "مرحبا بكِ في رحاب الإيمان 💫", 
    "زادكِ الله نورًا وطمأنينة 💛",
    "اللهم اجعل هذا اليوم بركةً وسعادة 🌸",
    "يا الله اجعل قلوبنا عامرة بذكرك 🤍"
  ];

  function openPanel(){
    if(!sidePanel) return;
    sidePanel.classList.add('open');
    if(backdrop) backdrop.classList.add('show');
    sidePanel.setAttribute('aria-hidden','false');
    playSound(soundWhoosh);
    
    const dailyPhrase = document.getElementById('dailyPhrase');
    if(dailyPhrase) {
      dailyPhrase.textContent = phrases[Math.floor(Math.random() * phrases.length)];
    }
  }

  function closePanel(){
    if(!sidePanel) return;
    sidePanel.classList.remove('open');
    if(backdrop) backdrop.classList.remove('show');
    sidePanel.setAttribute('aria-hidden','true');
    playSound(soundWhoosh);
  }

  if(openBtn) openBtn.addEventListener('click', ()=>{ openPanel(); playSound(soundClick); });
  if(closeBtn) closeBtn.addEventListener('click', ()=>{ closePanel(); playSound(soundClick); });
  if(backdrop) backdrop.addEventListener('click', ()=>{ closePanel(); playSound(soundClick); });

  function showPage(id){
    document.querySelectorAll('.page-content').forEach(p=> p.classList.add('d-none'));
    const t = document.getElementById(id);
    if(t) t.classList.remove('d-none');
    playSound(soundWhoosh);
    
    if(id === 'dashboard') {
      initCharts();
      initReminders();
      updateIslamicEvents();
      initAchievements();
    } else if(id === 'quran-garden') {
      initStoriesAndWisdom();
    } else if(id === 'righteous-path') {
      initChallenges();
    } else if(id === 'achievements') {
      initAchievements();
    } else if(id === 'islamic-events') {
      updateIslamicEvents();
    } else if(id === 'educational-games') {
      initIslamicJourney();
    }
    
    if(window.innerWidth < 900) setTimeout(closePanel, 220);
  }

  navItems.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const page = btn.getAttribute('data-page');
      playSound(soundClick);
      if(page) showPage(page);
    });
  });

  /* ---------- نظام اللغة والسمة ---------- */
  const LANG_KEY = 'waha_lang', THEME_KEY = 'waha_theme';

  function applyLang(l){
    if(wahaLang) wahaLang.value = l;
    document.querySelectorAll('[data-page]').forEach(btn=>{
      const id = btn.getAttribute('data-page');
      let label = '';
      if(id === 'dashboard') label = (l==='en' ? 'Dashboard' : (l==='fr' ? 'Tableau' : 'الرئيسية'));
      if(id === 'quran') label = (l==='en' ? 'Quran' : (l==='fr' ? 'Coran' : 'القرآن الكريم'));
      if(id === 'quran-garden') label = (l==='en' ? 'Quran Garden' : (l==='fr' ? 'Jardin' : 'بستان القرآن'));
      if(id === 'righteous-path') label = (l==='en' ? 'Righteous' : (l==='fr' ? 'Vertueux' : 'رياض الصالحين'));
      if(id === 'obedience-gardens') label = (l==='en' ? 'Obedience' : (l==='fr' ? 'Obéissance' : 'جنات الطاعة'));
      if(id === 'educational-games') label = (l==='en' ? 'Games' : (l==='fr' ? 'Jeux' : 'ألعاب تربوية'));
      if(id === 'progress-tracker') label = (l==='en' ? 'Progress' : (l==='fr' ? 'Progrès' : 'سجل تطورك'));
      if(id === 'daily-duas') label = (l==='en' ? 'Daily Duas' : (l==='fr' ? 'Duas' : 'الأدعية اليومية'));
      if(id === 'achievements') label = (l==='en' ? 'Achievements' : (l==='fr' ? 'Succès' : 'الإنجازات'));
      if(id === 'islamic-events') label = (l==='en' ? 'Events' : (l==='fr' ? 'Événements' : 'الفعاليات'));
      if(label){
        const icon = btn.querySelector('i');
        if(icon) btn.innerHTML = icon.outerHTML + ' ' + `<span>${label}</span>`;
        else btn.innerHTML = `<span>${label}</span>`;
      }
    });
  }

  function applyTheme(t){
    if(wahaTheme) wahaTheme.value = t;
    document.body.classList.remove('theme-normal','theme-dark','theme-royal');
    if(t === 'dark') document.body.classList.add('theme-dark');
    else if(t === 'royal') document.body.classList.add('theme-royal');
    else document.body.classList.add('theme-normal');
    localStorage.setItem(THEME_KEY, t);
  }

  function initControls(){
    const savedLang = localStorage.getItem(LANG_KEY) || 'ar';
    applyLang(savedLang);
    if(wahaLang) wahaLang.addEventListener('change', (e)=>{ const v = e.target.value; localStorage.setItem(LANG_KEY, v); applyLang(v); playSound(soundClick); });

    const savedTheme = localStorage.getItem(THEME_KEY) || 'normal';
    applyTheme(savedTheme);
    if(wahaTheme) wahaTheme.addEventListener('change', (e)=>{ applyTheme(e.target.value); playSound(soundPop); });
  }

  /* ---------- نظام الإحصائيات ---------- */
  function refreshStats(){
    const prayer = parseInt(localStorage.getItem('oasis_prayer')) || 0;
    const deeds  = parseInt(localStorage.getItem('oasis_deeds')) || 0;
    const pages  = parseInt(localStorage.getItem('oasis_pages')) || 0;
    const game   = parseInt(localStorage.getItem('oasis_game')) || 0;
    const elPrayer = document.getElementById('prayerStreak');
    const elDeeds  = document.getElementById('goodDeeds');
    const elPages  = document.getElementById('quranPages');
    const elGame   = document.getElementById('gameScore');
    if(elPrayer) elPrayer.textContent = prayer;
    if(elDeeds)  elDeeds.textContent  = deeds;
    if(elPages)  elPages.textContent  = pages;
    if(elGame)   elGame.textContent   = game;
  }

  /* ---------- Quran System ---------- */
  const surahList = document.getElementById('surahList');
  const surahTitle = document.getElementById('surahTitle');
  const surahMeta = document.getElementById('surahMeta');
  const surahText = document.getElementById('surahText');
  const searchInSurah = document.getElementById('searchInSurah');
  const searchResults = document.getElementById('searchResults');
  let currentAyahs = [], fontSize = 20;

  function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  async function loadSurahIndex(){
    try{
      if(surahList) surahList.innerHTML = '<div class="text-muted">جاري تحميل فهرس السور...</div>';
      const res = await fetch('https://api.alquran.cloud/v1/surah');
      const json = await res.json();
      const list = json.data;
      if(surahList){
        surahList.innerHTML = '';
        list.forEach(s=>{
          const btn = document.createElement('button');
          btn.className = 'surah-list-btn interactive-card';
          btn.innerHTML = `<strong>${s.number}.</strong> ${s.name} <span class="text-muted" style="float:left">${s.ayahs} آية</span>`;
          btn.addEventListener('click', ()=> loadSurah(s.number, s.englishName + ' — ' + s.name, s.ayahs));
          surahList.appendChild(btn);
        });
      }
    }catch(err){
      if(surahList) surahList.innerHTML = '<div class="text-danger">فشل تحميل فهرس السور.</div>';
      console.error(err);
    }
  }

  async function loadSurah(num,title,ayahCount){
    try{
      if(surahTitle) surahTitle.textContent = 'جاري تحميل السورة...';
      if(surahMeta) surahMeta.textContent = '';
      if(surahText) surahText.innerHTML = '';
      if(searchResults) searchResults.innerHTML = '';
      const res = await fetch('https://api.alquran.cloud/v1/surah/' + num + '/quran-uthmani');
      const json = await res.json();
      const ayahs = json.data.ayahs;
      currentAyahs = ayahs;
      const html = ayahs.map(a=>`<div style="margin-bottom:15px;padding:10px;border-radius:8px;background:rgba(255,255,255,0.02)"><span style="font-weight:700;color:var(--gold)">${a.numberInSurah}.</span> <span>${escapeHtml(a.text)}</span></div>`).join('');
      if(surahText) surahText.innerHTML = html;
      if(surahTitle) surahTitle.textContent = title + ` (${ayahCount} آية)`;
      if(surahMeta) surahMeta.textContent = `السورة رقم ${num} — عدد الآيات: ${ayahCount}`;
      if(searchInSurah) searchInSurah.value = '';
      if(surahText) surahText.style.fontSize = fontSize + 'px';
      const container = document.querySelector('.surah-container'); if(container) container.scrollTop = 0;
      playSound(soundPop);
      
      awardPoints(5, `قراءة سورة ${title}`);
    }catch(e){
      if(surahTitle) surahTitle.textContent = 'فشل التحميل';
      if(surahText) surahText.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h4>حدث خطأ في التحميل</h4>
          <p>تعذر تحميل السورة. يرجى التحقق من الاتصال بالإنترنت</p>
        </div>
      `;
      console.error(e);
    }
  }

  if(searchInSurah){
    searchInSurah.addEventListener('input', ()=>{
      const q = searchInSurah.value.trim();
      if(!q){ if(searchResults) searchResults.innerHTML=''; return; }
      const results = [];
      currentAyahs.forEach(a=>{ if(a.text.includes(q)) results.push({num:a.numberInSurah,text:a.text}); });
      if(results.length===0){ if(searchResults) searchResults.innerHTML = '<div class="text-muted">لا توجد نتائج</div>'; return; }
      if(searchResults) searchResults.innerHTML = '<div class="text-muted">نتائج البحث:</div>' + results.map(r=>`<div style="padding:10px;border-radius:8px;margin-top:8px;background:rgba(255,255,255,0.02)"><strong>${r.num}.</strong> ${r.text.replace(new RegExp(q,'g'),`<mark>${q}</mark>`)}</div>`).join('');
      playSound(soundClick);
    });
  }

  // Quran Controls
  document.getElementById('increaseFont')?.addEventListener('click', ()=>{ fontSize = Math.min(32,fontSize+2); surahText.style.fontSize = fontSize+'px'; playSound(soundClick); });
  document.getElementById('decreaseFont')?.addEventListener('click', ()=>{ fontSize = Math.max(14,fontSize-2); surahText.style.fontSize = fontSize+'px'; playSound(soundClick); });
  document.getElementById('toggleReaderTheme')?.addEventListener('click', ()=>{ const container=document.querySelector('.surah-container'); if(!container) return; container.classList.toggle('reader-dark'); playSound(soundPop); });

  /* ---------- Quran Garden ---------- */
  const verses = [
    {text:'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',surah:'الرعد - 28',ex:'الذكر يطمئن القلب.'},
    {text:'وَقُلْ رَبِّ زِدْنِي عِلْمًا',surah:'طه - 114',ex:'دعاء لزيادة العلم.'},
    {text:'إِنَّ مَعَ الْعُسْرِ يُسْرًا',surah:'الشرح - 5',ex:'التوكّل والصبر.'}
  ];
  document.getElementById('newVerseBtn')?.addEventListener('click', ()=>{ 
    const v = verses[Math.floor(Math.random()*verses.length)]; 
    document.getElementById('dailyVerse').textContent = '"' + v.text + '"'; 
    document.getElementById('verseSurah').textContent = v.surah; 
    document.getElementById('verseExplanation').textContent = v.ex; 
    playSound(soundPop); 
    awardPoints(1, "قراءة آية جديدة");
  });

  document.getElementById('nextStory')?.addEventListener('click', ()=>{ 
    initStoriesAndWisdom(); 
    playSound(soundClick); 
    awardPoints(2, "قراءة قصة الأنبياء");
  });

  /* ---------- نظام الأدعية والعبادات ---------- */
  function generateThirtyDuas(){
    return [
      "اللهم ارزقنا العلم النافع","اللهم فرّج همّي","اللهم اشفِ مرضانا","اللهم ثبت قلوبنا",
      "اللهم اهدنا وارزقنا","ربنا آتنا في الدنيا حسنة","اللهم اغفر لنا وارحمنا","اللهم اغننا بحلالك عن حرامك",
      "اللهم اجعل القرآن ربيع قلوبنا","اللهم أعنّا على ذكرك","اللهم بارك في أعمالنا","اللهم ارزقنا العمل الصالح",
      "اللهم سخر لنا الخير","اللهم احفظ بلادنا","اللهم أجرنا من الفتن","اللهم اجعلنا من عبادك الصالحين",
      "اللهم ثبتنا عند الصعاب","اللهم زدنا قربًا إليك","اللهم اجعلنا شاكرين","اللهم سلّم قلوبنا من الحقد",
      "اللهم أنر بصيرتنا","اللهم أسعد قلوبنا","اللهم اجعلنا من المستغفرين","اللهم اغننا بفضلك",
      "اللهم اجعل أعمالنا خالصة لك","اللهم توفنا مسلمين","اللهم اجعلنا من أهل الجنة","اللهم وفقنا للخير",
      "اللهم بارك لأهلي ومالي","اللهم اجعلنا من الذاكرين"
    ].slice(0,30);
  }

  function generateThirtyWorships(){
    return [
      "صلاة الضحى — ركعتان بعد شروق الشمس","صيام الاثنين والخميس — نوافل","قيام الليل — نافلة",
      "ذكر الصباح والمساء — أذكار","الصدقة الجارية — بث تمليك الخير","صلة الرحم — زيارة الأقارب",
      "إماطة الأذى — عمل مستحب","الاستغفار الدائم","الصدقة السرية","التعليم النافع للناس",
      "حفظ القرآن ولو جزءًا","دعاء مستمر في الخفاء","صلاة الاستخارة عند الحيرة","الوتر في الليل",
      "ذكر الله بعد الصلاة","حسن الخلق مع الناس","البتّ في الأمر بالخير","الالتزام بالوعد",
      "إصلاح ذات البين","ترتيب النية قبل العبادة","التواضع في القول والعمل","إعانة الطالب المحتاج",
      "الإحسان إلى الجار","قراءة أذكار النوم","إطعام الجائع","الصدقة على الميت","التحلي بالصبر",
      "الإكثار من الصلاة على النبي","التوبة النصوح","ذكر الله في السر"
    ].slice(0,30);
  }

  function populateDuaWorship(){
    const duaGrid = document.getElementById('duaGrid');
    const worshipGrid = document.getElementById('worshipGrid');
    const duas = JSON.parse(localStorage.getItem('waha_dua30') || JSON.stringify(generateThirtyDuas()));
    const worships = JSON.parse(localStorage.getItem('waha_worship30') || JSON.stringify(generateThirtyWorships()));
    if(!localStorage.getItem('waha_dua30')) localStorage.setItem('waha_dua30', JSON.stringify(duas));
    if(!localStorage.getItem('waha_worship30')) localStorage.setItem('waha_worship30', JSON.stringify(worships));

    if(duaGrid){
      let html = '';
      duas.forEach((d,i)=> html += `<div class="interactive-card dua-item" data-idx="${i}" tabindex="0"><h6>دعاء ${i+1}</h6><p>${d}</p></div>`);
      duaGrid.innerHTML = html;
      duaGrid.querySelectorAll('.dua-item').forEach(el=> el.addEventListener('click', ()=>{ 
        const idx = +el.getAttribute('data-idx'); 
        try{ navigator.clipboard.writeText(duas[idx]); }catch(e){} 
        playSound(soundClick); 
        showTempToast('نسخ إلى الحافظة'); 
        awardPoints(1, "نسخ دعاء");
      }));
    }
    if(worshipGrid){
      let html = '';
      worships.forEach((w,i)=> html += `<div class="interactive-card worship-item" data-idx="${i}" tabindex="0"><h6>${w.split('—')[0].trim()}</h6><p>${w}</p></div>`);
      worshipGrid.innerHTML = html;
      worshipGrid.querySelectorAll('.worship-item').forEach(el=> el.addEventListener('click', ()=>{ 
        const idx = +el.getAttribute('data-idx'); 
        const key = 'waha_worship_mark_'+idx; 
        if(localStorage.getItem(key)){ 
          localStorage.removeItem(key); 
          el.style.opacity = '1'; 
          showTempToast('إزالة العلامة'); 
        } else { 
          localStorage.setItem(key,'1'); 
          el.style.opacity = '0.6'; 
          showTempToast('تم التمييز'); 
          awardPoints(2, "ممارسة عبادة مستحبة");
        } 
        playSound(soundClick); 
      }));
      worshipGrid.querySelectorAll('.worship-item').forEach((el, idx)=>{ if(localStorage.getItem('waha_worship_mark_'+idx)) el.style.opacity = '0.6'; });
    }
  }

  /* ---------- نظام الألعاب ---------- */
  function createMemoryBoard(){
    const board = document.getElementById('memoryBoard');
    if(!board) return;
    board.innerHTML = '';
    const symbols = ['★','✿','☪','✦','❤','☀','✈','✧'];
    const cards = symbols.concat(symbols);
    for(let i=cards.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [cards[i],cards[j]]=[cards[j],cards[i]]; }
    cards.forEach(sym=>{ 
      const col=document.createElement('div'); 
      col.className='col-3'; 
      const c=document.createElement('div'); 
      c.className='memory-card islamic-card text-center'; 
      c.dataset.face=sym; 
      c.textContent='?'; 
      c.addEventListener('click', memoryFlip); 
      col.appendChild(c); 
      board.appendChild(col); 
    });
    
    startMemoryTimer();
  }

  let f=null, s=null, lock=false, pairsFound = 0, gameTimer = 0, timerInterval;

  function startMemoryTimer() {
    gameTimer = 0;
    pairsFound = 0;
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      gameTimer++;
      document.getElementById('gameTimer').textContent = gameTimer;
      document.getElementById('pairsFound').textContent = pairsFound;
    }, 1000);
  }

  function memoryFlip(e){
    if(lock) return; 
    const el = e.currentTarget; 
    if(el===f) return; 
    el.textContent = el.dataset.face; 
    el.classList.add('flipped'); 
    if(!f){ f = el; return; } 
    s = el; 
    lock = true; 
    setTimeout(()=>{ 
      if(f.dataset.face === s.dataset.face){
        f.style.visibility='hidden'; 
        s.style.visibility='hidden'; 
        pairsFound++;
        const g = parseInt(localStorage.getItem('oasis_game')) || 0;
        localStorage.setItem('oasis_game', g + 10);
        awardPoints(5, "فوز في لعبة الذاكرة");
        refreshStats(); 
        playSound(soundPop);
        
        if(pairsFound === 8) {
          clearInterval(timerInterval);
          showAchievement("سيد الذاكرة", "أحسنت! أكملت لعبة الذاكرة بنجاح");
        }
      } else { 
        f.textContent='?'; 
        s.textContent='?'; 
        f.classList.remove('flipped'); 
        s.classList.remove('flipped'); 
        playSound(soundClick); 
      } 
      f=null; 
      s=null; 
      lock=false; 
    },700);
  }

  document.getElementById('newGameBtn')?.addEventListener('click', ()=>{ 
    createMemoryBoard(); 
    localStorage.setItem('oasis_game',0); 
    refreshStats(); 
    playSound(soundClick); 
  });

  // اختبار يومي متغيّر (9 أسئلة)
  const quizPool = [
    {q:'كم ركعة الصبح؟', opts:['2','4','3'], a:0},
    {q:'ما آخر سورة؟', opts:['الناس','الفاتحة','الكوثر'], a:0},
    {q:'كم جزء في القرآن؟', opts:['30','10','60'], a:0},
    {q:'أين نزل القرآن؟', opts:['مكة','المدينة','القدس'], a:0},
    {q:'متى صلاة المغرب؟', opts:['بعد الغروب','قبل الفجر','بعد الظهر'], a:0},
    {q:'ما فائدة الاستغفار؟', opts:['مغفرة الذنوب','زيادة الهم','الكسل'], a:0},
    {q:'ما هي قبلة المسلمين؟', opts:['الكعبة','القدس','البحر'], a:0},
    {q:'كم ركعات العشاء؟', opts:['4','2','3'], a:0},
    {q:'من هو خاتم الأنبياء؟', opts:['محمد ﷺ','عيسى','موسى'], a:0},
    {q:'ما حكم الصدق؟', opts:['مطلوب','ممنوع','غير مهم'], a:0}
  ];

  function pickN(pool,n,seed){ 
    let s = seed % 2147483647; 
    if(s<=0) s+=2147483646; 
    function rand(){ s = (s * 16807) % 2147483647; return (s-1)/2147483646; } 
    const copy = pool.slice(); 
    for(let i=copy.length-1;i>0;i--){ const j=Math.floor(rand()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; } 
    return copy.slice(0, Math.min(n, copy.length)); 
  }

  function initDailyQuiz(){
    const area = document.getElementById('quizArea'); 
    if(!area) return;
    const today = new Date(); 
    const seed = Number(`${today.getFullYear()}${today.getMonth()+1}${today.getDate()}`);
    const chosen = pickN(quizPool, 9, seed);
    let html = '<form id="quizForm">';
    chosen.forEach((q,i)=>{ 
      html += `<div class="quiz-question">${i+1}. ${q.q}</div><div class="quiz-options">`; 
      q.opts.forEach((opt,idx)=> html += `<div class="quiz-option" data-question="${i}" data-answer="${idx}">${opt}</div>`); 
      html += '</div>'; 
    });
    html += '<button type="submit" class="btn btn-success mt-3">إرسال الإجابات</button></form><div id="quizResult" style="margin-top:12px"></div>';
    area.innerHTML = html;
    
    const form = document.getElementById('quizForm');
    form.addEventListener('submit', function(ev){ 
      ev.preventDefault(); 
      let score=0; 
      chosen.forEach((q,idx)=>{ 
        const selected = document.querySelector(`.quiz-option.selected[data-question="${idx}"]`);
        if(selected && parseInt(selected.dataset.answer) === q.a) score++; 
      }); 
      const percent = Math.round((score/chosen.length)*100); 
      const result = document.getElementById('quizResult'); 
      result.innerHTML = `<div style="font-weight:700">نتيجتك: ${score}/${chosen.length} — ${percent}%</div>`; 
      if(percent === 100) {
        result.innerHTML += '<div>ما شاء الله — ممتاز!</div>';
        awardPoints(20, "نتيجة كاملة في الاختبار");
      } else if(percent >= 70) {
        result.innerHTML += '<div>جيد جدًا — أحسنتِ!</div>';
        awardPoints(10, "نتيجة جيدة في الاختبار");
      } else {
        result.innerHTML += '<div>حاولي مرة أخرى غدًا — التعلم مستمر</div>';
        awardPoints(5, "مشاركة في الاختبار");
      } 
      playSound(soundPop); 
      const g = parseInt(localStorage.getItem('oasis_deeds')) || 0; 
      localStorage.setItem('oasis_deeds', g + Math.max(0, Math.floor(score/3))); 
      refreshStats(); 
    });

    document.querySelectorAll('.quiz-option').forEach(option => {
      option.addEventListener('click', function() {
        const question = this.dataset.question;
        document.querySelectorAll(`.quiz-option[data-question="${question}"]`).forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
      });
    });
  }

  /* ---------- نظام الأدعية اليومية ---------- */
  const DAILY_DUAS = [
    "دعاء الاستيقاظ: الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور.",
    "دعاء الدخول للبيت: بسم الله ولجنا، وبسم الله خرجنا.",
    "دعاء الخروج من المنزل: بسم الله توكلت على الله ولا حول ولا قوة إلا بالله.",
    "دعاء السفر: سبحان الذي سخر لنا هذا وما كنا له مقرنين.",
    "دعاء المطر: اللهم صيبا نافعا.",
    "دعاء الرياح: اللهم اجعلها بردًا وسلامًا.",
    "دعاء الخوف: اللهم إني أعوذ بك من خوف الليالي.",
    "دعاء النجاح: اللهم لا سهل إلا ما جعلته سهلا.",
    "دعاء اللباس: اللهم بارك لنا فيه وجعلنا شاكرين.",
    "دعاء المرض: اللهم اشفه وداوه شفاء لا يغادر سقمًا.",
    "دعاء النوم: باسمك ربي وضعت جنبي...",
    "دعاء الطعام: الحمد لله الذي أطعمنا وسقانا.",
    "دعاء الشكر: اللهم لك الحمد كما ينبغي لجلال وجهك.",
    "دعاء الاستغفار: أستغفر الله وأتوب إليه.",
    "دعاء طلب العلم: اللهم انفعني بما علمتني.",
    "دعاء السفر للرزق: اللهم بارك لنا في سفرنا وعافنا فيه.",
    "دعاء عند الكرب: لا إله إلا أنت سبحانك إني كنت من الظالمين.",
    "دعاء عند رؤية الآية الكريمة: اللهم اجعلها لنا نورًا.",
    "دعاء للوالدين: رب ارحمهما كما ربياني صغيرًا.",
    "دعاء للمريض: رب اشفِ مريض المؤمنين والمؤمنات.",
    "دعاء للرزق الحلال: اللهم ارزقني رزقًا طيبا مباركا.",
    "دعاء القلق: اللهم اطمئن قلبي واغمرني بالسكينة.",
    "دعاء الهم: يا مفرج الهم فرّج همي ويسر أمري.",
    "دعاء العافية: اللهم عافني في بدني وديني ودنياي.",
    "دعاء التوبة: اللهم اغفر لي وتب علي إنك أنت التواب الرحيم.",
    "دعاء عند الدخول للمسجد: اللهم افتح لي أبواب رحمتك.",
    "دعاء عند الخروج من المسجد: اللهم اجعل ما عملت خالصًا لوجهك.",
    "دعاء للرزق في العمل: اللهم بارك لي في عملي وارزقني الخير.",
    "دعاء عند القراءة: اللهم اجعل القرآن ربيع قلبي ونور صدري."
  ];

  function populateDailyDuas(){ 
    const area = document.getElementById('dailyDuasList'); 
    if(!area) return; 
    let html = ''; 
    DAILY_DUAS.forEach((d,i)=> html += `<div class="interactive-card" tabindex="0"><h6>دعاء ${i+1}</h6><p>${d}</p></div>`); 
    area.innerHTML = html; 
    area.querySelectorAll('.interactive-card').forEach((el,idx)=> el.addEventListener('click', ()=>{ 
      try{ navigator.clipboard.writeText(DAILY_DUAS[idx]); }catch(e){} 
      playSound(soundClick); 
      showTempToast('نسخ الدعاء'); 
      awardPoints(1, "نسخ دعاء يومي");
    })); 
  }

  /* ---------- نظام الأذكار ---------- */
  function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }
  function incAzkar(type){ 
    const key = 'oasis_azkar_' + type; 
    let v = parseInt(localStorage.getItem(key))||0; 
    v++; 
    if(v>33) v=0; 
    localStorage.setItem(key,v); 
    const el=document.getElementById('count'+capitalize(type)); 
    if(el) el.textContent=v; 
    if(v===0){ 
      playSound(soundPop); 
      showTempToast('انتهيت من 33 ذكرًا — بارك الله فيك');
      awardPoints(3, "إكمال 33 ذكر");
    } else {
      playSound(soundClick); 
      awardPoints(1, "ذكر الله");
    }
  }
  function resetAzkar(type){ 
    localStorage.setItem('oasis_azkar_'+type,0); 
    const el=document.getElementById('count'+capitalize(type)); 
    if(el) el.textContent=0; 
    playSound(soundClick); 
  }
  ['incMorning','incEvening','incAfter'].forEach(id=>{ const el = document.getElementById(id); if(el) el.addEventListener('click', ()=> incAzkar(el.getAttribute('data-counter'))); });
  ['resetMorning','resetEvening','resetAfter'].forEach(id=>{ const el = document.getElementById(id); if(el) el.addEventListener('click', ()=> resetAzkar(el.getAttribute('data-counter'))); });

  /* ---------- نظام أعمال الخير ---------- */
  const defaultDeeds = ['مساعدة الوالدين','زيارة الأقارب','إطعام طائر','تبسم في وجه أخيك','إماطة الأذى عن الطريق','إطعام صائم','التصدق بقطعة خبز','حفظ صفحة من القرآن','برّ الجار','الاستغفار 100 مرة','تعليم شخص حكمة بسيطة','زيارة مريض','مساعدة طالب في دراسته'];
  (function fillGoodDeeds(){ const sel=document.getElementById('goodDeedsSelect'); if(!sel) return; sel.innerHTML = defaultDeeds.map(d=>`<option>${d}</option>`).join(''); })();
  document.getElementById('recordDeedBtn')?.addEventListener('click', ()=>{ 
    const g = parseInt(localStorage.getItem('oasis_deeds'))||0; 
    localStorage.setItem('oasis_deeds', g+1); 
    refreshStats(); 
    playSound(soundClick); 
    awardPoints(2, "عمل خير");
    showTempToast('تم تسجيل العمل الخيري — بارك الله فيك');
  });

  document.getElementById('calculatePrayerBtn')?.addEventListener('click', ()=>{ 
    const checks = document.querySelectorAll('.prayer-check'); 
    let c=0; 
    checks.forEach(ch=>{ if(ch.checked) c++; }); 
    if(c===5){ 
      const p=parseInt(localStorage.getItem('oasis_prayer'))||0; 
      localStorage.setItem('oasis_prayer', p+1); 
      refreshStats(); 
      playSound(soundPop); 
      showTempToast('مبروك! سلسلة الصلاة زادت');
      awardPoints(10, "إكمال الصلوات الخمس");
    } else { 
      playSound(soundClick); 
      showTempToast('تم احتساب الصلوات ('+c+'/5)');
      awardPoints(c, "أداء الصلوات");
    } 
  });

  document.getElementById('recordReadingBtn')?.addEventListener('click', ()=>{ 
    const pages = parseInt(localStorage.getItem('oasis_pages')) || 0;
    const goal = parseInt(document.getElementById('pagesGoal').value) || 10;
    localStorage.setItem('oasis_pages', pages + goal);
    refreshStats();
    playSound(soundPop);
    awardPoints(goal, "قراءة صفحات القرآن");
    showTempToast(`تم تسجيل ${goal} صفحة — بارك الله في وقتك`);
  });

  document.getElementById('joinChallenge')?.addEventListener('click', ()=>{ 
    playSound(soundClick);
    awardPoints(5, "انضمام لتحدي أسبوعي");
    showTempToast('انضممت للتحدي الأسبوعي — تابعي تقدمك!');
  });

  /* ---------- نظام التبليغات ---------- */
  function showTempToast(msg){ 
    const t=document.createElement('div'); 
    t.style.position='fixed'; 
    t.style.left='18px'; 
    t.style.bottom='18px'; 
    t.style.zIndex=99999; 
    t.style.background='rgba(0,0,0,0.7)'; 
    t.style.color='#fff'; 
    t.style.padding='12px 16px'; 
    t.style.borderRadius='12px'; 
    t.textContent=msg; 
    document.body.appendChild(t); 
    setTimeout(()=>t.remove(),1800); 
  }

  /* ---------- التهيئة النهائية ---------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    initControls();
    initColorPicker();
    refreshStats();
    populateDuaWorship();
    populateDailyDuas();
    createMemoryBoard();
    initDailyQuiz();
    initStoriesAndWisdom();
    initChallenges();
    updateUserLevel();
    updateIslamicEvents();
    initReminders();
    initIslamicJourney();
    
    // استعادة عدادات الأذكار
    ['morning','evening','after'].forEach(k=>{ 
      const v=parseInt(localStorage.getItem('oasis_azkar_'+k))||0; 
      const el=document.getElementById('count'+capitalize(k)); 
      if(el) el.textContent=v; 
    });
    
    // تحميل الفهرس التلقائي للقرآن
    loadSurahIndex();
    
    // الصفحة الافتراضية
    showPage('dashboard');
    
    // تسجيل الزيارة اليومية
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('waha_last_visit');
    if (lastVisit !== today) {
      localStorage.setItem('waha_last_visit', today);
      awardPoints(1, "زيارة يومية");
    }
  });

  // تعريض الدوال للاستخدام الخارجي
  window.Oasis = { 
    showPage, 
    openPanel, 
    closePanel, 
    refreshStats,
    awardPoints,
    showAchievement,
    calculateLevel
  };

  /* ---------- نظام تثبيت التطبيق التلقائي ---------- */
let deferredPrompt;
let installPromptShown = false;

// استقبال حدث التثبيت
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // عرض إشعار التثبيت تلقائياً بعد 5 ثواني
  setTimeout(() => {
    if (!installPromptShown) {
      showInstallPrompt();
    }
  }, 5000);
});

// عرض إشعار التثبيت
function showInstallPrompt() {
  if (installPromptShown || !deferredPrompt) return;
  
  installPromptShown = true;
  
  const installToast = document.createElement('div');
  installToast.id = 'installToast';
  installToast.innerHTML = `
    <div class="install-toast-content">
      <div class="install-icon">📱</div>
      <div class="install-text">
        <h6>حمل التطبيق الآن!</h6>
        <p>ثبّت الواحة الروحانية على جهازك لتجربة أفضل</p>
        <small>وصول سريع - عمل دون اتصال - إشعارات مفيدة</small>
      </div>
      <div class="install-actions">
        <button class="btn btn-sm btn-outline-light" id="installLater">لاحقاً</button>
        <button class="btn btn-sm btn-success" id="installNow">تثبيت</button>
      </div>
      <button class="btn-close" id="closeInstallToast">×</button>
    </div>
  `;
  
  document.body.appendChild(installToast);
  
  // إضافة التنسيقات
  const style = document.createElement('style');
  style.textContent = `
    #installToast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #014d40, #013b33);
      border: 2px solid var(--gold);
      border-radius: 20px;
      padding: 20px;
      z-index: 10000;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      backdrop-filter: blur(10px);
      animation: slideInUp 0.5s ease-out;
      max-width: 500px;
      width: 90%;
    }
    
    @keyframes slideInUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
    
    .install-toast-content {
      display: flex;
      align-items: center;
      gap: 15px;
      position: relative;
    }
    
    .install-icon {
      font-size: 2.5rem;
      flex-shrink: 0;
    }
    
    .install-text {
      flex: 1;
      text-align: right;
    }
    
    .install-text h6 {
      color: var(--gold);
      margin: 0 0 5px 0;
      font-weight: bold;
    }
    
    .install-text p {
      margin: 0 0 5px 0;
      color: white;
      font-size: 0.9rem;
    }
    
    .install-text small {
      color: rgba(255,255,255,0.7);
      font-size: 0.8rem;
    }
    
    .install-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;
    }
    
    #closeInstallToast {
      position: absolute;
      top: -10px;
      left: -10px;
      background: rgba(0,0,0,0.7);
      border: none;
      color: white;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    @media (max-width: 768px) {
      .install-toast-content {
        flex-direction: column;
        text-align: center;
      }
      
      .install-actions {
        width: 100%;
        justify-content: center;
      }
    }
  `;
  document.head.appendChild(style);
  
  // مستمعي الأحداث
  document.getElementById('installNow').addEventListener('click', async () => {
    installToast.remove();
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        showTempToast('🎉 تم بدء تثبيت التطبيق');
        awardPoints(20, 'تثبيت التطبيق');
      } else {
        console.log('User dismissed the install prompt');
      }
      deferredPrompt = null;
    }
  });
  
  document.getElementById('installLater').addEventListener('click', () => {
    installToast.remove();
    // إعادة العرض بعد يوم
    setTimeout(() => {
      installPromptShown = false;
    }, 24 * 60 * 60 * 1000);
  });
  
  document.getElementById('closeInstallToast').addEventListener('click', () => {
    installToast.remove();
    // إعادة العرض بعد أسبوع
    setTimeout(() => {
      installPromptShown = false;
    }, 7 * 24 * 60 * 60 * 1000);
  });
}

// التحقق مما إذا كان التطبيق مثبتاً
window.addEventListener('appinstalled', () => {
  console.log('App installed successfully');
  deferredPrompt = null;
  showTempToast('🎉 تم تثبيت التطبيق بنجاح!');
});

// التحقق من وضع العرض
function isRunningAsPWA() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

// إخفاء إشعار التثبيت إذا كان التطبيق مثبتاً
if (isRunningAsPWA()) {
  installPromptShown = true;
}
})();
