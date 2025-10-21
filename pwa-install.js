// pwa-install.js - نظام متقدم لتثبيت التطبيق
class PWAInstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.installPromptShown = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkPWAStatus();
  }

  setupEventListeners() {
    // حدث قبل التثبيت
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showAutoPrompt();
    });

    // حدث بعد التثبيت
    window.addEventListener('appinstalled', () => {
      this.onAppInstalled();
    });
  }

  showAutoPrompt() {
    // عدم العرض إذا كان التطبيق مثبتاً أصلاً
    if (this.isPWAInstalled()) return;

    // الانتظار 5 ثواني ثم العرض
    setTimeout(() => {
      if (!this.installPromptShown && this.deferredPrompt) {
        this.showInstallPrompt();
      }
    }, 5000);
  }

  showInstallPrompt() {
    this.installPromptShown = true;
    
    const promptHTML = `
      <div id="pwaInstallPrompt" class="pwa-prompt">
        <div class="pwa-prompt-content">
          <div class="pwa-icon">📱</div>
          <div class="pwa-text">
            <h4>حمل التطبيق الآن!</h4>
            <p>استمتع بتجربة أفضل مع التطبيق المثبت</p>
            <div class="pwa-features">
              <span>⚡ أسرع تحميل</span>
              <span>📱 وصول سريع</span>
              <span>🌙 عمل دون إنترنت</span>
            </div>
          </div>
          <div class="pwa-actions">
            <button class="pwa-btn secondary" onclick="pwaManager.hidePrompt()">لاحقاً</button>
            <button class="pwa-btn primary" onclick="pwaManager.installApp()">تثبيت التطبيق</button>
          </div>
          <button class="pwa-close" onclick="pwaManager.hidePermanent()">×</button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', promptHTML);
    this.addPromptStyles();
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      this.onInstallSuccess();
    } else {
      this.onInstallDeclined();
    }
    
    this.deferredPrompt = null;
    this.hidePrompt();
  }

  hidePrompt() {
    const prompt = document.getElementById('pwaInstallPrompt');
    if (prompt) prompt.remove();
    this.installPromptShown = false;
  }

  hidePermanent() {
    this.hidePrompt();
    localStorage.setItem('pwa_prompt_hidden', 'true');
  }

  onInstallSuccess() {
    showTempToast('🎉 تم بدء تثبيت التطبيق');
    awardPoints(25, 'تثبيت التطبيق');
  }

  onInstallDeclined() {
    // إعادة العرض بعد 3 أيام
    setTimeout(() => {
      this.installPromptShown = false;
    }, 3 * 24 * 60 * 60 * 1000);
  }

  onAppInstalled() {
    console.log('Application installed successfully');
    this.hidePrompt();
  }

  isPWAInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone;
  }

  checkPWAStatus() {
    if (this.isPWAInstalled()) {
      document.body.classList.add('pwa-installed');
    }
  }

  addPromptStyles() {
    if (document.getElementById('pwa-prompt-styles')) return;

    const styles = `
      .pwa-prompt {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, var(--primary), var(--primary-2));
        border: 2px solid var(--gold);
        border-radius: 20px;
        padding: 25px;
        z-index: 10000;
        box-shadow: 0 15px 50px rgba(0,0,0,0.4);
        backdrop-filter: blur(10px);
        animation: slideInUp 0.5s ease-out;
        max-width: 500px;
        width: 95%;
      }

      .pwa-prompt-content {
        position: relative;
        text-align: center;
      }

      .pwa-icon {
        font-size: 3rem;
        margin-bottom: 15px;
      }

      .pwa-text h4 {
        color: var(--gold);
        margin: 0 0 10px 0;
        font-weight: bold;
      }

      .pwa-text p {
        color: white;
        margin: 0 0 15px 0;
        opacity: 0.9;
      }

      .pwa-features {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin: 15px 0;
        flex-wrap: wrap;
      }

      .pwa-features span {
        background: rgba(255,255,255,0.1);
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8rem;
        color: var(--gold);
      }

      .pwa-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
      }

      .pwa-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
      }

      .pwa-btn.primary {
        background: var(--gold);
        color: var(--primary);
      }

      .pwa-btn.secondary {
        background: rgba(255,255,255,0.1);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }

      .pwa-btn:hover {
        transform: translateY(-2px);
      }

      .pwa-close {
        position: absolute;
        top: -10px;
        left: -10px;
        background: rgba(0,0,0,0.7);
        border: none;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .pwa-prompt {
          width: 90%;
          padding: 20px;
        }

        .pwa-actions {
          flex-direction: column;
        }

        .pwa-features {
          flex-direction: column;
          gap: 8px;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'pwa-prompt-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }
}

// تهيئة مدير تثبيت PWA
window.pwaManager = new PWAInstallManager();