const { buildLinks } = require("../backend/linkBuilder");
const { scrapeCarGurus, scrapeEnterprise } = require("../backend/scraper");

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
  const priceRange = priceMin || priceMax ? `$${priceMin || "0"}–$${priceMax || "Any"}` : null;
  const bodyTypeLabel = BODY_TYPE_LABELS[bodyType] || null;
  return { title, yearRange, priceRange, bodyTypeLabel, links };
}

module.exports = async (req, res) => {
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
};
