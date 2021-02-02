import errorHandler from '../errors/errorHandler';

const germlineDownload = async () => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  };

  const response = await fetch(
    `${window._env_.API_BASE_URL}/export/germline-small-mutation-reports/batch/download?reviews=biofx,projects`,
    options,
  );

  if (response.ok) {
    const blob = await response.blob();
    const filenameHeader = response.headers.get('Content-Disposition');

    if (!filenameHeader) {
      throw new Error('unable to get excel file from server');
    }
    const [_, filename = 'germline_export.xlsx'] = filenameHeader.match(/filename=(.+)/) || [];

    return { filename, blob };
  }
  return errorHandler(response);
};

export default germlineDownload;
