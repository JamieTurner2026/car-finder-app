function buildLinks(params) {
  const {
    make = "",
    model = "",
    yearMin = "",
    yearMax = "",
    priceMin = "",
    priceMax = "",
    zip = "",
    radius = "50",
    bodyType = "",
    cargurusMakeId = "",
    cargurusModelId = "",
  } = params;

  const query = [make, model, bodyType].filter(Boolean).join(" ").trim();
  const makeSlug = make.toLowerCase().trim().replace(/\s+/g, "-");
  const modelSlug = model.toLowerCase().trim().replace(/\s+/g, "-");

  const facebook = new URL("https://www.facebook.com/marketplace/search");
  if (query) facebook.searchParams.set("query", query);
  if (priceMin) facebook.searchParams.set("minPrice", priceMin);
  if (priceMax) facebook.searchParams.set("maxPrice", priceMax);
  facebook.searchParams.set("exact", "false");

  const enterprise = new URL("https://www.enterprisecarsales.com/search");
  if (make) enterprise.searchParams.set("make", make);
  if (model) enterprise.searchParams.set("model", model);
  if (zip) enterprise.searchParams.set("zip", zip);
  if (radius) enterprise.searchParams.set("radius", radius);
  if (yearMin) enterprise.searchParams.set("year_min", yearMin);
  if (yearMax) enterprise.searchParams.set("year_max", yearMax);
  if (priceMin) enterprise.searchParams.set("price_min", priceMin);
  if (priceMax) enterprise.searchParams.set("price_max", priceMax);

  let cargurus;
  if (cargurusModelId) {
    const slug = [make, model].filter(Boolean).join("-").replace(/\s+/g, "-");
    cargurus = new URL(`https://www.cargurus.com/Cars/l-Used-${slug}-${cargurusModelId}`);
  } else if (cargurusMakeId) {
    const slug = make.replace(/\s+/g, "-");
    cargurus = new URL(`https://www.cargurus.com/Cars/l-Used-${slug}-${cargurusMakeId}`);
  } else {
    cargurus = new URL("https://www.cargurus.com/Cars/searchresults.action");
    if (query) cargurus.searchParams.set("searchQuery", query);
  }
  if (zip) cargurus.searchParams.set("zip", zip);
  if (radius) cargurus.searchParams.set("distance", radius);
  if (yearMin) cargurus.searchParams.set("startYear", yearMin);
  if (yearMax) cargurus.searchParams.set("endYear", yearMax);
  if (priceMin) cargurus.searchParams.set("priceMin", priceMin);
  if (priceMax) cargurus.searchParams.set("priceMax", priceMax);

  let autotraderPath = "/cars-for-sale/all-cars";
  if (makeSlug) autotraderPath += `/${makeSlug}`;
  if (makeSlug && modelSlug) autotraderPath += `/${modelSlug}`;
  if (zip) autotraderPath += `/zip-${zip}`;
  const autotrader = new URL(`https://www.autotrader.com${autotraderPath}`);
  if (radius) autotrader.searchParams.set("searchRadius", radius);
  if (yearMin) autotrader.searchParams.set("startYear", yearMin);
  if (yearMax) autotrader.searchParams.set("endYear", yearMax);
  if (priceMin) autotrader.searchParams.set("minPrice", priceMin);
  if (priceMax) autotrader.searchParams.set("maxPrice", priceMax);

  return {
    facebook: facebook.toString(),
    enterprise: enterprise.toString(),
    cargurus: cargurus.toString(),
    autotrader: autotrader.toString(),
  };
}

module.exports = { buildLinks };
