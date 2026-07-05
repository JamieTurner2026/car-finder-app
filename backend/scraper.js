const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent": "curl/8.4.0",
  Accept: "*/*",
};

async function scrapeCarGurus(url) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
    const $ = cheerio.load(data);
    const listings = [];
    $("[data-testid='srp-listing-tile']").each((_, el) => {
      const title = $(el)
        .find("[data-testid='srp-listing-blade-title']")
        .first()
        .text()
        .trim();
      const price = $(el)
        .find("[data-testid='srp-tile-price']")
        .first()
        .text()
        .trim();
      const mileage = $(el)
        .find("[data-testid='srp-tile-mileage']")
        .first()
        .text()
        .trim();
      const image = $(el).find("img").first().attr("src");
      const link = $(el).find("[data-testid='tile-link']").first().attr("href");
      if (title && link) {
        listings.push({
          source: "CarGurus",
          title,
          price: price || "N/A",
          mileage: mileage || null,
          image: image || null,
          url: link.startsWith("http") ? link : `https://www.cargurus.com${link}`,
        });
      }
    });
    return listings.slice(0, 20);
  } catch (err) {
    return [];
  }
}

async function scrapeEnterprise(url) {
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
    const $ = cheerio.load(data);
    const listings = [];
    $("article, .vehicle-card, [class*='vehicle-tile']").each((_, el) => {
      const title = $(el).find("h2, h3, .vehicle-title").first().text().trim();
      const price = $(el).find("[class*='price']").first().text().trim();
      const link = $(el).find("a").first().attr("href");
      if (title && link) {
        listings.push({
          source: "Enterprise Car Sales",
          title,
          price: price || "N/A",
          url: link.startsWith("http")
            ? link
            : `https://www.enterprisecarsales.com${link}`,
        });
      }
    });
    return listings.slice(0, 20);
  } catch (err) {
    return [];
  }
}

module.exports = { scrapeCarGurus, scrapeEnterprise };
