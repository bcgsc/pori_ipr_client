/* generate-build-version.js */
/* credit to https://dev.to/flexdinesh/cache-busting-a-react-app-22lk */

const fs = require('fs');
const { version } = require('./package.json');

const jsonData = {
  version,
};

var jsonContent = JSON.stringify(jsonData);

fs.writeFile('./dist/meta.json', jsonContent, 'utf8', function(err) {
  if (err) {
    console.log('An error occured while writing JSON Object to meta.json');
    return console.log(err);
  }

  console.log('meta.json file has been saved with latest version number');
});
