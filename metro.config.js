const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  'db', // For database files if needed
  'mp3',
  'wav',
  'ttf'
);

module.exports = config;