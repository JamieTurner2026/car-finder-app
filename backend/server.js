const express = require("express");
const cors = require("cors");
const path = require("path");
const { buildLinks } = require("./linkBuilder");
const { scrapeCarGurus, scrapeEnterprise } = require("./scraper");
const { listMakes, listModels } = require("./cargurusApi");

const app = express();
app.use(cors());
app.use(express.json());

// When bundled in the Electron package, serve the built frontend
if (process.env.STATIC_PATH) {
  app.use(express.static(process.env.STATIC_PATH));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(process.env.STATIC_PATH, "index.html"));
  });
}

const PORT = process.env.PORT || 4000;

const BODY_TYPE_LABELS = {
  sedan: "Sedan",
  suv: "SUV",
  truck: "Truck",
  coupe: "Coupe",
  hatchback: "Hatchback",
  convertible: "Convertible",
  minivan: "Minivan",
  "electric hybrid": "Electric / Hybrid",
};

function buildFeatured(query, links) {
  const { make = "", model = "", yearMin, yearMax, priceMin, priceMax, bodyType } = query;

  const title = [make, model].filter(Boolean).join(" ") || "Any car";
  const yearRange = yearMin || yearMax ? `${yearMin || "Any"}–${yearMax || "Any"}` : null;
  const priceRange =
    priceMin || priceMax
      ? `$${priceMin || "0"}–$${priceMax || "Any"}`
      : null;
  const bodyTypeLabel = BODY_TYPE_LABELS[bodyType] || null;

  return { title, yearRange, priceRange, bodyTypeLabel, links };
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/api/cargurus/makes", async (_req, res) => {
  try {
    const makes = await listMakes();
    res.json({ makes });
  } catch (err) {
    res.status(502).json({ makes: [], error: "Could not reach CarGurus makes API." });
  }
});

app.get("/api/cargurus/models", async (req, res) => {
  try {
    const models = await listModels(req.query.makeId);
    res.json({ models });
  } catch (err) {
    res.status(502).json({ models: [], error: "Could not reach CarGurus models API." });
  }
});

app.get("/api/search", async (req, res) => {
  const links = buildLinks(req.query);
  const featured = buildFeatured(req.query, links);

  const [cargurusListings, enterpriseListings] = await Promise.all([
    scrapeCarGurus(links.cargurus),
    scrapeEnterprise(links.enterprise),
  ]);

  const aggregated = [...cargurusListings, ...enterpriseListings];

  res.json({
    links,
    featured,
    aggregated,
    notes: {
      facebook: "Facebook Marketplace has no public listing API — opens a pre-filled search in your browser.",
      autotrader: "AutoTrader blocks automated scraping — opens a pre-filled search in your browser.",
      aggregationStatus:
        aggregated.length > 0
          ? "Live listings pulled successfully from CarGurus."
          : "Live listings aren't available for this search right now — use the links above to browse directly.",
    },
  });
});

app.listen(PORT, () => {
  console.log(`Car Finder backend running on http://localhost:${PORT}`);
});
