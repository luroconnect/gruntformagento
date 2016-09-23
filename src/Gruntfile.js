function merge(target, source) {
    if (typeof target !== "object") {
        target = {};
    }
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            var sourceProperty = source[property];
            if (typeof sourceProperty === "object") {
                target[property] = merge(target[property], sourceProperty);
                continue;
            }
            target[property] = sourceProperty;
        }
    }
    for (var a = 2, l = arguments.length; a < l; a++) {
        merge(target, arguments[a]);
    }
    return target;
}

module.exports = function(grunt) {
    pkg = merge(grunt.file.readJSON("package.json"), grunt.file.readJSON("project.json"));
    if(grunt.option("me") !== undefined){
      pkg = merge(pkg, grunt.file.readJSON(grunt.option("me") + ".json"));
      pkg.me = grunt.option("me");
    }
    if(grunt.option("ver") !== undefined)
      version = grunt.option("ver");
    grunt.initConfig({
        pkg: pkg,
        copy: {
           js : {
             files : [
               {expand: true, 
                cwd: "../js/",
                src: ['**/*'],
                dest: "../<%= pkg.jsmin %>/",
               }
            ],
           },
           skin : {
             files : [
               {expand: true, 
                cwd: "../skin",
                src: ['**/*'],
                dest: "../<%= pkg.skinmin %>/",
               }
            ],
           },
        },
          
        imagemin: {
options: {                       // Target options
        optimizationLevel: 6,
        svgoPlugins: [{ removeViewBox: false }],
      },
            skin: {
                expand: true,
                cwd: "../skin/",
                src: [ "**/*.{png,jpg,gif}"],
                dest: "../<%= pkg.skinmin %>/",
            },
            media_wysiwyg: {
                expand: true,
                cwd: "../media/wysiwyg",
                src: [ "**/*.{png,jpg,gif}"],
                dest: "../media.min/wysiwyg",
            },
        },
        jslint: {
            skin: {
                expand: true,
                cwd: "../skin/",
                src: [ "**/*.js", "!**/*min.js"].concat('<%= pkg.xcssfiles %>'),
               options: {
                  errorsOnly : true,
               },
            },
            js: {
                expand: true,
                cwd: "../js/",
                src: [ "**/*.js", "!**/*min.js"].concat('<%= pkg.xjsfiles %>'),
            }
        },


        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            skin: {
                expand: true,
                cwd: "../skin/",
                src: [ "**/*.js", "!**/*min.js"].concat('<%= pkg.xjsfiles %>'),
                dest: "../<%= pkg.skinmin %>/",
                ext: ".js"
            },
            js: {
                expand: true,
                cwd: "../js/",
                src: [ "**/*.js", "!**/*min.js"].concat('<%= pkg.xjsfiles %>'),
                dest: "../<%= pkg.jsmin %>/",
                ext: ".js"
            }
        },
        csslint: {
          skin: {
            options: {
               "errors":true,
               "qualified-headings": false,
               "unique-headings": false,
             },
            files: [{
              expand: true,
              cwd: "../skin/",
              src: ['**/*.css', '!**/*min.css'].concat(pkg.xcssfiles),
            }],
          },
        },
        cssmin: {
          skin: {
            options: {
               shorthandCompacting: false,
               roundingPrecision: -1,
               debug:pkg.debug,
               verbose:true,
             },
            files: [{
              expand: true,
              cwd: "../skin/",
              src: ['**/*.css', '!**/*min.css'].concat(pkg.xcssfiles),
              dest: '../<%= pkg.skinmin %>/',
              ext: '.css'
            }],
          },
       },
        compass:{
            dev: {
              options: {
                sassDir: '../skin/frontend/<%= pkg.theme %>/default/scss',
                cssDir: '../skin/frontend/<%= pkg.theme %>/default/css'
              }
            }
        },
        watch:{
            sass:{
              files: ['**/*.scss', "**/*.js", "**/*.{png,jpg,gif}"],
              tasks: ['compass:dev', 'copy:skin', 'uglify:skin', 'cssmin:skin'],
              options: {
                spawn: true,
                interrupt: true,
                cwd: "../skin",
                interval:5007,
              },
            },
            skin: {
              files: ['**/*.css', "**/*.js", "**/*.{png,jpg,gif}"],
              tasks: ['copy:skin', 'uglify:skin', 'cssmin:skin'],
              options: {
                spawn: true,
                interrupt: true,
                cwd: "../skin",
                interval:5007,
              },
            },
            js: {
              files: ['**/*.js'],
              tasks: ['copy:js', 'uglify:js'],
              options: {
                spawn: true,
                interrupt: true,
                cwd: "../js",
                interval:5007,
              },
            },
            media_wysiwyg: {
              files: ["**/*.{png,jpg,gif}"],
              options: {
                spawn: true,
                interrupt: true,
                cwd: "../media/wysiwyg",
                interval:5007,
              },
            },
        },
        svn_fetch: {
          options: {
              'repository': '<%= pkg.baserepo %><%= pkg.name %>/<%= pkg.repobranch %>/',
              'path':'../',
              'svnOptions' : {'username':pkg.svnuser?pkg.svnuser:pkg.me}
          },
          dev: {
            map: {
              'scripts': 'scripts',
              'app': 'app',
              'lib': 'lib',
              'skin': 'skin',
              'js': 'js',
            },
          },
        },
       clean: {
          options : {
            'force' : true,
            'no-write': '<%= pkg.debug %>',
          },
          cache: ["../var/cache/*"],
          dorelease: {
            files : [
                 {expand:true, cwd:'..', src : ['<%= pkg.deletefiles %>'],
                 }
              ]
          },
          dorollback: {
            files : [
                 {expand:true, cwd:'..', src : ['<%= pkg.addfiles %>'],
                 }
              ]
          },
       },
       flushredis : {
         options : {
           'host' : '<%= pkg.redishost %>',
           'port' : '<%= pkg.redisport %>',
         },
         cache : {
         },
       },           
       shell: {
          reindex: {
            options : {
              execOptions : {
                cwd : "../shell"
              },
              stdout : true,
              stderr : true,
            },
            command : 'php indexer.php --reindexall',
          }
        },
       compress: {
            skinjs: {
               options: {
                     level: 9,
                     mode: 'gzip'
                   },
                expand: true,
                cwd: "../<%= pkg.skinmin %>/",
                src: [ "**/*.js"],
                dest: "../<%= pkg.skinmin %>/",
                ext: ".js.gz"

            },
            skincss: {
               options: {
                     level: 9,
                     mode: 'gzip'
                   },
                expand: true,
                cwd: "../<%= pkg.skinmin %>/",
                src: [ "**/*.css"],
                dest: "../<%= pkg.skinmin %>/",
                ext: ".css.gz"
            },
            js: {
               options: {
                     level: 9,
                     mode: 'gzip'
                   },

                expand: true,
                cwd: "../<%= pkg.jsmin %>/",
                src: [ "**/*.js"],
                dest: "../<%= pkg.jsmin %>/",
                ext: ".js.gz",
                extDot: 'last'

            },
            jsmin: {
               options: {
                     level: 9,
                     mode: 'gzip'
                   },

                expand: true,
                cwd: "../<%= pkg.jsmin %>/",
                src: [ "**/*.min.js"],
                dest: "../<%= pkg.jsmin %>/",
                ext: ".min.js.gz"

            },

          dopackage: {
            options : {
              "mode" : "tgz",
              "archive" : "install/<%= pkg.project %>-<%= pkg.ver %>.tar.gz",
              "level": 9,
            },
            files : [
                 {expand:true, cwd:'..', src : ['<%= pkg.files %>'].concat(['<%= pkg.addfiles %>']),
                 }
            ]
          },
          dorelease: {
            options : {
              "mode" : "tgz",
              "archive" : "backup/<%= pkg.project %>-backup-<%= pkg.ver %>.tar.gz",
              "level": 9,
            },
            files : [
                 {expand:true, cwd:'..', src : ['<%= pkg.files %>'].concat(['<%= pkg.deletefiles %>']),
                 }
            ]
          },
        },
       untar: {
          dorelease: {
            files : [
                 {src : ['install/<%= pkg.project %>-<%= pkg.ver %>.tar.gz'], dest : '../'
                 }
            ]
          },
          dorollback: {
            files : [
                 {src : ['backup/<%= pkg.project %>-backup-<%= pkg.ver %>.tar.gz'], dest : '../'
                 }
            ]
          },
        },
      cloudfront: {
        options: {
          region:'us-east-1', // your AWS region
          //credentials:grunt.file.readJSON('awscredentials.json'), // !!Load them from a gitignored file
          listInvalidations:true, // if you want to see the status of invalidations
          listDistributions:false, // if you want to see your distributions list in the console
        },
        dev: {
          options: {
                  distributionId: 'dsotn8l6s8krf',
                },
                CallerReference: Date.now().toString(),
                Paths: {
                  Quantity: 1,
                  Items: [ '/skin/frontend/default/blank/css/styles.css']
                }
        }
      },
    });
    grunt.loadNpmTasks("grunt-contrib-imagemin");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-autoprefixer");
    grunt.loadNpmTasks("grunt-contrib-compass");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-xmlpoke");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-csslint");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-untar');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-cloudfront');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.registerTask("default", "default", ["dev"]);
    
    if(pkg.scm == "svn"){
      grunt.loadNpmTasks('grunt-svn-fetch');
      scm_fetch_task = "svn_fetch";
    }else{
      grunt.loadNpmTasks('grunt-git');
      scm_fetch_task = "gitfetch";
    }
    grunt.loadTasks('tasks/redis');
    if(pkg.cachetype == "redis"){
      grunt.loadTasks('tasks/redis');
      cache_clean_task_list = [ "flushredis:cache" ];
    }
    else{
      cache_clean_task_list = [ "clean:cache" ];
    }
    dev_task_list = [ scm_fetch_task, "compass"];
    staging_task_list = ["watch", scm_fetch_task ];
    production_task_list = [ "watch", scm_fetch_task ];
    package_task_list = [ "compress" ];
    release_task_list = [ "untar" ];
    optimize_task_list = [ "copy:skin", "copy:js", "uglify:skin", "uglify:js", "cssmin:skin", "imagemin:skin", "compress:skinjs", "compress:skincss", "compress:js"]
    mediawysiwyg_task_list = ["imagemin:media_wysiwyg"];

    post_task_list = [];
    if(pkg.clearcache){
       post_task_list.push(cache_clean_task_list);
    }
    if(pkg.reindex){
       post_task_list.push("shell:reindex");
    }
    grunt.registerTask("dev", dev_task_list.concat(post_task_list));
    grunt.registerTask("staging", staging_task_list.concat(post_task_list));
    grunt.registerTask("optimize", optimize_task_list.concat(post_task_list));
    grunt.registerTask("media", mediawysiwyg_task_list.concat(post_task_list));
    grunt.registerTask("production", production_task_list.concat(post_task_list));
    grunt.registerTask("dopackage", package_task_list.concat(post_task_list));
    grunt.registerTask("dorelease", release_task_list.concat(post_task_list));
    grunt.registerTask("package", "Call dopackage if manifest file is readable", function(){
      if(grunt.option("ver") === undefined){
        grunt.log.writeln("package needs --ver parameter");
        return;
      }
      var manifest_file = "install/manifest." + grunt.option("ver") + ".json";
      if(!grunt.file.exists(manifest_file)){
        grunt.log.writeln("Cannot read " + manifest_file);
        return;
      }
      /* open manifest.ver.json file for our package */
      preparepkg = grunt.file.readJSON(manifest_file);
      /* files array is mandatory */
      if(preparepkg.files === undefined){
        grunt.log.writeln("manifest file needs files");
        return;
      }
      pkg.clearcache = preparepkg.clearcache;
      pkg.reindex = preparepkg.reindex;
      grunt.config.set('preparepkg', preparepkg);
      pkg.files = preparepkg.files;
      pkg.addfiles = preparepkg.addfiles;
      pkg.project = preparepkg.project;
      pkg.ver = preparepkg.version;
      grunt.task.run("compress:dopackage");
    });
    grunt.registerTask("release", "Call dorelease if manifest file is readable", function(){
      if(grunt.option("ver") === undefined){
        grunt.log.writeln("release needs --ver parameter");
        return;
      }
      var manifest_file = "install/manifest." + grunt.option("ver") + ".json";
      if(!grunt.file.exists(manifest_file)){
        grunt.log.writeln("cannot open " + manifest_file);
        return;
      }
      /* open manifest.ver.json file for our package */
      preparepkg = grunt.file.readJSON(manifest_file);
      /* files array is mandatory */
      if(preparepkg.files === undefined){
        grunt.log.writeln("manifest file needs files");
        return;
      }
      pkg.clearcache = preparepkg.clearcache;
      pkg.reindex = preparepkg.reindex;
      grunt.config.set('preparepkg', preparepkg);
      pkg.files = preparepkg.files;
      pkg.addfiles = preparepkg.addfiles;
      pkg.deletefiles = preparepkg.deletefiles;
      pkg.ver = preparepkg.version;
      pkg.project = preparepkg.project;
      /* first create a backup */
      grunt.task.run("compress:dorelease");
      /* delete files from the delete list */
      grunt.task.run("clean:dorelease");
      grunt.task.run("untar:dorelease");
      grunt.task.run(post_task_list);
    });
    grunt.registerTask("rollback", "Rollback a release manifest file is readable", function(){
      if(grunt.option("ver") === undefined){
        grunt.log.writeln("package needs --ver parameter");
        return;
      }
      var manifest_file = "install/manifest." + grunt.option("ver") + ".json";
      if(!grunt.file.exists(manifest_file)){
        grunt.log.writeln("Cannot read " + manifest_file);
        return;
      }
      /* open manifest.ver.json file for our package */
      preparepkg = grunt.file.readJSON(manifest_file);
      /* files array is mandatory */
      if(preparepkg.files === undefined){
        grunt.log.writeln("manifest file needs files");
        return;
      }
      pkg.clearcache = preparepkg.clearcache;
      pkg.reindex = preparepkg.reindex;
      grunt.config.set('preparepkg', preparepkg);
      pkg.files = preparepkg.files;
      pkg.addfiles = preparepkg.addfiles;
      pkg.project = preparepkg.project;
      pkg.ver = preparepkg.version;
      /* delete files from the add list */
      grunt.task.run("clean:dorollback");
      grunt.task.run("untar:dorollback");
      grunt.task.run(post_task_list);
    });

};
