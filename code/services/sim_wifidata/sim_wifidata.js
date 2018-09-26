//Similates WIFI data Coming into the system

DEVICE_ID = "00:00:00:00:00:02";
TOPIC = "data/platform/wifi/" + DEVICE_ID + "/_platform"
function sim_wifidata(req, resp) {
  ClearBlade.init({ request: req });
  msg = ClearBlade.Messaging();

  var callback = function (err, body) {
    if (err) {
      resp.error("sim_wifidata error: " + JSON.stringify(body));
    } else {
        body = { "deviceid": DEVICE_ID, "device_name": DEVICE_ID, "Temperature": Math.floor(Math.random() * 120) + 1, "Humidity": Math.floor(Math.random() * 100), "Manufacturer": "ClearBlade Wifi Device Simulator" }
      msg.publish(TOPIC, JSON.stringify(body));
      resp.success(body);
    }
  }
  msg.getAndDeleteMessageHistory(TOPIC, 0, null, null, null, callback);
}

