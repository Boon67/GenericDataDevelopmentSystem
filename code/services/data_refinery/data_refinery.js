/** Purpose of this component it to operate as a clearing house for 
 * data payload from BD devices. Currently it targeted to a single
 * BLE device message payload, but can be expanded to additional data
 * formats.
 */

MSGTOPIC="data/bluetooth/refined";
messageTypes = {
    "LED": "01",
    "ADC": "02",
    "Lid": "03"
};

pinIDs = {
    "Dark Squid 1": 266,
    "Dark Goat 2": 25,
    "Dark Goat 3": 30
};

LEDStates = {
    "Off": "00",
    "On": "01"
};

lidStates = {
    "7F": "Error",
    "00": "Closed",
    "81": "Opening",
    "7E": "Open Failed",
    "01": "Open" 
};


function data_refinery(req, resp) {
    ClearBlade.init({request:req});
    msg=ClearBlade.Messaging();
    log(req);
    var body="027B02AC17"; //Testing Example if no data is passed
    if (req.params.body) {
        log(req.params.body);
        body=req.params.body; //Set to the correct passed parameter
        val=parseIncomingMessage(body);
        val.TESTMESSAGE=false;
        val.deviceid=req.params.topic.split("/")[2];
    }
    else {
        val=parseIncomingMessage(body);
        val.TESTMESSAGE=true;
        val.deviceid="TEST_DEVICE";
    }

    val.raw_temperature=val.temperature;
    val.raw_pressure=val.pressure;
    //Parsing Logic
    val.temperature=(0.00298 * val.temperature);
    val.pressure=(0.0004 * val.pressure - 0.186);
    msg.publish(MSGTOPIC, JSON.stringify(val))
    log(val);
    resp.success(val);
}

parseIncomingMessage = function (rawMsg) {
    if (typeof rawMsg == "object") {
        return;
    }

    var msg = rawMsg;
    var msgTypeHex = msg.substring(0, 2);
    var msgPayload = msg.substring(2);

    //define helper functions
    function hexToUint16LittleEndian(hexString) {
        return parseInt('0x'+hexString.match(/../g).reverse().join(''));
    }

    //Tweak to support ECMA5
    function getObjectKeyByValue(object, value) {
        //log(JSON.stringify(object));
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                if (object[property]===value)
                    return property
                //log(property + ":" +  object[property])
            }
        //ECMA6 Version
        //return Object.keys(object).find(key => object[key] === value);
        };
    }

    if (msgTypeHex === "01") {
        var pinIdHex = msgPayload.substring(0, 4);
        var stateHex = msgPayload.substring(4, 6);
        var pin_id = hexToUint16LittleEndian(pinIdHex);
        return {
            "message_type_name": getObjectKeyByValue(messageTypes, msgTypeHex),
            "pin_id": pin_id,
            "description": getObjectKeyByValue(pinIDs, pin_id),
            "state": getObjectKeyByValue(LEDStates, stateHex)
        };
    } else if (msgTypeHex === "02") {
        var pressureHex = msgPayload.substring(0, 4);
        var tempHex = msgPayload.substring(4, 8);
        return {
            "message_type_name": getObjectKeyByValue(messageTypes, msgTypeHex),
            "pressure": hexToUint16LittleEndian(pressureHex),
            "temperature": hexToUint16LittleEndian(tempHex)
        };
    } else if (msgTypeHex === "03") {
        var stateHex = msgPayload.substring(4, 6);
        return {
            "message_type_name": getObjectKeyByValue(messageTypes, msgTypeHex),
            "state": lidStates[stateHex]
        };
    } else {
        console.log("Unexpected Message Type of: " + msgTypeHex);
        return;
    }
};

