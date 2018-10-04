app.factory('api.socket', ['socketFactory', '$localStorage', '$q',
  (socketFactory, $cookies, $q) => {
    let _ready = false;

    const myIoSocket = io.connect(CONFIG.ENDPOINTS.SOCKET);

    const socket = socketFactory({
      ioSocket: myIoSocket,
    });

    socket.on('connect', () => {
      socket.emit('authenticate', { token: $cookies.get('BCGSC_SSO') });
    });

    socket.on('authenticated', () => {
      _ready = true;
      console.log('Socket.io successfully authenticated');
    });

    socket.on('disconnect', () => {
      console.log('Connection dropped.');
    });

    socket.ready = () => {
      return $q((resolve, reject) => {
        (_ready) ? resolve() : reject();
      });
    };

    return socket;
  }]);
