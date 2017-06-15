import { Server } from './server';
class Startup {
    public static Main(): void {
        console.log("DiplomContentSystem LaTeX services");
        const server = new Server();
        server.useDefaultConfig().run();
    }
}
Startup.Main();