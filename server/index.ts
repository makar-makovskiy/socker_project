import express, {Application} from 'express';
import http, { Server } from 'http';
import {Server as IOServer} from 'socket.io';
import cors from 'cors';

class SocketServer {
    private app: Application
    private httpServer: Server
    private io: IOServer
    private readonly port: number = 3000

    constructor(port?: number){
        this.port = port || Number(process.env.PORT)
        this.app = express()
        this.httpServer = http.createServer(this.app)
        this.io = new IOServer(this.httpServer, {
            cors: {
                origin: "*",
                methods: ['GET', "POST"]
            }
        })
        this.app.use(cors())

        this.configureRoutes()
        this.configureSocketEvents()
    }

    private configureRoutes() {
        this.app.get('/', (req, res) => res.send("Hello"))
    }

    private configureSocketEvents() {
        this.io.on('connection', (socket) => {
            console.log('connection',socket.id)
            
            socket.emit('server_message', "Добро пожаловать на сервер")
            
            socket.on("client_message", (client_message)=>{
            socket.broadcast.emit('server_message', "Пользователь подключился")
            console.log(`Сообщение от пользователя ${socket.id} - ${client_message}`)
            socket.broadcast.emit('server_message', `Пользователь ${socket.id} - ${client_message}`)
            })
            socket.on('disconnect', () => {
            console.log('disconnect',socket.id)
            socket.broadcast.emit('server_message', "Пользователь отключился")
            console.log(`Пользователь отключился ${socket.id}`)
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

new SocketServer(3000).start()