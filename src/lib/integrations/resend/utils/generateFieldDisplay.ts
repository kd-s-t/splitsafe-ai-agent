/**
 * Generate standardized field display - Mobile Responsive
 */
export function generateFieldDisplay(label: string, value: string, isCode: boolean = false): string {
  const valueStyle = isCode 
    ? 'background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace; word-break: break-all;'
    : 'word-break: break-word;';
    
  return `
    <div class="field-display" style="
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start; 
      padding: 8px 0; 
      border-bottom: 1px solid #e0e0e0;
      flex-wrap: wrap;
      margin: 5px 0;
    ">
      <strong style="color: #333; font-weight: 600; min-width: 120px; margin-bottom: 5px;">${label}:</strong>
      <span style="color: #666; text-align: right; flex: 1; margin-left: 10px; ${valueStyle}">${value}</span>
    </div>
  `;
}
