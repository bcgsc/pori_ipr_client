import errorHandler from '../errors/errorHandler';

const geneViewer = async (gene, reportIdent) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/reports/${reportIdent}/gene-viewer/${gene}`,
    options,
  );

  if (response.ok) {
    return response.json();
  }
  return errorHandler(response);
};

export default geneViewer;
