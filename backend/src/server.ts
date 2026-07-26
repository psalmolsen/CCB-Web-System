import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import routes from "./routes/index.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import config from "./config/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN || true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "Backend is running", data: null });
});

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const port = config.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
