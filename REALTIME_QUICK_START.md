# Realtime Order Tracking - Quick Start

Your Supabase credentials from `.env.local` have been automatically configured! 🎉

## What's Already Done ✅

1. ✅ Supabase client installed (`@supabase/supabase-js`)
2. ✅ Credentials configured (from `.env.local`)
3. ✅ Realtime subscriptions added to order tracking page
4. ✅ `.env` file created with your Supabase credentials

## Next Steps (Only 2 Steps!)

### Step 1: Enable Realtime on Supabase Table

1. Go to https://app.supabase.com
2. Select your project: `vifafrkwcmsyjrfjfxbn`
3. Go to **Database** → **Replication**
4. Find the `online_orders` table
5. Toggle **Enable** for realtime replication

**OR** run this SQL in the SQL Editor:

```sql
-- Enable realtime for online_orders table
ALTER PUBLICATION supabase_realtime ADD TABLE online_orders;
```

### Step 2: Restart Your App

```bash
npm start
```

Press `r` to reload the app.

## Test It! 🧪

1. Open order page: `http://localhost:8082/order/31` or `http://localhost:8082/order/32`
2. In another browser tab, open Supabase Dashboard
3. Go to **Table Editor** → `online_orders`
4. Find the order (ID 31 or 32)
5. Change `order_status` from `confirmed` to `preparing`
6. Click Save
7. **Watch your app update automatically!** ✨

You should see console logs:
```
Setting up realtime subscription for order: 31
Realtime update received: { eventType: 'UPDATE', ... }
Order updated in realtime: preparing
```

## Troubleshooting

**Not receiving updates?**
- Check console for `Setting up realtime subscription for order: X`
- Verify realtime is enabled on `online_orders` table
- Make sure you restarted the app after creating `.env`

**Still issues?**
- See full setup guide in `REALTIME_SETUP.md`
- Check browser console for errors
- Verify Supabase project is accessible

## How It Works

```
User opens order page
    ↓
App fetches order via REST API
    ↓
App subscribes to realtime updates for that order
    ↓
When backend updates order in Supabase
    ↓
Supabase sends realtime event to app
    ↓
App refetches order and updates UI
    ↓
User sees live status changes! 🎉
```

## What Gets Updated in Realtime

- Order status (pending → confirmed → preparing → ready → out_for_delivery → delivered)
- Payment status
- Total amount, subtotal, delivery charge
- Delivery slot
- Special instructions
- Any field in `online_orders` table

No page refresh needed! 🚀
