/* css */
// use webpack.ProvidePlugin - bootstrap
import '../node_modules/font-awesome/css/font-awesome.min.css';
// import '../node_modules/animate.css/animate.min.css';
import './src/css/animate.css';
import '../node_modules/nprogress/nprogress.css';
import '../node_modules/icheck/skins/flat/green.css';
import '../node_modules/switchery-npm/index.css';
import '../node_modules/bootstrap-daterangepicker/daterangepicker.css';
import '../node_modules/bootstrap-datetimepicker-npm/build/css/bootstrap-datetimepicker.min.css';
import '../node_modules/devextreme/dist/css/dx.common.css';
import '../node_modules/devextreme/dist/css/generic.light-compact.custom_1120.css';
/* datatable */
// import '../node_modules/datatables.net-dt/css/jquery.dataTables.css';
import '../node_modules/datatables.net-bs/css/dataTables.bootstrap.css';
import '../node_modules/datatables.net-buttons-bs/css/buttons.bootstrap.css';
// import '../node_modules/datatables.net-responsive-bs/css/responsive.bootstrap.min.css'
import './src/css/custom.css';
import './src/css/pmacct.css';

/* js */
// use webpack.ProvidePlugin - jquery, bootstrap, moment && ...
import jquery from '../node_modules/jquery/dist/jquery';                                                // moment korean
import moment from '../node_modules/moment/min/moment.min';                                             // moment korean
import '../node_modules/moment/locale/ko';                                                              // moment korean
import '../node_modules/twix/dist/twix.min';                                                            // twix
import '../node_modules/jquery-ui-dist/jquery-ui.min';                                                  // jquery-ui
import '../node_modules/metismenu/dist/metisMenu.min';                                                  // metisMenu
import '../node_modules/nestable2/dist/jquery.nestable.min';                                            // nestable2
import './src/vender/jquery.slimscroll/jquery.slimscroll.min';                                          // jquery.slimscroll
// import '../node_modules/slimscroll/lib/slimscroll';                                                  // jquery.slimscroll
import NProgress from '../node_modules/nprogress/nprogress';                                            // nprogress
import '../node_modules/bootstrap-daterangepicker/daterangepicker';                                     // bootstrap-daterangepicker
import '../node_modules/bootstrap-datetimepicker-npm/build/js/bootstrap-datetimepicker.min';            // bootstrap-datetimepicker-npm
import '../node_modules/jquery-knob/dist/jquery.knob.min';                                              // jquery-knob
import '../node_modules/icheck/icheck.min';                                                             // icheck
import '../node_modules/parsleyjs/dist/parsley.min';                                                    // parsleyjs
import '../node_modules/parsleyjs/src/i18n/ko';                                                         // parsleyjs korean
import '../node_modules/switchery-npm/index';                                                           // switchery
import '../node_modules/gasparesganga-jquery-loading-overlay/src/loadingoverlay.min';                   // loading-overlay
import Logger from '../node_modules/js-logger/src/logger.min';                                          // logger
import Dexie from '../node_modules/dexie/dist/dexie.min';                                               // dexie - for indexedDB

/* DevExtreme */
import '../node_modules/jszip/dist/jszip.min';                                                           // switchery
import '../node_modules/devextreme/dist/js/dx.all';

/* datatables */
// import '../node_modules/datatables.net/js/jquery.dataTables';
import '../node_modules/datatables.net-bs/js/dataTables.bootstrap';
import '../node_modules/datatables.net-buttons-bs/js/buttons.bootstrap';
import '../node_modules/datatables.net-buttons/js/buttons.html5';
import '../node_modules/datatables.net-buttons/js/buttons.print';
import '../node_modules/datatables.net-plugins/api/fnReloadAjax';
// import '../node_modules/datatables.net-responsive-bs/js/responsive.bootstrap.min';

import Chart from 'chart.js';

/* custom common */
import './src/js/common/bootstrap-dynamic-tabs-custom';
import './src/js/common/jquery.textareafullscreen-custom';
import './src/js/common/utils.cmmn';
import './src/js/common/utils.dx';
import CSRequester from './src/js/common/csrequester.js';
import './src/js/common/custom.js';

/* for external accessing */
window.jquery = jquery;
// window.jQuery = Jquery;
// window.$ = jquery;
window.moment = moment;
window.Logger = Logger;
window.Logger = Logger;
window.Dexie = Dexie;
window.CSRequester = CSRequester;
window.NProgress = NProgress;
// window.Chart = Chart;

// import hi from '../app/hello';
// import who from '../app/hong';

/* for dev  */
window.devconfig_dailysales_csr = false;
window.devconfig_dailysales_fake = false;
window.devconfig_sellerstate_csr = false;
window.devconfig_sellerstate_fake = false;
window.devconfig_sellerlistd_csr = false;
window.devconfig_sellerlistd_fake = false;
window.devconfig_crosssales_csr = false;
window.devconfig_crosssales_fake = false;
window.devconfig_multisales_csr = false;
window.devconfig_multisales_fake = false;
window.devconfig_selleractivew_csr = false;
window.devconfig_selleractivew_fake = false;
window.devconfig_selleractivem_csr = false;
window.devconfig_selleractivem_fake = false;
window.devconfig_factbook_csr = false;
window.devconfig_factbook_fake = false;
window.devconfig_crossbuy_csr = false;
window.devconfig_crossbuy_fake = false;
window.devconfig_signuppath_csr = false;
window.devconfig_signuppath_fake = false;
window.devconfig_loginpath_csr = false;
window.devconfig_loginpath_fake = false;
window.devconfig_dashboard_csr = false;
window.devconfig_dashboard_fake = false;
window.devconfig_login_csr = false;
window.devconfig_login_fake = false;
window.devconfig_memstatus_csr = false;
window.devconfig_memstatus_fake = false;

/*
var dttest = $('#dttest').DataTable();
console.log("dttest=>"+dttest );
*/

/* set main page function */
/* deploy version  */
window.deploy_version = 'v0.5.8';

/* CS requester init for indexedDB request - hong */
var csrOpt = { /* can use custom schema & handler(csrOpt.schema, csrOpt.handler) */ };
/* use default schema & handler */
CSRequester.initialize(csrOpt);

/* logger - hong  */
Logger.useDefaults();
Logger.setLevel(Logger.INFO);
var consoleHandler = Logger.createDefaultHandler();
var serverHandler = function (messages, context) {
    if (context.level.name === 'INFO' && messages[0] === '[weblog]') {
        var param = {msg: messages[1]};
        $.ajax({
            url: '/isis/admin/weblog/update',
            data: $.param(param),
            type: 'get',
            dataType: 'json',
            contentType: 'application/json;charset=UTF-8'
        });
    }
};

Logger.setHandler(function (messages, context) {
    consoleHandler(messages, context);
    // serverHandler(messages, context);
});

/* tab - hong */
var tabs = $('#tabs').bootstrapDynamicTabs();

/* common toast */
window.plainToast = UtilsDx.initToast($('#plain_toast'), {message: 'plain error'});

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

    // test
    // addTabContents("all_bn_dailysales", "[매출]일별", "/view/all/dailysales");

    // default tab
/*
    var dashboard =
        {
            id : "all_dashboard",
            title: "dashboard",
            url: "/view/all/dashboard"
        }
*/
    /* 임시 for beta test */
    // addTabContents("dev_demoinfo", "page info", "/isis/dev/demoinfo");
    /* tab home */
    // addTabContents(dashboard.id, dashboard.title, dashboard.url);
    /* req dynamic menu */
    // reqDynaminMenu

    /* temp ----------------- */
    createFavoriteMenuFromLcDB();
    /* activate MetisMenu */
    $('#side-menu1').metisMenu();
    $('#side-menu2').metisMenu();
    $('#side-menu3').metisMenu();

    /* left memu link event  */
    //$('ul.tab_link li.tab_go').on("click", function(e) {
    $('body').on("click", "ul.tab_link li.tab_go", function(e) {

        e.preventDefault();
        //var abc = $(this).attr('data-info').id;
        var menuInfo = $(this).data('info');
        Logger.debug("[dev]","menuInfo:"+JSON.stringify(menuInfo));
        if (menuInfo != undefined) {
            addTabContents(menuInfo.id, menuInfo.title, menuInfo.url);
        }
    });
    /* temp ----------------- */
});

function reqDynaminMenu() {

    /* dynamic menu */
    var param = {};
    $.ajax({
        url: "/isis/menu",
        data: $.param(param),
        type: "get",
        dataType : "json",
        contentType: "application/json;charset=UTF-8",
        success: function(resData)
        {
            /* generate memu  */
            //genMenu(resData.data);

            /* generate 관심별 memu  */
            // createFavoriteMenu(resData.data);

            /* activate MetisMenu */
            $('#side-menu1').metisMenu();
            $('#side-menu2').metisMenu();
            $('#side-menu3').metisMenu();

            /* left memu link event  */
            //$('ul.tab_link li.tab_go').on("click", function(e) {
            $('body').on("click", "ul.tab_link li.tab_go", function(e) {

                e.preventDefault();
                //var abc = $(this).attr('data-info').id;
                var menuInfo = $(this).data('info');
                Logger.debug("[dev]","menuInfo:"+JSON.stringify(menuInfo));
                if (menuInfo != undefined) {
                    addTabContents(menuInfo.id, menuInfo.title, menuInfo.url);
                }
            });
        }
    });
}


function addTabContents(id, title, url, params){

    // check tab count max 10!
    var tabArry = tabs.getTabArry();
    if ( (10 <= tabArry.length) && (tabArry.indexOf(id) < 0) ) {
        plainToast.option("message", "tab은 최대 10개까지 허용됩니다.");
        plainToast.show();
        return;
    }

    // check fav tab - change icon color
    var icon = "fa fa-star";
    if (UtilsCmmn.isSupportLS) {
        var favTabIdArry = UtilsCmmn.getObjDataToLS("isis_favorite") || [];

        // get valid index
        // var favTabIdIndex = favTabIdArry.indexOf(id);  - for dynamic menu
        /* temp ----------------- */
        // now(beta), use static menu. save tabObj({id, title, url}) not tabid!
        var favTabIdIndex = favTabIdArry.map(function(e) { return e.id; }).indexOf(id);
        /* temp ----------------- */

        if (favTabIdIndex != -1) {
            icon = "fa fa-star color-f-star"
        }
    }

    // add tab
    tabs.addTab({
        id: id,
        title: title,
        ajaxUrl: url,
        icon: icon,
        closable: true
        /* loadScripts: 'js/load.js',
        loadStyles: ['css/test.css','css/test2.css'] */
    });

    // add tab trigger
    $('#tabs').trigger('addTabEvent');

    // tab shown event 로 일괄처리하기로함. tab이 활성화되는 모든 시점을 해당 tab울 사용할 의도를 가지고 있다고 보도록 함.
    // request weblog
    var userId = "${sessionScope.userInfo.userId}";
    Logger.info("[weblog]", UtilsCmmn.genWebLogJson(userId, id, title, "addTab", []));
}


/* dynanmic general menu - hong (menuInfo array 순서가 보장되었다는 전제) */
function genMenu(menuInfo) {

    //var menuInfo = loginInfo.menuInfo;
    var sub1Parent = $("#side-menu1");
    sub1Parent.empty();
    genMenuHtml(menuInfo, 1, sub1Parent);		// 부문별

    var sub2Parent = $("#side-menu2");
    sub2Parent.empty();
    genMenuHtml(menuInfo, 2, sub2Parent);		// 관심별

}


/* dynanmic favorite menu - hong */
function createFavoriteMenu(menuInfo) {

    if (UtilsCmmn.isSupportLS) {

        var parent = $("#side-menu3");
        var loopCnt = 0;
        var favTabIdArry = UtilsCmmn.getObjDataToLS("isis_favorite") || [];

        $.each(menuInfo, function(i, v) {

            var favTabIdIndex = favTabIdArry.indexOf(v.tabId);
            if (favTabIdIndex != -1) {
                var li = $("<li/>").addClass("tab_go").attr("data-id", v.tabId).attr("data-info", UtilsCmmn.genTabInfoObjToString(v.tabId, v.tabTitle, v.tabUrl));
                var a = $("<a/>").appendTo(li);
                var i = $("<i/>").addClass("fa fa-star color-f-star");
                var span = $("<span/>").addClass("nav-label").html(v.tabTitle);
                a.append(i).append(span);
                parent.append(li);
                loopCnt++;
                if (loopCnt == favTabIdArry) {
                    return false;
                }
            }
        });

    } else {
        // error
    }
}

/* temp ----------------- */
// temp : dynamic menu가 완성되면 createFavoriteMenu 사용
// now(beta), use static menu. save tabObj({id, title, url}) not tabid!
function createFavoriteMenuFromLcDB() {

    if (UtilsCmmn.isSupportLS) {

        var parent = $("#side-menu3");
        var favTabIdArry = UtilsCmmn.getObjDataToLS("isis_favorite") || [];

        favTabIdArry.forEach(function (tabObj) {

            var li = $("<li/>").addClass("tab_go").attr("data-id", tabObj.id).attr("data-info", UtilsCmmn.genTabInfoObjToString(tabObj.id, tabObj.title, tabObj.url));
            var a = $("<a/>").appendTo(li);
            var i = $("<i/>").addClass("fa fa-star color-f-star");
            var span = $("<span/>").addClass("nav-label").html(tabObj.title);
            a.append(i).append(span);
            parent.append(li);

        });
    } else {
        // error
    }
}
/* temp ----------------- */

// 일단 그냥 두번 돌리기로 했음..
function genMenuHtml(menuInfo, menuType, parent) {

    var depth0Menu, depth1Menu;

    $.each(menuInfo, function(i, v) {

        // 부문별 or 업무별 ( 1 or 2)
        if (menuType == v.type) {
            // depth2
            if (v.depth2 != "") {
                var depth2Menu = $("<li/>").addClass("tab_go").attr("data-info", UtilsCmmn.genTabInfoObjToString(v.tabId, v.tabTitle, v.tabUrl));
                var a = $("<a/>").appendTo(depth2Menu);
                a.html(v.depth2);
                depth1Menu.find('.nav-third-level').append(depth2Menu);

                // depth1
            } else if (v.depth2 == "" && v.depth1 != "") {

                if (v.tabYn == "Y") {
                    depth1Menu = $("<li/>").addClass("tab_go").attr("data-info", UtilsCmmn.genTabInfoObjToString(v.tabId, v.tabTitle, v.tabUrl));
                    var a = $("<a/>").appendTo(depth1Menu);
                    a.html(v.depth1);
                } else {
                    depth1Menu = $("<li/>");
                    var a = $("<a/>").appendTo(depth1Menu);
                    a.html(v.depth1);
                    var spanIcon = $("<span/>").addClass("fa arrow");
                    a.append(spanIcon);
                    depth1Menu.append($("<ul/>").addClass("nav nav-third-level collapse"));
                }
                depth0Menu.find('.nav-second-level').append(depth1Menu);

                // depth0
            } else if (v.depth2 == "" && v.depth1 == "") {

                if (v.tabYn == "Y") {
                    depth0Menu = $("<li/>").addClass("tab_go").attr("data-info", UtilsCmmn.genTabInfoObjToString(v.tabId, v.tabTitle, v.tabUrl));
                    var a = $("<a/>").appendTo(depth0Menu);
                    var i = $("<i/>").addClass("fa fa-th-large");
                    var span = $("<span/>").addClass("nav-label").html(v.depth0);
                    a.append(i).append(span);
                } else {
                    depth0Menu = $("<li/>");
                    var a = $("<a/>").appendTo(depth0Menu);
                    var i = $("<i/>").addClass("fa fa-th-large");
                    var span = $("<span/>").addClass("nav-label").html(v.depth0);
                    var spanIcon = $("<span/>").addClass("fa arrow");
                    a.append(i).append(span).append(spanIcon);
                    depth0Menu.append($("<ul/>").addClass("nav nav-second-level collapse"));
                }
                parent.append(depth0Menu);
            }
        }
    });
}




// delete - for dynamic menu local test
/*
var loginInfo = {
		"userId" : "admin",
		"authInfo" : "YYYY_YYYY",
		"menuInfo" : [
	{"type" : "sub1",	"depth0" : "web log",	"depth1" : "",	"depth2" : "",					"tabYn" : "Y",	"tabSeq" : "0001",	"tabId" : "admin_weblog",	"tabTitle" : "web log",	"tabUrl" : "/isis/admin/weblog"},
	{"type" : "sub1",	"depth0" : "dashboard",	"depth1" : "",	"depth2" : "",					"tabYn" : "Y",	"tabSeq" : "0002",	"tabId" : "all_dashboard",	"tabTitle" : "dashboard",	"tabUrl" : "/isis/all/dashboard"},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "",		"depth2" : "",					"tabYn" : "N",	"tabSeq" : "",	"tabId" : "",	"tabTitle" : "",	"tabUrl" : ""},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "영업정보",	"depth2" : "",					"tabYn" : "N",	"tabSeq" : "",	"tabId" : "",	"tabTitle" : "",	"tabUrl" : ""},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "영업정보",	"depth2" : "[매출]일별",		"tabYn" : "Y",	"tabSeq" : "0003",	"tabId" : "all_bn_dailysales",	"tabTitle" : "[매출]일별",	"tabUrl" : "/isis/all/dailysales"},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "영업정보",	"depth2" : "[매출]대분류별",	"tabYn" : "Y",	"tabSeq" : "0004",	"tabId" : "all_bn_clslasales",	"tabTitle" : "[매출]대분류별",	"tabUrl" : "/isis/all/clslasales"},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "영업정보",	"depth2" : "[매출]중분류별",	"tabYn" : "Y",	"tabSeq" : "0005",	"tabId" : "all_bn_clsmisales",	"tabTitle" : "[매출]중분류별",	"tabUrl" : "/isis/all/clsmisales"},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "영업정보",	"depth2" : "[매출]타켓마케팅",	"tabYn" : "Y",	"tabSeq" : "0006",	"tabId" : "all_bn_crosssales",	"tabTitle" : "[매출]타켓마케팅",	"tabUrl" : "/isis/all/crosssales"},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "영업정보",	"depth2" : "[매출]멀티조건",	"tabYn" : "Y",	"tabSeq" : "0006",	"tabId" : "all_bn_multisales",	"tabTitle" : "[매출]멀티조건",	"tabUrl" : "/isis/all/multisales"},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "마케팅정보","depth2" : "",					"tabYn" : "N",	"tabSeq" : "",	"tabId" : "",	"tabTitle" : "",	"tabUrl" : ""},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "마케팅정보","depth2" : "마케팅 Factbook",	"tabYn" : "Y",	"tabSeq" : "0007",	"tabId" : "all_ma_factbook",	"tabTitle" : "마케팅 Factbook",	"tabUrl" : "/isis/all/factbook"},
	{"type" : "sub1",	"depth0" : "전사지표",	"depth1" : "마케팅정보","depth2" : "교차구매내역",		"tabYn" : "Y",	"tabSeq" : "0008",	"tabId" : "all_ma_crossbuy",	"tabTitle" : "교차구매내역",	"tabUrl" : "/isis/all/crossbuy"}
		]
};
*/


//import './js/dashboard';
