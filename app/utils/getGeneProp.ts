import { AnyVariant } from '@/common';
import { ValueGetterParams } from '@ag-grid-community/core';

const getGeneProp = (params: ValueGetterParams<AnyVariant>, property: string): string => {
  const { data: { variant, variantType } } = params;
  if (variantType === 'sv') {
    return variant?.gene1?.[property] || variant.gene2?.[property] || false;
  }
  return variant?.gene?.[property] || false;
};

export default getGeneProp;
