const router = require('express').Router();
const axios = require('axios');

// GET /lookup/calories?q=1 banana
router.get('/calories', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing q' });

    const resp = await axios.post(
      'https://trackapi.nutritionix.com/v2/natural/nutrients',
      { query: q },
      {
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID,
          'x-app-key': process.env.NUTRITIONIX_API_KEY,
          'x-remote-user-id': '0',
          'Content-Type': 'application/json',
        },
      }
    );

    const foods = resp.data?.foods || [];
    // Option A: take the first match’s calories
    const first = foods[0];
    const firstKcal = first ? Math.round(first.nf_calories || 0) : 0;

    // Option B (commented): sum all parsed items
    // const totalKcal = Math.round(foods.reduce((s,f)=>s+(f.nf_calories||0),0));

    return res.json({
      query: q,
      calories: firstKcal,
      items: foods.map(f => ({
        name: f.food_name,
        serving_qty: f.serving_qty,
        serving_unit: f.serving_unit,
        calories: f.nf_calories,
        brand: f.brand_name || null,
      })),
    });
  } catch (e) {
    console.error('Nutritionix lookup error:', e?.response?.data || e.message);
    // Surface useful message if available
    const status = e?.response?.status || 500;
    return res.status(status).json({ error: 'Lookup failed' });
  }
});

module.exports = router;
