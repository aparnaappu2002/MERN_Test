import express, { Express, urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectMongo } from "./framework/database/databaseConnection/dbConnection";
import http from "http";
import { UserRoute } from "./framework/routes/userRoute";


export class App {
  private app: Express;
  private database: connectMongo;
  private server: http.Server;
  private userRoute: UserRoute
  constructor() {
    dotenv.config();
    this.app = express();
    this.database = new connectMongo();
    this.server = http.createServer(this.app);
    this.userRoute = new UserRoute();

    this.database.connectDb();
    this.setMiddlewares();
    this.setUserRoutes()
    
  }
  private setMiddlewares() {
    this.app.use(
      cors({
        origin: process.env.ORIGIN,
        credentials: true,
      })
    );
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(morgan("dev"));
  }

  private setUserRoutes() {
    this.app.use("/users", this.userRoute.userRoute);
  }

  
  public listen() {
    const port = process.env.PORT;
    this.server.listen(port, () => console.log(`server running on ${port}`));
  }
}

const app = new App()
app.listen()
