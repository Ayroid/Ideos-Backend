import mongoose, { ConnectOptions } from "mongoose";
import logger from "../logger";
class Database {
  private uri: string;
  private options: ConnectOptions;

  constructor(uri: string, options?: ConnectOptions) {
    this.uri = uri;
    this.options = options || {};
  }

  async connect() {
    try {
      await mongoose.connect(this.uri, this.options);
      logger.info("Database Connected");
    } catch (error) {
      logger.error("Database Connection Error", error);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      logger.info("Database Disconnected");
    } catch (error) {
      logger.error("Database Disconnection Error", error);
    }
  }
}

export { Database };
