app.factory('socket', ['socketFactory', (socketFactory) => {

  return socketFactory({
    ioSocket: io(CONFIG.ENDPOINTS.SOCKET)
  });
}]);