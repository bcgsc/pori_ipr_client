/**
 * Factory for socket connections
 * @param {*} socketFactory {@link https://github.com/btford/angular-socket-io}
 * @param {*} $cookies {@link https://docs.angularjs.org/api/ngCookies/service/$cookies}
 * @param {*} $q {@link https://docs.angularjs.org/api/ng/service/$q}
 * @return {Object} Socket factory object
 */
function apiSocket(socketFactory, $cookies, $q) {
  let ready = false;

  const socket = socketFactory({
    ioSocket: io.connect(CONFIG.ENDPOINTS.SOCKET),
  });

  socket.on('connect', () => {
    socket.emit('authenticate', { token: $cookies.get(CONFIG.COOKIES.KEYCLOAK) });
  });

  socket.on('authenticated', () => {
    ready = true;
    console.log('Socket.io successfully authenticated');
  });

  socket.on('disconnect', () => {
    console.log('Connection dropped.');
  });

  socket.ready = () => {
    return $q((resolve, reject) => {
      if (ready) {
        resolve();
      }
      reject();
    });
  };

  return socket;
}

apiSocket.$inject = ['socketFactory', '$cookies', '$q'];

angular
  .module('bcgscIPR')
  .factory('api.socket', apiSocket);
