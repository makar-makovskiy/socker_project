import express, {Application} from 'express';
import http, { Server } from 'http';
import {Server as IOServer} from 'socket.io'

class SocetServer {
    private app: Application
    private httpServer: Server
    private io: IOServer
    private readonly port: number = 3000

    constructor(port?: number){
        this.port = port || Number(process.env.PORT)
        this.app = express()
        this.httpServer = http.createServer(this.app)
        this.io = new IOServer(this.httpServer)

        this.configureRoutes()
        this.configureSocketEvents()
    }

    private configureRoutes() {
        this.app.get('/', (req, res) => res.send("Hello"))
    }

    private configureSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('connection',socket.id);
            socket.on('dissconnect', () => {
            console.log('dissconnect',socket.id);
        })
    })
 }

    public start() {
        this.httpServer.listen(
            this.port, 
            () => console.log(`Listening at: ${this.port}`)
        )
    }
  }

new SocetServer(3000).start()