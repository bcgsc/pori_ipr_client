const UNSPECIFIED_EVIDENCE_LEVEL = 'Unspecified evidence level';
const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/i;
const extractUUID = (str = '') => {
  const match = str.match(
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  );
  return match ? match[0] : null;
};

export {
  UNSPECIFIED_EVIDENCE_LEVEL,
  UUID_REGEX,
  extractUUID,
};
