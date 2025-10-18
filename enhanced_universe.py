import streamlit as st
import random
import time
import datetime
from datetime import datetime
import pandas as pd
import plotly.express as px

# إعداد الصفحة بتصميم موسع
st.set_page_config(
    page_title="الواحة الروحانية - ملاذك الإيماني",
    page_icon="🕌",
    layout="wide",
    initial_sidebar_state="expanded"
)

language = st.sidebar.selectbox("Language / اللغة:", ["English", "Arabic", "french"])
# تخصيص التصميم المحسن
st.markdown("""
<style>
    .main {
        background: linear-gradient(135deg, #1a5e63 0%, #2d936c 50%, #6abf69 100%);
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
    }
    
    .islamic-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 30px;
        margin: 15px 0;
        border: 2px solid #2d936c;
        box-shadow: 0 10px 30px rgba(45, 147, 108, 0.3);
    }
    
    .blessed-text {
        color: #1a5e63;
        font-weight: bold;
        font-size: 1.2em;
    }
    
    .quran-frame {
        background: linear-gradient(45deg, #1a5e63, #2d936c);
        color: white;
        padding: 20px;
        border-radius: 15px;
        margin: 10px 0;
        border-right: 10px solid #6abf69;
    }
    
    .memory-game {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin: 20px 0;
    }
    
    .memory-card {
        background: #1a5e63;
        color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .memory-card:hover {
        transform: scale(1.05);
        background: #2d936c;
    }
</style>
""", unsafe_allow_html=True)

# قاعدة بيانات موسعة للأدعية والآيات
extended_duas = [
    {"text": "اللهم إني أسألك علماً نافعاً، ورزقاً طيباً، وعملاً متقبلاً", "category": "العلم والعمل"},
    {"text": "ربّ اشرح لي صدري، ويسّر لي أمري، واحلل عقدة من لساني", "category": "التيسير"},
    {"text": "اللهم إني أعوذ بك من الهمّ والحزن، والعجز والكسل، والجبن والبخل", "category": "الهموم"},
    {"text": "ربّنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار", "category": "الدعاء الجامع"},
    {"text": "اللهم إني أسألك العفو والعافية في الدنيا والآخرة", "category": "العافية"},
    {"text": "اللهم اجعلني شكوراً، واجعلني صبوراً، واجعلني في عينك كبيراً", "category": "الأخلاق"},
    {"text": "ربّ أعنّي ولا تعن علي، وانصرني ولا تنصر علي", "category": "النصرة"},
    {"text": "اللهم إني أسألك خشيتك في الغيب والشهادة، وكلمة الحق في الغضب والرضا", "category": "الخشية"},
    {"text": "اللهم اهدني وسددني", "category": "الهداية"},
    {"text": "ربّ زدني علماً ونوراً وبصيرة", "category": "العلم والنور"}
]

quran_verses = [
    {"verse": "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "surah": "الرعد - 28", "explanation": "الذكر يطمئن القلب ويزيل الهموم"},
    {"verse": "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "surah": "الشرح - 5", "explanation": "بعد كل صعوبة تأتي الفرج واليسر"},
    {"verse": "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ", "surah": "الأنبياء - 30", "explanation": "الماء أصل الحياة ونعمة عظيمة من الله"},
    {"verse": "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي", "surah": "طه - 25", "explanation": "دعاء موسى لطلب التيسير والانشراح"},
    {"verse": "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ", "surah": "الإسراء - 82", "explanation": "القرآن شفاء للقلوب ورحمة للمؤمنين"},
    {"verse": "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا", "surah": "الشرح - 5-6", "explanation": "تكرير اليسر للتأكيد على قرب الفرج"},
    {"verse": "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ", "surah": "الفرقان - 58", "explanation": "التوكل على الله الحي الذي لا يموت"}
]

islamic_questions = [
    {"question": "كم عدد أركان الإسلام؟", "options": ["4", "5", "6"], "answer": "5", "category": "أركان الإسلام"},
    {"question": "ما هي أول آية نزلت من القرآن؟", "options": ["اقرأ", "الفاتحة", "البقرة"], "answer": "اقرأ", "category": "القرآن"},
    {"question": "من هو خاتم الأنبياء؟", "options": ["موسى", "عيسى", "محمد"], "answer": "محمد", "category": "الأنبياء"},
    {"question": "ما هي أعظم سورة في القرآن؟", "options": ["البقرة", "الفاتحة", "يس"], "answer": "الفاتحة", "category": "القرآن"},
    {"question": "كم عدد الركعات في صلاة الظهر؟", "options": ["3", "4", "5"], "answer": "4", "category": "الصلاة"},
    {"question": "ما هي السورة التي تسمى قلب القرآن؟", "options": ["البقرة", "يس", "الرحمن"], "answer": "يس", "category": "القرآن"},
    {"question": "من هو النبي الذي سمي بخليل الله؟", "options": ["موسى", "إبراهيم", "محمد"], "answer": "إبراهيم", "category": "الأنبياء"},
    {"question": "ما هي أولى القبلتين؟", "options": ["الكعبة", "المسجد الأقصى", "المسجد النبوي"], "answer": "المسجد الأقصى", "category": "الإسلام"},
    {"question": "كم عدد أيام شهر رمضان؟", "options": ["29", "30", "29 أو 30"], "answer": "29 أو 30", "category": "الصيام"},
    {"question": "ما هي أركان الإيمان؟", "options": ["5", "6", "7"], "answer": "6", "category": "أركان الإيمان"}
]

# جلسة المستخدم المحسنة
if 'enhanced_data' not in st.session_state:
    st.session_state.enhanced_data = {
        'prayer_streak': 0,
        'good_deeds': 0,
        'quran_pages': 0,
        'gratitude_days': [],
        'reflection_entries': [],
        'daily_questions_answered': 0,
        'memory_game_score': 0,
        'daily_verse_date': None,
        'daily_verse_index': 0
    }

# شريط التنقل الجانبي المحسن
with st.sidebar:
    st.markdown('<div class="islamic-card">', unsafe_allow_html=True)
    st.markdown('<h2 style="color: #1a5e63;">🕌 الواحة الروحانية</h2>', unsafe_allow_html=True)
    
    page = st.radio("اختر قسمك:", [
        "📖 بستان القرآن", 
        "🤲 رياض الصالحين", 
        "🕌 جديد: جنات الطاعة",
        "💭 حديقة التأمل",
        "🌺 شجرة الامتنان",
        "🎮 ألعاب تربوية",
        "📊 سجل تطورك"
    ])
    
    st.markdown("---")
    st.markdown(f"**سلسلة الصلاة:** {st.session_state.enhanced_data['prayer_streak']} يوم 🕌")
    st.markdown(f"**الحسنات:** {st.session_state.enhanced_data['good_deeds']} 🌟")
    st.markdown(f"**صفحات القرآن:** {st.session_state.enhanced_data['quran_pages']} 📖")
    st.markdown(f"**نتيجة الألعاب:** {st.session_state.enhanced_data['memory_game_score']} 🎯")
    
    st.markdown('</div>', unsafe_allow_html=True)

# الصفحة 1: بستان القرآن المحسن
if page == "📖 بستان القرآن":
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown('<div class="islamic-card">', unsafe_allow_html=True)
        st.markdown('<h2 class="blessed-text">📖 بستان القرآن الكريم</h2>', unsafe_allow_html=True)
        
        # آية اليوم مع الشرح
        today = datetime.now().date()
        if st.session_state.enhanced_data['daily_verse_date'] != today:
            st.session_state.enhanced_data['daily_verse_date'] = today
            st.session_state.enhanced_data['daily_verse_index'] = random.randint(0, len(quran_verses)-1)
        
        daily_verse = quran_verses[st.session_state.enhanced_data['daily_verse_index']]
        
        st.markdown(f'<div class="quran-frame">', unsafe_allow_html=True)
        st.markdown(f'<h3>آية اليوم:</h3>', unsafe_allow_html=True)
        st.markdown(f'<h2>"{daily_verse["verse"]}"</h2>', unsafe_allow_html=True)
        st.markdown(f'<p>{daily_verse["surah"]}</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        st.markdown(f'**شرح الآية:** {daily_verse["explanation"]}')
        
        if st.button("🔄 آية جديدة"):
            st.session_state.enhanced_data['daily_verse_index'] = random.randint(0, len(quran_verses)-1)
            st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="islamic-card">', unsafe_allow_html=True)
        st.markdown('<h3 class="blessed-text">🎯 تحدي القرآن اليومي</h3>', unsafe_allow_html=True)
        
        daily_goal = st.slider("حددي هدفك اليومي من الصفحات:", 1, 20, 10)
        
        if st.button("📚 سجلي قراءتك"):
            st.session_state.enhanced_data['quran_pages'] += daily_goal
            st.success(f"مبارك! أضفتِ {daily_goal} صفحة إلى سجلك 🌟")
            
            milestones = [50, 100, 200, 500]
            for milestone in milestones:
                if st.session_state.enhanced_data['quran_pages'] >= milestone:
                    st.balloons()
                    st.success(f"🎉 وصلتِ إلى {milestone} صفحة! الله يبارك فيكِ")
                    break
        
        # مكتبة الأدعية الموسعة
        st.markdown("### 📖 مكتبة الأدعية")
        dua_category = st.selectbox("اختر نوع الدعاء:", list(set([d["category"] for d in extended_duas])))
        
        category_duas = [d for d in extended_duas if d["category"] == dua_category]
        selected_dua = random.choice(category_duas)
        
        st.markdown(f'**{selected_dua["text"]}**')
        st.caption(f'نوع الدعاء: {selected_dua["category"]}')
        
        if st.button("🔄 دعاء جديد"):
            st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)

# الصفحة 2: رياض الصالحين
elif page == "🤲 رياض الصالحين":
    st.markdown('<div class="islamic-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="blessed-text">🤲 رياض الصالحين</h2>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🌙 أعمال الخير اليومية")
        good_deeds = [
            "مساعدة الوالدين",
            "زيارة الأقارب",
            "إطعام طائر",
            "تبسم في وجه أخيك",
            "إماطة الأذى عن الطريق",
            "الكلمة الطيبة",
            "صلة الرحم",
            "تفريج كربة",
            "إعانة المحتاج"
        ]
        
        selected_deed = st.selectbox("اختر عملاً صالحاً:", good_deeds)
        
        if st.button("🤲 سجلي هذا العمل"):
            st.session_state.enhanced_data['good_deeds'] += 1
            st.success(f"ماشاء الله! {selected_deed} 🌟")
            st.session_state.enhanced_data['memory_game_score'] += 2
            st.balloons()
    
    with col2:
        st.subheader("🕌 متابعة الصلوات")
        prayers = ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"]
        
        prayer_count = 0
        for prayer in prayers:
            if st.checkbox(f"صلاة {prayer}", key=f"prayer_{prayer}"):
                prayer_count += 1
        
        if st.button("🔄 احسبي سلسلة الصلاة"):
            if prayer_count == 5:
                st.session_state.enhanced_data['prayer_streak'] += 1
                st.success(f"أحسنتِ! أكملتِ الصلوات الخمس ✅ سلسلتك: {st.session_state.enhanced_data['prayer_streak']} يوم")
                st.session_state.enhanced_data['memory_game_score'] += 5
            else:
                st.warning(f"صليتي {prayer_count} من أصل 5 صلوات. استمري! 💪")
    
    st.markdown('</div>', unsafe_allow_html=True)

# الصفحة 3 الجديدة: جنات الطاعة
elif page == "🕌 جديد: جنات الطاعة":
    st.markdown('<div class="islamic-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="blessed-text">🕌 جنات الطاعة</h2>', unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["📿 الأذكار اليومية", "🤲 دعاء الخير", "🌙 العبادات المستحبة"])
    
    with tab1:
        st.subheader("📿 برنامج الأذكار اليومية")
        
        azkar_times = {
            "الصباح": ["أستغفر الله", "سبحان الله وبحمده", "لا إله إلا الله وحده لا شريك له"],
            "المساء": ["أعوذ بكلمات الله التامات", "بسم الله الذي لا يضر مع اسمه شيء", "حسبي الله ونعم الوكيل"],
            "بعد الصلاة": ["سبحان الله", "الحمد لله", "الله أكبر"]
        }
        
        selected_time = st.selectbox("اختر وقت الذكر:", list(azkar_times.keys()))
        
        st.write("**أذكار هذا الوقت:**")
        for zikr in azkar_times[selected_time]:
            count = st.number_input(f"{zikr}", min_value=0, max_value=100, value=0, key=zikr)
            if count > 0:
                st.success(f"أتممتِ {count} من {zikr}")
    
    with tab2:
        st.subheader("🤲 أدعية الخير للآخرين")
        
        good_duas = [
            "اللهم اغفر للمسلمين والمسلمات",
            "اللهم ارحم والدَي وارزقهما الجنة",
            "اللهم احفظ إخواني وأخواتي في الإسلام",
            "اللهم اهدي ضال المسلمين",
            "اللهم اشفي مرضى المسلمين"
        ]
        
        for dua in good_duas:
            if st.button(f"ادعي: {dua}", key=dua):
                st.success("جزاك الله خيراً على هذا الدعاء 🕊️")
                st.session_state.enhanced_data['good_deeds'] += 1
    
    with tab3:
        st.subheader("🌙 العبادات المستحبة")
        
        recommended_acts = [
            {"act": "صلاة الضحى", "reward": "صدقة عن كل مفصل في جسمك"},
            {"act": "قيام الليل", "reward": "تقرب إلى الله ورفعة في الدرجات"},
            {"act": "صيام الاثنين والخميس", "reward": "تكفير للذنوز ورفعة في الدرجات"},
            {"act": "صدقة سرية", "reward": "ظل في ظل العرش يوم القيامة"}
        ]
        
        for act in recommended_acts:
            with st.expander(f"{act['act']}"):
                st.write(f"**الثواب:** {act['reward']}")
                if st.button("سجلي هذا العمل", key=act['act']):
                    st.success(f"بارك الله فيكِ على نية {act['act']}")
                    st.session_state.enhanced_data['good_deeds'] += 2
    
    st.markdown('</div>', unsafe_allow_html=True)

# الصفحة 6: الألعاب التربوية المحسنة
elif page == "🎮 ألعاب تربوية":
    st.markdown('<div class="islamic-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="blessed-text">🎮 ألعاب تربوية مفيدة</h2>', unsafe_allow_html=True)
    
    tab1, tab2, tab3 = st.tabs(["🧩 اختبار اليوم", "🎯 لعبة الذاكرة", "📚 أسئلة متنوعة"])
    
    with tab1:
        st.subheader("🧩 اختبار اليوم (6 أسئلة)")
        
        # اختيار 6 أسئلة عشوائية مختلفة كل يوم
        today = datetime.now().date()
        random.seed(str(today))  # لجعل الأسئلة تتغير يومياً
        
        daily_questions = random.sample(islamic_questions, min(6, len(islamic_questions)))
        
        score = 0
        for i, q in enumerate(daily_questions):
            st.write(f"**السؤال {i+1}: {q['question']}**")
            user_answer = st.radio(f"اختر الإجابة:", q['options'], key=f"q_{i}")
            
            if user_answer == q['answer']:
                score += 1
                st.success("✅ إجابة صحيحة!")
            elif user_answer:
                st.error(f"❌ الإجابة الصحيحة: {q['answer']}")
            
            st.write("---")
        
        if st.button("📊 احسبي نتيجتك"):
            st.success(f"🎉 نتيجتك: {score}/6")
            st.session_state.enhanced_data['memory_game_score'] += score * 2
            
            if score == 6:
                st.balloons()
                st.success("متفوقة! الله يزيدك علماً 🌟")
    
    with tab2:
        st.subheader("🎯 لعبة الذاكرة الإسلامية")
        
        st.write("**حاولي تذكر مواقع الرموز ثم انقري لتكشفيها:**")
        
        # رموز إسلامية للعبة الذاكرة
        symbols = ["🕌", "📖", "🌙", "⭐", "🕋", "☪️", "🤲", "🕋"]
        symbols *= 2  # نضاعفها للحصول على أزواج
        random.shuffle(symbols)
        
        # لعبة ذاكرة تفاعلية
        if 'memory_game_state' not in st.session_state:
            st.session_state.memory_game_state = ['❓'] * len(symbols)
            st.session_state.memory_selected = []
            st.session_state.memory_matches = 0
        
        # عرض شبكة اللعبة
        cols = st.columns(4)
        for i in range(len(symbols)):
            with cols[i % 4]:
                if st.session_state.memory_game_state[i] == '❓':
                    if st.button("❓", key=f"btn_{i}"):
                        st.session_state.memory_game_state[i] = symbols[i]
                        st.session_state.memory_selected.append(i)
                else:
                    st.button(symbols[i], key=f"btn_{i}")
        
        # تحقق من التطابقات
        if len(st.session_state.memory_selected) == 2:
            idx1, idx2 = st.session_state.memory_selected
            if symbols[idx1] == symbols[idx2]:
                st.session_state.memory_matches += 1
                st.success("🎉 وجدتِ تطابقاً!")
                st.session_state.enhanced_data['memory_game_score'] += 5
            else:
                st.error("💔 ليس تطابقاً، حاولي مرة أخرى")
                time.sleep(2)
                st.session_state.memory_game_state[idx1] = '❓'
                st.session_state.memory_game_state[idx2] = '❓'
            
            st.session_state.memory_selected = []
        
        if st.session_state.memory_matches == len(symbols) // 2:
            st.balloons()
            st.success("🎊 فوز! أكملتِ اللعبة بنجاح!")
        
        if st.button("🔄 ابدأ لعبة جديدة"):
            st.session_state.memory_game_state = ['❓'] * len(symbols)
            st.session_state.memory_selected = []
            st.session_state.memory_matches = 0
            st.rerun()
    
    with tab3:
        st.subheader("📚 أسئلة متنوعة يومياً")
        
        # أسئلة إضافية متنوعة
        st.write("**اختبري معلوماتك اليوم:**")
        
        extra_questions = random.sample([q for q in islamic_questions if q not in daily_questions], 3)
        
        for q in extra_questions:
            with st.expander(f"سؤال: {q['question']}"):
                user_choice = st.radio("الإجابة:", q['options'], key=f"extra_{q['question']}")
                if user_choice == q['answer']:
                    st.success("🎯 صحيح! أحسنتِ")
                    st.session_state.enhanced_data['memory_game_score'] += 1
                elif user_choice:
                    st.error(f"💡 الجواب الصحيح: {q['answer']}")
    
    st.markdown('</div>', unsafe_allow_html=True)

# الصفحة 7: سجل التطور المحسن
elif page == "📊 سجل تطورك":
    st.markdown('<div class="islamic-card">', unsafe_allow_html=True)
    st.markdown('<h2 class="blessed-text">📊 سجل تطورك الروحاني</h2>', unsafe_allow_html=True)
    
    # مخططات متعددة
    col1, col2 = st.columns(2)
    
    with col1:
        # مخطط تقدم الحسنات
        days_data = {
            'الأيام': [f'اليوم {i+1}' for i in range(7)],
            'الحسنات': [random.randint(5, 20) for _ in range(7)]
        }
        df_days = pd.DataFrame(days_data)
        fig_days = px.line(df_days, x='الأيام', y='الحسنات', title='تطور أعمالك الصالحة خلال الأسبوع')
        st.plotly_chart(fig_days, use_container_width=True)
    
    with col2:
        # مخطط دائري للأنشطة
        activities_data = {
            'النشاط': ['الصلاة', 'القرآن', 'الأذكار', 'الأعمال', 'الألعاب'],
            'النقاط': [
                st.session_state.enhanced_data['prayer_streak'],
                st.session_state.enhanced_data['quran_pages'] // 10,
                st.session_state.enhanced_data['good_deeds'],
                len(st.session_state.enhanced_data['gratitude_days']),
                st.session_state.enhanced_data['memory_game_score']
            ]
        }
        df_activities = pd.DataFrame(activities_data)
        fig_pie = px.pie(df_activities, values='النقاط', names='النشاط', title='توزيع أنشطتك الروحانية')
        st.plotly_chart(fig_pie, use_container_width=True)
    
    # إحصائيات مفصلة
    st.subheader("📈 إحصائياتك التفصيلية")
    
    col3, col4, col5, col6 = st.columns(4)
    
    with col3:
        st.metric("إجمالي الحسنات", st.session_state.enhanced_data['good_deeds'])
    
    with col4:
        st.metric("صفحات القرآن", st.session_state.enhanced_data['quran_pages'])
    
    with col5:
        st.metric("نتيجة الألعاب", st.session_state.enhanced_data['memory_game_score'])
    
    with col6:
        st.metric("أيام الشكر", len(st.session_state.enhanced_data['gratitude_days']))
    
    # تقدم نحو الأهداف
    st.subheader("🎯 تقدمك نحو الأهداف")
    
    goals = [
        {"name": "ختم القرآن", "current": st.session_state.enhanced_data['quran_pages'], "target": 604, "unit": "صفحة"},
        {"name": "100 عمل صالح", "current": st.session_state.enhanced_data['good_deeds'], "target": 100, "unit": "عمل"},
        {"name": "30 يوم صلاة", "current": st.session_state.enhanced_data['prayer_streak'], "target": 30, "unit": "يوم"}
    ]
    
    for goal in goals:
        progress = min(goal['current'] / goal['target'], 1.0)
        st.write(f"**{goal['name']}:** {goal['current']}/{goal['target']} {goal['unit']}")
        st.progress(progress)
    
    st.markdown('</div>', unsafe_allow_html=True)

# تذييل الصفحة
st.markdown("---")
st.markdown("### 🌸 صنع بكل حب لتقوية إيمانك وروحانيتك")
st.caption("'وذكر فإن الذكرى تنفع المؤمنين' - الحمد لله رب العالمين")