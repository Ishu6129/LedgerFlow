# LedgerFlow

<div align="center">
  

  <h3>A production-ready banking API with ACID compliance, immutable ledger tracking, and enterprise-grade security</h3>
  
  [Getting Started](#-quick-start) • [API Reference](#-api-reference) • [Features](#-core-features)
  
</div>

## 📋 Table of Contents

- [Features](#-core-features)
- [Quick Start](#-quick-start)
- [API Reference](#-api-reference)
- [ACID Compliance](#-acid-compliance)
- [Tech Stack](#-tech-stack)
- [Environment Variables](#-environment-variables)
- [Examples](#-code-examples)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Core Features

<table>
  <tr>
    <td width="33%">
      <h3>🔐 Security</h3>
      <ul>
        <li>JWT authentication with token blacklist</li>
        <li>Password hashing with bcrypt</li>
        <li>Dual middleware (user + system auth)</li>
        <li>3-day auto-expiry blacklist (TTL index)</li>
      </ul>
    </td>
    <td width="33%">
      <h3>💰 Accounts</h3>
      <ul>
        <li>Multi-account per user support</li>
        <li>ACTIVE status enforcement</li>
        <li>Balance from immutable ledger</li>
        <li>Full transaction history</li>
      </ul>
    </td>
    <td width="33%">
      <h3>💸 Transactions</h3>
      <ul>
        <li>User-to-user money transfers</li>
        <li>Idempotent operations (UUID v4)</li>
        <li>7-second delay for concurrency</li>
        <li>Email notifications (OAuth2 Gmail)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="33%">
      <h3>📊 Ledger</h3>
      <ul>
        <li>Immutable audit trail</li>
        <li>DEBIT/CREDIT entries only</li>
        <li>Pre-hooks prevent modification</li>
        <li>Balance = Credits - Debits</li>
      </ul>
    </td>
    <td width="33%">
      <h3>🔒 Data Integrity</h3>
      <ul>
        <li>ACID compliant transactions</li>
        <li>Race condition prevention</li>
        <li>Unique idempotencyKey constraint</li>
        <li>Atomic operations with rollback</li>
      </ul>
    </td>
    <td width="33%">
      <h3>📧 Notifications</h3>
      <ul>
        <li>Registration welcome emails</li>
        <li>Transaction confirmation alerts</li>
        <li>OAuth2 Gmail integration</li>
        <li>Async email delivery</li>
      </ul>
    </td>
  </tr>
</table>

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.0+ for transactions)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ledgerflow.git
cd ledgerflow

# Install dependencies
npm install

# Create .env file with required variables (see Environment Variables section)
cp .env.example .env
# Edit .env with your MongoDB URI and email credentials

# Start the server
npm start

# Server runs on http://localhost:3000
# Visit http://localhost:3000 for API documentation
```

### First API Calls

```bash
# 1. Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secure123"}'

# 2. Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secure123"}'
# Save the token from response

# 3. Create an account (use token from login)
curl -X POST http://localhost:3000/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 4. Check balance
curl -X GET http://localhost:3000/api/accounts/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📚 API Reference

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new user | None |
| POST | `/api/auth/login` | Login & get JWT | None |
| POST | `/api/auth/logout` | Logout & blacklist token | ✅ JWT |

<details>
<summary><b>Register Example</b></summary>

**Request:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```
</details>

### 💰 Account Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/accounts` | Create bank account | ✅ JWT |
| GET | `/api/accounts` | Get all accounts | ✅ JWT |
| GET | `/api/accounts/balance` | Check balance | ✅ JWT |
| GET | `/api/accounts/history` | Transaction history | ✅ JWT |

### 💸 Transaction Endpoints

| Method | Endpoint | Description | Auth | Notes |
|--------|----------|-------------|------|-------|
| POST | `/api/transactions` | Transfer money (user-to-user) | ✅ JWT | Requires idempotencyKey (UUID v4) |
| POST | `/api/transactions/system/initial-fund` | Admin funding only | 🔑 System | Creates initial account funds |

<details>
<summary><b>Transfer Money Example</b></summary>

**Request:**
```json
POST /api/transactions
Authorization: Bearer <your_jwt_token>
{
  "fromUserAccount": "acc_123456",
  "toUserAccount": "acc_789012",
  "amount": 5000,
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "id": "txn_987654",
    "fromAccount": "acc_123456",
    "toAccount": "acc_789012",
    "amount": 5000,
    "status": "COMPLETED",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```
</details>

## 🔒 ACID Compliance

| Property | Implementation | Benefit |
|----------|----------------|---------|
| **Atomicity** | MongoDB sessions with commit/rollback | All-or-nothing execution |
| **Consistency** | Unique constraints, ledger immutability | Data integrity maintained |
| **Isolation** | Session isolation, 7-second delay | Concurrent ops don't interfere |
| **Durability** | Write-after-commit, replica sets | Data persists forever |


## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB + Mongoose ODM |
| **Authentication** | JWT + bcryptjs |
| **Email** | Nodemailer + OAuth2 Gmail |
| **Transactions** | MongoDB Sessions |
| **Security** | Token Blacklist + TTL |

## 🔧 Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/ledgerflow
# MongoDB Atlas example: mongodb+srv://user:password@cluster.mongodb.net/ledgerflow

JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production

# Gmail OAuth2 Configuration (from Google Cloud Console)
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your-google-oauth-client-id
CLIENT_SECRET=your-google-oauth-client-secret
REFRESH_TOKEN=your-google-refresh-token
```

### Setting up Gmail OAuth2:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Desktop Application)
3. Download credentials and use in .env
4. Enable Gmail API for your project
5. Replace `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN` with your credentials

## 📝 Code Examples

### Node.js

```javascript
const axios = require('axios');

async function example() {
  // Register
  const register = await axios.post('http://localhost:3000/api/auth/register', {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'SecurePass123!'
  });
  
  const token = register.data.token;
  
  // Transfer money
  const transfer = await axios.post('http://localhost:3000/api/transactions', 
    {
      fromUserAccount: 'acc_123456',
      toUserAccount: 'acc_789012',
      amount: 1000,
      idempotencyKey: crypto.randomUUID()
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
```
## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  password: String (bcrypt hashed),
  role: { type: String, enum: ['user', 'system'], default: 'user' },
  createdAt: Date,
  updatedAt: Date
}
```

### Accounts Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  status: { type: String, enum: ['ACTIVE'], default: 'ACTIVE' },
  currency: { type: String, default: 'INR' },
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  from: ObjectId (ref: Account),
  to: ObjectId (ref: Account),
  amount: Number,
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REVERSED'] },
  idempotencyKey: { type: String, unique: true },
  createdAt: Date
}
```

### Ledger Collection (Immutable)
```javascript
{
  _id: ObjectId,
  account: ObjectId (ref: Account),
  type: { type: String, enum: ['DEBIT', 'CREDIT'] },
  amount: Number,
  transaction: ObjectId (ref: Transaction),
  createdAt: Date
  // NOTE: Cannot be updated or deleted after creation (pre-hooks prevent this)
}
```

### Token Blacklist Collection
```javascript
{
  _id: ObjectId,
  token: { type: String, unique: true },
  createdAt: Date
  // NOTE: Auto-deletes after 3 days (TTL index)
}
```

## 🧪 Testing

```bash
# Run all tests
npm test
```


<div align="center">
  <a href="#-table-of-contents">Back to Top</a>
</div>