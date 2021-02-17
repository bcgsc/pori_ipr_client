import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import orderBy from 'lodash.orderby';
import { LinearProgress, Typography } from '@material-ui/core';
import { useSnackbar } from 'notistack';

import DemoDescription from '@/components/DemoDescription';
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

  const snackbar = useSnackbar();

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
    let newSignatures;
    let setter;

    if (newData) {
      if (!newData.signature.toLowerCase().match(/dbs|id/)) {
        setter = setSbsSignatures;
        newSignatures = orderBy(sbsSignatures, ['nnls', 'signature'], ['desc', 'asc']);
      }
      if (newData.signature.toLowerCase().match(/dbs/)) {
        setter = setDbsSignatures;
        newSignatures = orderBy(dbsSignatures, ['nnls', 'signature'], ['desc', 'asc']);
      }
      if (newData.signature.toLowerCase().match(/id/)) {
        setter = setIdSignatures;
        newSignatures = orderBy(idSignatures, ['nnls', 'signature'], ['desc', 'asc']);
      }
      const signatureIndex = newSignatures.findIndex(sig => sig.ident === newData.ident);
      if (signatureIndex !== -1) {
        newSignatures[signatureIndex] = newData;
        setter(newSignatures);
      }
    }
    setEditData(null);
  }, [dbsSignatures, idSignatures, sbsSignatures]);

  return (
    <div>
      <DemoDescription>
        The pattern of specific base changes and base context of single nucleotide variants, small
        insertions and deletions in the tumour, referred to as the mutation signature, is computed
        and compared to patterns previously observed in a wide variety of tumour types. Signatures
        that suggest a particular mutation etiology, such as exposure to a specific mutagen, are
        noted.
      </DemoDescription>
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
