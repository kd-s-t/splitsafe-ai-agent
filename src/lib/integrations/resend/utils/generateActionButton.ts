/**
 * Generate standardized action button - Mobile Responsive
 */
export function generateActionButton(text: string, url: string, backgroundColor: string = '#007AFF'): string {
  return `
    <div style="text-align: center; margin-top: 25px;">
      <a href="${url}" 
         class="action-button"
         style="background: ${backgroundColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; width: 100%; max-width: 300px; box-sizing: border-box;">
        ${text}
      </a>
    </div>
  `;
}
