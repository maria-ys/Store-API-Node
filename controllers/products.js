const { query } = require('express');
const Product = require('../models/product');

const getAllProducts = async (req, res) => {
  const {featured, company, name, sort, fields, numericFilters} = req.query;
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

  // numeric filtering
  
  if(numericFilters){
    const operatorMap = {
      '<':'$lt',
      '<=':'$lte',
      '=':'$eq',
      '>':'$gt',
      '>=':'$gte',
    }
    const regex = /\b(<|<=|=|>|>=)\b/g;
    // replace mathematical operators by mongoose query operators
    let filters = numericFilters.replace(regex, (match)=> `-${operatorMap[match]}-`);

    // if option exists assign its value to query object after splitting
    const options = ['price', 'rating'];
    filters = filters.split(',').forEach(item=>{
      const [field, operator, value] = item.split('-');
      if(options.includes(field)){
        queryObject[field] = {
          [operator] : value
        }
      }
    })
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
