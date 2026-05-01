# AnnSetu — Real-Time Food Redistribution Platform

<p align="center">
  <strong>Connecting surplus food with communities in need — powered by AI matching and volunteer delivery.</strong>
</p>

---

## 🎯 What is AnnSetu?

AnnSetu is an intelligent, real-time food redistribution platform that minimizes food waste by connecting **Donors** (restaurants, vendors, individuals), **NGOs** (community kitchens, shelters), and **Volunteer Riders** through an automated matching engine and delivery tracking system.

> **Ann** (अन्न) = Food in Hindi | **Setu** (सेतु) = Bridge — *A bridge between surplus food and hunger.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Frontend** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | [Firebase Firestore](https://firebase.google.com/products/firestore) (real-time NoSQL) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/products/auth) (Email/Password) |
| **Font** | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) |

---

## ✨ Key Features

### 🔐 Role-Based Dashboards
- **Donors** — List surplus food, track active donations, view impact history
- **NGOs** — Submit food requests, review AI-matched donations, manage distribution
- **Volunteers** — Browse available pickups (Swiggy-style UI), accept deliveries, track routes with Google Maps navigation

### 🧠 AI-Powered Matching Engine
- Scores donations against NGO requests using **5 weighted factors**: expiry urgency (25%), NGO urgency (25%), proximity (20%), quantity fit (15%), food type compatibility (15%)
- Haversine formula for accurate distance calculation
- Auto-triggers on new donation creation — matches are instant

### 📍 Swiggy-Style Delivery Flow
- Real-time available deliveries with live listener (auto-refreshes)
- Green/Red route visualization (Pickup → Drop-off)
- Accept delivery → Auto-opens Google Maps for navigation
- OTP-verified pickup and delivery handoffs (6-digit codes)
- Step-by-step delivery tracker: Assigned → At Pickup → In Transit → Delivered

### 📊 Real-Time Impact Dashboard
- Landing page shows live platform metrics (meals saved, food waste reduced, NGOs served)
- Dashboard overview cards powered by Firestore `onSnapshot` listeners
- Animated counters with easing transitions

### 🎮 Demo Mode
- Instant demo login for all 3 roles (Donor, NGO, Volunteer)
- Demo users are seeded into Firestore — all functionality works including creating donations, accepting deliveries, OTP verification
- Real login users get pure Firebase Auth with real-time Firestore data

---

## 📁 Project Structure

```
annsetu-v0/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login + Demo login
│   ├── signup/page.tsx             # Registration with role selection
│   └── dashboard/
│       ├── page.tsx                # Role-based overview (auto-detects)
│       ├── donate/page.tsx         # Donor: Add donation form
│       ├── request/page.tsx        # NGO: Add food request form
│       ├── active/page.tsx         # Active donations/deliveries
│       ├── available/page.tsx      # Volunteer: Swiggy-style pickup list
│       ├── matches/page.tsx        # NGO: View matched donations
│       ├── completed/page.tsx      # Volunteer: Completed deliveries
│       └── history/page.tsx        # Donation/request history
├── components/
│   ├── landing/                    # Landing page sections
│   │   ├── header.tsx
│   │   ├── hero.tsx
│   │   ├── impact-dashboard.tsx    # Real-time stats with fallbacks
│   │   ├── how-it-works.tsx
│   │   ├── features-grid.tsx       # Platform features showcase
│   │   ├── testimonials.tsx        # Community stories
│   │   ├── volunteer-cta.tsx
│   │   ├── donate-cta.tsx
│   │   └── footer.tsx
│   ├── dashboard/
│   │   ├── donor-overview.tsx      # Live Firestore stats
│   │   ├── ngo-overview.tsx        # Live Firestore stats
│   │   ├── volunteer-overview.tsx  # Live Firestore stats
│   │   ├── delivery-tracker.tsx    # Step-by-step OTP tracker
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── firebase.ts                 # Firebase config
│   ├── firestore.ts                # All Firestore CRUD + real-time listeners
│   ├── auth-context.tsx            # Auth provider with demo seeding
│   ├── matching-engine.ts          # AI matching algorithm
│   └── types.ts                    # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or pnpm
- Firebase project with Firestore and Auth enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd annsetu-v0

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎮 Demo Walkthrough

### Quick Start (No registration needed)
1. Go to `/login` → Click any demo role button (Donor, NGO, or Volunteer)

### Full Flow
1. **Donor** → "Add Donation" → Fill food details + map location → Submit
2. **Matching Engine** auto-runs → Creates Match + Delivery records in Firestore
3. **NGO** → "View Matches" → See matched donation with score → Accept
4. **Volunteer** → "Available Pickups" → Accept delivery → Auto-navigates to Google Maps
5. **Volunteer** → "Active Delivery" → Mark arrived → Verify Pickup OTP → Navigate to NGO → Verify Delivery OTP
6. **Done!** → History and impact stats update in real-time

---

## 🔥 Firestore Collections

| Collection | Purpose |
|-----------|---------|
| `users` | User profiles (uid, name, role, email, phone, location) |
| `donations` | Food donations from donors |
| `requests` | Food requests from NGOs |
| `matches` | AI-generated matches (donation_id ↔ request_id + score) |
| `deliveries` | Delivery tasks with embedded donation/request, OTPs, status |
| `stats` | Global impact metrics (optional pre-aggregated doc) |

### Required Composite Indexes
- `deliveries`: `volunteer_id` ASC + `created_at` DESC
- `donations`: `donor_id` ASC + `created_at` DESC
- `requests`: `ngo_id` ASC + `created_at` DESC

---

## 📄 License

This project was built for a hackathon. Feel free to fork and contribute!
