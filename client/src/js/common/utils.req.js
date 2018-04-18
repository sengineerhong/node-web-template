(function ($, global) {
    var window = global;
    window.UtilsReq = function () {
        return new UtilsReq.fn.init();
    };

    UtilsReq.fn = UtilsReq.prototype = {
        init: function () {
            return this;
        },
        about: 'hong request functions',
        version: '0.1'
    };

    UtilsCmmn.reqDefaultAjax = function (callback, options) {
        $.ajax({
            url: options.url,
            type: options.type || 'POST',
            data: options.param,
            success: function (resData) {
                callback.success(resData);
            },
            error: function (jqXHR, exception) {
                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status === 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status === 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'session time out! Please, Login.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                callback.error(msg);
            }
        });
    };

    UtilsReq.fn.init.prototype = UtilsReq.fn;
})(jQuery, window);
