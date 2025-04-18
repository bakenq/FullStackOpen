const uniqById = (a) => {
  let seen = new Set();
  return a.filter((item) => {
    let k = item?.id;
    return k ? (seen.has(k) ? false : seen.add(k)) : true;
  });
};

export const updateCache = (cache, queryOptions, addedBook) => {
  cache.updateQuery(queryOptions, (cachedData) => {
    if (!cachedData || !cachedData.allBooks) {
      console.warn(
        "updateCache: Query not found in cache or has unexpected structure",
        queryOptions.query.definitions[0]?.name?.value
      );
      return cachedData;
    }

    console.log(
      "updateCache: Updating cache for query:",
      queryOptions.query.definitions[0]?.name?.value,
      "with book:",
      addedBook.title
    );
    return {
      allBooks: uniqById(cachedData.allBooks.concat(addedBook)),
    };
  });
};
