/**
 * Generate standardized email container with background image - Mobile Responsive
 */
export function generateEmailContainer(content: string): string {
  // Use raw GitHub link for background image
  const backgroundImageUrl = 'https://raw.githubusercontent.com/kd-s-t/splitsafe/refs/heads/development/public/email_bg.png';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>SplitSafe Email</title>
      <style>
        @media only screen and (max-width: 600px) {
          .email-container {
            width: 95% !important;
            padding: 10px !important;
          }
          .email-content {
            padding: 15px !important;
            margin: 10px !important;
          }
          .email-header {
            padding: 15px !important;
          }
          .email-header h2 {
            font-size: 20px !important;
          }
          .email-header img {
            max-width: 35px !important;
            height: 35px !important;
          }
          .bg-logo {
            width: 200px !important;
            height: 20px !important;
          }
          .content-card {
            padding: 15px !important;
          }
          .action-button {
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
          .field-display {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .field-display strong {
            margin-bottom: 5px !important;
          }
        }
        
        /* Extra small screens */
        @media only screen and (max-width: 480px) {
          .email-container {
            width: 98% !important;
            padding: 8px !important;
          }
          .email-content {
            padding: 12px !important;
            margin: 8px !important;
          }
          .email-header {
            padding: 12px !important;
          }
          .email-header h2 {
            font-size: 18px !important;
          }
          .content-card {
            padding: 12px !important;
          }
          .action-button {
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
      <div class="email-container" style="
        font-family: Arial, sans-serif; 
        width: 80% !important; 
        max-width: 800px !important;
        margin: 0 auto !important; 
        padding: 150px; 
        background-image: url('${backgroundImageUrl}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        min-height: 100vh;
        position: relative;
        box-sizing: border-box;
      ">
        <div class="email-content" style="
          background-color: rgba(248, 249, 250, 0.95);
          border-radius: 10px;
          padding: 20px;
          backdrop-filter: blur(2px);
          max-width: 600px;
          margin: 0 auto;
        ">
          ${content}
        </div>
      </div>
    </body>
    </html>
  `;
}
