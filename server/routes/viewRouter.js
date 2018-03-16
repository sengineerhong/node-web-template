module.exports = (router) => {

    // acct test1
    router.route('/acct/test1').get(function (req, res, next) {
        res.render('tab/acct/test1');
    });

    // acct test2
    router.route('/acct/test2').get(function (req, res, next) {
        res.render('tab/acct/test2');
    });

    // main page
    router.route('/all/dashboard').get(function (req, res, next) {
        res.render('tab/all/dashboard', { title: 'Express' });
    });

    // main page
    router.route('/all/dailysales').get(function (req, res, next) {
        res.render('tab/all/dailySales', { title: 'Express' });
    });

    return router;
};
