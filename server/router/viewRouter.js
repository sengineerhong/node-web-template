module.exports = (router) => {

    // ftm traffic history
    router.route('/acct/trfHistory').get(function (req, res, next) {
        res.render('tab/acct/trfHistory');
    });

    // ftm as traffic viewer
    router.route('/acct/trfViewer').get(function (req, res, next) {
        res.render('tab/acct/trfViewer');
    });

    // ftm profile
    router.route('/acct/profile').get(function (req, res, next) {
        res.render('tab/acct/profile');
    });

    // ftm ifoList
    router.route('/acct/ifoList').get(function (req, res, next) {
        res.render('tab/acct/ifoList');
    });

    return router;
};
