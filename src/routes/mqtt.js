const { Router } = require("express");
const axios = require('axios')
const mqtt = require('mqtt')
const { db, getAuth2 } = require("../firebase");
const { Command } = require('commander')
const program = new Command()
const router = Router();

program
  .option('-p, --protocol <type>', 'connect protocol: mqtt, mqtts, ws, wss. default is mqtt', 'mqtt')
  .parse(process.argv)
  const host = '0.0.0.0'
  const mqttport = '00'
  const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
  
// connect options
const OPTIONS = {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: '....',
  password: '....',
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
var client = mqtt.connect(connectUrl, OPTIONS)
client.on('connect', mqtt_connect);
client.on('reconnect', mqtt_reconnect);
client.on('error', mqtt_error);
client.on('message', mqtt_messsageReceived);
client.on('close', mqtt_close);

function mqtt_connect()
{
  console.log("Connecting MQTT");
  client.subscribe("bike", {qos: 0});
  // io.on('connection', (socket)=>{
  //   console.log('a user connected');
  //   socket.on("disconnect", ()=>{
  //     console.log("disconnect");
  //     // client.end();
  //   })
  // })
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
  // io.emit('sendMessage', {
  //   text: message.toString(),
  //   topic: topic
  // });
  //MQTT Topic and Message parsing Part
  var query = JSON.parse(message.toString())
  console.log(query)
  if(query.a === 19){
    var temp = query.g.split(',')
    var lat = temp[0]
    var lon = temp[1]
    query.lat = lat
    query.lng = lon
    axios.get('https://nominatim.openstreetmap.org/reverse?lat='+lat+'&lon='+lon+'&zoom=-8&addressdetails=1&format=json')
    .then(response => {
      query.address = response.data.display_name
      delete query.a
      try {
        db.collection('scooters').doc(query.i).set(query, {merge: true});
      } catch (error) {
        console.log(error);
      }
    })
    .catch(error => {
      console.log(error);
    });

  }else if(query.a === 27){
    delete query.a
    try {
      db.collection('scooters').doc(query.i).set(query, {merge: true});
    } catch (error) {
      console.log(error);
    }
  }
  console.log('Topic=' +  topic + '  Message=' + message);
}

function mqtt_close()
{
  console.log("Close MQTT");
}

router.get('/changebatterystatus', async (req, res) => {
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

router.get('/changelightstatus', async (req, res) => {
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

router.get('/changealarmstatus', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  // client.publish("", message, [options], [callback])
  if(params.alarm == 'true'){
    await client.publish(params.scooterID,"{'a':28}");
  }
  res.send("Success")
})

router.get('/changepowerstatus', async (req, res) => {
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

router.get('/scootersetting', async (req, res) => {
  console.log(req.query);
  var params = req.query;
  await client.publish(params.scooterID,params.payload);
  res.send("Success")
})

module.exports = router;
