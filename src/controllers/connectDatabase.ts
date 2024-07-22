import mongoose, { ConnectOptions } from "mongoose";

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
      console.log("Database connected");
    } catch (error) {
      console.log("Database Connection Error", error);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log("Database disconnected");
    } catch (error) {
      console.log("Database disconnection Error", error);
    }
  }
}

export { Database };
