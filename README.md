# CopperX-Bounty

CopperX Telegram Bot Documentation

1. Introduction

1.1 Overview

The CopperX Telegram Bot is a secure and efficient financial assistant that allows users to manage their funds, make transactions, and receive notifications through Telegram. The bot integrates with CopperX APIs to provide seamless authentication, balance inquiries, transfers, and real-time updates.

1.2 Key Features

Secure Login: OTP-based authentication via email.

Fund Transfers: Supports transfers via email, wallet address, and bank details.

Balance & Transactions: Retrieve account balance and transaction history.

Deposit & Withdrawal: Manage deposits and withdrawals effortlessly.

Real-time Notifications: Get notified of transactions and important updates.


1.3 Target Audience

Users who want a seamless way to interact with CopperX financial services.

Businesses that require automated fund management.

Developers looking to integrate CopperX APIs into Telegram.



---

2. Technical Architecture

2.1 High-Level Architecture

The bot is built using Node.js and Telegraf.js to handle Telegram interactions. It communicates with the CopperX backend via REST APIs for authentication, transactions, and notifications. The architecture consists of:

1. Telegram Bot (Telegraf.js) – Handles user commands and actions.


2. CopperX API (Backend in Node.js) – Provides authentication, transactions, and user data.


3. Session Storage – Maintains user authentication state.


4. Notification Service – Pushes real-time transaction updates.



3. Setup and Installation

3.1 Prerequisites

Node.js (v16+) installed

Telegram Bot Token (from @BotFather)

CopperX API Credentials


3.2 Installation

git clone https://github.com/your-repo/copperx-telegram-bot.git
cd copperx-telegram-bot
npm install

3.3 Configuration

Create a .env file with the following:

BOT_TOKEN=your_telegram_bot_token
COPPERX_API_KEY=your_api_key
WEBHOOK_URL=your_webhook_url

3.4 Running the Bot

npm start

or

node index.js



4. Features & Commands

4.1 Authentication Flow

1. User sends /login.


2. Bot prompts for email.


3. User enters email, bot requests OTP from CopperX API.


4. User enters OTP, bot verifies and stores session.



4.2 Transaction Commands



5. Code Structure

📂 copperx-telegram-bot
 ├── 📂 src
 │   ├── 📂 services          # Handles API interactions
 │   ├── 📂 handlers          # Telegram bot command handlers
 │   ├── 📂 utils             # Helper functions
 │   ├── bot.ts               # Main bot logic
 │   ├── types.ts             # TypeScript interfaces
 ├── package.json
 ├── README.md
 ├── .env
 ├── index.ts



6. API Integration

6.1 Authentication API

Endpoint: POST /auth/request-otp

Request: { email: "user@example.com" }

Response: { sid: "12345" }

Endpoint: POST /auth/verify-otp

Request: { email: "user@example.com", otp: "123456", sid: "12345" }

Response: { accessToken: "xyz" }


6.2 Transaction API

Endpoint: GET /balance

Request Headers: { Authorization: Bearer accessToken }

Response: { balance: 100, currency: "USDC" }




7. Security Considerations

Uses JWT for authentication – Sessions are stored securely.

Input validation – Prevents injection attacks.

Rate-limiting – Protects from abuse.




8. Troubleshooting & FAQs

Q: I am not receiving the OTP. What should I do?

A: Check your spam folder and ensure the email is correct.

Q: How do I reset my session?

A: Use /logout and then /login to restart authentication.

