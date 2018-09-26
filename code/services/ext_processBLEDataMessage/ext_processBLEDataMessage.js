var _resp, _req;
var _record;
tbl="azure_historian";
isMSSQL=true;

/* 
sample={
  "topic": "data/C031051823-00001/F4:5E:F4:79:AC:13/_platform",
  "body": "01190000",
  "userId": "8cb089b30b92fcabb0d9c0efa7f301",
  "trigger": "Messaging::Publish"
}
*/


function ext_processBLEDataMessage(req, resp) {
    ClearBlade.init({request:req});
    var msg = ClearBlade.Messaging();
    //log(req);
    _resp=resp;
    _req=req;
    log(req.params);
    deviceid=req.params.topic.split("/")[2];
    log(deviceid);
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

//Locate a record by item_id
function findRecord(tbl, values) {
    _record=values; //Global for inner loop
    log("processRecord");
    var query = ClearBlade.Query({collectionName: tbl});
    query.equalTo('item_id', values.item_id);
    d = Q.defer();
	query.fetch(function(err, result) {
        if (err) {
            d.reject(new Error(err));
        } else {
            d.resolve(result.DATA);
        }
    });
    return d.promise;
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
