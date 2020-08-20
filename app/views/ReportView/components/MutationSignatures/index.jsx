import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { LinearProgress } from '@material-ui/core';

import DataTable from '@/components/DataTable';
import ReportContext from '../ReportContext';
import EditContext from '@/components/EditContext';
import ImageService from '@/services/reports/image.service';
import { getMutationSignatures } from '@/services/reports/mutation-signature';
import EditDialog from './components/EditDialog';
import columnDefs from './columnDefs';

import './index.scss';

const imageKeys = [
  'mutSignature.barplot.dbs',
  'mutSignature.barplot.indels',
  'mutSignature.barplot.sbs',
];

const MutationSignatures = () => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useContext(EditContext);
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
          getMutationSignatures(report.ident),
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
            canEdit={canEdit}
            EditDialog={EditDialog}
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
            canEdit={canEdit}
            EditDialog={EditDialog}
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
            canEdit={canEdit}
            EditDialog={EditDialog}
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

export default MutationSignatures;
