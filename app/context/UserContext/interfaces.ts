interface UserContextInterface {
  /** Can the current user make edits */
  canEdit: boolean;
  isAdmin?: boolean;
}

export default UserContextInterface;
