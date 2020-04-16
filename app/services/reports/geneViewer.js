import getLocalToken from '../management/token';

const geneViewer = async (gene, reportIdent) => {
  const authToken = getLocalToken();
  if (!authToken) {
    return [];
  }

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': authToken,
    },
  };

  const response = await fetch(
    `${CONFIG.ENDPOINTS.API}/reports/${reportIdent}/gene-viewer/${gene}`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
};

export default geneViewer;
