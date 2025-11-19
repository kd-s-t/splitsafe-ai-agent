/**
 * Generate standardized alert box - Mobile Responsive
 */
export function generateAlertBox(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): string {
  const colors = {
    info: { bg: '#e3f2fd', border: '#2196f3', text: '#1976d2' },
    success: { bg: '#e8f5e8', border: '#4caf50', text: '#2e7d32' },
    warning: { bg: '#fff3e0', border: '#ff9800', text: '#f57c00' },
    error: { bg: '#ffebee', border: '#f44336', text: '#c62828' }
  };

  const color = colors[type];
  
  return `
    <div style="background: ${color.bg}; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color.border}; word-wrap: break-word;">
      <p style="margin: 0; color: ${color.text}; font-weight: bold; line-height: 1.4;">${message}</p>
    </div>
  `;
}
