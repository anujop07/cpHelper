import { getCodeforcesInfo } from "../services/codeforces.service.js";
import { getLeetCodeInfo } from "../services/leetcode.service.js";
import { getCodeChefInfo } from "../services/codechef.service.js";

export const getCpInfoFromUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({
        success: false,
        message: "User not found or invalid user object",
      });
    }

    const result = {};

    console.log("Fetching CP info for user:", user._id);

    if (user.codeforcesHandle) {
      result.codeforces = await getCodeforcesInfo(user.codeforcesHandle);
    } else {
      result.codeforces = null;
    }

    if (user.leetcodeHandle) {
      result.leetcode = await getLeetCodeInfo(user.leetcodeHandle);
    } else {
      result.leetcode = null;
    }

    if (user.codechefHandle) {
      result.codechef = await getCodeChefInfo(user.codechefHandle);
    } else {
      result.codechef = null;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
