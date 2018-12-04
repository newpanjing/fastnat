var axios = require('axios');

exports.post = function (url, data, call) {

    axios.post(url, data)
        .then(res => {
            if (res.status = 200) {
                call(null, res.data);
            } else {
                call(`http code:${res.status}`, res.status);
            }
        }).catch(err => {
        call(err);
    });
}
