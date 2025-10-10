import express, {Application} from 'express';
import http, { Server } from 'http';
import {Server as IOServer} from 'socket.io';
import cors from 'cors';
import { PrismaClient } from './generated/prisma';

const newPrsm = new PrismaClient

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
        //    ЗАДАНИЕ - добавляем сокет в комнату (обработка в index.html)
            socket.join("room1")
            socket.join("admin")
            
            this.io.to("room1").emit("joinRoom_room1", "user was connected")

            this.io.except("admin").emit("update", "hello vsem!")
            // socket.leave('room1')

            console.log('connection',socket.id);
            
            socket.on("ping", (count) => {
                console.log(count);
            });


            socket.on('disconnect', () => {
            console.log('disconnect',socket.id)
        })
        socket.on('login', async (user_id: string) => {
                try{
                  const user = await newPrsm.user.upsert ({
                     where:  {user_id},
                     update: { online: true },
                     create: { user_id, online: true}
                  })
                  console.log("Пользователь зарегистрирован", user_id)

                  socket.broadcast.emit("userInfo", {
                    user_id: user.user_id,
                    online: user.online,
                    created_at: user.created_at
                  })
                } catch (err) {
                    console.log("Ошибка авторизации", err)
                }
            })
        socket.on('logout', async (user_id: string) => {
            try{
                const user = await newPrsm.user.update ({
                    where: {user_id},
                    data: {online: false}
                })
                console.log("Пользователь вышел", user_id)

                socket.broadcast.emit('userInfo', {
                    user_id: user.user_id,
                    online: user.online,
                    created_at: user.created_at
                })
            }catch (err) {
                console.log("Ошибка выхода", err)
            }
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