import React, {
  useState, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import { useQueryClient, useMutation } from 'react-query';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import { useLegendAll } from '@/queries/get';
import { queryKeys } from '@/queries/queryKeys';
import columnDefs from './columnDefs';
import AddEditPathwayLegend, { PathwayLegendRecord } from './components/AddEditPathwayLegend';

// Pathway Legends admin view — modeled on the Variant Text admin view.
//
// Global legend endpoints (DEVSU-2310):
//   GET    /legend               — list all legend records (via useLegendAll)
//   POST   /legend               — multipart upload (fields: name, default; file under any key)
//   GET    /legend/:ident
//   PUT    /legend/:ident        — update (name, default, replace image)
//   DELETE /legend/:ident?force=true

const deleteLegend = async (rowData: PathwayLegendRecord) => api.del(`/legend/${rowData.ident}?force=true`, {}, {}).request();

function PathwayLegends(): JSX.Element {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingData, setEditingData] = useState<PathwayLegendRecord | null>(null);
  const queryClient = useQueryClient();

  const { data: legends = [], isLoading } = useLegendAll<PathwayLegendRecord[]>({
    onError: () => snackbar.error('Error: failed to get pathway legends.'),
  });

  const legendDeleteMutation = useMutation({
    mutationFn: deleteLegend,
    onSuccess: () => {
      snackbar.success('Pathway legend deleted');
      queryClient.invalidateQueries(queryKeys.legend.all());
    },
    onError: (err) => snackbar.error(`Error deleting pathway legend: ${err}`),
  });

  const handleOnEdit = useCallback((rowData: PathwayLegendRecord) => {
    setEditingData(rowData);
    setIsEditing(true);
  }, []);

  const handleOnAdd = useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleOnDelete = useCallback((rowData: PathwayLegendRecord) => {
    legendDeleteMutation.mutate(rowData);
  }, [legendDeleteMutation]);

  // The dialog performs the POST/PUT itself; refetch so the `default` flag the
  // API may have flipped on *other* rows is reflected here too.
  const handleAddClose = useCallback((newData?: PathwayLegendRecord) => {
    if (newData) {
      queryClient.invalidateQueries(queryKeys.legend.all());
    }
    setIsAdding(false);
  }, [queryClient]);

  const handleEditClose = useCallback((nextData?: PathwayLegendRecord) => {
    if (nextData) {
      queryClient.invalidateQueries(queryKeys.legend.all());
    }
    setIsEditing(false);
  }, [queryClient]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <section style={{ height: '100%', overflowY: 'auto' }}>
      <DataTable
        columnDefs={columnDefs}
        rowData={legends}
        titleText="Pathway Legends"
        canAdd
        onAdd={handleOnAdd}
        addText="Upload Pathway Legend"
        canEdit
        onEdit={handleOnEdit}
        canDelete
        onDelete={handleOnDelete}
      />
      <AddEditPathwayLegend
        isOpen={isAdding}
        onClose={handleAddClose}
      />
      <AddEditPathwayLegend
        isOpen={isEditing}
        editData={editingData}
        onClose={handleEditClose}
      />
    </section>
  );
}

export default PathwayLegends;
