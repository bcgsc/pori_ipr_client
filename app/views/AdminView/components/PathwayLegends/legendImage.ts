type LegendImageSource = {
  data?: string;
  format?: string;
  filename?: string;
};

// The API stores `format` as an uppercase enum (PNG/JPG/SVG), none of which is
// directly usable as a data-URI / <img> mime subtype (JPG must be `jpeg`, SVG
// must be `svg+xml`). Normalize to a valid `image/<subtype>`.
const legendMimeSubtype = ({ format, filename }: LegendImageSource): string => {
  const ext = (format ?? filename?.split('.').pop() ?? 'png').toLowerCase();
  if (ext === 'svg') {
    return 'svg+xml';
  }
  if (ext === 'jpg') {
    return 'jpeg';
  }
  return ext;
};

// Build a full data URI from the API's bare base64 `data`.
const legendDataUri = ({ data, format, filename }: LegendImageSource): string => {
  if (!data) {
    return '';
  }
  if (data.startsWith('data:')) {
    return data;
  }
  return `data:image/${legendMimeSubtype({ format, filename })};base64,${data}`;
};

export default legendDataUri;
export { legendMimeSubtype };
export type { LegendImageSource };
