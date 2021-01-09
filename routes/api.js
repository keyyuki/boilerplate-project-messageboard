'use strict';

module.exports = function (app) {
  
  app.use('/api/threads', require('./threads'));
    
  app.use('/api/replies', require('./replies'));

};
