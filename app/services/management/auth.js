import Keycloak from 'keycloak-js';
import * as jwt from 'jsonwebtoken';
import { $http } from 'ngimport';

const externalGroups = ['clinician', 'collaborator', 'external analyst'];

const keycloak = Keycloak({
  'realm': window._env_.KEYCLOAK_REALM,
  'clientId': window._env_.KEYCLOAK_CLIENT_ID,
  'url': window._env_.KEYCLOAK_URL,
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
 * Gets the user object from the api
 */
const getUser = async (token) => {
  try {
    // Token passed on login
    if (token) {
      $http.defaults.headers.common.Authorization = token;
    }
    const resp = await $http.get(`${window._env_.API_BASE_URL}/user/me`);
    return resp.data;
  } catch (err) {
    return null;
  }
};

/**
 * Returns true if the user has been sucessfully authenticated and the token is valid
 */
const isAdmin = (user) => {
  try {
    return user.groups.some(group => group.name.toLowerCase() === 'admin');
  } catch {
    return false;
  }
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

const isExternalMode = (user) => {
  try {
    return user.groups.some(group => externalGroups.includes(group.name.toLowerCase()));
  } catch (err) {
    return true;
  }
};

const searchUsers = async (query) => {
  try {
    const resp = await $http.get(`${window._env_.API_BASE_URL}/user/search`, { params: { query } });
    return resp.data;
  } catch {
    return false;
  }
};

const login = async (referrerUri = null) => {
  setReferrerUri(referrerUri);

  const init = new Promise((resolve, reject) => {
    /* setting promiseType = native does not work for later functions inside the closure
       checkLoginIframe: true breaks for some users in chrome causing an infinite loop
       see: https://szoradi-balazs.medium.com/keycloak-login-infinite-loop-9005bcd9a915
    */
    const prom = keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
    });
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
    return null;
  } catch (err) {
    delete localStorage[CONFIG.STORAGE.KEYCLOAK];
    delete $http.headers.Authorization;
    return err;
  }
};

export {
  isAuthorized,
  isAdmin,
  login,
  logout,
  keycloak,
  getReferrerUri,
  setReferrerUri,
  getUser,
  getUsername,
  isExternalMode,
  searchUsers,
};
