/* jshint expr: true */

(function() {
  'use strict';

  var Manager = require('../lib/manager'),
      Model = require('../lib/model');

  describe('Manager', function () {
    describe('#constructor', function () {
      var inge;

      it('should create a new model-manager', function () {
        inge = new Manager('cid', __dirname + '/../config/models.json');
        inge.should.be.an.instanceOf(Manager);
      });

      it('should has all models', function () {
        inge.users.should.be.an.instanceOf(Model);
        inge.messages.should.be.an.instanceOf(Model);
        inge.authenticated.should.be.an.instanceOf(Model);
      });
    });
  });
}(this));
