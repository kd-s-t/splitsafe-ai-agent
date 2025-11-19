# TODO Checklist

## ✅ Completed

### Frontend
- [x] AWS Q integration created (`src/lib/integrations/awsq/`)
- [x] `parseUserMessageWithQ()` function ready
- [x] `sendMessageToQ()` function ready
- [x] API URL mapping configured (`/api/amazonq/parse`)
- [x] Enhanced integration with session management, retry logic, metrics
- [x] Files created: `aiParser.ts`, `qService.ts`, `index.ts`, `config.ts`, `sessionManager.ts`, `metrics.ts`, `types.ts`
- [x] Unified AI integration (`src/lib/integrations/ai/`)
- [x] Unified `parseUserMessage()` function with provider selection
- [x] Provider storage (localStorage) via `provider.ts`
- [x] AIProviderToggle UI component
- [x] All components updated: `AiModePage.tsx`, `RightSidebar.tsx`, `AgentRightSidebar.tsx`, `AIAssistant.tsx`

### Backend
- [x] OpenAI service exists (`lib/services/openai.service.ts`)
- [x] OpenAI route exists (`lib/routes/openai.ts`)
- [x] Amazon Q service exists (`lib/services/amazonq.service.ts`)
- [x] Amazon Q route exists (`lib/routes/amazonq.ts`)
- [x] Unified AI route (`lib/routes/ai.ts`)
- [x] `/api/ai/parse` endpoint accepts `provider` parameter
- [x] Routes to appropriate service based on provider
- [x] Registered in `api/index.ts`

### Tools Setup
- [x] Kiro IDE installed and in use
- [x] Amazon Q Developer extension in VS Code installed
- [x] Amazon Q Developer signed in (Builder ID or AWS account)

### Hackathon Requirements
- [x] Screenshots showing Kiro/Amazon Q usage
- [x] Code showing you built with the tools (awsq folder + unified integration)
- [x] Explanation of how you leveraged them (Added to README.md)

## 📋 TODO

### Screenshots
- [x] Kiro screenshots (10 screenshots in `public/awsq/kiro/`) ✅
- [x] Amazon Q Developer in VS Code (7 screenshots in `public/awsq/vscod+awsq/`) ✅
- [ ] Before/After code comparison (OpenAI vs Amazon Q)
- [ ] Working application with Amazon Q (showing it in action) - Optional
- [ ] Amazon Q CLI usage (if using CLI) - Optional

### Submission
- [ ] Write submission description on DoraHacks portal
- [ ] Create video demo (optional but recommended)
- [ ] Submit to hackathon portal by December 1, 2025

### Optional / Not Required
- [x] AWS SDK installation and credentials (not needed - using frontend integration)
- [x] Full backend endpoint testing (not needed - frontend integration is enough)
- [x] Complete migration from OpenAI (not needed - both providers work together)
