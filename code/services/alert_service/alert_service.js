/** SMS Sending Service
 * 
 */

var _resp;
SMSTOPIC = "config/smsAlerts"; //Config Section for sending SMS Messages
var TEXT = "";
function alert_service(req, resp) {
    ClearBlade.init({ request: req });
    log(req)
    _resp = resp;

    if ((req.params)&&(req.params.body)) {
        d = JSON.parse(req.params.body);
        //SMS Body
        TEXT = req.params.ruleName + " Triggered \rDevice: " + d.deviceid + "\r";
        if (d.Temperature)
            TEXT += "Temp: " + d.Temperature + "\r"
        if (d.temperature)
            TEXT += "Temp: " + d.temperature + "\r"
        if (d.Humidity)
            TEXT += "Humidity: " + d.Humidity + "\r"
        if (d.pressure)
            TEXT += "Pressure: + " + d.pressure + "\r"
        TEXT += "http://bit.ly/2MOfWSg";
    }
    else {
        TEXT = "This is a test notification from http://bit.ly/2MOfWSg\r";
    }
    //Get the SMS #'s to send to.
    log(TEXT);
    getSMSNumbers();
}

function sendSMS(err, data) {
    if (err) {
        _resp.error("message history error : " + JSON.stringify(data));
    } else {
        log(data);

        numbers = data[0].message.split(";");
        //numbers=["3039129535"];
        log(numbers);
        for (var i = 0; i < numbers.length; i++) {
            //Force US numbers for now
            recipientNumber = "(+1 " + numbers[i].trim() + ")"
            twillioSMS(recipientNumber)
        }
    }
}

function twillioSMS(recipientNumber) {
    var twconf = TWILIO_CONFIG;
    //log(TWILIO_CONFIG)
    var twilio = Twilio(twconf.USER, twconf.PASS, twconf.SOURCE_NUMBER);
    twilio.sendSMS(TEXT, recipientNumber, sms_callback);
    function sms_callback(err, data) {
        if (err) {
            _resp.error(err);
        }
        _resp.success(data);
    }
}

function getSMSNumbers() {
    var msg = ClearBlade.Messaging();
    var unixTimeNano = new Date().getTime()
    var unixTimeMilli = unixTimeNano / 1000
    msg.getMessageHistory(SMSTOPIC, 0, 1, sendSMS);
}

function getRecentAlerts(devieid) {
    val=findRecord("alerts", {device_id:deviceid});
    log(val);
    
}

//Locate a record by id field
function findAlertRecord(tbl, values) {
    var query = ClearBlade.Query({collectionName: tbl});
    query.equalTo(values);
    query.descending("timestamp");
    query.setPage(PAGESIZE,1);
	query.fetch(promiseQuery(q).then(function(r) {return(r)}));
}

function promiseQuery(query) {
    d = Q.defer();
    var cb = function(err, result) {
        if (err) {
            d.reject(new Error(result));
        } else {
            d.resolve(result.DATA);
        }
    };
    query.fetch(cb);
    return d.promise;
}
