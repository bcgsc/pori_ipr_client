import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import orderBy from 'lodash.orderby';
import { LinearProgress, Typography } from '@material-ui/core';
import { SnackbarContext } from '@bcgsc/react-snackbar-provider';

import DataTable from '@/components/DataTable';
import ReportContext from '../../../../components/ReportContext';
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

  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState();

  const snackbar = useContext(SnackbarContext);

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

  const handleEditStart = (rowData) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData) => {
    setShowDialog(false);
    if (newData) {
      let newSignatures;
      if (!newData.signature.toLowerCase().match(/dbs|id/)) {
        newSignatures = orderBy(sbsSignatures, ['nnls', 'signature'], ['desc', 'asc']);
        const signatureIndex = newSignatures.findIndex(sig => sig.ident === newData.ident);
        if (signatureIndex !== null) {
          newSignatures[signatureIndex] = newData;
          setSbsSignatures(newSignatures);
        }
      }
      if (newData.signature.toLowerCase().match(/dbs/)) {
        newSignatures = orderBy(dbsSignatures, ['nnls', 'signature'], ['desc', 'asc']);
        const signatureIndex = dbsSignatures.findIndex(sig => sig.ident === newData.ident);
        if (signatureIndex !== null) {
          newSignatures[signatureIndex] = newData;
          setDbsSignatures(newSignatures);
        }
      }
      if (newData.signature.toLowerCase().match(/id/)) {
        newSignatures = orderBy(idSignatures, ['nnls', 'signature'], ['desc', 'asc']);
        const signatureIndex = idSignatures.findIndex(sig => sig.ident === newData.ident);
        if (signatureIndex !== null) {
          newSignatures[signatureIndex] = newData;
          setIdSignatures(newSignatures);
        }
      }
    }
    setEditData(null);
  }, [dbsSignatures, idSignatures, sbsSignatures]);

  return (
    <div>
      {!isLoading ? (
        <>
          <Typography variant="h3" className="mutation-signature__title">
            Single base substitution signatures
          </Typography>
          {images['mutSignature.barplot.sbs'] && (
            <div className="mutation-signature__images">
              <img
                src={`data:image/${images['mutSignature.barplot.sbs'].format};base64,${images['mutSignature.barplot.sbs'].data}`}
                alt="Single base substitution barplot"
                className="mutation-signature__image mutation-signature__image--small"
              />
            </div>
          )}
          {showDialog && (
            <EditDialog
              editData={editData}
              isOpen={showDialog}
              onClose={handleEditClose}
              showErrorSnackbar={snackbar.add}
            />
          )}
          <DataTable
            rowData={sbsSignatures}
            columnDefs={columnDefs}
            isPaginated
            canEdit={canEdit}
            onEdit={handleEditStart}
          />
          <Typography variant="h3" className="mutation-signature__title">
            Double base substitution signatures
          </Typography>
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
            rowData={dbsSignatures}
            columnDefs={columnDefs}
            isPaginated
            canEdit={canEdit}
            onEdit={handleEditStart}
            canToggleColumns
          />
          <Typography variant="h3" className="mutation-signature__title">
            Indel Signatures
          </Typography>
          {images['mutSignature.barplot.indels'] && (
            <div className="mutation-signature__images">
              <img
                src={`data:image/${images['mutSignature.barplot.indels'].format};base64,${images['mutSignature.barplot.indels'].data}`}
                alt="Indel barplot"
                className="mutation-signature__image"
              />
            </div>
          )}
          <DataTable
            rowData={idSignatures}
            columnDefs={columnDefs}
            isPaginated
            canEdit={canEdit}
            onEdit={handleEditStart}
            canToggleColumns
          />
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

export default MutationSignatures;
