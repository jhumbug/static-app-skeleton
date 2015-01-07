# Static App

## Getting Started
Make sure you have [node.js](http://nodejs.org/) installed locally on your machine so that `npm` is available from your command line.

Install Grunt globally by running: 

```
npm install -g grunt-cli
```

## Initial Setup
Copy and rename the *.ftppass.sample* file to *.ftppass* and then in it point to the SSH keys on your machine for adultswimstaging and adultswimproduction (not the putty ppk's, the actual private keys). You can either pull those down from *aswim8jarvis1/srv/keys/[adultswimstaging/adutlswimproduction]* or get them from another dev if you don't already have them.

From the command line, run the following commands in order:

```
cd /path/to/repo
```

```
npm install
```

```
bower install
```

The project and all of its dependencies should now be installed and you can start using the grunt tasks to automate mundane shit. 


## Available Grunt Tasks
`grunt`, `grunt stage`, and `grunt deploy` will be probably your most commonly used tasks for day to day updates. But here's everything you can do:


### grunt
This will persistently watch (until you close/cancel the task) for any updates you make to *app/index.html*, compile the HTML, and FTP it up to [Staging](http://www.staging.adultswim.com/). Best for working on daily homepage content updates.
    
    

### grunt stage
This will compile the HTML, and FTP it up to [Staging](http://www.staging.adultswim.com/). This is the manual way to do what `grunt` and `grunt watch:staging` does for you automatically.
    
    

### grunt stage --all
This will compile all of the JS and CSS in addition to the HTML and FTP it up to [Staging](http://www.staging.adultswim.com/). 

### grunt stage --path=%YOUR_PATH%
Same as `grunt stage` except you can give it a path all of the compiled HTML, CSS, JS at [http://www.staging.adultswim.com/dev/homepage/%YOUR_PATH%](http://www.staging.adultswim.com/dev/homepage/pinchmytail). Good for branching features to an orphaned URL for people to test on staging.
    
    

### grunt deploy
This will compile the HTML, and FTP it up to [Production](http://www.adultswim.com/). This is what you can use for go lives.
    
    

### grunt deploy --all
This will compile all of the JS and CSS in addition to the HTML and FTP it up to [Production](http://www.adultswim.com/). Really only need to use this when there's a go live that involves changes to the JS and CSS of the homepage. Might be safer to run `grunt build` and then manually FTP the CSS or JS from the `dist` directory.
    
    

### grunt build
This is what gets called by `grunt stage` and `grunt deploy` to compile the HTML, JS, and CSS. It concatenates and minifies the JS automatically. All of the files get outputted to the *dist* directory. **(Only ever deploy/ftp files to the site from the *dist* directory, the *app* directory contains all of the uncompiled source. If you use any of the grunt stage/deploy tasks you'll never have to worry about that though.)**
    
    

### grunt dev
This is like `grunt stage --all` except it stages all of the compiled HTML, CSS, JS at [http://www.dev.adultswim.com/](http://www.dev.adultswim.com/). 
    
    

### grunt dev --path=%YOUR_PATH%
Same as `grunt dev` except you can give it a path all of the compiled HTML, CSS, JS at [http://www.dev.adultswim.com/%YOUR_PATH%](http://www.dev.adultswim.com/dev/homepage/pinchmytail). Good for branching features to a dev URL for people to test on staging.
    
    

### grunt serve
This will run a local server (at http://yo.adultswim.com) and persistently watch and livereload your browser (until you close/cancel the task) whenever you make changes to any html, js, or css in the app directory. Good for working on daily homepage content updates locally. Use `grunt serve:staging` for working daily homepage updates, otherwise you'll have to manually run `grunt stage` with this. This task is best for working on actual css and js updates locally.
    
    

### grunt serve:staging
Similar to `grunt serve` except this will only watch *app/index.html* and will also simultaneously FTP it up to [Staging](http://www.staging.adultswim.com/). This will run a local server (at http://yo.adultswim.com) and persistently watch and livereload your browser (until you close/cancel the task). Best for working on daily homepage content updates locally.