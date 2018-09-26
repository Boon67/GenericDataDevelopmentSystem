function RB_RuleEditor_AaronsRuleDeleteME_Service (req, resp) {
    
    var reqObject;

    try {
        reqObject = JSON.parse(req.params);
    } catch(e) {
        reqObject = req.params;
    }
  
    if ((tryParse(reqObject.body).length > "5")) {
	  callAlertProvider0();
  }
  
    
    
    function callAlertProvider0 () {
      
        ClearBlade.init({request:req});
        ClearBlade.Code().execute("TwilioExampleSendSMS", Object.assign({ruleName: 'AaronsRuleDeleteME'}, req.params), true, function (err, body){
            if(err) {
                log("Failure while executing TwilioExampleSendSMS; " + JSON.stringify(err));
                resp.error(body);
            } else {
                log("Successfully executed TwilioExampleSendSMS");
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