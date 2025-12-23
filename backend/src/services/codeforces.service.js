import axios from "axios";

const CODEFORCES_BASE_URL = "https://codeforces.com/api";

/**
 * Fetch Codeforces user profile info
 * @param {string} handle - Codeforces username
 */
export const getCodeforcesInfo = async (handle) => {
  if (!handle) {
    throw new Error("Codeforces handle is required");
  }

  try {
    const url = `${CODEFORCES_BASE_URL}/user.info?handles=${handle}`;

    const response = await axios.get(url);

    if (response.data.status !== "OK") {
      throw new Error("Codeforces API returned error");
    }
    
    const user = response.data.result[0];

    return {
      details:user
    };
  } catch (error) {
    // normalize error
    throw new Error(
      error.response?.data?.comment ||
      "Failed to fetch Codeforces data"
    );
  }
};



