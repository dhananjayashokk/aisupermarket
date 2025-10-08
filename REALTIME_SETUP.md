# Realtime Order Tracking Setup with Supabase

This guide explains how to set up realtime order tracking using Supabase in your GoGenie app.

## Prerequisites

1. A Supabase project (create one at https://app.supabase.com)
2. Your backend should be using Supabase as the database

## Setup Steps

### 1. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in your Supabase project settings:
- Go to https://app.supabase.com
- Select your project
- Go to Settings → API
- Copy the "Project URL" and "anon public" key

### 2. Enable Realtime on Supabase

In your Supabase project:

1. Go to Database → Replication
2. Find the `delivery_orders` table
3. Enable realtime replication for this table

Alternatively, run this SQL in the SQL Editor:

```sql
-- Enable realtime for delivery_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_orders;
```

### 3. Set up Row Level Security (Optional but Recommended)

To ensure customers can only see their own orders:

```sql
-- Enable RLS on delivery_orders
ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can only view their own orders
CREATE POLICY "Customers can view own orders"
ON delivery_orders
FOR SELECT
USING (
  auth.uid() = customer_id::text
  OR auth.role() = 'authenticated'
);

-- Policy: Allow realtime updates for customer's own orders
CREATE POLICY "Customers can subscribe to own orders"
ON delivery_orders
FOR SELECT
USING (
  auth.uid() = customer_id::text
);
```

### 4. Backend Configuration

Ensure your backend is configured to use Supabase. The backend should:

1. Connect to the same Supabase database
2. Update the `delivery_orders` table when order status changes
3. Trigger Supabase realtime events automatically

Example backend update (Node.js/Express):

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key on backend
);

// When updating order status
async function updateOrderStatus(orderId, newStatus) {
  const { data, error } = await supabase
    .from('delivery_orders')
    .update({
      orderStatus: newStatus,
      updatedAt: new Date().toISOString()
    })
    .eq('id', orderId);

  // Realtime subscribers will be notified automatically
  return { data, error };
}
```

### 5. Restart the App

After setting up environment variables, restart your Expo development server:

```bash
npm start
```

## How It Works

1. **Initial Load**: When a user opens `/order/[id]`, the app fetches the order details via REST API
2. **Realtime Subscription**: The app subscribes to changes for that specific order in Supabase
3. **Live Updates**: When the order status changes in the database (e.g., from "confirmed" to "preparing"), Supabase pushes the update to the app
4. **UI Refresh**: The app refetches the complete order details and updates the UI automatically
5. **Cleanup**: When the user navigates away, the subscription is cleaned up

## Testing Realtime Updates

To test if realtime is working:

1. Open the order tracking page: `http://localhost:8082/order/32`
2. In Supabase Dashboard, go to Table Editor
3. Find order #32 in the `delivery_orders` table
4. Change the `orderStatus` field (e.g., from "confirmed" to "preparing")
5. Save the change
6. Watch the app update automatically without refreshing!

You should see console logs:
```
Setting up realtime subscription for order: 32
Realtime update received: { eventType: 'UPDATE', new: {...}, old: {...} }
Order updated in realtime: preparing
```

## What Gets Updated Realtime

The following changes are tracked in realtime:
- Order status (`orderStatus`)
- Payment status (`paymentStatus`)
- Total amount (`totalAmount`, `subtotal`, `deliveryCharge`)
- Delivery slot (`deliverySlot`)
- Special instructions (`specialInstructions`)
- Any other field in the `delivery_orders` table

## Troubleshooting

### Realtime not working?

1. **Check environment variables**: Make sure `.env` file exists and contains correct values
2. **Verify Supabase connection**: Check browser console for connection errors
3. **Enable realtime on table**: Ensure `delivery_orders` table has realtime enabled in Supabase
4. **Check network**: Supabase realtime uses WebSockets - ensure they're not blocked
5. **Review logs**: Check console.log output for subscription status

### Common Issues

**Issue**: "Invalid Supabase credentials"
- **Solution**: Double-check your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`

**Issue**: No updates received
- **Solution**: Verify realtime is enabled on the `delivery_orders` table in Supabase Dashboard

**Issue**: "Table does not exist"
- **Solution**: Make sure your backend created the `delivery_orders` table in Supabase

## Performance Considerations

- Subscriptions are automatically cleaned up when users navigate away
- Only one subscription per order ID is active at a time
- Refetching on updates ensures all nested data (items, customer info) stays in sync
- Consider adding debouncing if you expect very frequent updates

## Security Notes

- The anon key is safe to expose in client apps
- Use Row Level Security (RLS) to restrict which orders users can access
- Never expose your service key in the frontend
- Backend should use the service key for privileged operations

## Next Steps

- Add visual indicators when updates are received (e.g., toast notifications)
- Implement optimistic UI updates for better perceived performance
- Add animations when status changes
- Consider subscribing to order items table for item-level updates
