tbl = "alerts"; 
function alert_log(req, resp) {
  ClearBlade.init({request:req});
  alert = {};
  alert.alertname = req.params.ruleName;
  alert.device_id=JSON.parse(req.params.body).deviceid;
  alert.alertdetails = req.params.body;
  alert.alerttype = req.params.ruleName;
  alert.timestamp = Math.floor(Date.now() / 1000);

  var callback = function (err, data) {
    if (err) {
      resp.error("creation error : " + JSON.stringify(data));
    } else {
      resp.success(data);
    }
  };
  var col = ClearBlade.Collection({ collectionName: tbl});
  log(alert)
  col.create(alert, callback);
}