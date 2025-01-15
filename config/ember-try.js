/* jshint node: true */
module.exports = {
  useYarn: true,
  scenarios: [
    {
      name: 'ember-data-release',
      npm: {
        devDependencies: {
          'ember-data': '2.5.0'
        }
      }
    }
  ]
};
