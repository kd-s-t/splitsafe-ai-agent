/**
 * Generate standardized content card with enhanced styling for background - Mobile Responsive
 */
export function generateContentCard(content: string): string {
  return `
    <div class="content-card" style="
      background: rgba(255, 255, 255, 0.95); 
      padding: 25px; 
      border-radius: 10px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin: 15px 0;
    ">
      ${content}
    </div>
  `;
}
