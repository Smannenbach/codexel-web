import { Router } from 'express';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export function createSubscriptionRoutes() {
  const router = Router();

  // Create subscription with payment intent
  router.post('/create', async (req, res) => {
    try {
      const { planId, billing, priceAmount } = req.body;

      // Create a customer
      const customer = await stripe.customers.create({
        metadata: {
          planId,
          billing,
        }
      });

      // Create a product first
      const product = await stripe.products.create({
        name: `Codexel ${planId} Plan`,
        description: `${billing === 'yearly' ? 'Annual' : 'Monthly'} subscription`,
      });

      // Create a price for the product
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceAmount,
        currency: 'usd',
        recurring: {
          interval: billing === 'yearly' ? 'year' : 'month',
        },
      });

      // Create subscription with trial period
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: price.id,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: 7, // 7-day free trial
      });

      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = (invoice as any).payment_intent as Stripe.PaymentIntent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ 
        error: 'Failed to create subscription',
        message: error.message 
      });
    }
  });

  // Update subscription
  router.post('/update', async (req, res) => {
    try {
      const { subscriptionId, planId, billing } = req.body;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Create new product and price
      const product = await stripe.products.create({
        name: `Codexel ${planId} Plan`,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: getPriceAmount(planId, billing),
        currency: 'usd',
        recurring: {
          interval: billing === 'yearly' ? 'year' : 'month',
        },
      });

      // Update subscription with new price
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: price.id,
        }],
        proration_behavior: 'create_prorations',
      });

      res.json({
        success: true,
        subscription: updatedSubscription,
      });
    } catch (error: any) {
      console.error('Subscription update error:', error);
      res.status(500).json({ 
        error: 'Failed to update subscription',
        message: error.message 
      });
    }
  });

  // Cancel subscription
  router.post('/cancel', async (req, res) => {
    try {
      const { subscriptionId } = req.body;

      const canceledSubscription = await stripe.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true }
      );

      res.json({
        success: true,
        subscription: canceledSubscription,
      });
    } catch (error: any) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ 
        error: 'Failed to cancel subscription',
        message: error.message 
      });
    }
  });

  // Get subscription status
  router.get('/status/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;

      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        res.json({
          active: true,
          subscription: subscriptions.data[0],
        });
      } else {
        res.json({
          active: false,
        });
      }
    } catch (error: any) {
      console.error('Subscription status error:', error);
      res.status(500).json({ 
        error: 'Failed to get subscription status',
        message: error.message 
      });
    }
  });

  return router;
}

// Helper function to get price amount based on plan
function getPriceAmount(planId: string, billing: string): number {
  const prices: any = {
    starter: { monthly: 2900, yearly: 29000 },
    professional: { monthly: 9900, yearly: 99000 },
    enterprise: { monthly: 29900, yearly: 299000 },
  };

  return prices[planId]?.[billing === 'yearly' ? 'yearly' : 'monthly'] || 9900;
}