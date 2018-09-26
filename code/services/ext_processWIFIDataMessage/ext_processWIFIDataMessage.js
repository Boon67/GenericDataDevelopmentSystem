var _resp, _req;
var _record;
tbl="azure_historian";
isMSSQL=true;

function ext_processWIFIDataMessage(req, resp) {
    ClearBlade.init({request:req});
    var msg = ClearBlade.Messaging();
    //log(req);
    _resp=resp;
    _req=req;
    deviceid=JSON.parse(req.params.body).deviceid;
    devicedata=req.params.body;
    //log(ClearBlade.edgeId());
    //*Uncomment if you want to store in collection as well  */
    log(devicedata);
    if (isMSSQL)
        createRecord(tbl, {device_id:deviceid, device_data:devicedata});
    else
        createRecord(tbl, {device_id:deviceid, device_data:devicedata, timestamp: Math.floor(Date.now()/1000)});
}

//Create a record
function createRecord(tbl, values) {
    var col = ClearBlade.Collection( {collectionName: tbl } );
    col.create(values, statusCallBack);
}


//Shared Status Callback
var statusCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
    	_resp.error(data);
    } else {
        log(data);
    	_resp.success(data);
    }
};

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
