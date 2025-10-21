// pwa-config.js - إعدادات متقدمة للتطبيق التقدمي
const PWAConfig = {
    name: 'الواحة الروحانية',
    shortName: 'الواحة',
    description: 'منصة إيمانية متكاملة لتطوير الروحانية',
    themeColor: '#014d40',
    backgroundColor: '#014d40',
    
    // إعدادات التخزين
    cache: {
        name: 'oasis-spiritual-v3',
        urls: [
            '/',
            '/index.html',
            '/styles.css',
            '/app.js',
            '/sounds.js',
            '/animations.css',
            '/manifest.json'
        ]
    },
    
    // إعدادات الإشعارات
    notifications: {
        enabled: true,
        prayerTimes: true,
        dailyReminders: true,
        achievements: true
    },
    
    // إعدادات المزامنة
    sync: {
        enabled: true,
        interval: 24 * 60 * 60 * 1000 // 24 ساعة
    }
};

// تسجيل Service Worker متقدم
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registered: ', registration);
                
                // طلب الإذن للإشعارات
                if ('Notification' in window && PWAConfig.notifications.enabled) {
                    Notification.requestPermission();
                }
            })
            .catch(function(registrationError) {
                console.log('ServiceWorker registration failed: ', registrationError);
            });
    });
}

// كشف التثبيت
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const installPrompt = document.createElement('div');
    installPrompt.className = 'install-prompt';
    installPrompt.innerHTML = `
        <div class="install-content">
            <div class="install-icon">📱</div>
            <div class="install-text">
                <h5>تثبيت الواحة الروحانية</h5>
                <p>ثبّت التطبيق لتجربة أفضل ووصول سريع</p>
            </div>
            <div class="install-buttons">
                <button class="btn btn-sm btn-outline-light" id="installLater">لاحقاً</button>
                <button class="btn btn-sm btn-success" id="installNow">تثبيت</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(installPrompt);
    
    document.getElementById('installNow').addEventListener('click', async () => {
        installPrompt.remove();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        }
    });
    
    document.getElementById('installLater').addEventListener('click', () => {
        installPrompt.remove();
    });
}

// إدارة الاتصال بالشبكة
window.addEventListener('online', function() {
    showTempToast('🔄 تم استعادة الاتصال بالإنترنت');
});

window.addEventListener('offline', function() {
    showTempToast('⚠️ فقدان الاتصال بالإنترنت - التطبيق يعمل دون اتصال');
});

// تحميل متقدم للبيانات
class DataManager {
    constructor() {
        this.cache = new Map();
    }
    
    async get(url, forceRefresh = false) {
        if (!forceRefresh && this.cache.has(url)) {
            return this.cache.get(url);
        }
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.cache.set(url, data);
            return data;
        } catch (error) {
            console.error('Failed to fetch data:', error);
            return this.cache.get(url) || null;
        }
    }
    
    clearCache() {
        this.cache.clear();
    }
}

window.dataManager = new DataManager();