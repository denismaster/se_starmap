import * as _express from "express";
import * as _bodyParser from "body-parser";
import * as _morgan from "morgan";
import { Request, Response } from "express"
import { stars } from './stars-repository';

let alphaShape = require("alpha-shape");
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

        this.app.use(_express.static(this.pathToFiles))

        this.app.use("/api/stars", (request: Request, response: Response) => {
            response.end(JSON.stringify(stars));
        });

        this.app.use("/api/sectors", (request: Request, response: Response) => {
            let hull = alphaShape(0.0085, stars.map(star => [star.x, star.y]))
            let sectors = [];
            for (let i = 0; i < hull.length; ++i) {
                const cell = hull[i];
                let sector = [];
                for (let j = 0; j < cell.length; ++j) {
                    let p = stars[cell[j]]
                    let q = stars[cell [(j+1)%cell.length]]
                    sector.push(p);
                    sector.push(q);
                }
                sectors.push(sector);
            }
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