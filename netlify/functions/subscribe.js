/**
 * Netlify Function: subscribe.js
 *
 * Receives { email, card_name, card_link } from the browser.
 * Submits to ConvertKit using the secret API key stored in a
 * Netlify environment variable (CONVERTKIT_API_SECRET).
 *
 * The public form ID is also stored as an env var (CONVERTKIT_FORM_ID)
 * so it can be changed without a code deploy.
 *
 * ConvertKit API docs:
 *   POST https://api.convertkit.com/v3/forms/{form_id}/subscribe
 *   Body: { api_secret, email, fields: { card_name, card_link } }
 *
 * Errors are logged server-side (visible in Netlify function logs)
 * but never surfaced to the user.
 */

exports.handler = async function(event, context) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // CORS headers — allow requests from the same origin
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let email, card_name, card_link;

  try {
    const body = JSON.parse(event.body || '{}');
    email = body.email;
    card_name = body.card_name;
    card_link = body.card_link;
  } catch (err) {
    console.error('[subscribe] Failed to parse request body:', err);
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) };
  }

  // Read secrets from environment variables (set in Netlify dashboard)
  const apiSecret = process.env.CONVERTKIT_API_SECRET;
  const formId = process.env.CONVERTKIT_FORM_ID;

  if (!apiSecret || !formId) {
    console.error('[subscribe] Missing environment variables: CONVERTKIT_API_SECRET or CONVERTKIT_FORM_ID');
    // Return 200 so the user experience is never broken
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe`;

  const payload = {
    api_secret: apiSecret,
    email: email,
    fields: {
      card_name: card_name || '',
      card_link: card_link || ''
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[subscribe] ConvertKit API error ${response.status}:`, responseText);
      // Still return 200 to the browser — failure is silent to the user
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    console.log(`[subscribe] Success for ${email} — card: ${card_name}`);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error('[subscribe] Network error calling ConvertKit:', err);
    // Silent failure — return 200 to the browser
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }
};
