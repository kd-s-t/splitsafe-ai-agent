<div align="center"> 
	<a href="https://dorahacks.io/hackathon/awsvibecoding/detail" target="_blank">
		<img src="./public/AWS Global Vibe- AI Coding Hackathon 2025.png" width="100%" /> 
	</a>
</div>

<div align="center"> 
	<img src="./public/githublogo.png" width="20%" />
</div>

SplitSafe, trustless escrow and split-payments platform on Internet Computer (ICP) with native Bitcoin (ckBTC) support and optional SEI fast settlement—no bridges, wraps, or intermediaries.

**Features:**
- **ICP**: Mainnet
- **Bitcoin (cKBTC → BTC)**: Native Bitcoin integration via ICP for secure escrow
- **Milestone Escrow**: Advanced escrow with scheduled payments over time, multiple milestones, and automatic fund distribution
- **Email Notifications**: Comprehensive email system via Resend API for escrow updates, milestone notifications, and support
- **Withdrawal System**: Multi-asset withdrawal support (ICP, cKBTC, SEI)
- **AI Assistant**: Intelligent support for transfers and decision making with unified OpenAI/Amazon Q integration
- **SaaS Integration**: Business registration, client ID management, merchant ICP accounts, API key management, and payment gateway integration for companies like Cebu Pacific
- **Voucher System**: Digital voucher creation and redemption for escrow transactions
- **Feedback System**: User rating and review system for escrow participants
- **Hosted Payment Gateway**: Business registration, client ID management, and merchant ICP system with API documentation
- **All CK crypto Network Integration** (e.g., ckETH): Coming soon 

<div align="center"> 
	<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" /> 
	<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white" /> 
	<img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Framer Motion-EF008F?style=for-the-badge&logo=framer&logoColor=white" /> 
</div>

<div align="center"> 
	<img src="https://img.shields.io/badge/AWS%20Kiro-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Amazon%20Q%20Developer-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" /> 
</div>

<div align="center"> 
	<img src="https://img.shields.io/badge/OpenAI-74aa9c?style=for-the-badge&logo=openai&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Resend-%23FF6B6B.svg?style=for-the-badge&logo=mailgun&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Pusher-%23300D4F.svg?style=for-the-badge&logo=pusher&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Sentry-%23362D59.svg?style=for-the-badge&logo=sentry&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" /> 
	<img src="https://img.shields.io/badge/Loki-2C5EE8?style=for-the-badge&logo=loki&logoColor=white" /> 
</div>
<div align="center"> 
  <img src="https://img.shields.io/badge/ICP-000000?style=for-the-badge&logo=internet-computer&logoColor=white" />
  <img src="https://img.shields.io/badge/bitcoin-2F3134?style=for-the-badge&logo=bitcoin&logoColor=white" />
  <img src="https://img.shields.io/badge/Motoko-3B00B9?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3VjE3TDEyIDIyTDIyIDE3VjdMMTIgMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMTIgMkwxMiAyMkwyMiAxN1Y3TDEyIDJaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTIgN0wxMiAxMkwyMiA3IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPC9zdmc+" /> 
</div>

<div align="center"> 
	<img src="https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" />
</div>  

---

## How We Leveraged AWS AI Tools

This project was built using **Amazon Kiro IDE** and **Amazon Q Developer** (VS Code extension) as part of the AWS Global Vibe: AI Coding Hackathon 2025.

**Amazon Kiro IDE:**
- Used Kiro's AI-powered development environment to generate the Amazon Q integration code
- Leveraged Kiro's conversational AI to design the unified AI provider system
- Utilized Kiro for refactoring and code generation across the `src/lib/integrations/awsq/` directory

**Amazon Q Developer (VS Code Extension):**
- Used Amazon Q Developer for code suggestions and assistance during development
- Leveraged Q Developer's multi-step agentic coding capabilities to build the unified AI integration
- Utilized Q Developer for debugging and improving the provider selection system

---

Use cases for SplitSafe include freelance payments, DAO treasuries, milestone-based bounties, marketplace transactions, booking and travel (airline/hotel with refund/no-show policies), gaming payments, DeFi integrations, creative work licensing, intellectual property management, and any scenarios requiring trust-minimized Bitcoin escrow with fast settlement options and legal compliance.  

---

## Quick Start
```bash
nvm use

# These are IC network values
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```
### The application will be available at http://localhost:3000  

---

## **Repository Structure**

- **Backend API**: [SplitSafe Backend](https://github.com/kd-s-t/splitsafe-ai-agent-backend) - Secure proxy layer for third-party integrations

---

## Authors

- [@kenn](https://www.linkedin.com/in/kdst/)
- [@don](https://www.linkedin.com/in/carl-john-don-sebial-882430187/)
- [@peter](https://www.linkedin.com/in/petertibon/)

## Social Media

- **LinkedIn**: [SplitSafe Escrow](https://www.linkedin.com/company/splitsafe-escrow/?viewAsMember=true)
- **Facebook**: [SplitSafe](https://www.facebook.com/profile.php?id=61581697425694)
