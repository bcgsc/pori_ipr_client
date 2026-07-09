import React, {
  useState, useEffect, useCallback,
} from 'react';
import { CircularProgress } from '@mui/material';
import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import columnDefs from './columnDefs';
import AddEditPathwayLegend, { PathwayLegendRecord } from './components/AddEditPathwayLegend';

// Pathway Legends admin view — modeled on the Appendices admin view.
//
// Global legend endpoints (DEVSU-2310):
//   GET    /legend               — list all legend records
//   POST   /legend               — multipart upload (fields: name, default; file under any key)
//   GET    /legend/:ident
//   PUT    /legend/:ident        — update (name, default, replace image)
//   DELETE /legend/:ident?force=true

function PathwayLegends(): JSX.Element {
  const [legends, setLegends] = useState<PathwayLegendRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingData, setEditingData] = useState<PathwayLegendRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    const getLegends = async () => {
      try {
        const resp = await api.get('/legend').request();
        if (resp && !cancelled) {
          setLegends(resp);
        }
      } catch (err) {
        snackbar.error(`Network error: ${err}`);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    getLegends();
    return () => { cancelled = true; };
  }, []);

  const handleOnEdit = useCallback((rowData: PathwayLegendRecord) => {
    setEditingData(rowData);
    setIsEditing(true);
  }, []);

  const handleOnAdd = useCallback(() => {
    setIsAdding(true);
  }, []);

  const handleOnDelete = useCallback(async (rowData: PathwayLegendRecord) => {
    try {
      await api.del(`/legend/${rowData.ident}?force=true`, {}, {}).request();
      setLegends((prev) => prev.filter((l) => l.ident !== rowData.ident));
      snackbar.success('Pathway legend deleted');
    } catch (err) {
      snackbar.error(`Error deleting pathway legend: ${err}`);
    }
  }, []);

  const handleAddClose = useCallback((newData?: PathwayLegendRecord) => {
    if (newData) {
      setLegends((prev) => [...prev, newData]);
    }
    setIsAdding(false);
  }, []);

  const handleEditClose = useCallback((nextData?: PathwayLegendRecord) => {
    if (nextData) {
      setLegends((prev) => prev.map((l) => (l.ident === nextData.ident ? nextData : l)));
    }
    setIsEditing(false);
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <>
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
    </>
  );
}

export default PathwayLegends;
