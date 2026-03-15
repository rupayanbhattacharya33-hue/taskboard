const crypto = require('crypto');
const Webhook = require('../models/Webhook');

// ── Send webhook to a URL ────────────────────────────────────
const sendWebhook = async (webhookUrl, payload, secret) => {
  try {
    const body = JSON.stringify(payload);

    // Create signature if secret exists
    const headers = { 'Content-Type': 'application/json' };
    if (secret) {
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body,
    });

    console.log(`✅ Webhook sent to ${webhookUrl} — Status: ${response.status}`);
    return true;
  } catch (err) {
    console.error(`❌ Webhook failed for ${webhookUrl}:`, err.message);
    return false;
  }
};

// ── Trigger all webhooks for a board event ───────────────────
const triggerWebhooks = async (boardId, eventType, data) => {
  try {
    // Find all active webhooks for this board that listen to this event
    const webhooks = await Webhook.find({
      board: boardId,
      isActive: true,
      events: eventType,
    });

    if (webhooks.length === 0) return;

    console.log(`🔔 Triggering ${webhooks.length} webhook(s) for event: ${eventType}`);

    const payload = {
      event: eventType,
      boardId,
      timestamp: new Date().toISOString(),
      data,
    };

    // Send all webhooks in parallel
    await Promise.allSettled(
      webhooks.map(webhook => sendWebhook(webhook.url, payload, webhook.secret))
    );
  } catch (err) {
    console.error('❌ Error triggering webhooks:', err.message);
  }
};

module.exports = { triggerWebhooks };