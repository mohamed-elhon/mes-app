const paginate = (model, query = {}, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', populate = null, select = null } = options;
  
  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
  
  // Build query
  let queryBuilder = model.find(query);
  
  // Apply sorting
  queryBuilder = queryBuilder.sort(sort);
  
  // Apply field selection
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }
  
  // Apply population
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(pop => {
        queryBuilder = queryBuilder.populate(pop);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }
  
  // Execute query
  return Promise.all([
    queryBuilder.skip(skip).limit(limit).exec(),
    model.countDocuments(query).exec()
  ]).then(([results, total]) => {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      success: true,
      data: results,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      }
    };
  });
};

// Advanced pagination with aggregation
const paginateAggregate = (model, pipeline = [], options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;
  
  // Add pagination to pipeline
  const paginatedPipeline = [
    ...pipeline,
    { $skip: skip },
    { $limit: limit }
  ];
  
  // Count pipeline
  const countPipeline = [
    ...pipeline,
    { $count: 'total' }
  ];
  
  return Promise.all([
    model.aggregate(paginatedPipeline).exec(),
    model.aggregate(countPipeline).exec()
  ]).then(([results, countResult]) => {
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      success: true,
      data: results,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      }
    };
  });
};

module.exports = { paginate, paginateAggregate };
