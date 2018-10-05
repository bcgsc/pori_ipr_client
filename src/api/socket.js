app.factory('api.socket', ['socketFactory', '$cookies', '$q',
  (socketFactory, $cookies, $q) => {
    let ready = false;

    const socket = socketFactory({
      ioSocket: io.connect(CONFIG.ENDPOINTS.SOCKET),
    });

    socket.on('connect', () => {
      socket.emit('authenticate', { token: $cookies.get('BCGSC_SSO') });
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
  }]);
