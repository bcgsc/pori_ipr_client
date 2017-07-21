app.factory('api.socket', ['socketFactory', '$localStorage', '$q', function (socketFactory, $localStorage, $q) {

  let _ready = false;

  let myIoSocket = io.connect(CONFIG.ENDPOINTS.SOCKET);

  let socket = socketFactory({
    ioSocket: myIoSocket
  });

  socket.on('connect', function () {
    socket.emit('authenticate', {token: $localStorage.bcgscIprToken});
  });

  socket.on('authenticated', (msg) => {
    _ready = true;
    console.log('Socket.io successfully authenticated');
  });

  socket.on('disconnect', function () {
    console.log('Connection dropped.');
  });

  socket.ready = function () {
    return $q(function (resolve, reject) {
      (_ready) ? resolve() : reject();
    });
  };

  return socket;

}]);