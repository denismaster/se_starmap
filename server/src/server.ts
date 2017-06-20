import * as _bodyParser from "body-parser";
import * as _express from "express";
import { Request, Response } from "express";
import * as _morgan from "morgan";
import { stars } from "./stars-repository";

import * as concaveHull from "concaveman";
export class Server {
    public readonly app: _express.Application;
    public readonly port: number;
    public readonly router: _express.Router;

    private pathToFiles = __dirname + "/../../client/";
    constructor(port?: number) {
        this.port = port || process.env.PORT || 1234;
        this.app = _express();
        this.router = _express.Router();
    }

    public useDefaultConfig(): Server {
        this.app.use(_bodyParser.json());
        this.app.use(_morgan("dev"));

        this.app.use(_express.static(this.pathToFiles));

        this.app.use("/api/stars", (request: Request, response: Response) => {
            response.end(JSON.stringify(stars));
        });

        this.app.use("/api/sectors", (request: Request, response: Response) => {
            const hull = concaveHull(stars.map((star) => [star.x, star.y]));
            const sectors = hull.map((res) => {
                return { x: res[0], y: res[1]};
            });
            response.end(JSON.stringify(sectors));
        });

        this.app.use("/", (request: Request, response: Response) => {
            response.sendFile("index.html", { root: this.pathToFiles });
        });

        this.app.use((error: any, request: Request, response: Response, next: any) => {
            response.status(500);
            console.error(error);
            response.end();
        });
        return this;
    }

    public run() {
        this.app.listen(this.port);
        console.log("Application started on port " + this.port);
    }
}
