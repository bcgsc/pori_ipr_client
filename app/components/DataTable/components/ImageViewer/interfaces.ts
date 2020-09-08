interface SelectedRow {
  image: ImageData,
}

interface ImageData {
  caption?: string | null,
  createdAt?: string,
  data: string,
  filename?: string,
  format: string,
  ident?: string,
  key: string,
  title?: string | null,
  updatedAt?: string | null,
}

export {
  ImageData,
  SelectedRow,
};
