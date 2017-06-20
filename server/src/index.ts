import { Server } from "./server";
class Startup {
    public static Main(): void {
        console.log("Mass Space Star map server");
        const server = new Server();
        server.useDefaultConfig().run();
    }
}
Startup.Main();
