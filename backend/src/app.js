import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";

const app = express();




app.use(cors({ origin: env.corsOrigins }));
app.use(express.json());

app.use(routes);

app.use(notFound);
app.use(errorHandler);

export default app;
