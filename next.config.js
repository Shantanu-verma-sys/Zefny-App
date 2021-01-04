const withPlugins = require('next-compose-plugins');
const withPrefresh = require('@prefresh/next');
const withPreact = require('next-plugin-preact');
const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
module.exports = withPlugins(
    [
        [withPreact, { /* plugin config here ... */ }],
        [withPWA, {}],
    ], {
        images: {
            domains: ['lh3.googleusercontent.com'],
        },
        pwa: {
            dest: 'public',
            runtimeCaching,
        }
    }
);