import { getCodeforcesInfo } from "./codeforces.service.js";
import { getLeetCodeInfo } from "./leetcode.service.js";
import { getCodeChefInfo } from "./codechef.service.js";

export const getInfo = async (handleCF, handleLC,handleCC) => {
  const result = {};

  // Codeforces
  if (handleCF) {
    result.codeforces = await getCodeforcesInfo(handleCF);
  } else {
    result.codeforces = null;
  }

  // LeetCode
  if (handleLC) {
    result.leetcode = await getLeetCodeInfo(handleLC);
  } else {
    result.leetcode = null;
  }
  if (handleCC) {
    result.codechef = await getCodeChefInfo(handleCC);
  } else {
    result.codechef = null;
  }

  return result;
};
