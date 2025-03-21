import express from "express";
import proxy from "express-http-proxy";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const auth = proxy("http://localhost:8081");
const products = proxy("http://localhost:8082");
const orders = proxy("http://localhost:8083");

app.use("/api/v1/auth", auth);
app.use("/api/v1/products", products);
app.use("/api/v1/orders", orders);

const server = app.listen(8080, () => {
  console.log("Gateway is listening to port 8080");
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
