
/**
 *
 * @module grunt-develop
 * @author Edward Hotchkiss <edwardhotchkiss@me.com>
 * @description http://github.com/edwardhotchkiss/grunt-develop
 * @license MIT
 *
 */

'use strict';

module.exports = function(grunt) {

  var child
    , running = false
    , fs = require('fs')
    , util = require('util');

  // kills child process (server)
  grunt.event.on('develop.kill', function() {
    grunt.log.warn('kill process');
    child.kill('SIGHUP');
  });

  // starts server
  grunt.event.on('develop.start', function(filename, nodeArgs, args, env, cmd) {
    if (running) {
      return grunt.event.emit('develop.kill');
    }
    child = grunt.util.spawn({
      cmd: cmd,
      args: nodeArgs.concat([filename], args),
      opts: {
        stdio: 'inherit',
        env: env
      }
    }, function(error, result, code) {
      /* ---- */
    });
    running = true;
    grunt.event.emit('develop.started');
    grunt.log.ok(util.format('started application "%s".', filename));
    child.on('exit', function(code, signal) {
      running = false;
      if (signal !== null) {
        grunt.log.warn(util.format('application exited with signal %s',
          signal));
      } else {
        grunt.log.warn(util.format('application exited with code %s', code));
      }
      if ('SIGHUP' === signal ) {
        grunt.event.emit('develop.start', filename, nodeArgs, args, env, cmd);
      }
    });
  });

  // TASK. perform setup
  grunt.registerMultiTask('develop', 'init', function() {
    var done
      , filename = this.data.file
      , nodeArgs = this.data.nodeArgs || []
      , args = this.data.args || []
      , env = this.data.env || process.env || {}
      , cmd = this.data.cmd || process.argv[0];
    if (!grunt.file.exists(filename)) {
      grunt.fail.warn(util.format('application file "%s" not found!', filename));
      return false;
    }
    done = this.async();
    grunt.event.emit('develop.start', filename, nodeArgs, args, env, cmd);
    done();
  });

  process.on('exit', function() {
    if (running) {
      child.kill('SIGINT');
    }
  });

};
