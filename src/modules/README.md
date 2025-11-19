# Modules

This directory contains modular components organized by feature/domain. Each module should follow a consistent structure for maintainability and reusability.

## Module Structure

Each module should contain:

```
module-name/
├── components/          # React components specific to this module
├── constants.ts        # Constant values and configuration
├── hooks.ts            # Custom hooks for this module
├── types.ts            # TypeScript type definitions
└── index.ts            # Module exports (optional)
```

## Shared Resources

The modules directory also contains shared resources that are used across multiple modules:

- **shared.constants.ts** - Common constants used across modules (BLOCKSTREAM_URL, ACTIVITY_CATEGORIES, etc.)
- **shared.types.ts** - Common type definitions used across modules (Recipient, Message, etc.)
- **shared.hooks.ts** - Common hooks used across modules (useIsMobile, useModalCleanup, etc.)

### Transaction Types

When working with transactions, always use the blockchain-compatible types from `shared.types.ts`:

- **EscrowTransaction** - Main transaction interface that matches the ICP blockchain schema exactly
- **ToEntry** - Core transaction recipient entry that matches ICP ToEntry schema
- **NormalizedTransaction** - Normalized version for Redux storage and UI components
- **ApiTransaction** & **ApiToEntry** - API response types for better type safety with ICP backend

**Important**: Always use `EscrowTransaction` and `ToEntry` interfaces when working with blockchain data, as these match the exact schema saved in the ICP blockchain. Use `NormalizedTransaction` only for UI state management and Redux storage.

## Current Modules

- **agent/** - Chat agent functionality and components
- **associates/** - Associate management and related components
- **dashboard/** - Dashboard-related components and logic
- **docs/** - API documentation components and live examples
- **escrow/** - Escrow creation, management, and related components
- **integrations/** - Third-party integrations (Bitcoin, ICP, SEI)
- **milesone/** - Milestone escrow functionality and components
- **notifications/** - Notification system components
- **settings/** - User settings and configuration
- **transactions/** - Transaction management and display components
- **withdraw/** - Withdrawal functionality and components

## Guidelines

1. **Single Responsibility**: Each module should focus on a specific domain/feature
2. **Encapsulation**: Module internals should be encapsulated, exposing only necessary interfaces
3. **Reusability**: Components and hooks should be designed for reuse across the application
4. **Type Safety**: All modules should have proper TypeScript definitions
5. **Consistent Structure**: Follow the standard structure outlined above
6. **Absolute Paths**: Always use absolute imports with the `@/` alias instead of relative paths
7. **Constants**: Store constant values in a `constants.ts` file within each module
8. **Shared Resources**: Use shared constants, types, and hooks from the root modules directory when they are used across multiple modules
9. **DRY Principle**: Avoid duplicating constants, types, or hooks - consolidate them in shared files when used in 2+ modules
10. **Type Safety**: Never use `any` type - always define proper TypeScript types for better type safety and code maintainability
11. **Naming Consistency**: Method and component names should reflect their file names for better maintainability and clarity
12. **Clean Code**: Remove unnecessary comments and console.log statements to keep the codebase clean and production-ready, but keep console.error statements in catch blocks for debugging

## Adding New Modules

When creating a new module:

1. Create the module directory under `src/modules/`
2. Add the standard structure (components/, hooks.ts, types.ts)
3. Update this README with the new module information
4. Follow the established patterns from existing modules
