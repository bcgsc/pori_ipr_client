/* global CONFIG */
import Keycloak from 'keycloak-js';
import jwtDecode from 'jwt-decode';

const keycloak = new Keycloak({
  realm: window._env_.KEYCLOAK_REALM,
  clientId: window._env_.KEYCLOAK_CLIENT_ID,
  url: window._env_.KEYCLOAK_URL,
});

/**
 * Get and Set referrerUri is for when KeyCloak redirects on init when a direct report is accessed
 */
const getReferrerUri = () => sessionStorage.getItem(CONFIG.STORAGE.REFERRER);
const setReferrerUri = (uri) => {
  if (uri === null) {
    sessionStorage.removeItem(CONFIG.STORAGE.REFERRER);
  } else {
    sessionStorage.setItem(CONFIG.STORAGE.REFERRER, uri);
  }
};

/**
 * Checks expiry date on JWT token and compares with current time.
 */
const isExpired = (token) => {
  try {
    const expiry = jwtDecode(token).exp;
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
    const decoded = jwtDecode(token);
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
    return jwtDecode(authorizationToken).preferred_username;
  }
  return null;
};

const login = async (referrerUri = null) => {
  setReferrerUri(referrerUri);

  /* setting promiseType = native does not work for later functions inside the closure
  checkLoginIframe: true breaks for some users in chrome causing an infinite loop
  see: https://szoradi-balazs.medium.com/keycloak-login-infinite-loop-9005bcd9a915
  */
  if (keycloak.authenticated === undefined) {
    await keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
    });
  } else {
    try {
      await keycloak.updateToken(Number.MAX_SAFE_INTEGER);
    } catch (e) {
      console.error(e);
    }
  }
};

const logout = async () => {
  try {
    delete localStorage[CONFIG.STORAGE.KEYCLOAK];
    await keycloak?.logout({
      redirectUri: window.location.uri,
    });
    return null;
  } catch (err) {
    delete localStorage[CONFIG.STORAGE.KEYCLOAK];
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
  getUsername,
};
