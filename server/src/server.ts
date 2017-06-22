import * as _bodyParser from "body-parser";
import * as _express from "express";
import { Request, Response } from "express";
import * as _morgan from "morgan";
import { stars, Star } from './stars-repository';
import * as jwt from "express-jwt";
import * as concaveHull from "concaveman";
import { groupBy } from './group-by';
let Offset = require("polygon-offset");

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



        // this.router.use(jwt({ secret: 'superdupersecret that need to be saved anywhere else', strict:false}).unless({path: ["/token","/stars"]}));

        this.app.use(_express.static(this.pathToFiles));



        this.router.get("/stars", (request: Request, response: Response) => {
            response.end(JSON.stringify(stars));
        });

        this.router.get("/sectors", (request: Request, response: Response) => {

            const groups = groupBy(stars, t => t.sector)
                .map(group => {
                    return {
                        key: group.key,
                        values: groupBy(group.values, t => t.owner)
                    };
                })
            const sectors: { key:any, values:{ x:number,y:number}[] }[]=[];
            let offset = new Offset();
            for (let group of groups) {
                if (!group.key) continue;
                for(let subgroup of group.values)
                {
                    const hull = concaveHull(subgroup.values.map((star: Star) => [star.x, star.y]));
                    const sector = hull.map((res: number[]) => {
                        return { x: res[0], y: res[1] };
                    });
                    sectors.push({
                        key:subgroup.key, values:sector
                    });
                }
            }
            response.end(JSON.stringify(sectors));

        });


        this.app.use("/api", this.router);



        this.app.use((err: Error, req: Request, res: Response, next: _express.NextFunction) => {
            if (err.name === 'UnauthorizedError') {
                res.status(401).send('invalid token...');
                return;
            }
            res.status(500).send('Internal server error');
        });

        this.app.use("/", (request: Request, response: Response) => {
            response.sendFile("index.html", { root: this.pathToFiles });
        });

        return this;
    }

    public run() {
        this.app.listen(this.port);
        console.log("Application started on port " + this.port);
    }
}
