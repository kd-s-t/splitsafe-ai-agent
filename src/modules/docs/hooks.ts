import { useEffect } from 'react';

export function useDocsPageSetup() {
  useEffect(() => {
    // Clear any cached content
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('splitsafe')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    
    // Force reload if this is a cached version
    if (window.performance && window.performance.navigation.type === 2) {
      window.location.reload();
    }
    
    // Listen for messages from ICP login tab
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'ICP_LOGIN_SUCCESS') {
        alert(`✅ Demo Login Successful!\n\nWelcome back, ${event.data.user.split('@')[0]}!\n\n This was a simulation - no real authentication or transfers occurred.\n\nYou can now see how the Philippines Airlines integration would work.`);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Add timestamp to prevent any caching
    const timestamp = Date.now();
    console.log(`Docs page loaded at: ${timestamp}`);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
}

export function useIcpLogin() {
  const openIcpLogin = () => {
    // Create a new tab within the same page
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Internet Identity - ICP Login</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
              width: 90%;
            }
            .logo {
              width: 80px;
              height: 80px;
              background: #4F46E5;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
            }
            h1 {
              color: #1F2937;
              margin-bottom: 10px;
              font-size: 24px;
            }
            p {
              color: #6B7280;
              margin-bottom: 30px;
              line-height: 1.5;
            }
            .user-list {
              text-align: left;
              margin-bottom: 30px;
            }
            .user-item {
              padding: 12px;
              border: 2px solid #E5E7EB;
              border-radius: 8px;
              margin-bottom: 10px;
              cursor: pointer;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .user-item:hover {
              border-color: #4F46E5;
              background: #F3F4F6;
            }
            .user-avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: #4F46E5;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            }
            .user-info h3 {
              margin: 0;
              color: #1F2937;
              font-size: 16px;
            }
            .user-info p {
              margin: 0;
              color: #6B7280;
              font-size: 14px;
            }
            .login-btn {
              background: #4F46E5;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
              width: 100%;
            }
            .login-btn:hover {
              background: #4338CA;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">ICP</div>
            <h1>Internet Identity</h1>
            <p>Choose your identity to continue with Philippines Airlines</p>
            <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 8px; margin: 10px 0; font-size: 12px; color: #92400E;">
              <strong> DEMO ONLY:</strong> This is a simulation - no real authentication occurs
            </div>
            
            <div class="user-list">
              <div class="user-item" onclick="selectUser('john.doe@example.com')">
                <div class="user-avatar">JD</div>
                <div class="user-info">
                  <h3>John Doe</h3>
                  <p>john.doe@example.com</p>
                </div>
              </div>
              <div class="user-item" onclick="selectUser('jane.smith@example.com')">
                <div class="user-avatar">JS</div>
                <div class="user-info">
                  <h3>Jane Smith</h3>
                  <p>jane.smith@example.com</p>
                </div>
              </div>
              <div class="user-item" onclick="selectUser('mike.wilson@example.com')">
                <div class="user-avatar">MW</div>
                <div class="user-info">
                  <h3>Mike Wilson</h3>
                  <p>mike.wilson@example.com</p>
                </div>
              </div>
            </div>
            
            <button class="login-btn" onclick="login()">
              Continue with Selected Identity
            </button>
          </div>
          
          <script>
            let selectedUser = null;
            
            function selectUser(email) {
              selectedUser = email;
              document.querySelectorAll('.user-item').forEach(item => {
                item.style.borderColor = '#E5E7EB';
                item.style.background = 'white';
              });
              event.currentTarget.style.borderColor = '#4F46E5';
              event.currentTarget.style.background = '#F3F4F6';
            }
            
            function login() {
              if (!selectedUser) {
                alert('Please select an identity first');
                return;
              }
              
              // Simulate login process
              document.body.innerHTML = \`
                <div class="container">
                  <div class="logo">✓</div>
                  <h1>Login Successful!</h1>
                  <p>Welcome back, \${selectedUser.split('@')[0]}!</p>
                  <p>Redirecting to Philippines Airlines...</p>
                  <div style="margin-top: 20px;">
                    <div style="width: 100%; height: 4px; background: #E5E7EB; border-radius: 2px; overflow: hidden;">
                      <div style="width: 100%; height: 100%; background: #4F46E5; animation: progress 2s ease-in-out;"></div>
                    </div>
                  </div>
                </div>
                <style>
                  @keyframes progress {
                    from { width: 0%; }
                    to { width: 100%; }
                  }
                </style>
              \`;
              
              setTimeout(() => {
                // Close this tab and trigger success in parent
                window.opener.postMessage({ type: 'ICP_LOGIN_SUCCESS', user: selectedUser }, '*');
                window.close();
              }, 2000);
            }
          </script>
        </body>
        </html>
      `);
      newTab.document.close();
    }
  };

  return { openIcpLogin };
}
