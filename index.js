"use strict";

/*
 *    ___               __           ___  _  ______
 *   / _ \___ ____  ___/ /__  __ _  / _ \/ |/ / __/
 *  / , _/ _ `/ _ \/ _  / _ \/  ' \/ // /    /\ \
 * /_/|_|\_,_/_//_/\_,_/\___/_/_/_/____/_/|_/___/
 *
 * Author: Sabri Haddouche <sabri@riseup.net>
 * Description: Little script that download and convert Alexa top 1 million websites CSV to RandomDNS-compatible format.
 *
 * This repository is a part of the RandomDNS project.
*/

let convertedDatas = [],
    data;
const request     = require('request'),
      fs          = require('fs'),
      unzip       = require('unzip'),
      csv2        = require('csv2'),
      through2    = require('through2');

console.log('[1/4] Downloading and parsing CSV...');
request.get('https://s3.amazonaws.com/alexa-static/top-1m.csv.zip')
  .pipe(unzip.Parse())
  .on('entry', (entry) => {
    entry.pipe(csv2())
         .pipe(through2({ objectMode: true }, (chunk, enc, callback) => {
            convertedDatas.push({
              d:  chunk[1], // Domain
              sd: [] // Subdomain(s)
            });
            process.stdout.write('[2/4] Added ' + convertedDatas.length + ' entries to the object\x1b[0G');
            callback();
          })).on('finish', () => {
            console.log('[2/4] Added ' + convertedDatas.length + ' entries to the object');

            console.log('[3/4] Converting object to JSON...');
            let convertedDatasJSON = JSON.stringify(convertedDatas);
            convertedDatas = null;

            // Build filename
            let filename = './Alexa-Top-1M-Websites-' + (new Date().getTime()) + '.json';

            console.log('[4/5] Writing JSON to file...');
            fs.writeFileSync(filename, convertedDatasJSON, 'utf8');

            console.log('[5/5] Done. File has been written here: ' + filename);
          });
  });
