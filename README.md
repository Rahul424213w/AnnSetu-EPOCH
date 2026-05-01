# AnnSetu 🌾🤝

AnnSetu is a high-performance, intelligent food redistribution ecosystem designed to eliminate food waste by connecting surplus food from donors (restaurants, caterers, individuals) with verified NGOs and a decentralized network of volunteer riders.

The platform leverages real-time data, an **ML-powered priority prediction engine**, and a secure dual-OTP handoff system to ensure that fresh food reaches those who need it most, with maximum efficiency, transparency, and speed.

---

## 🚀 Tech Stack & Architecture

AnnSetu is built using a modern, decoupled full-stack architecture optimized for real-time interactivity, mobile responsiveness, and scalable machine learning inference.

### Frontend: UI/UX Excellence
*   **[Next.js 14+ (App Router)](https://nextjs.org/)**: The backbone of the web application, providing server-side rendering, optimized image handling, and a robust API routing system.
*   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework used for creating a custom, premium, and highly responsive design system.
*   **[Framer Motion](https://www.framer.com/motion/)**: Powers the platform's fluid UI—handling layout transitions, dynamic data visualizations, and micro-interactions.
*   **[shadcn/ui](https://ui.shadcn.com/)**: A collection of high-quality, accessible components built on top of Radix UI.
*   **[Leaflet & React-Leaflet](https://leafletjs.com/)**: Integrated interactive maps for precise location targeting, geocoding, and delivery route visualization.

### Backend & Real-time Data
*   **[Firebase Authentication](https://firebase.google.com/products/auth)**: Secure identity management with role-based access control (Donor, NGO, Volunteer).
*   **[Cloud Firestore](https://firebase.google.com/products/firestore)**: A real-time NoSQL database. We utilize Firestore's `onSnapshot` listeners to provide a "zero-refresh" experience—updates to donations, matches, and deliveries propagate to all connected clients in milliseconds.
*   **[TypeScript](https://www.typescriptlang.org/)**: Enforces strict type safety across the Node.js codebase, ensuring robust data contracts between the UI, Firebase, and the ML microservice.

### Machine Learning Microservice
*   **[Python 3.9+](https://www.python.org/)**: The language of choice for the data science backend.
*   **[FastAPI](https://fastapi.tiangolo.com/)**: A modern, fast web framework for building the ML prediction API, handling concurrent requests from the Next.js backend.
*   **[Scikit-learn](https://scikit-learn.org/)**: Used for training and deploying the core **Random Forest Regressor** model that predicts delivery priority.
*   **[Pandas](https://pandas.pydata.org/) & Numpy**: For data manipulation, synthetic data generation, and feature extraction.

---

## 🧠 The Smart Delivery & ML Matching Engine

One of AnnSetu's core innovations is its **Blended Priority Engine**, which fuses physical logistics heuristics with a trained Machine Learning model.

### 1. ML Priority Pipeline
The system uses a Random Forest model trained on synthetic historical logistics data to predict the optimal priority of a delivery.
*   **Features Analyzed**: Distance, Traffic Multiplier, Food Vulnerability, Route Time, Base Match Probability, NGO Need Level, Hunger Index.
*   **Output**: A continuous Priority Score (0-100) and a Classification (HIGH, MEDIUM, LOW).
*   **Resiliency**: The Next.js backend communicates with the FastAPI service via an internal API proxy (`/api/ml-predict/batch`). If the Python ML service is unreachable, the Node.js backend gracefully falls back to a deterministic **Heuristic Engine** to ensure zero downtime.

### 2. Traffic-Aware ETA & Spoilage Risk
Before hitting the ML model, the physical engine (`lib/delivery-engine.ts`) calculates:
*   **Traffic Modeling**: Automatically applies traffic multipliers based on the time of day (e.g., peak morning 8-10 AM, evening 5-8 PM).
*   **Spoilage Assessment**: Categorizes food into High (Cooked/Dairy), Medium (Produce), or Low (Packaged) vulnerability. It combines this with the Traffic ETA to flag deliveries that are at high risk of spoiling in transit.

### 3. Blended Scoring Algorithm
The final priority score used to rank deliveries for volunteers is a blend:
*   **60% ML Prediction**: The Random Forest's assessment of overall impact.
*   **40% Heuristics**: Immediate physical constraints like distance and urgent expiry times.

---

## ✨ Feature Deep-Dive: A Seamless Workflow

### 🎁 For Donors (The Source)
*   **Instant Listing**: A streamlined, mobile-friendly form to list surplus food with type, quantity, and strict expiry details.
*   **Precision Map Picker**: Donors drop a pin exactly where the pickup should happen, capturing exact GPS coordinates for the routing engine.
*   **Live Tracking Dashboard**: Track every donation from "Pending" to "In Transit" to "Delivered" with real-time Firestore-powered status badges.

### 🏢 For NGOs (The Impact)
*   **Automated Smart Matching**: When a donation is created, the backend instantly calculates distances to all NGOs, checks capacity, and generates Match records.
*   **Priority Smart Feed**: Donations are sorted by their blended ML Priority Rank, putting the most urgent and viable food at the top of the NGO's dashboard.
*   **One-Tap Claiming**: NGOs can instantly reserve food, which updates the database and immediately alerts the volunteer network.

### 🛵 For Volunteers (The Heroes)
*   **Swiggy-Style Dashboard**: A mobile-optimized interface showing available nearby pickups, complete with ML-generated impact scores, traffic-aware ETAs, and distance metrics.
*   **Visual Priority Gradients**: Deliveries are color-coded (Red for High urgency, Yellow for Medium) based on the ML engine's assessment.
*   **In-App Navigation**: One-tap "Navigate" buttons open Google Maps with exact pickup/drop-off coordinates.

### 🔐 Dual-OTP Security Verification
To ensure 100% accountability and prevent food misappropriation, the platform enforces a strict handoff protocol:
1.  **Pickup OTP**: The Volunteer must enter a 6-digit OTP generated by the Donor to confirm they have physically received the food.
2.  **Delivery OTP**: The Volunteer must enter a second OTP provided by the NGO to successfully close the delivery loop and mark the status as Completed.

---

## 📁 Project Structure

```text
annsetu-v0/
├── app/                  # Next.js App Router (Pages, API Routes)
│   ├── api/              # Internal API proxies (ML communication)
│   └── dashboard/        # Role-specific dashboards (Donor, NGO, Volunteer)
├── components/           # Reusable React Components
│   ├── dashboard/        # Complex UI features (Maps, Trackers, Data Tables)
│   └── landing/          # Marketing and public-facing UI
├── lib/                  # Core Business Logic & Configurations
│   ├── firestore.ts      # Firebase DB schemas, mutations, and triggers
│   ├── matching-engine.ts# Heuristic + ML matching algorithms
│   ├── delivery-engine.ts# ETA, Traffic, and Spoilage math
│   └── ml-client.ts      # Node.js wrapper for the Python ML service
└── ML/                   # Python Machine Learning Microservice
    ├── api.py            # FastAPI server
    ├── train_model.py    # Random Forest training script
    └── generate_data.py  # Synthetic logistics data generator
```

---

## 🛠️ Getting Started

### 1. Web Platform (Next.js) Setup
1.  **Clone the repository**.
2.  **Install Node dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Configuration**: Create a `.env.local` file and add your Firebase credentials and the ML API URL:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    # ... other firebase config
    ML_API_URL=http://localhost:8000
    NEXT_PUBLIC_ML_API_URL=http://localhost:8000
    ```
4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

### 2. ML Prediction Service (Python) Setup
To enable the intelligent ranking and scoring features, you must run the local ML service.
1.  **Navigate to the ML Directory**:
    ```bash
    cd ML
    ```
2.  **Install Python Dependencies**:
    ```bash
    pip install fastapi uvicorn scikit-learn pandas numpy
    ```
3.  **Train the Model**:
    ```bash
    python train_model.py
    ```
4.  **Start the FastAPI Server**:
    ```bash
    uvicorn api:app --reload --port 8000
    ```

### 3. Testing the App
*   Open `http://localhost:3000`.
*   Click **"Try Demo"** on the login page to easily switch between Donor, NGO, and Volunteer roles using pre-configured mock accounts.
*   To test the full flow: Create a donation (Donor) -> Claim it (NGO) -> Accept and deliver it using OTPs (Volunteer).

---

*Built with ❤️ to ensure that every surplus meal finds a plate.*
