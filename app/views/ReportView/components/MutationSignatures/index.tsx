import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import orderBy from 'lodash.orderby';
import { LinearProgress, Typography } from '@material-ui/core';

import DemoDescription from '@/components/DemoDescription';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import EditContext from '@/context/EditContext';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import ImageType from '@/components/Image/types';
import EditDialog from './components/EditDialog';
import MutationSignatureType from './types';
import columnDefs from './columnDefs';

import './index.scss';

const imageKeys = [
  'mutSignature.barplot.dbs',
  'mutSignature.barplot.indels',
  'mutSignature.barplot.sbs',
];

const MutationSignatures = (): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useEdit();
  const [images, setImages] = useState<ImageType[]>([]);
  const [sbsSignatures, setSbsSignatures] = useState<MutationSignatureType[]>([]);
  const [dbsSignatures, setDbsSignatures] = useState<MutationSignatureType[]>([]);
  const [idSignatures, setIdSignatures] = useState<MutationSignatureType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState<MutationSignatureType | null>();

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        try {
          const [imageData, signatureData] = await Promise.all([
            api.get(`/reports/${report.ident}/image/retrieve/${imageKeys.join(',')}`, {}).request(),
            api.get(`/reports/${report.ident}/mutation-signatures`, {}).request(),
          ]);
          setImages(imageData);
          setSbsSignatures(signatureData.filter((sig) => !(new RegExp(/dbs|id/)).test(sig.signature.toLowerCase())));
          setDbsSignatures(signatureData.filter((sig) => (new RegExp(/dbs/)).test(sig.signature.toLowerCase())));
          setIdSignatures(signatureData.filter((sig) => (new RegExp(/id/)).test(sig.signature.toLowerCase())));
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report]);

  const handleEditStart = (rowData: MutationSignatureType) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = useCallback((newData?: MutationSignatureType) => {
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
      const signatureIndex = newSignatures.findIndex((sig) => sig.ident === newData.ident);
      if (signatureIndex !== -1) {
        newSignatures[signatureIndex] = newData;
        setter(newSignatures);
      }
    }
    setEditData(null);
  }, [dbsSignatures, idSignatures, sbsSignatures]);

  const getImage = useCallback((key, isSmall) => {
    const image = images.find((img) => img.key === key);
    if (image) {
      return (
        <img
          src={`data:image/${image.format};base64,${image.data}`}
          alt={image.title}
          className={`mutation-signature__image ${isSmall ? 'mutation-signature__image--small' : ''}`}
        />
      );
    }
    return null;
  }, [images]);

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
          <div className="mutation-signature__images">
            {getImage('mutSignature.barplot.sbs', true)}
          </div>
          {showDialog && (
            <EditDialog
              editData={editData}
              isOpen={showDialog}
              onClose={handleEditClose}
              showErrorSnackbar={snackbar.error}
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
          <div className="mutation-signature__images">
            {getImage('mutSignature.barplot.dbs', false)}
          </div>
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
          <div className="mutation-signature__images">
            {getImage('mutSignature.barplot.indels', false)}
          </div>
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

export { MutationSignatureType };
