const path = require('path');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/background.js'),
  output: {
    filename: 'background.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
