# Paystack Payment Integration Setup

## Overview
This application integrates Paystack for secure payment processing for both farm investments and store purchases.

## Setup Instructions

### 1. Get Your Paystack API Keys

1. Sign up or log in to your Paystack account at [https://dashboard.paystack.com](https://dashboard.paystack.com)
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Copy your **Public Key** (starts with `pk_test_` for test mode or `pk_live_` for live mode)

### 2. Configure Environment Variables

Update the `.env` file in your project root:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_key_here
```

**Important:**
- For testing: Use `pk_test_` key
- For production: Use `pk_live_` key
- Never commit your live keys to version control

### 3. Update WhatsApp Number

In `src/pages/CartPage.tsx`, update the WhatsApp business number:

```typescript
const whatsappNumber = '2348000000000'; // Replace with your actual number
```

## Features Implemented

### 1. User Types
- **Digital Farmer (Investor)**: Users who invest in agricultural projects
- **Product Buyer**: Users who purchase farm produce
- Users can perform both activities

### 2. Store Checkout
- **Pay with Card**: Secure Paystack payment gateway (opens Paystack payment modal)
- **Order via WhatsApp**: Alternative ordering method with pre-filled message
- Simplified checkout flow (address + phone → payment method)
- Real-time cart updates
- "Add to Cart" changes to "View Cart" after adding items
- Cart quantity management directly from cart page

### 3. Investment Management
- **Investment Withdrawal**: Investors can withdraw pending investment requests
- **Status Tracking**: Clear status indicators (pending, approved, rejected)
- **Unified Dashboard**: Single account for both investing and shopping
- Cannot withdraw approved investments (contact admin required)

### 4. Payment Tracking
All payments are logged in the `payment_transactions` table for:
- Audit trail
- Reconciliation
- Payment verification

## Database Schema

### New Tables

#### `payment_transactions`
- Tracks all payment attempts
- Stores Paystack responses
- Links to orders or investments

#### Updated Tables
- `profiles`: Added `user_type` column
- `investments`: Added payment tracking columns
- `orders`: Added payment tracking columns

## Testing Payment Integration

### Test Mode
1. Set `VITE_PAYSTACK_PUBLIC_KEY` to your test key
2. Use Paystack test cards:
   - **Success**: 4084 0840 8408 4081 (CVV: 408, Expiry: Any future date)
   - **Insufficient Funds**: 5060 6666 6666 6666 4
   - **Declined**: 5060 6666 6666 6666 5

### Production Checklist
- [ ] Replace test key with live Paystack key
- [ ] Update WhatsApp number to your business number
- [ ] Test complete checkout flow
- [ ] Verify payment webhooks (if needed)
- [ ] Test order notifications
- [ ] Verify payment status updates

## Payment Flow

### Store Purchases
1. User adds products to cart
2. Fills in delivery details
3. Chooses payment method:
   - **Card**: Paystack popup opens → Payment processed → Order confirmed
   - **WhatsApp**: Pre-filled message sent to WhatsApp → Manual processing

### Investment Payments (When Implemented)
1. Admin approves investment
2. Investor receives notification
3. Investor clicks "Pay Now"
4. Paystack popup opens
5. Payment processed
6. Investment status updated to "paid"

## Security Notes

- Payment processing happens client-side via Paystack's secure iframe
- No card details touch your servers
- All transactions are logged for audit
- RLS policies protect payment data
- Only users can see their own payment transactions
- Admins can view all transactions

## Support

For Paystack integration issues:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://support.paystack.com)

## Environment Variables Reference

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_or_pk_live_key
```

## Next Steps

1. Add your Paystack public key to `.env`
2. Update WhatsApp number in CartPage.tsx
3. Test checkout flow with test cards
4. Implement investment payment prompts (optional)
5. Deploy to production
6. Switch to live Paystack keys

## Notes

- The emergency buffer system (10% of investments) is automatically calculated
- All prices are shown in both USD and NGN
- Paystack processes payments in NGN by default
- Cart updates in real-time
- Payment status is tracked for all transactions
