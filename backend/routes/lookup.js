const router = require('express').Router();
const axios = require('axios');

// GET /lookup/calories?q=1 banana
router.get('/calories', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(400).json({ error: 'Missing q' });

    // USDA search
    const search = await axios.post(
      'https://api.nal.usda.gov/fdc/v1/foods/search',
      { query: q, pageSize: 1 },
      { params: { api_key: process.env.FDC_API_KEY } }
    );

    const item = search.data?.foods?.[0];
    if (!item) return res.json({ query: q, calories: 0, items: [] });

    // Energy (kcal) → nutrientNumber 208 (or id 1008)
    const kcal =
      item.foodNutrients?.find(
        n => n.nutrientNumber === '208' || n.nutrientId === 1008
      )?.value;

    res.json({
      query: q,
      calories: kcal ? Math.round(kcal) : 0,
      items: [
        {
          name: item.description,
          brand: item.brandOwner || null,
          fdcId: item.fdcId,
          calories: kcal ?? null,
        },
      ],
    });
  } catch (e) {
    console.error('USDA lookup error:', e?.response?.data || e.message);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

module.exports = router;
