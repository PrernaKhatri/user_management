const buildQueryFeatures = ({model, queryParams = {}, searchFields = [], baseFilter = {}, populate = []}) => {

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 10;
    const skip = (page - 1) * limit;
  
    let filter = { ...baseFilter };
  
    if (queryParams.search && searchFields.length) {
      const searchRegex = new RegExp(queryParams.search.trim(), "i");
  
      filter.$or = searchFields.map(field => ({
        [field]: searchRegex
      }));
    }
  
    const sortBy = queryParams.sortBy || "_id";
    const order = queryParams.order === "ASC" ? 1 : -1;
  
    const sort = { [sortBy]: order };
  
    let query = model.find(filter).sort(sort).skip(skip).limit(limit);
  
    populate.forEach(pop => {
      query = query.populate(pop);
    });
  
    return {query, pagination: { page, limit }};
  };
  
  module.exports = buildQueryFeatures;
  