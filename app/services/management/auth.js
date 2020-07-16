import Keycloak from 'keycloak-js';
import * as jwt from 'jsonwebtoken';
import { $http } from 'ngimport';

const externalGroups = ['clinician', 'collaborator', 'external analyst'];

const keycloak = Keycloak({
  'realm': CONFIG.SSO.REALM,
  'clientId': CONFIG.SSO.CLIENT,
  'url': CONFIG.ENDPOINTS.KEYCLOAK,
});

const getReferrerUri = () => localStorage.getItem(CONFIG.STORAGE.REFERRER);

const setReferrerUri = (uri) => {
  if (uri === null) {
    localStorage.removeItem(CONFIG.STORAGE.REFERRER);
  } else {
    localStorage.setItem(CONFIG.STORAGE.REFERRER, uri);
  }
};

/**
 * Checks expiry date on JWT token and compares with current time.
 */
const isExpired = (token) => {
  try {
    const expiry = jwt.decode(token).exp;
    return !Number.isNaN(expiry) && (expiry * 1000) < (new Date()).getTime();
  } catch (err) {
    return false;
  }
};

/**
 * Checks that the token is formatted properly and can be decoded
 */
const validToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return !!decoded;
  } catch (err) {
    return false;
  }
};

/**
 * Returns true if the user has been sucessfully authenticated and the token is valid
 */
const isAuthorized = (authorizationToken) => {
  const token = authorizationToken || keycloak.token;

  if (token) {
    // check that the token is not expired
    return Boolean(validToken(token) && !isExpired(token));
  }
  return false;
};

/**
 * Primarily used for display when logged in
 */
const getUsername = ({ authorizationToken }) => {
  if (authorizationToken) {
    return jwt.decode(authorizationToken).preferred_username;
  }
  return null;
};

/**
 * Gets the user object from the api
 */
const getUser = async () => {
  try {
    const resp = await $http.get(`${CONFIG.ENDPOINTS.API}/user/me`);
    return { user: resp.data, admin: resp.data.groups.some(({ name }) => name === 'admin') };
  } catch (err) {
    return null;
  }
};

const isExternalMode = ({ authorizationToken }) => {
  try {
    return Boolean(
      getUser({ authorizationToken }).groups
        .find(group => externalGroups.includes(group.name.toLowerCase())),
    );
  } catch (err) {
    return false;
  }
};

const login = async (referrerUri = null) => {
  setReferrerUri(referrerUri);

  const init = new Promise((resolve, reject) => {
    const prom = keycloak.init({ onLoad: 'login-required' }); // setting promiseType = native does not work for later functions inside the closure
    prom.success(resolve);
    prom.error(reject);
  });
  await init;
};

const logout = async () => {
  try {
    await keycloak.init();
    delete localStorage[CONFIG.STORAGE.KEYCLOAK];
    await keycloak.logout({
      redirectUri: window.location.uri,
    });
  } catch (err) {
    delete localStorage[CONFIG.STORAGE.KEYCLOAK];
    delete $http.headers.Authorization;
    return err;
  }
};

export {
  isAuthorized,
  login,
  logout,
  keycloak,
  getReferrerUri,
  setReferrerUri,
  getUser,
  getUsername,
  isExternalMode,
};
