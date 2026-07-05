const axios = require("axios");

const HEADERS = {
  "User-Agent": "curl/8.4.0",
  Accept: "*/*",
};

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const makesCache = { data: null, fetchedAt: 0 };
const modelsCache = new Map();

async function listMakes() {
  if (makesCache.data && Date.now() - makesCache.fetchedAt < CACHE_TTL_MS) {
    return makesCache.data;
  }
  const { data } = await axios.get(
    "https://www.cargurus.com/Cars/api/1.0/carselector/listMakes.action",
    { params: { searchType: "USED" }, headers: HEADERS, timeout: 8000 }
  );
  const makes = (data.makes || [])
    .map((m) => ({ id: m.id, name: m.name, isPopular: !!m.isPopular }))
    .sort((a, b) => a.name.localeCompare(b.name));
  makesCache.data = makes;
  makesCache.fetchedAt = Date.now();
  return makes;
}

async function listModels(makeId) {
  if (!makeId) return [];
  const cached = modelsCache.get(makeId);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }
  const { data } = await axios.get(
    "https://www.cargurus.com/Cars/api/1.0/carselector/listModels.action",
    { params: { searchType: "USED", makeId }, headers: HEADERS, timeout: 8000 }
  );
  const models = (data.models || [])
    .map((m) => ({ id: m.id, name: m.name, isPopular: !!m.isPopular }))
    .sort((a, b) => a.name.localeCompare(b.name));
  modelsCache.set(makeId, { data: models, fetchedAt: Date.now() });
  return models;
}

module.exports = { listMakes, listModels };
