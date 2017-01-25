"use strict";

var fs = require('fs');
var path = require('path');

/**
 * Webpack plugin. Replaces publicPath in emitted webpack manifest file with a given variable name.
 *
 * Useful when you don't want to specify static output:publicPath at webpack build stage but set it on the client side.
 * Plugin modifies webpack result manifest file and replaces the static publicPath string with variable reference provided.
 *
 * Plugin runs on 'after-emit' webpack stage.
 *
 * Uses options.output.publicPath to determine what to replace. Make sure to use such placeholder that
 * nothing else in the code gets replaced. A real publicPath would make sence.
 *
 * @param {object} options:
 *          {
 *              externalGlobal: 'window.some.external.global',
 *              chunkName: 'manifestChunkName_usuallyJust_manifest_or_webpack'
 *          }
 *
 * @class
 */
function DynamicPublicPathPlugin(options) {
    this.options = options;
}

/**
 *
 * @param compiler - comes from webpack
 */
DynamicPublicPathPlugin.prototype.apply = function(compiler) {

    if(this.options.externalGlobal && this.options.chunkName) {
        compiler.plugin('after-emit', (compilation, callback) => {

            var publicPathToReplace,
                chunk,
                jsfile,
                manifestAsset,
                filePath;

            //get path to file to open
            publicPathToReplace = compilation.options.output.publicPath;

            chunk = compilation.chunks.find((chunk)=>{
                return chunk.name === this.options.chunkName;
            });

            jsfile = chunk.files.find((file)=>{
                return file.match(/.*\.js$/);
            });

            manifestAsset = compilation.assets[jsfile];

            _log('attempting to modify: '+manifestAsset);


            //open file
            filePath = path.resolve(manifestAsset.existsAt);

            fs.exists(filePath, (exists) => {
                if (exists) {
                    fs.readFile(filePath, 'utf8', (err, data) => {
                        if (err) {
                            _log('fs read error (' + err + ')');
                            callback();
                            return;
                        }

                        //change contents
                        var result = data.replace('"' + publicPathToReplace + '"', this.options.externalGlobal);

                        //save file
                        fs.writeFile(filePath, result, 'utf8', (err) => {
                            if (err) {
                                _log('fs write error (' + err + ')');
                            } else {
                                _log('replaced publicPath');
                            }

                            callback();
                        });
                    });
                } else {
                    _log('could not find file (' + filePath + ')');
                    callback();
                }
            });
        });
    }else{
        _log('some param missing: ');
        console.log('    [mandatory] externalGlobal - name of global var you want to use as publicPath');
        console.log('    [mandatory] chunkName - name of chunk you expect the manifest (webpack file) to be in (can be found in your CommonsChunkPlugin setup)');
    }
};

function _log(msg){
    console.log('-------- Dynamic Public Path Plugin: '+msg);
}

module.exports = DynamicPublicPathPlugin;
