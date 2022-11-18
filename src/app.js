const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const morgan = require("morgan");
const cors = require("cors")
const app = express();
const server = require('http').createServer(app);
const mqtt = require('mqtt')
var socketIo = require('socket.io'); 
const { Command } = require('commander')
const program = new Command()


app.use(cors())

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

// Settings
app.set("port", process.env.PORT || 8080);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs.create({
    defaultLayout: "main",
    extname: ".hbs",
  }).engine
);
app.set("view engine", ".hbs");

// middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use(require("./routes/index"));

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

app.get('/changebatterystatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.battery == 'true'){
    await client.publish(params.scooterID,"{'a':62}");
  } else if(params.battery == 'false'){
    await client.publish(params.scooterID,"{'a':60}");
  }
  res.send("Success")
})

app.get('/changelightstatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.lights == 'true'){
    await client.publish(params.scooterID,"{'a':37,'d':1}");
  } else if(params.lights == 'false'){
    await client.publish(params.scooterID,"{'a':37,'d':0}");
  }
  res.send("Success")
})

app.get('/changealarmstatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.alarm == 'true'){
    await client.publish(params.scooterID,"{'a':28}");
  }
  res.send("Success")
})

app.get('/changepowerstatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.power == 'true'){
    await client.publish(params.scooterID,"{'a':1}");
  } else if(params.power == 'false'){
    await client.publish(params.scooterID,"{'a':3}");
  }
  res.send("Success")
})

app.get('/scootersetting', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  await client.publish(params.scooterID,params.payload);
  res.send("Success")
})
module.exports = server;