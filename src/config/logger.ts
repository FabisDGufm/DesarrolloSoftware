import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

const transports: winston.transport[] = [
  new winston.transports.Console(),
];

const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
if (accessKey && secretKey) {
  transports.push(
    new CloudWatchTransport({
      logGroupName: 'DesarrolloSoftware',
      logStreamName: 'api-logs',
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      awsAccessKeyId: accessKey,
      awsSecretKey: secretKey,
    })
  );
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});

export default logger;
