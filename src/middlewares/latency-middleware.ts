// src/middlewares/latency-middleware.ts
import type { Request, Response, NextFunction } from "express";
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const region = process.env.AWS_REGION;

if (!region) {
  throw new Error("AWS_REGION no está definida");
}

const cloudwatch = new CloudWatchClient({
  region: region
});
export const latencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
