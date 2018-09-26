var _resp;

function clearMessageQueues(req, resp) {
    _resp = resp;
    //This erases the messages from the messagequeue to prevent overrunning storage on the micro instance.
    ClearBlade.init({ request: req });
    var topics;
    _getMessageTopics()
        .then(function (r) {
            topics = r;
            log("Topic Count:" + r.length);
        })
        .catch(function (result) { _resp.error(result) });

//This is where the error occurs.
	var callback = function (err, data) {
		if(err) {
			_resp.error("getcurrenttopics error: ");
		} else {
			_resp.success(data);
		}
    };

var msg = ClearBlade.Messaging();
msg.getAndDeleteMessageHistory(topics[0], 0, null, null, null, callback);
}

function _deleteTopic(topic) {
    var msg = ClearBlade.Messaging();
    d = Q.defer();
    var cb = function (err, result) {
        if (err) {
            d.reject(err);
        } else {
            d.resolve(result);
        }
    };
    log(topic);
    msg.getCurrentTopics(cb);
    //msg.getAndDeleteMessageHistory("data/DemoEM/E9:E9:DB:F7:70:6E/_platform", 0, "", null, null, cb);
    return d.promise;
}


function _getMessageTopics() {
    var msg = ClearBlade.Messaging();
    d = Q.defer();
    var cb = function (err, result) {
        if (err) {
            d.reject(new Error(result));
        } else {
            d.resolve(result);
        }
    };
    msg.getCurrentTopics(cb);
    return d.promise;
}

function runQuery(q) {
    promiseQuery(q).then(function (r) {
        _resp.success(r);
    })
        .catch(function (err) {
            _resp.error(err);
        });
}
