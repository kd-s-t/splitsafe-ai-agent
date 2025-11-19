/**
 * Generate standardized info box - Mobile Responsive
 */
export function generateInfoBox(content: string, backgroundColor: string = '#f8f9fa'): string {
  return `
    <div style="background: ${backgroundColor}; padding: 15px; border-radius: 8px; margin: 15px 0; word-wrap: break-word; line-height: 1.5;">
      ${content}
    </div>
  `;
}
