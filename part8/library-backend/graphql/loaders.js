const DataLoader = require("dataloader");
const Book = require("../models/book");
const mongoose = require("mongoose");

const batchBookCounts = async (authorIds) => {
  console.log(
    "DataLoader: Batching book counts for",
    authorIds.length,
    "authors"
  );

  const validObjectIds = authorIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  if (validObjectIds.length === 0) {
    return authorIds.map(() => 0);
  }

  try {
    console.log(
      "DataLoader: Running aggregation with $match:",
      JSON.stringify({ author: { $in: validObjectIds } })
    );
    const results = await Book.aggregate([
      { $match: { author: { $in: validObjectIds } } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]);

    const countsMap = new Map(results.map((r) => [r._id.toString(), r.count]));

    const counts = authorIds.map((id) => countsMap.get(id.toString()) || 0);
    return counts;
  } catch (error) {
    console.error("DataLoader: Error in batchBookCounts:", error);
    return authorIds.map(() => 0);
  }
};

module.exports = {
  batchBookCounts,
};
