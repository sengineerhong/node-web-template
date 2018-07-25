/* css */
// use webpack.ProvidePlugin - bootstrap
import 'Modules/font-awesome/css/font-awesome.min.css';
// import 'Modules/animate.css/animate.min.css';
import 'Venders/css/animate.css';
import 'Modules/nprogress/nprogress.css';
import 'Modules/icheck/skins/flat/green.css';
import 'Modules/switchery-npm/index.css';
import 'Modules/bootstrap-daterangepicker/daterangepicker.css';
import 'Modules/bootstrap-datetimepicker-npm/build/css/bootstrap-datetimepicker.min.css';
import 'select2/dist/css/select2.min.css';
import 'select2-bootstrap-theme/dist/select2-bootstrap.min.css';
import 'toastr/build/toastr.min.css';
// import 'Modules/devextreme/dist/css/dx.common.css';
// import 'Modules/devextreme/dist/css/generic.light-compact.custom_1120.css';
/* datatable */
// import 'Modules/datatables.net-dt/css/jquery.dataTables.css';
import 'Modules/datatables.net-bs/css/dataTables.bootstrap.css';
import 'Modules/datatables.net-buttons-bs/css/buttons.bootstrap.css';
// import 'Modules/datatables.net-responsive-bs/css/responsive.bootstrap.min.css'
import 'Venders/css/custom.css';
import 'Venders/css/pmacct.css';

/* js */
// use webpack.ProvidePlugin - jquery, bootstrap, moment && ...
import jquery from 'Modules/jquery/dist/jquery';                                                // moment korean
import moment from 'Modules/moment/min/moment.min';                                             // moment korean
import 'Modules/moment/locale/ko';                                                              // moment korean
import 'Modules/twix/dist/twix.min';                                                            // twix
import 'Modules/jquery-ui-dist/jquery-ui.min';                                                  // jquery-ui
import 'Modules/metismenu/dist/metisMenu.min';                                                  // metisMenu
import 'Modules/nestable2/dist/jquery.nestable.min';                                            // nestable2
import 'Venders/vender/jquery.slimscroll/jquery.slimscroll.min';                                // jquery.slimscroll
import NProgress from 'Modules/nprogress/nprogress';                                            // nprogress
import 'Modules/bootstrap-daterangepicker/daterangepicker';                                     // bootstrap-daterangepicker
import 'Modules/bootstrap-datetimepicker-npm/build/js/bootstrap-datetimepicker.min';            // bootstrap-datetimepicker-npm
import 'Modules/jquery-knob/dist/jquery.knob.min';                                              // jquery-knob
import 'Modules/icheck/icheck.min';                                                             // icheck
import 'Modules/parsleyjs/dist/parsley.min';                                                    // parsleyjs
import 'Modules/parsleyjs/src/i18n/ko';                                                         // parsleyjs korean
import 'Modules/switchery-npm/index';                                                           // switchery
import 'Modules/gasparesganga-jquery-loading-overlay/src/loadingoverlay.min';                   // loading-overlay
import randomColor from 'Modules/randomcolor/randomColor';                                      // randomcolor
import 'select2/dist/js/select2.min';                                                           // select2
import toastr from 'toastr/build/toastr.min';                                                   // toastr
import Logger from 'Modules/js-logger/src/logger.min';                                          // logger
import Dexie from 'Modules/dexie/dist/dexie.min';                                               // dexie - for indexedDB

/* DevExtreme */
// import 'Modules/jszip/dist/jszip.min';
// import 'Modules/devextreme/dist/js/dx.all';

/* datatables */
import 'Modules/datatables.net-bs/js/dataTables.bootstrap';
import 'Modules/datatables.net-buttons-bs/js/buttons.bootstrap';
import 'Modules/datatables.net-buttons/js/buttons.html5';
import 'Modules/datatables.net-buttons/js/buttons.print';
import 'Modules/datatables.net-plugins/api/fnReloadAjax';
import 'Modules/datatables.net-plugins/api/sum()';
import 'Modules/datatables.net-plugins/api/average()';
import 'Modules/datatables.net-plugins/api/fnStandingRedraw';
import 'Modules/datatables.net-plugins/api/column().title()';
// import 'Modules/datatables.net-responsive-bs/js/responsive.bootstrap.min';

import 'chart.js';
import 'Modules/chart.piecelabel.js';

/* custom common */
import 'Venders/js/common/bootstrap-dynamic-tabs-custom';
import 'Venders/js/common/utils.cmmn';
import 'Venders/js/common/utils.dx';
import 'Venders/js/common/custom.js';

/* for external accessing */
window.jquery = jquery;
window.moment = moment;
window.Logger = Logger;
window.randomColor = randomColor;
// window.Dexie = Dexie;
window.NProgress = NProgress;
window.toastr = toastr;

/* set main page function */
/* deploy version  */
window.deploy_version = 'v0.1.8';

/* logger - hong  */
Logger.useDefaults();
Logger.setLevel(Logger.INFO);
var consoleHandler = Logger.createDefaultHandler();

Logger.setHandler(function (messages, context) {
    consoleHandler(messages, context);
});

/* tab - hong */
var tabs = $('#tabs').bootstrapDynamicTabs();

/* for Parsley validations */
window.ParsleyConfig = {
    // errorsWrapper: '<li class="alert-box-item"></li>',
    // errorTemplate: '<span></span>',
    excluded:
    // Defaults
    'input[type=button],' +
    'input[type=submit],' +
    'input[type=reset],'  +
    'input[type=hidden],' +
    '[disabled],'         +
    ':hidden,'            +
    // -- Additional attributes to look --
    '[data-parsley-disabled],' +  // Exclude specific input/select/radio/checkbox/etc
    '[data-parsley-disabled] *'   // Exclude all nesting inputs/selects/radios/checkboxes/etc
};
window.Parsley.setLocale('ko');
/* add validator (only number & comma seperation)   */
window.Parsley.addValidator('numcommasepearate', {
    messages: {ko: '숫자입력(구분자 ,)'},
    validateString: function (value) {
        if ($.trim(value) === '')   return true;
        else                        return UtilsCmmn.isValidNumAndCommaSeperate(value);
    }
});

$(document).ready(function () {
    /* activate MetisMenu */
    $('#side-menu1').metisMenu();

    /* left memu link event  */
    $('body').on('click', 'ul.tab_link li.tab_go', function(e) {
        e.preventDefault();
        // var abc = $(this).attr('data-info').id;
        var menuInfo = $(this).data('info');
        Logger.debug('[dev]', 'menuInfo:' + JSON.stringify(menuInfo));
        if (menuInfo !== undefined) {
            addTabContents(menuInfo);
        }
    });
});

function addTabContents (tabInfo) {
    // check tab count max 10!
    var tabArry = tabs.getTabArry();
    if ((tabArry.length >= 10) && (tabArry.indexOf(tabInfo.id) < 0)) {
        UtilsCmmn.showToast('tab은 최대 10개까지 허용됩니다.', false, {});
        return;
    }

    // add tab
    tabs.addTab({
        id: tabInfo.id,
        title: tabInfo.title,
        ajaxUrl: tabInfo.url,
        icon: tabInfo.icon || 'fa fa-th-large',
        closable: true
        /* loadScripts: 'js/load.js',
        loadStyles: ['css/test.css','css/test2.css'] */
    });

    // add tab trigger
    $('#tabs').trigger('addTabEvent');
}
