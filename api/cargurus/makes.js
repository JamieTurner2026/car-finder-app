const { listMakes } = require("../../backend/cargurusApi");

module.exports = async (req, res) => {
  try {
    const makes = await listMakes();
    res.json({ makes });
  } catch (err) {
    res.status(502).json({ makes: [], error: "Could not reach CarGurus makes API." });
  }
};
