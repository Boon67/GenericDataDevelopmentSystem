function RB_RuleEditor_wifi_temp_low_alert_Service (req, resp) {
    
    var reqObject;

    try {
        reqObject = JSON.parse(req.params);
    } catch(e) {
        reqObject = req.params;
    }
  
    if ((tryParse(reqObject.body).Temperature < "-18")) {
	  callAlertProvider0();
  }
  
    
    
    function callAlertProvider0 () {
      
        ClearBlade.init({request:req});
        ClearBlade.Code().execute("alert_service", Object.assign({ruleName: 'wifi_temp_low_alert'}, req.params), true, function (err, body){
            if(err) {
                log("Failure while executing alert_service; " + JSON.stringify(err));
                callAlertProvider1();
            } else {
                log("Successfully executed alert_service");
                callAlertProvider1();
            }
        })
    
    }
    
    
    function callAlertProvider1 () {
      
        ClearBlade.init({request:req});
        ClearBlade.Code().execute("alert_log", Object.assign({ruleName: 'wifi_temp_low_alert'}, req.params), true, function (err, body){
            if(err) {
                log("Failure while executing alert_log; " + JSON.stringify(err));
                resp.error(body);
            } else {
                log("Successfully executed alert_log");
                resp.success(body);
            }
        })
    
    }
    
    
    resp.success('Nothing to do');
  }
 
  function tryParse(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
}