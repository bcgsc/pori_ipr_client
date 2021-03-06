interface EditContextInterface {
  /** Can the current user make edits */
  canEdit: boolean;
  /** Update current user edit status */
  setCanEdit: (newValue: boolean) => void;
}

export default EditContextInterface;
