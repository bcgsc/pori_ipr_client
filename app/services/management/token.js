const getLocalToken = () => {
  const token = localStorage.getItem(
    `ngStorage-${CONFIG.STORAGE.KEYCLOAK}`,
  );
  return token.replace(/"/g, '');
};

export default getLocalToken;
