/*
 * grunt-flush-redis
 * https://github.com/yaymukund/grunt-flush-redis
 *
 * Copyright (c) 2012 Mukund Lakshman
 * Licensed under the MIT license.
 */

var redis = require('redis');

module.exports = function(grunt) {

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('flushredis', 'Flush a redis database.', function() {
    grunt.log.writeln('Flushing the redis database');
    var options = this.options({
      host: "localhost",
      port: '6379',
    });


    redisClient = redis.createClient(options.port, options.host)
    redisClient.on('error', function(err) {
      grunt.warn('Redis client, error: ' + err);
    });

    if (!this.data.keys) {
       this.data.keys = [];
    }
    if (this.data.keys.length === 0){
       redisClient.flushdb(this.async());
       grunt.log.ok('redis flush all');
    }else{
      grunt.log.writeln('Deleting keys...');
      var callbacks_left = this.data.keys.length;
      var delete_keys = function(key_pattern) {
        client.keys(key_pattern, function(err, keys){
          for (var n = 0; n < keys.length; n++) {
            grunt.verbose.writeln('Deleting: ' + keys[n]);
            client.del(keys[n]);
          }
          grunt.log.ok('Deleted ' + keys.length + ' keys on pattern: ' + key_pattern);
          if ((--callbacks_left) === 0) {
            client.quit();
            done();
          }
        });
      };

      for (var i = 0; i < this.data.keys.length; i++) {
        delete_keys(this.data.keys[i]);
      }
    }
  });
};
