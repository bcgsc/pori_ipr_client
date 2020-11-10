interface EditContextInterface {
  /** Can the current user make edits */
  canEdit: boolean,
  /** Update current user edit status */
  setCanEdit: (arg0: boolean) => void,
}

export default EditContextInterface;
