const validation = require('express-validation');
const rule = require('../model/validationRule');

const entirety = require('../controller/entiretyController');
/* const UserCtrl = controller.UserCtrl;
const AuthCtrl = controller.AuthCtrl;
const BoardCtrl = controller.BoardCtrl; */

module.exports = (router) => {
    router.route('/acct/test1/grid').post(validation(rule.tab_acct_test1_grid), entirety.checkTableExist, entirety.getAcctTest1Grid_reqOnce);
    router.route('/acct/test1/chart').post(validation(rule.tab_acct_test1_chart), entirety.checkTableExist, entirety.getAcctTest1Chart);
    router.route('/acct/test2/grid').post(validation(rule.tab_acct_test2_grid), entirety.checkTableExist, entirety.getAcctTest2Grid_reqOnce);
    router.route('/acct/test2/chart').post(validation(rule.tab_acct_test2_chart), entirety.checkTableExist, entirety.getAcctTest2Chart);
    router.route('/acct/test2/pie').post(validation(rule.tab_acct_test2_pie), entirety.checkTableExist, entirety.getAcctTest2Pie);
    router.route('/acct/test2/dstas').post(validation(rule.tab_acct_test2_dstas), entirety.getAcctTest2DstAs);

    router.route('/acct/ifoList/grid').post(validation(rule.tab_acct_ifoList_grid_select), entirety.getAcctIfoListGrid);
    router.route('/acct/ifoList/grid/update').post(validation(rule.tab_acct_ifoList_grid_update), entirety.getAcctIfoListGridUpdate);

    // User
    // router.route('/all/loginpath/grid/day').post(validation(rule.tab_all_loginPath), entirety.getAllLoginPath);
    router.route('/all/dailysales/grid').post(validation(rule.tab_all_dailySales_grid), entirety.getAllLoginPath);
    // router.route('/all/dailysales/grid').post(validation(rule.tab_all_dailySales_grid), entirety.getAllDailySalesGrid);
    router.route('/all/dailysales/yoy').post(validation(rule.tab_all_dailySales_yoy), entirety.getAllDailySalesYoy);

    /* router.route('/user/sign-in')
        .post(validate(validationRule.user_sign_in), UserCtrl.signIn);

    // Board
    router.route('/board')
        .get(BoardCtrl.list)
        .post(AuthCtrl.auth, validate(validationRule.board_write), BoardCtrl.write);
    router.route('/board/:board_id')
        .get(AuthCtrl.auth, validate(validationRule.board_read), BoardCtrl.read);
    router.route('/board/:board_id/comment')
        .post(AuthCtrl.auth, validate(validationRule.board_comment), BoardCtrl.commentWrite);
*/
    return router;
};
