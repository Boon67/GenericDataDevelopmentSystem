TABLENAME="azure_historian"
function ext_clearHistorianTable(req, resp) {
    ClearBlade.init({request:req});
    var query = ClearBlade.Query();
    query.setPage(0, 0);
    query.notEqualTo('item_id', '00000000-0000-0000-0000-000000000000');
    var callback = function (err, data) {
        if (err) {
        	resp.error("update error : " + JSON.stringify(data));
        } else {
        	  resp.success(data);
        }
    };

   	var col = ClearBlade.Collection({collectionName: TABLENAME});
    col.remove(query, callback);
}