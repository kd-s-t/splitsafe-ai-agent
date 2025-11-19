/**
 * Generate standardized email header with SplitSafe logo - Mobile Responsive
 */
export function generateEmailHeader(title: string): string {
  return `
    <div class="email-header" style="
      background:radial-gradient(91.85% 91.85% at 57.95% 22.75%, rgb(62, 62, 62) 0%, rgb(13, 13, 13) 100%); 
      padding: 20px; 
      border-radius: 12px; 
      margin-bottom: 20px;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 120px;
    ">
      <div style="
        width: 20px; 
        height: 20px; 
        background-image: url('https://raw.githubusercontent.com/kd-s-t/splitsafe/refs/heads/development/public/logo-partial.svg');
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
      "></div>
      <div style="
        opacity: 1; 
        transform: translateX(15px) translateY(5px);
        position: absolute;
        top: 0;
        right: 0;
        overflow: hidden;
      ">
        <div style="
          width: 400px; 
          height: 32px; 
          background-image: url('https://raw.githubusercontent.com/kd-s-t/splitsafe/refs/heads/development/public/bg-logo.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        "></div>
      </div>

      <div style="
        opacity: 1; 
        transform: none;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: -8px;
        z-index: 10;
      ">
        <div style="
          width: 45px; 
          height: 45px; 
          background-image: url('https://raw.githubusercontent.com/kd-s-t/splitsafe/refs/heads/development/public/splitsafe.svg');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          margin: 0 auto;
        "></div>
          <h2 style="
            font-size: 24px;
            text-align: center;
            margin-top: 6px;
            color: white;
            margin-bottom: 0;
            line-height: 1.2;
          ">
          ${title}
          </h2>
      </div>
    </div>
  `;
}
