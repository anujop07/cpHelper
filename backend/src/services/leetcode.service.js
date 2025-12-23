import axios from "axios";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

/**
 * Fetch LeetCode user profile + solved stats
 * @param {string} username - LeetCode username
 */
export const getLeetCodeInfo = async (username) => {
  if (!username) {
    throw new Error("LeetCode username is required");
  }

  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
            starRating
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;

    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query,
        variables: { username }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Referer": "https://leetcode.com"
        }
      }
    );

    const user = response.data.data.matchedUser;

    if (!user) {
      throw new Error("LeetCode user not found");
    }

    // extract solved counts
    const solvedStats = user.submitStats.acSubmissionNum;

    const easy = solvedStats.find(d => d.difficulty === "Easy")?.count || 0;
    const medium = solvedStats.find(d => d.difficulty === "Medium")?.count || 0;
    const hard = solvedStats.find(d => d.difficulty === "Hard")?.count || 0;

    return {
      platform: "leetcode",
      username: user.username,
      ranking: user.profile?.ranking || null,
      reputation: user.profile?.reputation || 0,
      starRating: user.profile?.starRating || 0,
      solved: {
        easy,
        medium,
        hard,
        total: easy + medium + hard
      }
    };
  } catch (error) {
    throw new Error(
      error.response?.data?.errors?.[0]?.message ||
      "Failed to fetch LeetCode data"
    );
  }
};
