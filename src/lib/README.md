# Library Organization

Shared utilities, integrations, and internal services for SplitSafe.

## Directory Structure

```
src/lib/
├── integrations/        # External service integrations
│   ├── openai/         # OpenAI API integration
│   ├── sentry/         # Sentry error monitoring
│   ├── pusher/         # Pusher real-time messaging
│   └── index.ts        # Export all integrations
├── internal/            # Internal services & custom logic
│   ├── api/            # Next.js API utilities
│   ├── icp/            # ICP blockchain integrations
│   └── index.ts        # Export all internal services
├── utils/               # General utility functions
│   ├── cache.ts        # Caching utilities
│   ├── constants.ts    # Constants
│   ├── utils.ts        # General utilities
│   └── index.ts        # Export all utilities
├── redux/               # State management
│   ├── store/          # Redux store configuration
│   └── index.ts        # Export Redux utilities
└── index.ts             # Main library exports
```

## Integrations

External service integrations organized by provider:

### OpenAI
- **Purpose**: AI-powered chat and assistance
- **Files**: `integrations/openai/client.ts`
- **Usage**: `@/lib/integrations/openai`

### Sentry
- **Purpose**: Error monitoring and performance tracking
- **Files**: `integrations/sentry/client.ts`, `server.ts`, `edge.ts`
- **Usage**: `@/lib/integrations/sentry`

### Pusher
- **Purpose**: Real-time messaging and notifications
- **Files**: `integrations/pusher/client.ts`
- **Usage**: `@/lib/integrations/pusher`

## Internal Services

Custom logic and APIs:

### API
- **Purpose**: Next.js API route utilities and authentication
- **Files**: `internal/api/client.ts`, `auth.ts`
- **Usage**: `@/lib/internal/api`

### Chat
- **Purpose**: Custom chat functionality and ICP integration
- **Files**: `internal/blockchain/icp/chat/`
- **Usage**: `@/lib/internal/blockchain/icp`

### ICP (Internal)
- **Purpose**: Internet Computer Protocol (ICP) blockchain integration
- **Files**: `internal/icp/`
- **Usage**: `@/lib/internal/icp`

### Utils
- **Purpose**: General utility functions and constants
- **Files**: `utils/utils.ts`, `utils/constants.ts`, `utils/polyfills.ts`
- **Usage**: `@/lib/utils`

## State Management

Redux state management:

### Redux
- **Purpose**: Global state management
- **Files**: `redux/store/`
- **Usage**: `@/lib/redux`

## Import Examples

```typescript
import { openaiClient } from '@/lib/integrations/openai'
import { sentryClient } from '@/lib/integrations/sentry'
import { pusherClient } from '@/lib/integrations/pusher'

import { apiCall, sendEscrowEventNotification } from '@/lib/internal/auth'
import { icpChatService } from '@/lib/internal/icp/chat'
import { utils } from '@/lib/utils'

import { store } from '@/lib/redux'

import { openaiClient, apiCall, store } from '@/lib'
```

## Design Principles

1. **Separation of Concerns**: External integrations vs internal logic
2. **Service Isolation**: Each integration is self-contained
3. **Clean Exports**: Each directory exports through index.ts
4. **Scalability**: Easy to add new integrations or services
5. **Maintainability**: Related functionality is co-located

## Adding New Integrations

1. Create directory under `integrations/`
2. Add service-specific files (client.ts, config.ts, etc.)
3. Create `index.ts` to export the service
4. Update `integrations/index.ts` to include new service
5. Update main `lib/index.ts` if needed

## Adding New Internal Services

1. Create directory under `internal/`
2. Add service-specific files
3. Create `index.ts` to export the service
4. Update `internal/index.ts` to include new service
5. Update main `lib/index.ts` if needed

## Code Standards

### File Organization
- All directories must have `index.ts` for clean exports
- Use TypeScript for all new files
- Follow existing naming conventions
- Keep related functionality together

### Code Quality
- **No comments** - Code should be self-documenting
- **No console.logs** - Use proper logging services
- **No debug statements** - Remove all debugging code
- **Clean imports** - Organize imports alphabetically
- **Type safety** - Use proper TypeScript types
- **Error handling** - Implement proper error boundaries
- **Absolute paths** - Use absolute imports with `@/` prefix

### Code Compliance
- **One function per file** - Each function gets its own dedicated file
- **No duplicate files** - Remove duplicate functionality
- **Domain organization** - Group related functions into domain folders
- **Barrel exports** - Use `index.ts` files for clean imports
- **Centralized types** - All blockchain-specific types in `{blockchain}/types.ts`
- **No unnecessary type files** - Remove files that only re-export types

### Import Organization
```typescript
// External libraries first
import { Principal } from '@dfinity/principal'
import { toast } from 'sonner'

// Internal imports with absolute paths
import { createSplitDappActor } from '@/lib/internal/blockchain/icp/splitDapp'
import type { ParticipantShare } from '@/lib/internal/blockchain/icp/types'

// Relative imports only for same directory
import { serializeBigInts } from './serializeBigInts'
```

### Path Guidelines
- **Always use absolute paths** with `@/` prefix for internal imports
- **Avoid relative paths** like `../` or `./` except for same-directory files
- **Use `@/` for all internal modules** - `@/lib/`, `@/modules/`, `@/components/`
- **Keep relative imports minimal** - only for files in the same directory

### Common Violations to Avoid
- **Console statements** - Found in 9+ files, should use proper logging
- **Comments** - Found in 29+ files, code should be self-documenting
- **Relative imports** - Found in 30+ files, use absolute paths instead
- **Duplicate files** - `splitDappNew.ts`, `notificationsNew.ts` should be removed
- **Unnecessary type files** - `milestone/types.ts`, `transaction/types.ts` only re-export
- **Missing index files** - Some domains lack proper barrel exports
