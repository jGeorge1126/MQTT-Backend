const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')

const app = express()
const mqtt = require('mqtt')
const { Command } = require('commander')

const program = new Command()

app.use(cors())

const server = http.createServer(app)

const io = socketIo(server, {
  cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
})

program
  .option('-p, --protocol <type>', 'connect protocol: mqtt, mqtts, ws, wss. default is mqtt', 'mqtt')
  .parse(process.argv)
  const host = '101.37.148.19'
  const mqttport = '1883'
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
  
  // connect options
  const OPTIONS = {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: 'serverclient',
    password: 'password',
    reconnectPeriod: 1000,
  }
  // protocol list
  const PROTOCOLS = ['mqtt', 'mqtts', 'ws', 'wss']
  
  // default is mqtt, unencrypted tcp connection
  // let connectUrl = `ws://${host}:${port}`
  let connectUrl = `mqtt://${host}:${mqttport}`
  if (program.protocol && PROTOCOLS.indexOf(program.protocol) === -1) {
    console.log('protocol must one of mqtt, mqtts, ws, wss.')
  } else if (program.protocol === 'mqtts') {
    // mqtts， encrypted tcp connection
    connectUrl = `mqtts://${host}:8883`
  } else if (program.protocol === 'ws') {
    // ws, unencrypted WebSocket connection
    const mountPath = '/mqtt' // mount path, connect emqx via WebSocket
    connectUrl = `ws://${host}:8083${mountPath}`
  } else if (program.protocol === 'wss') {
    // wss, encrypted WebSocket connection
    const mountPath = '/mqtt' // mount path, connect emqx via WebSocket
    connectUrl = `wss://${host}:8084${mountPath}`
    
  } else {}
  
  // const Topic = 'TEST-999666'
  const Topic = 'TEST-999666'
  const client = mqtt.connect(connectUrl, OPTIONS)
  
// Listening for a connection on the socket.io server

io.on('connection', (socket)=>{
  console.log('a user connected');
  // the moment i get a connection, i want to send a welcome message
  socket.on('join', ({name, room})=>{
    socket.emit('message', {user:'admin', text:`${name}, You're welcome!`})
    socket.broadcast.emit('message', {user:'admin', text:`${name}, just joined`})
    console.log('welcome message')
  })

  socket.on('sendMessage', (message)=>{
    io.emit('message', {user:'user', text:message})
  })

  socket.on("disconnect", ()=>{
    console.log("disconnect");
    io.emit('message', {user:'admin', text:`user Just left!`})
  })
  client.on('connect', mqtt_connect);
  client.on('reconnect', mqtt_reconnect);
  client.on('error', mqtt_error);
  client.on('message', mqtt_messsageReceived);
  client.on('close', mqtt_close);
  
  function mqtt_connect()
  {
      console.log("Connecting MQTT");
      client.subscribe("bike", {qos: 1}, mqtt_subscribe);
  }
  
  function mqtt_subscribe(err, granted)
  {
      console.log("Subscribed to " + Topic);
      if (err) {console.log(err);}
  }
  
  function mqtt_reconnect(err)
  {
      console.log("Reconnect MQTT");
      if (err) {console.log(err);}
    client  = mqtt.connect(connectUrl, OPTIONS);
  }
  
  function mqtt_error(err)
  {
      console.log("Error!");
    if (err) {console.log(err);}
  }
  
  function after_publish()
  {
    //do nothing
  }
  
  function mqtt_messsageReceived(topic, message, packet)
  {
    io.emit('sendMessage', {
      text: message.toString(),
      topic: topic
    });
    console.log('Topic=' +  topic + '  Message=' + message);
  }
  
  function mqtt_close()
  {
    console.log("Close MQTT");
  }
})


const port = process.env.PORT || 8000
server.listen(port, ()=> console.log(`Listening on port : ${port}`))