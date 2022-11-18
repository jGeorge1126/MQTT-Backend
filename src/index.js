const app = require("./app");
const socketIo = require('socket.io')
const http = require('http')
const server = http.createServer(app)
const cors = require('cors')
const mqtt = require('mqtt')
const { Command } = require('commander')
const program = new Command()

const io = socketIo(server, {
  cors: {
        origin: "http://34.224.66.154:3000",
        // origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
})

program
  .option('-p, --protocol <type>', 'connect protocol: mqtt, mqtts, ws, wss. default is mqtt', 'mqtt')
  .parse(process.argv)
  const host = '54.210.189.224'
  const mqttport = '1883'
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
  
  // connect options
  const OPTIONS = {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: 'mqtt',
    password: 'mqtt123456',
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
  
  const client = mqtt.connect(connectUrl, OPTIONS)
  client.on('connect', mqtt_connect);
  client.on('reconnect', mqtt_reconnect);
  client.on('error', mqtt_error);
  client.on('message', mqtt_messsageReceived);
  client.on('close', mqtt_close);
  
  function mqtt_connect()
  {
    console.log("Connecting MQTT");
    client.subscribe("bike", {qos: 0});
    io.on('connection', (socket)=>{
      console.log('a user connected');
      socket.on("disconnect", ()=>{
        console.log("disconnect");
        // client.end();
      })
    })
  }

  function mqtt_reconnect(err)
  {
    console.log("Reconnect MQTT");
    if (err) {console.log(err);}
    client = mqtt.connect(connectUrl, OPTIONS);
  }
  
  function mqtt_error(err)
  {
    console.log("Error!");
    if (err) {console.log(err);}
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

async function main() {
  app.listen(8080);
  console.log("Server on port", 8080);
}

main();
