const getLocalToken = () => localStorage.getItem(
  `ngStorage-${CONFIG.STORAGE.KEYCLOAK}`,
);

export default getLocalToken;
