import React from 'react';
import { ColDef } from '@ag-grid-community/core';
import Image, { ImageType } from '@/components/Image';
import { formatDate } from '@/utils/date';

const ImageCellRenderer = ({ data }: { data: { image?: ImageType; data?: string; format?: string; filename?: string } }) => {
  if (data?.image) {
    return <Image image={data.image} height={80} isZoomable />;
  }
  if (data?.data) {
    const inferredFormat = data.format ?? (data.filename?.split('.').pop() ?? 'png');
    const image: ImageType = {
      ident: '',
      key: data.filename ?? '',
      data: data.data,
      format: inferredFormat,
      caption: '',
      title: '',
    } as ImageType;
    return <Image image={image} height={80} isZoomable />;
  }
  return null;
};

const columnDefs: ColDef[] = [
  {
    field: 'ident',
    hide: true,
  },
  {
    headerName: 'Title',
    field: 'title',
  },
  {
    headerName: 'Version',
    field: 'version',
  },
  {
    headerName: 'Filename',
    field: 'filename',
  },
  {
    headerName: 'Report ID',
    field: 'reportId',
    minWidth: 100,
    cellRenderer: ({ data }) => data.reportId ?? '(default legend image)',
  },
  {
    headerName: 'Image',
    cellRenderer: ImageCellRenderer,
    autoHeight: true,
    minWidth: 200,
    flex: 1,
    sortable: false,
  },
  {
    headerName: 'Format',
    field: 'format',
  },
  {
    headerName: 'Caption',
    field: 'caption',
    wrapText: true,
  },
  {
    headerName: 'Updated By',
    field: 'updatedBy',
    minWidth: 110,
  },
  {
    headerName: 'Created',
    valueGetter: ({ data }) => formatDate(data.createdAt),
    minWidth: 90,
  },
  {
    headerName: 'Updated',
    valueGetter: ({ data }) => formatDate(data.updatedAt),
    minWidth: 90,
  },
  {
    headerName: 'Deleted',
    valueGetter: ({ data }) => (data.deletedAt ? formatDate(data.deletedAt) : ''),
    minWidth: 90,
  },
  {
    headerName: 'Actions',
    cellRenderer: 'ActionCellRenderer',
    pinned: 'right',
    sortable: false,
    suppressMenu: true,
  },
];

export default columnDefs;
