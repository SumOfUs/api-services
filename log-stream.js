import zlib from 'zlib';
import winston from 'winston';
import winstonPapertrail from 'winston-papertrail';

winstonPapertrail.Papertrail;

exports.handler = (event, context, callback) => {
  const winstonPapertrail = new winston.transports.Papertrail({
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
    hostname: `support.sumofus.org-${process.env.AWS_STAGE}`,
    colorize: true,
  });

  const logger = new winston.Logger({
    transports: [winstonPapertrail],
  });

  const payload = new Buffer(event.awslogs.data, 'base64');

  zlib.gunzip(payload, (err, res) => {
    const parsed = JSON.parse(res.toString('utf8'));
    winstonPapertrail.on('connect', function() {
      parsed.logEvents.forEach(ev => {
        console.log('++++++++ Logging event here ++++++++');
        logger.info(ev.message);
      });

      logger.close();
      callback(null);
    });
  });
};
