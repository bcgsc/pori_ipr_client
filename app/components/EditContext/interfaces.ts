interface EditContextInterface {
  /** Can the current user make edits */
  canEdit: Boolean,
  /** Update current user edit status */
  setCanEdit: Function,
}

export {
  EditContextInterface,
};
