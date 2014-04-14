(function(sandbox) {
  'use strict';

  describe('Model service', function() {
    var Model;

    beforeEach(function() {
      sandbox.module('client.services.Model');
      sandbox.inject(function(_Model_) {
        Model = _Model_;
      });
    });

    it('should instantiates a new Model', function() {
      var name = 'users',
          users = new Model(name, {});
      expect(users).toBeDefined();
      expect(users.name).toEqual(name);
    });
  });
}(this));
