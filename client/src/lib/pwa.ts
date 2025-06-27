export function initializePWA() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  // Handle PWA installation
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
  });

  // Listen for install completion
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    hideInstallBanner();
  });

  // Install banner functions
  function showInstallBanner() {
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'fixed top-20 left-4 right-4 bg-primary text-white rounded-lg p-4 shadow-lg z-40 animate-fade-in';
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <div>
            <div class="font-medium">Install ReviewResponder</div>
            <div class="text-sm opacity-90">Get the full app experience</div>
          </div>
        </div>
        <div class="flex space-x-2">
          <button id="pwa-install-btn" class="px-3 py-1 bg-white text-primary rounded text-sm font-medium">
            Install
          </button>
          <button id="pwa-dismiss-btn" class="p-1 hover:bg-primary/80 rounded">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
        hideInstallBanner();
      }
    });

    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', hideInstallBanner);
  }

  function hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.remove();
    }
  }

  // Handle push notifications (if supported)
  if ('Notification' in window && 'serviceWorker' in navigator) {
    // Request notification permission
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted');
      }
    });
  }

  // Handle offline/online events
  window.addEventListener('online', () => {
    showToast('Back online! Your data will sync automatically.', 'success');
  });

  window.addEventListener('offline', () => {
    showToast('You are offline. Changes will be saved locally.', 'info');
  });
}

export function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `bg-white border-l-4 ${
    type === 'success' ? 'border-green-500' : 
    type === 'error' ? 'border-red-500' : 
    'border-blue-500'
  } p-4 rounded-lg shadow-lg max-w-sm mb-2 animate-fade-in`;
  
  toast.innerHTML = `
    <div class="flex items-center space-x-3">
      <svg class="w-5 h-5 ${
        type === 'success' ? 'text-green-500' : 
        type === 'error' ? 'text-red-500' : 
        'text-blue-500'
      }" fill="currentColor" viewBox="0 0 24 24">
        ${type === 'success' ? 
          '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' :
          type === 'error' ?
          '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>' :
          '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>'
        }
      </svg>
      <span class="text-slate-900 text-sm">${message}</span>
      <button class="ml-auto text-slate-400 hover:text-slate-600" onclick="this.parentElement.parentElement.remove()">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-50 space-y-2';
  document.body.appendChild(container);
  return container;
}

export function saveDraftLocally(reviewId: number, content: string) {
  try {
    const drafts = JSON.parse(localStorage.getItem('reviewDrafts') || '{}');
    drafts[reviewId] = {
      content,
      timestamp: Date.now()
    };
    localStorage.setItem('reviewDrafts', JSON.stringify(drafts));
    showToast('Draft saved locally', 'success');
  } catch (error) {
    console.error('Error saving draft:', error);
    showToast('Failed to save draft', 'error');
  }
}

export function loadDraftFromLocal(reviewId: number): string | null {
  try {
    const drafts = JSON.parse(localStorage.getItem('reviewDrafts') || '{}');
    return drafts[reviewId]?.content || null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve('denied');
}

export function simulateNewReviewNotification() {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.showNotification('New Review Received!', {
            body: 'A customer just left a review that needs your attention.',
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'new-review',
            actions: [
              {
                action: 'view',
                title: 'View Review'
              },
              {
                action: 'respond',
                title: 'Quick Respond'
              }
            ]
          });
        }
      });
    }
  }
}
