# Secure Payment Integration Plan

## Payment Rules

Local patients:

- No online payment.
- Payment at clinic only.

International Zoom:

- Full consultation fee: $50 or 2500 EGP.
- 50% deposit required: $25 or 1250 EGP.
- Deposit must be paid before human approval and Zoom link.

## Recommended Gateway

Use one Egypt-supported payment gateway:

- Paymob Egypt
- PayTabs Egypt

## Payment Flow

1. International patient chooses Zoom date and slot.
2. Patient fills booking form.
3. Backend creates booking with status pending and payment_status pending.
4. Patient clicks Pay Deposit Now.
5. Backend creates a hosted payment link for $25 or 1250 EGP.
6. Patient pays on the gateway page, not inside our website form.
7. Payment gateway sends webhook to api.drmagedragab.com.
8. Backend verifies webhook signature.
9. Backend marks payment as paid.
10. Admin reviews request.
11. Admin confirms booking.
12. Backend closes the exact slot.
13. CRM sends confirmation and Zoom/link details.

## Backend Endpoints

- POST /api/payments/create-deposit
- POST /api/payments/webhook
- GET /api/payments/:bookingId/status

## Security

- Never store card details.
- Use hosted gateway payment pages.
- Verify webhook signatures.
- Keep gateway secret keys only on backend.
- Store payment provider reference in payments table.
- Add audit log for every payment status change.

