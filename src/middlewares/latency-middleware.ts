// src/middlewares/latency-middleware.ts
import type { Request, Response, NextFunction } from "express";
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const region = process.env.AWS_REGION;

const skipMetrics =
  process.env.CI === "true" ||
  process.env.DISABLE_CLOUDWATCH_METRICS === "1" ||
  !region;

const cloudwatch = region
  ? new CloudWatchClient({
      region,
    })
  : null;

export const latencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (skipMetrics || !cloudwatch) {
    next();
    return;
  }

  const start = Date.now();

  res.on("finish", async () => {
    const duration = Date.now() - start;

    try {
      await cloudwatch.send(new PutMetricDataCommand({
        Namespace: "ElPasillo/API",
        MetricData: [
          {
            MetricName: "Latency",
            Dimensions: [
              { Name: "Endpoint", Value: req.path },
              { Name: "Method", Value: req.method },
            ],
            Unit: "Milliseconds",
            Value: duration,
          }
        ]
      }));
    } catch (err) {
      console.error("Error enviando métrica:", err);
    }
  });

  next();
};
