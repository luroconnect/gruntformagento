# Gruntfile for Magento builds
Grunt file and other scripts needed to build Magento

Not as yet a node or grunt package

A Gruntfile.js that is very flexible and will work in different Magento development environments.
This file addresses the needs of both develpment and a production environment.
The script gives flexibility by reading 3 json files in successsion, allowing project and instance based overrides.

Create a directory "script" in the main Magento folder.
Ensure this file is excluded in your production hosting apache / nginx configuration file.

## Some useful tasks

dev : the main development task. Will update from scm (svn update or git pull) and run compass to compile.

optimize : minify css, uglify js and run imagemin on media/wyswyg. The modified versions are in separate directories skin.min, js.min and media.min

watch : production server watch to run optimize tasks

package : create a tar.gz for deployment based on a manifest json with a list of files to package.

release : take the packaged tar.gz and deploy on live server. A backup is taken before.

rollback : rollback a package by deploying from the backup
