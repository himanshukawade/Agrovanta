# Agrovanta

Agrovanta is a professional platform designed to assist in agricultural livestock antimicrobial residue risk assessment. It leverages AI models to estimate whether animal products (milk/meat) are within safe residue limits based on treatment scenarios and withdrawal periods.

## Features

-   **AI-Assisted Risk Prediction**: Estimate residue risk using machine learning models.
-   **Multi-language Support**: Supports English, Hindi, and Marathi.
-   **Real-time Compliance Checks**: Immediate feedback on whether a product is within a safe withdrawal window.
-   **Modern Dashboard**: A sleek, glassmorphism-inspired UI for easy data entry and visualization.

## Architecture

Agrovanta is built using a modern full-stack architecture:

-   **Frontend**: [Next.js](https://nextjs.org/) with [Tailwind CSS](https://tailwindcss.com/) and [Framer Motion](https://www.framer.com/motion/) for a premium, responsive UI.
-   **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python) providing a high-performance REST API with asynchronous database support.
-   **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for scalable, document-based data storage.
-   **AI/ML**: Custom prediction logic for residue risk calculation.

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   Python (v3.10+)
-   MongoDB Atlas account

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Configure environment variables in `.env`:
    ```env
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET_KEY=your_secret_key
    FRONTEND_URL=http://localhost:3000
    ```
5.  Run the server:
    ```bash
    fastapi dev app/main.py
    ```

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables in `.env`:
    ```env
    NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## Deployment

The project is structured to be easily deployed on platforms like Vercel (Frontend) and Render/Heroku (Backend).

### Vercel Deployment

The frontend includes a `vercel.json` for proper client-side routing management.

## License

This project is licensed under the MIT License.
