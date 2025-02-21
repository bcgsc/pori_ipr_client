const INT_STATUS_TO_STRING = {
  yes: 'integration',
  no: 'no integration',
  none: '',
  '': '',
};

const getMicbSiteIntegrationStatusLabel = (species: string, integrationStatus: string) => {
  if (typeof integrationStatus !== 'string' || !species || species === '' || species.toLowerCase() === 'none') return '';
  const intStatus = INT_STATUS_TO_STRING[integrationStatus.toLowerCase()] ?? integrationStatus;
  return `${species}${intStatus ? ` | (${intStatus})` : ''}`;
};

const getMicbSiteSummary = (microbial) => {
  if (
    microbial?.length < 1
    || (microbial.length === 1 && microbial.find(({ species }) => species.toLowerCase() === 'none'))
  ) {
    return 'Not detected';
  }

  const visibleMicrobials = microbial.filter((m) => m.microbialHidden === false);
  return visibleMicrobials.filter(({ species }) => species.toLowerCase() !== 'none').map(({ species, integrationSite }) => getMicbSiteIntegrationStatusLabel(species, integrationSite)).join(', ');
};

export {
  getMicbSiteIntegrationStatusLabel,
  getMicbSiteSummary,
};
