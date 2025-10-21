// sounds.js - نظام الأصوات التفاعلي المتكامل
class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = localStorage.getItem('sound_enabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('sound_volume')) || 0.7;
        this.initSounds();
    }

    initSounds() {
        // أصوات ناعمة ومتناغمة مع الطابع الإسلامي
        this.sounds = {
            click: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3'),
            pop: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'),
            whoosh: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-whoosh-1126.mp3'),
            success: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-success-bell-1937.mp3'),
            pageTurn: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-book-page-turn-1150.mp3'),
            prayer: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkle-3024.mp3'),
            reward: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
            nature: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-1307.mp3')
        };
    }

    createSound(url) {
        const audio = new Audio();
        audio.src = url;
        audio.preload = 'auto';
        audio.volume = this.volume;
        return audio;
    }

    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.volume = this.volume;
            const playPromise = sound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // تجاهل الأخطاء الصوتية بصمت
                });
            }
        } catch (error) {
            // تجاهل الأخطاء
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('sound_enabled', this.enabled);
        return this.enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('sound_volume', this.volume);
        
        // تحديث حجم الصوت لجميع الأصوات
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }
}

// إنشاء نسخة عامة من مدير الأصوات
window.soundManager = new SoundManager();

// دمج الأصوات مع النظام الحالي
document.addEventListener('DOMContentLoaded', function() {
    // استبدال نظام الأصوات القديم بالنظام الجديد
    const originalPlaySound = window.playSound;
    
    window.playSound = function(el) {
        if (el && el.id) {
            const soundMap = {
                'soundClick': 'click',
                'soundPop': 'pop',
                'soundWhoosh': 'whoosh',
                'soundAchievement': 'success'
            };
            
            if (soundMap[el.id]) {
                window.soundManager.play(soundMap[el.id]);
                return;
            }
        }
        
        // الاستمرار بالنظام القديم كنسخة احتياطية
        if (originalPlaySound) {
            originalPlaySound(el);
        }
    };

    // إضافة عناصر تحكم الصوت للوحة الجانبية
    addSoundControls();
});

function addSoundControls() {
    const panelControls = document.querySelector('.panel-controls');
    if (!panelControls) return;

    const soundControlHTML = `
        <div class="sound-controls">
            <label class="control-label">🎵 الإعدادات الصوتية</label>
            <div class="sound-toggle">
                <button class="btn btn-sm btn-outline-light" id="toggleSound">
                    ${window.soundManager.enabled ? '🔊' : '🔇'} ${window.soundManager.enabled ? 'مفعّل' : 'معطل'}
                </button>
            </div>
            <div class="volume-control mt-2">
                <label class="form-label">مستوى الصوت: <span id="volumeValue">${Math.round(window.soundManager.volume * 100)}%</span></label>
                <input type="range" class="form-range" id="volumeSlider" min="0" max="100" value="${window.soundManager.volume * 100}">
            </div>
        </div>
    `;

    panelControls.insertAdjacentHTML('beforeend', soundControlHTML);

    // إضافة مستمعي الأحداث
    document.getElementById('toggleSound').addEventListener('click', function() {
        const enabled = window.soundManager.toggle();
        this.innerHTML = `${enabled ? '🔊' : '🔇'} ${enabled ? 'مفعّل' : 'معطل'}`;
        window.soundManager.play('click');
    });

    document.getElementById('volumeSlider').addEventListener('input', function() {
        const volume = this.value / 100;
        window.soundManager.setVolume(volume);
        document.getElementById('volumeValue').textContent = this.value + '%';
    });
}