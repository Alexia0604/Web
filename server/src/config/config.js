const config = {
  assetsUrl: '',
  audioUrl: '/Images',
  uploadUrl: 'http://localhost:5000',
  mongoUri: 'mongodb://localhost:27017/birdHub',
  cloudinary: {
    cloud_name: 'dwewebzrjv',
    api_key: '529725339895941',
    api_secret: 'wxxsk7K1a2Wf7vRX90EW83zE1H8',
    folder: {
      images: 'birds-images',
      audio: 'birds-audio'
    },
    base_url: 'https://res.cloudinary.com/dwewebzrjv'
  }
};

module.exports = config;