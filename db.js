const mongoose  = require('mongoose');

let connectDB = () => {
  // Connect to DB
  var connectionOptions = {
    useNewUrlParser: true,
    connectTimeoutMS: 300000, // 5 minutes
    keepAlive: 120,
    ha: true, // Make sure the high availability checks are on
    haInterval: 10000, // Run every 10 seconds
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true
  };
  //mongoose.set('debug', true);
  mongoose.connect(process.env.DB, connectionOptions, function (err) {
    if (err) logger.info(err);
  });
  mongoose.connection.on('connecting', function () {
    logger.info('Connecting to MongoDB...');
  });
  mongoose.connection.on('connected', function () {
    logger.info('MongoDB connected!');
  });
  mongoose.connection.on('open', function () {
    logger.info('MongoDB connection opened!');
  });
  mongoose.connection.on('error', function (err) {
    logger.info(err);
    mongoose.disconnect();
  });
  mongoose.connection.on('disconnected', function () {
    logger.info('MongoDB disconnected!');
    mongoose.connect(process.env.DB, connectionOptions, function (err) {
        if (err) logger.info(err);
    });
  });
  mongoose.connection.on('reconnected', function () {
    logger.info('MongoDB reconnected!');
  });
  mongoose.connection.on('close', function () {
    logger.info('MongoDB closed');
  });
}

module.exports = connectDB