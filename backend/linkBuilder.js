function buildLinks(params) {
  const {
    make = "",
    model = "",
    yearMin = "",
    yearMax = "",
    priceMin = "",
    priceMax = "",
    zip = "",
    state = "",
    radius = "50",
    mileageMin = "",
    mileageMax = "",
    bodyType = "",
    cargurusMakeId = "",
    cargurusModelId = "",
  } = params;

  const query = [make, model, bodyType, state].filter(Boolean).join(" ").trim();
  const makeSlug = make.toLowerCase().trim().replace(/\s+/g, "-");
  const modelSlug = model.toLowerCase().trim().replace(/\s+/g, "-");

  // Facebook Marketplace — city-level search works better than /search
  // zip→city lookup not available without an API; use /marketplace/{zip} for local results
  let facebook;
  if (zip) {
    facebook = new URL(`https://www.facebook.com/marketplace/${zip}/search`);
  } else {
    facebook = new URL("https://www.facebook.com/marketplace/search");
  }
  if (query) facebook.searchParams.set("query", query);
  if (priceMin) facebook.searchParams.set("minPrice", priceMin);
  if (priceMax) facebook.searchParams.set("maxPrice", priceMax);
  if (radius) facebook.searchParams.set("radius", radius);
  facebook.searchParams.set("exact", "false");

  // Enterprise Car Sales — their SPA ignores URL params; link to homepage search
  // so users aren't misled into thinking results are pre-filtered
  const enterprise = new URL("https://www.enterprisecarsales.com/");

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
  if (mileageMin) cargurus.searchParams.set("minMileage", mileageMin);
  if (mileageMax) cargurus.searchParams.set("maxMileage", mileageMax);

  let autotraderPath = "/cars-for-sale/all-cars";
  if (makeSlug) autotraderPath += `/${makeSlug}`;
  if (makeSlug && modelSlug) autotraderPath += `/${modelSlug}`;
  if (state) autotraderPath += `/state-${state.toLowerCase()}`;
  if (zip) autotraderPath += `/zip-${zip}`;
  const autotrader = new URL(`https://www.autotrader.com${autotraderPath}`);
  if (radius) autotrader.searchParams.set("searchRadius", radius);
  if (yearMin) autotrader.searchParams.set("startYear", yearMin);
  if (yearMax) autotrader.searchParams.set("endYear", yearMax);
  if (priceMin) autotrader.searchParams.set("minPrice", priceMin);
  if (priceMax) autotrader.searchParams.set("maxPrice", priceMax);
  if (mileageMax) autotrader.searchParams.set("maxMileage", mileageMax);

  return {
    facebook: facebook.toString(),
    enterprise: enterprise.toString(),
    cargurus: cargurus.toString(),
    autotrader: autotrader.toString(),
  };
}

module.exports = { buildLinks };
