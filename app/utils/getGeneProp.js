const getGeneProp = (params, property) => {
  const { data: { variant, variantType } } = params;
  if (variantType === 'sv') {
    return variant?.gene1?.[property] || variant.gene2?.[property] || false;
  }
  return variant?.gene?.[property] || false;
};

export default getGeneProp;
