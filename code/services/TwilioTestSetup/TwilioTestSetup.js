
/**
 * This service ensures TwilioConstants are set.
 */
function TwilioTestSetup(req, resp){
    var isConfigured = function (constant) {
        return constant ? true : false
    }

    var errMessages = [];

    for (var property in TWILIO_CONFIG) {
        if (TWILIO_CONFIG.hasOwnProperty(property) && (!isConfigured(TWILIO_CONFIG[property]))) {
            errMessages.push(property + " not set in TwilioConstants Library");
        }
    }

    if (errMessages) {
        resp.error(errMessages);
    }
    else {
        resp.success("All constants have been set successfully")
    }
}