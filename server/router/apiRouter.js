const validation = require('express-validation');
const rule = require('../model/validationRule');

const entiretyC = require('../controller/entiretyController');
/* const UserCtrl = controller.UserCtrl;
const AuthCtrl = controller.AuthCtrl;
const BoardCtrl = controller.BoardCtrl; */

module.exports = (router) => {
    /* for history tab */
    // get trf history data by strDate (for grid)
    router.route('/trf/history').get(validation(rule.get_trf_history), entiretyC.checkTableExist, entiretyC.getTrfHistory);
    // get trf bps usage data by strDate & range (for chart)
    router.route('/trf/bpsUsage').get(validation(rule.get_trf_bpsUsage), entiretyC.checkTableExist, entiretyC.getTrfBpsUsage);

    /* for viewer tab */
    // for dynamic grid header
    // get trf ifaceout list(if use profile? get profile-ifoList)
    router.route('/trf/ifaceList').get(validation(rule.get_trf_ifaceList), entiretyC.getTrfIfoList);
    // get trf viewer data (for grid, chart, pie)
    router.route('/trf/viewer').get(validation(rule.get_trf_viewer), entiretyC.checkTableExist, entiretyC.getTrfViewer);
    // get trf dstas (request whoisapi)
    router.route('/trf/dstas/:dstAsNum').get(validation(rule.get_trf_dstas), entiretyC.getTrfDstAs);

    /* for profile tab */
    // get priflie all
    router.route('/trf/profile').get(entiretyC.getTrfProfiles);
    // profile CRUD by profileId
    // create
    router.route('/trf/profile').post(validation(rule.create_trf_profile), entiretyC.checkTrfProfileMaxCnt, entiretyC.checkTrfProfileNameUq, entiretyC.createTrfProfile);
    // get / update / delete
    router.route('/trf/profile/:profileId')
        .get(validation(rule.get_trf_profile), entiretyC.getTrfProfile)
        .put(validation(rule.update_trf_profile), entiretyC.checkTrfProfileNameUqWhenUpd, entiretyC.updateTrfProfile)
        .delete(validation(rule.delete_trf_profile), entiretyC.checkTrfProfileMinCnt, entiretyC.deleteTrfProfile);
    // get current ifaceout list (for profile CRUD / select2 UI)
    router.route('/trf/ifaceout').get(entiretyC.getTrfCurrentIfo);

    /* for iface out alias modal */
    // get ifaceout date list order by current ifaceout data (for confirm cal-UI setting)
    router.route('/trf/ifaceout/date').get(entiretyC.getTrfAvailableDateIfo);
    // get ifaceout list(include alias data) by strDate
    router.route('/trf/ifaceout/alias')
        .get(validation(rule.get_trf_alias), entiretyC.getTrfIfoAlias)
        // update all
        .put(validation(rule.update_trf_alias_all), entiretyC.updateTrfIfoAliasAll);
    // ifaceout alias CRUD by ifaceout & peeripsrc
    // update
    router.route('/trf/ifaceout/alias/:ifaceOut')
        .put(validation(rule.update_trf_alias), entiretyC.updateTrfIfoAlias);
    return router;
};
