# Gruntfile for Magento builds
Grunt file and other scripts needed to build Magento

Not as yet a node or grunt package


## Installation

### Node Installation (skip this if node is already installed)
* On CentOS
```
sudo yum install nodejs npm --enablerepo=epel 
sudo yum -y install npm
sudo npm install -g grunt-cli
```
Verify node is running
```
node -v
```
### Installing and running optimization task
* create a directory called "scripts" in your Magento root
* Modify apache .htaccess or nginx configuration so scripts is not accesible from the web
* git clone this repo
* copy the contents of src directory in the clone to the scripts directory
```
cd scripts
npm install
grunt optimize
```
By default the following tasks are executed
* copy skin to skin.min
* copy js to js.min
* uglify skin to skin.min and js to js.min (js files)
* minify skin to skin.min (css files minifier)
* optimize images in skin to skin.min

> Note : all optimization leaves the original files intact in the skin, js and media directories

* Changing the magento admin settings to use the minified and optimized files
```
System->Configuration->Web
Change scope to store (2nd level)
Change base skin url to skin.min from skin, js.min from js
```

## Other features and tasks

The Gruntfile.js that is very flexible and will work in different Magento development environments.
This file addresses the needs of both develpment and a production environment.
The script gives flexibility by reading 3 json files in successsion, allowing project and instance based overrides.

### Some useful tasks

**optimize** : minify css, uglify js and run imagemin on media/wyswyg. The modified versions are in separate directories skin.min, js.min and media.min.

**dev** : the main development task. Will update from scm (svn update or git pull) and run compass to compile.

**watch** : watch skin, js, sass and media/wysiwyg directories and run sass or optimize

**package** : create a tar.gz for deployment based on a manifest json with a list of files to package.

**release** : take the packaged tar.gz and deploy on live server. A backup is taken before.

**rollback** : rollback a package by deploying from the backup

### Upcoming tasks and improvements
* sass build in theme relative directory that is configurable
* less build (for Magento 2)
* make tasks more developer friendly
* Improve documentation 
