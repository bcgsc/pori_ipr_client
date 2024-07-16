const INT_STATUS_TO_STRING = {
  yes: 'integration',
  no: 'no integration',
  none: 'not detected',
  '': 'not detected',
};

const getMicbSiteIntegrationStatusLabel = (species: string, integrationStatus: string) => {
  if (typeof integrationStatus !== 'string' || !species) return '';
  return `${species} | (${INT_STATUS_TO_STRING[integrationStatus.toLowerCase()]})`;
};

export default getMicbSiteIntegrationStatusLabel;
