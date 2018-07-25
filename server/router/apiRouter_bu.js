const validation = require('express-validation');
const rule = require('../model/validationRule');

const entiretyC = require('../controller/entiretyController');
/* const UserCtrl = controller.UserCtrl;
const AuthCtrl = controller.AuthCtrl;
const BoardCtrl = controller.BoardCtrl; */

module.exports = (router) => {

    /* for history tab */
    // get trf history data by strDate (for grid)
    router.route('/trf/history').get(validation(rule.get_trf_history), entiretyC._checkTableExist, entiretyC.getTrfHistory);
    // get trf bps usage data by strDate & range (for chart)
    router.route('/trf/bpsUsage').get(validation(rule.get_trf_history), entiretyC._checkTableExist, entiretyC.getTrfBpsUsage);

    /* for viewer tab */
    // for dynamic grid header
    // get trf ifaceout list(if use profile? get profile-ifoList)
    router.route('/trf/ifaceList').get(validation(rule.get_trf_ifaceList), entiretyC.getTrfIfoList);
    // get trf viewer data (for grid, chart, pie)
    router.route('/trf/viewer').get(validation(rule.get_trf_viewer), entiretyC._checkTableExist, entiretyC.getTrfViewer);
    // get trf dstas (request whoisapi)
    router.route('/trf/dstas/:dstAsNum').get(validation(rule.get_trf_dstas), entiretyC.getTrfDstAs);

    /* for profile tab */
    // get priflie all
    router.route('/trf/profile').get(entiretyC.getTrfProfiles);
    // profile CRUD by profileId
    // create
    router.route('/trf/profile').post(validation(rule.create_trf_profile), entiretyC.checkTrfProfileTotalCnt, entiretyC.checkTrfProfileNameUq, entiretyC.createTrfProfile)
    // get / update / delete
    router.route('/trf/profile/:profileId')
        .get(validation(rule.get_trf_profile), entiretyC.getTrfProfile)
        .put(validation(rule.update_trf_profile), entiretyC.checkTrfProfileNameUqWhenUpd, entiretyC.updateTrfProfile)
        .delete(validation(rule.delete_trf_profile), entiretyC.checkTrfProfileCnt, entiretyC.deleteTrfProfile);
    // get current ifaceout list (for profile CRUD / select2 UI)
    router.route('/trf/ifaceout').get(entiretyC.getTrfCurrentIfo);

    /* for iface out alias modal */
    // get ifaceout date list order by current ifaceout data (for confirm cal-UI setting)
    router.route('/trf/ifaceout/date').get(entiretyC.getTrfAvailableDateIfo);
    // get ifaceout list(include alias data) by strDate
    router.route('/trf/ifaceout/alias')
        .get(validation(rule.get_trf_alias), entiretyC.getTrfIfoAlias);
    // ifaceout alias CRUD by ifaceout & peeripsrc
    // update
    router.route('/trf/ifaceout/alias/:ifaceOut')
        .put(validation(rule.update_trf_alias), entiretyC.updateTrfIfoAlias);

    // router.route('/acct/test1/grid').post(validation(rule.tab_acct_test1_grid), entiretyC.checkTableExist, entiretyC.getAcctTest1Grid_reqOnce);
    // router.route('/acct/test1/chart').post(validation(rule.tab_acct_test1_chart), entiretyC.checkTableExist, entiretyC.getAcctTest1Chart);
    // router.route('/acct/test2/grid').post(validation(rule.tab_acct_test2_grid), entiretyC.checkTableExist, entiretyC.getAcctTest2Grid_reqOnce);
    // router.route('/acct/test2/dstas').post(validation(rule.tab_acct_test2_dstas), entiretyC.getAcctTest2DstAs);
    // router.route('/acct/test2/profile').post(entiretyC.getAcctTest2Profile);
    // router.route('/acct/test2/pIfoList').post(entiretyC.getAcctPIfoList);

    // router.route('/acct/profile/grid').post(entiretyC.getAcctProfileGrid);
    // router.route('/acct/profile/detail').post(entiretyC.getAcctProfileDetail);
    // router.route('/acct/profile/ifaceout').post(entiretyC.getAcctProfileIfaceout);
    // router.route('/acct/profile/update').post(entiretyC.checkProfileNameWhenUpd, entiretyC.getAcctProfileUpdate);
    // router.route('/acct/profile/create').post(entiretyC.checkProfileTotalCnt, entiretyC.checkProfileName, entiretyC.getAcctProfileCreate);
    // router.route('/acct/profile/delete').post(entiretyC.checkProfileCnt, entiretyC.getAcctProfileDelete);

    // router.route('/acct/ifoList/grid').post(validation(rule.tab_acct_ifoList_grid_select), entiretyC.getAcctIfoListGrid);
    // router.route('/acct/ifoList/grid/update').post(validation(rule.tab_acct_ifoList_grid_update), entiretyC.getAcctIfoListGridUpdate);

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
