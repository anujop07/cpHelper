import axios from "axios";
import * as cheerio from "cheerio";

export const getCodeChefInfo = async (username) => {
  if (!username) {
    throw new Error("CodeChef username is required");
  }

  const url = `https://www.codechef.com/users/${username}`;

  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0" // IMPORTANT
      }
    });

    // console.log(data);

    const $ = cheerio.load(data);

    // rating
    const rating = $(".rating-number").first().text().trim();

    // stars
    const stars = $(".rating-star").text().trim();

    return {
      platform: "codechef",
      username,
      rating: rating ? Number(rating) : 0,
      stars: stars || "0★"
    };
  } catch (error) {
    throw new Error("Failed to fetch CodeChef data");
  }
};
