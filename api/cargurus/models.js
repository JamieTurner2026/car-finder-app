const { listModels } = require("../../backend/cargurusApi");

module.exports = async (req, res) => {
  try {
    const models = await listModels(req.query.makeId);
    res.json({ models });
  } catch (err) {
    res.status(502).json({ models: [], error: "Could not reach CarGurus models API." });
  }
};
