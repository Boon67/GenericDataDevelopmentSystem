/*** 
 * API Entry point for data from WIFI devices
 * Publishes to the data/wifi/device_name/deviceid/data channel for processing
 */

function svc_wifi_data(req, resp) {
  ClearBlade.init({request:req});
  var msg = ClearBlade.Messaging();
  log(req)
  payload=JSON.stringify(req.params);
  log(payload);
  msg.publish("data/platform/wifi/"  +req.params.deviceid + "/_platform", payload);
  resp.success('Success');
}
