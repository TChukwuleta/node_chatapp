const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 5000
const directoryPath = path.join(__dirname, '../public')

app.use(express.static(directoryPath))

io.on('connection', (socket) => {
    console.log('New websocket connection')
    
    socket.on('join', (options, callback) => {
        const {error, user } = addUser({ id: socket.id, ...options })
        if (error){
            return callback(error)
        }
        socket.join(user.room)
        //socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit, socket.broadcast.to.emit
        socket.emit('theMessage', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('mank', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('Profane words is not allowed')
        }
        console.log(message)
        io.to(user.room).emit('message', generateMessage(user.username, message))   
        callback()
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        pee = io.to(user.room).emit('message', generateLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        io.to(user.room).emit('message', generateLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        console.log(pee)
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('meee', generateMessage('Admin', `${user.username} left the group`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})