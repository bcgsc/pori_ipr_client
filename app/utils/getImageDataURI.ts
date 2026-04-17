import { ImageType } from '@/common';

const getImageDataURI = (image: ImageType): string => {
  if (!image) return null;

  const { data: imageData, format: imageFormat } = image;

  if (imageData) {
    if (!imageData?.startsWith('data:image')) {
      return (`data:${imageFormat};base64,${imageData}`);
    }
    return imageData;
  }
  return '';
};

export default getImageDataURI;
