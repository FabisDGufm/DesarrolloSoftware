import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // logs en la terminal
    new winston.transports.Console(),
    // logs en CloudWatch
    new CloudWatchTransport({
      logGroupName: 'DesarrolloSoftware',
      logStreamName: 'api-logs',
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    })
  ]
});

export default logger;
