import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from '@material-ui/core';

import DataTable from '@/components/DataTable';
import ImageService from '@/services/reports/image.service';
import MutationSignatureService from '@/services/reports/mutation-signature.service';
import columnDefs from './columnDefs';

import './index.scss';

const imageKeys = [
  'mutSignature.barplot.dbs',
  'mutSignature.barplot.indels',
  'mutSignature.barplot.sbs',
];

const MutationSignatures = (props) => {
  const {
    report,
  } = props;

  const [images, setImages] = useState({});
  const [sbsSignatures, setSbsSignatures] = useState([]);
  const [dbsSignatures, setDbsSignatures] = useState([]);
  const [idSignatures, setIdSignatures] = useState([]);
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
        setSbsSignatures(signatureData.filter(sig => !(new RegExp(/dbs|id/)).test(sig.signature.toLowerCase())));
        setDbsSignatures(signatureData.filter(sig => (new RegExp(/dbs/)).test(sig.signature.toLowerCase())));
        setIdSignatures(signatureData.filter(sig => (new RegExp(/id/)).test(sig.signature.toLowerCase())));
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
            rowData={sbsSignatures}
            columnDefs={columnDefs}
            titleText="Single base subtitution signatures"
            isPaginated
          />
          {images['mutSignature.barplot.sbs'] && (
            <div className="mutation-signature__images">
              <img
                src={`data:image/${images['mutSignature.barplot.sbs'].format};base64,${images['mutSignature.barplot.sbs'].data}`}
                alt="Single base substitution barplot"
                className="mutation-signature__image mutation-signature__image--small"
              />
            </div>
          )}
          <DataTable
            rowData={dbsSignatures}
            columnDefs={columnDefs}
            titleText="Double base substitution signatures"
            isPaginated
          />
          {images['mutSignature.barplot.dbs'] && (
            <div className="mutation-signature__images">
              <img
                src={`data:image/${images['mutSignature.barplot.dbs'].format};base64,${images['mutSignature.barplot.dbs'].data}`}
                alt="Double base substitution barplot"
                className="mutation-signature__image"
              />
            </div>
          )}
          <DataTable
            rowData={idSignatures}
            columnDefs={columnDefs}
            titleText="Indel Signatures"
            isPaginated
          />
          {images['mutSignature.barplot.indels'] && (
            <div className="mutation-signature__images">
              <img
                src={`data:image/${images['mutSignature.barplot.indels'].format};base64,${images['mutSignature.barplot.indels'].data}`}
                alt="Indel barplot"
                className="mutation-signature__image"
              />
            </div>
          )}
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
