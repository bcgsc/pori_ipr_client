import React, {
  useEffect, useState, useContext, useCallback,
} from 'react';
import orderBy from 'lodash/orderBy';
import { useQueryClient } from 'react-query';
import { Typography } from '@mui/material';

import DemoDescription from '@/components/DemoDescription';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import api, { ApiCallSet } from '@/services/api';
import useApiError from '@/hooks/useApiError';
import { unwrapSettled } from '@/utils/settleApiCalls';
import ImageType from '@/components/Image/types';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { MutationSignatureType } from '@/common';

import EditDialog from './components/EditDialog';
import columnDefs from './columnDefs';

import './index.scss';

const imageKeys = [
  'mutSignature.barplot.dbs',
  'mutSignature.barplot.indels',
  'mutSignature.barplot.sbs',
];

type MutationSignaturesProps = WithLoadingInjectedProps;

const MutationSignatures = ({
  isLoading,
  setIsLoading,
}: MutationSignaturesProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useReport();
  const [images, setImages] = useState<ImageType[]>([]);
  const [sbsSignatures, setSbsSignatures] = useState<MutationSignatureType[]>([]);
  const [dbsSignatures, setDbsSignatures] = useState<MutationSignatureType[]>([]);
  const [idSignatures, setIdSignatures] = useState<MutationSignatureType[]>([]);

  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState<MutationSignatureType | null>();
  const queryClient = useQueryClient();

  const { reportError } = useApiError();

  useEffect(() => {
    if (report && report.ident) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/image/retrieve/${imageKeys.join(',')}`),
            api.get(`/reports/${report.ident}/mutation-signatures`),
          ]);
          // The signature tables must still render when the plots 404
          const [imageData = [], signatureData = []] = unwrapSettled<[ImageType[], MutationSignatureType[]]>(
            await apiCalls.request(true) as PromiseSettledResult<unknown>[],
            ['Failed to load mutation signature plots', 'Failed to load mutation signatures'],
            reportError,
          );
          setImages(imageData);
          setSbsSignatures(signatureData.filter((sig) => !(/dbs|id/).test(sig.signature.toLowerCase())));
          setDbsSignatures(signatureData.filter((sig) => (/dbs/).test(sig.signature.toLowerCase())));
          setIdSignatures(signatureData.filter((sig) => (/id/).test(sig.signature.toLowerCase())));
        } catch (err) {
          reportError('Failed to load mutation signatures', err);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report, setIsLoading, reportError]);

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
      queryClient.refetchQueries({
        queryKey: [`/reports/${report.ident}/mutation-signatures`],
      });
    }
    setEditData(null);
  }, [dbsSignatures, idSignatures, queryClient, report.ident, sbsSignatures]);

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
      {!isLoading && (
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
      )}
    </div>
  );
};

export default withLoading(MutationSignatures);
