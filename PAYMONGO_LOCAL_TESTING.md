# PayMongo Local Testing Guide

This guide focuses on testing the PayMongo integration in your **local environment** (localhost).

## ⚡ Quick Start Checklist

1.  **Backend Running**: `npm run dev` (Port 3000)
2.  **Frontend Running**: `npm run dev` (Port 5173)
3.  **Ngrok Running**: `ngrok http 3000`
4.  **Env Configured**:
    - `FRONTEND_URL=http://localhost:5173`
    - `PAYMONGO_WEBHOOK_SECRET` matches your ngrok webhook.

---

## Part 1: Testing with Postman (Backend Only)

Use Postman to verify that the backend API correctly creates checkout sessions.

### Step 1: Authenticate

1.  Open Postman.
2.  Send a `POST` request to `{{baseUrl}}/api/auth/login` (ensure `baseUrl` is `http://localhost:3000`).
3.  Body (JSON):
    ```json
    {
      "email": "test@example.com",
      "password": "password123"
    }
    ```
4.  Copy the `token` from the response.

### Step 2: Create Checkout Session

1.  Create a new request: `POST {{baseUrl}}/api/credits/purchase`.
2.  **Headers**:
    - `Authorization`: `Bearer <YOUR_TOKEN>`
    - `Content-Type`: `application/json`
3.  **Body**:

    ```json
    {
      "packageId": "starter_pack",
      "successUrl": "http://localhost:5173/payment/success",
      "cancelUrl": "http://localhost:5173/payment/cancel"
    }
    ```

    _(Note: `packageId` must match an ID from `src/config/creditPackages.js`)_

4.  **Send Request**.
5.  **Expected Response**:
    ```json
    {
      "success": true,
      "data": {
        "provider": "paymongo",
        "checkoutId": "cs_...",
        "url": "https://pm.link/...",
        "referenceNumber": "...",
        "status": "active",
        "package": { ... }
      }
    }
    ```

### Step 3: Simulate Payment (Manual)

1.  Copy the `url` from the response.
2.  Open it in your browser.
3.  Use **PayMongo sandbox test cards only** to complete the payment (no real charges).

- Example Visa: `4242 4242 4242 4242`, future expiry, any CVC.
- Example Mastercard: `5454 5454 5454 5454`, future expiry, any CVC.
- Full list: https://developers.paymongo.com/docs/testing

4.  Check your backend terminal. If ngrok is set up, you should see a log indicating the webhook was received and credits were added.

---

## Part 2: Testing with Frontend (Localhost)

Test the full end-to-end flow from your local React application.

### Step 1: Frontend Setup

1.  Ensure your frontend `.env` points to your local backend.

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

2.  Start the frontend: `npm run dev`.
3.  Open `http://localhost:5173` in your browser.

### Step 2: Purchase Flow

1.  **Login**: Log in to the application.
2.  **Check Initial Balance**: Note your current credit balance in the dashboard header or profile.
3.  **Navigate**: Go to the **Credits** or **Pricing** page.
4.  **Select Package**: Click the **"Buy"** button on a credit package (e.g., Starter Pack).
5.  **Redirect**: You should be redirected to a PayMongo Checkout page.
6.  **Payment**:
    - Enter dummy details (Name, Email, etc.).
    - Use a test card (e.g., `4242 4242 4242 4242`, Exp: `12/25`, CVC: `123`).
7.  **Success**:
    - After payment, click "Return to Merchant" (or wait for auto-redirect).
    - You should be redirected back to `http://localhost:5173/payment/success`.
    - The page should show a success message.

---

## Part 3: Verification (How to check credits)

After a successful payment, you can verify the credits were added in three ways:

### Method 1: Frontend UI

1.  After being redirected to the success page, click "Go to Dashboard".
2.  Look at the **Credit Balance** in the top navigation bar or the Dashboard overview.
3.  It should have increased by the package amount (e.g., +50 for Starter, +200 for Professional).
    - _Note: You might need to refresh the page if the update isn't instant._

### Method 2: Postman (API)

1.  Open Postman.
2.  Select the **"Get Credit Balance"** request (`GET {{baseUrl}}/credits/balance`).
3.  Ensure you are using the `token` of the user who made the purchase.
4.  Send the request.
5.  Check the response:
    ```json
    {
      "success": true,
      "data": {
        "credits": 250, // Should reflect the new total
        "userId": "..."
      }
    }
    ```

### Method 3: Transaction History

1.  In the Frontend, go to the **Transactions** or **History** tab.
2.  You should see a new entry:
    - **Type**: `purchase` or `credit_added`
    - **Amount**: `+200`
    - **Description**: `Purchase of Professional Pack`
    - **Status**: `completed`

---

## Troubleshooting

### 1. "Request failed with status code 400"

- **Cause**: PayMongo rejected the payload.
- **Fix**: Check the backend logs. We have added detailed error logging. Look for `PayMongo Checkout Error Details` in your terminal to see the specific validation error from PayMongo.
- **Common Issues**:
  - `amount` is too low (minimum PHP 100.00).
  - `cancel_url` or `success_url` is invalid.

### 2. Webhook Not Working

- **Cause**: PayMongo cannot reach your localhost.
- **Fix**: Ensure `ngrok` is running and the URL in PayMongo Dashboard matches your current ngrok URL.
