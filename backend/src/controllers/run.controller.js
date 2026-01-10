import axios from "axios";

const RUNNER_URL = process.env.RUNNER_URL || "http://localhost:4000";

export const runCode = async (req, res) => {
  const { code, input } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  try {
    const response = await axios.post(`${RUNNER_URL}/run`, {
      code,
      input,
    });

    return res.json(response.data);
  } catch (err) {
    return res.status(500).json({
      status: "ERROR",
      error: "Runner service unavailable",
    });
  }
};