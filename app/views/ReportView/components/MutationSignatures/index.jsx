import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from '@material-ui/core';

import DataTable from '@/components/DataTable';
import ImageService from '@/services/reports/image.service';
import MutationSignatureService from '@/services/reports/mutation-signature.service';
import columnDefs from './columnDefs';

import './index.scss';

const imageKeys = [
  'mutSignature.corPcors.dbs',
  'mutSignature.corPcors.indels',
  'mutSignature.barplot.dbs',
  'mutSignature.barplot.indels',
  'mutSignature.barplot.sbs',
];

const MutationSignatures = (props) => {
  const {
    report,
  } = props;

  const [images, setImages] = useState({});
  const [signatures, setSignatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        const [imageData, signatureData] = await Promise.all([
          ImageService.get(
            report.ident,
            imageKeys.join(','),
          ),
          MutationSignatureService.all(report.ident),
        ]);
        setImages(imageData);
        setSignatures(signatureData);
        setIsLoading(false);
      };

      getData();
    }
  }, [report]);

  return (
    <div>
      {!isLoading ? (
        <>
          <DataTable
            rowData={signatures}
            columnDefs={columnDefs}
            titleText="Mutation Signatures"
            isPaginated
          />
          <div className="mutation-signature__images">
            {Object.entries(images).map(([key, value]) => (
              <img src={`data:image/${value.format};base64,${value.data}`} alt={key} key={key} className="mutation-signature__image" />
            ))}
          </div>
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

MutationSignatures.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  report: PropTypes.object,
};

MutationSignatures.defaultProps = {
  report: {},
};

export default MutationSignatures;
