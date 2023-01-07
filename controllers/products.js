const Product = require('../models/product');

const getAllProducts = async (req, res) => {
  const {featured, company, name, sort, fields} = req.query;
  const queryObject = {};

  if(featured){
    queryObject.featured = featured === 'true' ? true : false;
  }
  if(company){
    queryObject.company = company;
  }
  if(name){
    queryObject.name = {$regex: name, $options: 'i'};
  }

  var result = Product.find(queryObject);

  // sorting 
  if(sort){
    const sortList = sort.split(',').join(' ');
    result = result.sort(sortList);
  }

  // fields 
  if(fields){
    const fieldsList = fields.split(',').join(' ');
    result = result.select(fieldsList);
  }

  // paging & skipping
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);

  const products = await result;
  res.status(200).json({products, nbHits: products.length});
};

const getAllProductsStatic = async (req, res) => {
  res.status(200).json({ products: await Product.find({}) });
};

module.exports = {
  getAllProducts,
  getAllProductsStatic,
};
