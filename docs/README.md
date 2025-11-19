# SplitSafe Guides

Welcome to the SplitSafe guides directory! This folder contains comprehensive documentation for setting up, deploying, and maintaining the SplitSafe application.

## 📋 Table of Contents

### 🚀 **Deployment & Infrastructure**
- [SSL Setup Guide](./pages/SSL_SETUP_GUIDE.md) - SSL certificate setup for EC2 instances
- [Mainnet Deployment](./pages/MAINNET_DEPLOYMENT.md) - Mainnet deployment guide

### 🔧 **Backend & Blockchain**
- [ICP Backend](./pages/ICP_BACKEND.md) - Internet Computer Backend Architecture
- [SEI Integration](./pages/SEI_INTEGRATION.md) - SEI Network Integration Guide
- [Bitcoin Integration](./pages/BITCOIN_INTEGRATION.md) - Bitcoin Integration with ICP
- [ckBTC Deployment](./pages/CKBTC_DEPLOYMENT.md) - Real ckBTC deployment guide
- [ICP Balance Checking](./pages/ICP_BALANCE_CHECKING.md) - ICP balance verification system

### 📊 **Documentation & Presentations**
- [Development Plan](./pages/DEVELOPMENT_PLAN.md) - Comprehensive development roadmap and strategy
- [Presentation README](./pages/PRESENTATION_README.md) - Project presentation and overview
- [Security Features](./pages/SECURITY_FEATURES.md) - Enterprise-grade security features
- [Hybrid Messaging Architecture](./pages/HYBRID_MESSAGING_ARCHITECTURE.md) - Cross-chain messaging system
- [Milestone Escrow Feature](./pages/MILESTONE_ESCROW_FEATURE.md) - Milestone-based escrow system
- [SaaS API Integration](./pages/SAAS_API_INTEGRATION.md) - Complete SaaS integration guide with business registration and API documentation
- [API Reference](./pages/API_REFERENCE.md) - Comprehensive API reference with endpoints, data types, and integration examples
- [Quick Reference](./pages/QUICK_REFERENCE.md) - Developer quick reference card with common endpoints and examples
- [AWS Global Vibe Hackathon](./pages/AWS_GLOBAL_VIBE_HACKATHON.md) - AWS Global Vibe: AI Coding Hackathon 2025 information, requirements, and guidelines
- [TODO](./pages/TODO.md) - Quick checklist of what's done and what's missing

### 🛠️ **Development Workflow**
- [Quick Start Guide](#-quick-start-guide)
- [Development Workflow](#-development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)

### 🐛 **Debugging & Troubleshooting**
- [Common Bugs and Fixes](./pages/COMMON_BUGS_AND_FIXES.md) - Recurring bugs and their solutions
- [Transaction Debug Page](./pages/TRANSACTION_DEBUG_PAGE.md) - Transaction debugging tools
- [Loading Spinner Usage](./pages/LOADING_SPINNER_USAGE.md) - Loading state management
- [Environment Variables Guide](./pages/ENVIRONMENT_VARIABLES_GUIDE.md) - Environment configuration
- [Canister Upgrade Guide](./pages/CANISTER_UPGRADE_GUIDE.md) - Canister upgrade procedures

### 📚 **Resources & Support**
- [Project Structure](#project-structure)
- [External Resources](#external-resources)
- [Support & Troubleshooting](#-support--troubleshooting)
- [Contributing](#contributing)

---

## 📚 Available Guides

### 🚀 **Deployment & Infrastructure**

#### [SSL_SETUP_GUIDE.md](./pages/SSL_SETUP_GUIDE.md)
**SSL Certificate Setup for EC2 Instances**
- Manual and automated SSL setup with Let's Encrypt
- Nginx configuration for SSL domains
- Certificate renewal and monitoring
- Vercel deployment configuration

**Key Topics:**
- Let's Encrypt certificate generation
- Nginx SSL configuration
- Automatic certificate renewal
- Vercel deployment automation
- SSL monitoring and troubleshooting

---

### 🔧 **Backend & Blockchain**

#### [ICP_BACKEND.md](./pages/ICP_BACKEND.md)
**Internet Computer Backend Architecture**
- Motoko canister development
- Cross-chain Bitcoin integration
- Escrow system implementation
- Security and fraud detection

**Key Topics:**
- ICP canister architecture
- Bitcoin integration via threshold ECDSA
- Escrow lifecycle management
- Reputation and fraud detection system
- Auto-expiry and transaction management

---

#### [SEI_INTEGRATION.md](./pages/SEI_INTEGRATION.md)
**SEI Network Integration Guide**
- Multi-chain SEI token support
- Test network configuration
- Frontend and backend integration
- Network deployment strategies

**Key Topics:**
- SEI test networks (Atlantic-2, Pacific-1, Arctic-1)
- SEI wallet and balance management
- Testnet faucet integration
- Network switching and configuration
- SEI escrow functionality

---

#### [CKBTC_DEPLOYMENT.md](./pages/CKBTC_DEPLOYMENT.md)
**Real ckBTC Deployment Guide**
- Chain Key Bitcoin (ckBTC) integration
- Real Bitcoin backing on mainnet
- Migration from placeholder to production ckBTC
- Deployment and verification procedures

**Key Topics:**
- ckBTC architecture and benefits
- Real mainnet canister IDs
- Deployment process and verification
- Cost analysis and monitoring
- Security considerations and KYT checks

---

### 📊 **Documentation & Presentations**

#### [DEVELOPMENT_PLAN.md](./pages/DEVELOPMENT_PLAN.md)
**Comprehensive development roadmap and strategy**
- Current status and completed features
- Immediate priorities and timelines
- Medium-term goals and long-term vision
- Success metrics and risk management

**Key Topics:**
- Real ckBTC deployment plan
- Performance optimization strategy
- Multi-chain platform vision
- DeFi ecosystem development
- Global expansion roadmap

---

#### [PRESENTATION_README.md](./pages/PRESENTATION_README.md)
**Project presentation and overview**
- SplitSafe project introduction
- Key features and benefits
- Technical architecture overview
- Demo and showcase information

**Key Topics:**
- Project overview and goals
- Technical architecture
- Key features demonstration
- Future roadmap

---

#### [AWS_GLOBAL_VIBE_HACKATHON.md](./pages/AWS_GLOBAL_VIBE_HACKATHON.md)
**AWS Global Vibe: AI Coding Hackathon 2025 information, requirements, and guidelines**
- Complete hackathon overview and participation guide
- Required AWS AI coding tools installation and setup
- Submission requirements and scoring criteria
- Prize information and track categories
- Team formation and disqualification warnings

**Key Topics:**
- Amazon Q Developer CLI, IDE, GitHub, and AWS Console integration
- Amazon Kiro IDE setup and usage
- Builder ID free tier access without AWS account
- 10 diverse hackathon tracks
- $700k+ prize pool breakdown
- Submission requirements and proof of tool usage
- Scoring criteria for prize-worthy submissions

---

### 🐛 **Debugging & Troubleshooting**

#### [COMMON_BUGS_AND_FIXES.md](./pages/COMMON_BUGS_AND_FIXES.md)
**Recurring bugs and their solutions**
- Transaction not found after creation bug
- dfx ColorOutOfRange error
- Frontend parsing issues
- Canister response handling

**Key Topics:**
- Transaction parsing bug fixes
- dfx environment variable setup
- Frontend-backend synchronization
- Emergency debugging procedures
- Prevention strategies

---

#### [TRANSACTION_DEBUG_PAGE.md](./pages/TRANSACTION_DEBUG_PAGE.md)
**Transaction debugging tools and methods**
- Comprehensive transaction analysis
- Multiple search method testing
- Canister response validation
- Frontend data flow debugging

**Key Topics:**
- Transaction ID analysis
- Search method comparison
- Response format debugging
- Authentication verification
- Common issue resolution

---

#### [SAAS_INTEGRATION.md](./pages/SAAS_INTEGRATION.md)
**Business registration, client ID management, and merchant ICP system**
- SaaS platform for businesses to integrate SplitSafe escrow
- Business registration and KYC process
- Merchant ICP accounts for receiving customer payments
- API integration and webhook notifications

**Key Topics:**
- Business registration process
- Client ID and API key management
- Merchant ICP account structure
- REST API integration and authentication
- Webhook notification system
- SDK examples for JavaScript and Python
- Error handling and rate limiting
- Pricing models and subscription tiers

---

## 🎯 **Quick Start Guide**

### For New Developers

1. **Start with the basics:**
   - Read [PRESENTATION_README.md](./pages/PRESENTATION_README.md) for project overview
   - Review [ICP_BACKEND.md](./pages/ICP_BACKEND.md) for backend understanding

2. **Set up development environment:**
   - Follow [MAINNET_DEPLOYMENT.md](./pages/MAINNET_DEPLOYMENT.md) for deployment guidance
   - Configure SSL with [SSL_SETUP_GUIDE.md](./pages/SSL_SETUP_GUIDE.md)
   - Set up environment variables with [ENVIRONMENT_VARIABLES_GUIDE.md](./pages/ENVIRONMENT_VARIABLES_GUIDE.md)

3. **Add blockchain integrations:**
   - Implement SEI integration using [SEI_INTEGRATION.md](./pages/SEI_INTEGRATION.md)
   - Set up Bitcoin integration with [BITCOIN_INTEGRATION.md](./pages/BITCOIN_INTEGRATION.md)
   - Deploy real ckBTC with [CKBTC_DEPLOYMENT.md](./pages/CKBTC_DEPLOYMENT.md)

4. **Debugging and troubleshooting:**
   - Read [COMMON_BUGS_AND_FIXES.md](./pages/COMMON_BUGS_AND_FIXES.md) for known issues
   - Use [TRANSACTION_DEBUG_PAGE.md](./pages/TRANSACTION_DEBUG_PAGE.md) for transaction debugging

### For DevOps Engineers

1. **Infrastructure setup:**
   - Follow [MAINNET_DEPLOYMENT.md](./pages/MAINNET_DEPLOYMENT.md) for deployment guidance
   - Configure SSL with [SSL_SETUP_GUIDE.md](./pages/SSL_SETUP_GUIDE.md)

2. **Backend deployment:**
   - Deploy ICP canisters following [ICP_BACKEND.md](./pages/ICP_BACKEND.md)
   - Configure blockchain integrations

### For Blockchain Developers

1. **Understand the architecture:**
   - Review [ICP_BACKEND.md](./pages/ICP_BACKEND.md) for cross-chain integration
   - Study [SEI_INTEGRATION.md](./pages/SEI_INTEGRATION.md) for multi-chain support

2. **Add new integrations:**
   - Follow the patterns established in SEI integration
   - Extend the backend modules as needed

## 🔗 **Related Documentation**

### Project Structure
```
splitsafe/
├── docs/                     # Documentation directory
│   ├── README.md             # This file
│   ├── pages/                # All documentation pages
│   │   ├── AWS_GLOBAL_VIBE_HACKATHON.md
│   │   ├── BITCOIN_INTEGRATION.md
│   │   ├── CANISTER_UPGRADE_GUIDE.md
│   │   ├── CKBTC_DEPLOYMENT.md
│   │   ├── COMMON_BUGS_AND_FIXES.md
│   │   ├── DEVELOPMENT_PLAN.md
│   │   ├── ENVIRONMENT_VARIABLES_GUIDE.md
│   │   ├── FEEDBACK_FEATURE.md
│   │   ├── HYBRID_MESSAGING_ARCHITECTURE.md
│   │   ├── ICP_BACKEND.md
│   │   ├── ICP_BALANCE_CHECKING.md
│   │   ├── LOADING_SPINNER_USAGE.md
│   │   ├── MAINNET_DEPLOYMENT.md
│   │   ├── MILESTONE_ESCROW_FEATURE.md
│   │   ├── MILESTONE_RELEASE_PAYMENT_TRACKING.md
│   │   ├── PRESENTATION_README.md
│   │   ├── SECURITY_FEATURES.md
│   │   ├── SEI_INTEGRATION.md
│   │   ├── SSL_SETUP_GUIDE.md
│   │   └── TRANSACTION_DEBUG_PAGE.md
│   └── sample_milestone_contract.md
├── icp/                      # Internet Computer backend
├── src/                      # Frontend application
└── scripts/                  # Deployment scripts
```

### External Resources

#### Internet Computer
- [ICP Documentation](https://internetcomputer.org/docs)
- [Motoko Language Guide](https://internetcomputer.org/docs/current/developer-docs/build/languages/motoko/)
- [ICP Dashboard](https://dashboard.internetcomputer.org/)

#### SEI Network
- [SEI Documentation](https://docs.seinetwork.io/)
- [SEI Explorer](https://sei.explorers.guru/)
- [SEI Discord](https://discord.gg/sei)

#### Bitcoin Integration
- [Bitcoin Core Documentation](https://bitcoin.org/en/developer-documentation)
- [Blockstream API](https://blockstream.info/api/)
- [Mempool API](https://mempool.space/api)

## 🛠️ **Development Workflow**

### 1. Local Development
```bash
# Start local development
cd splitsafe
npm install
npm run dev

# Start DFX for ICP local development
cd icp
dfx start --background
dfx deploy --network local
```

### 2. Testing
```bash
# Run frontend tests
npm test

# Run backend tests
cd icp
# Testing is now integrated into the main split_dapp canister
```

### 3. Deployment
```bash
# Deploy to local network
dfx deploy --network local

# Deploy to mainnet
dfx deploy --network ic

# Deploy to Vercel
vercel --prod
```

## 📝 **Contributing**

When adding new guides:

1. **Create the guide** in the `docs/pages/` directory
2. **Update this README.md** to include the new guide
3. **Follow the naming convention**: `TOPIC_NAME.md`
4. **Include key topics** and a brief description
5. **Add cross-references** to related guides

### Guide Template
```markdown
# Guide Title

Brief description of what this guide covers.

## Key Topics
- Topic 1
- Topic 2
- Topic 3

## Prerequisites
- Requirement 1
- Requirement 2

## Quick Start
```bash
# Quick start commands
```

## Detailed Instructions
[Detailed content here]

## Related Guides
- [Related Guide 1](./RELATED_GUIDE_1.md)
- [Related Guide 2](./RELATED_GUIDE_2.md)
```

## 🆘 **Support & Troubleshooting**

### Common Issues

1. **Transaction Not Found After Creation**
   - See [COMMON_BUGS_AND_FIXES.md](./pages/COMMON_BUGS_AND_FIXES.md) for detailed solution
   - Check frontend parsing logic in `src/lib/internal/blockchain/icp/transactions.ts`
   - Use [TRANSACTION_DEBUG_PAGE.md](./pages/TRANSACTION_DEBUG_PAGE.md) for debugging

2. **DFX ColorOutOfRange Error**
   - Set environment variables: `export TERM=xterm && export NO_COLOR=1`
   - Use JSON output: `dfx canister call --output json`
   - See [COMMON_BUGS_AND_FIXES.md](./pages/COMMON_BUGS_AND_FIXES.md) for complete solution

3. **DFX Connection Issues**
   - Check if DFX is running: `dfx ping local`
   - Restart DFX: `dfx stop && dfx start --background`

4. **Deployment Failures**
   - Check logs: `dfx canister call split_dapp getLogs`
   - Verify canister status: `dfx canister status split_dapp`

5. **Network Issues**
   - Verify network configuration in `dfx.json`
   - Check firewall and security group settings

### Getting Help

- **GitHub Issues**: Create an issue in the repository
- **Discord**: Join the SEI Discord for community support
- **Documentation**: Check the official ICP and SEI documentation

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: SplitSafe Development Team
