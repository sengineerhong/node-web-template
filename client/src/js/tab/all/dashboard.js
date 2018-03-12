(function(AllDashboard, $) {
    // for showing
    var allMemberBarData = [ { year: "2011", vvip: 106000000, vip: 502000000, family: 163000000, general: 16000000, joinMb: 7910000, secedeMb: 2910000 }, { year: "2012", vvip: 107000000, vip: 635000000, family: 203000000, general: 24000000, joinMb: 9780000, secedeMb: 5780000 }
        ,{ year: "2013", vvip: 111000000, vip: 809000000, family: 276000000, general: 38000000, joinMb: 12620000, secedeMb: 7620000 }, { year: "2014", vvip: 133000000, vip: 947000000, family: 408000000, general: 74000000, joinMb: 16500000, secedeMb: 6500000 }
        ,{ year: "2015", vvip: 229895000, vip: 1403388000, family: 547287000, general: 167368000, joinMb: 25322270, secedeMb: 5322270 }, { year: "2016", vvip: 811101000, vip: 3719044000, family: 726777000, general: 521419000, joinMb: 61227700, secedeMb: 1227700 }
        ,{ year: "2017", vvip: 2191599000, vip: 5142220000, family: 719257000, general: 750956000, joinMb: 93061280, secedeMb: 3061280 }];
    /* static  */
    /* view  */
    var allwrapId = "dashboard_allwrap";
    /* tab id, title, url */
    var tabObj = UtilsIsis.getTabInfo(allwrapId);
    /* user id */
    var userId = "${sessionScope.userInfo.userId}";
    var AllDashboardView = function () {
        var self = this;
        self.init = function($toast, $loadPanel, $chartAllSalesBar, $chartAllSalesPie, $chartAllMemberBar, $rTSalesObj) {
            self.chartAllSalesBar = UtilsDx.initChart($chartAllSalesBar, chartAllSalesBarOpt);
            self.chartAllSalesPie = UtilsDx.initPieChart($chartAllSalesPie, chartAllSalesPieOpt);
            self.chartAllMemberBar = UtilsDx.initChart($chartAllMemberBar, chartAllMemberBarOpt);
            self.$rTSalesObj = $rTSalesObj;
            self.loadPanel = UtilsDx.initLoadPanel($loadPanel,  { position: { of: "#"+allwrapId }, message:"dashboard" });
            self.loadPanel.hide();
            self.loaded = true;
            self.toast = UtilsDx.initToast($toast, { message:"dailysales error" });
        }
        self.clearChart = function() {
            UtilsDx.clearChart(self.chartAllSalesBar);
            UtilsDx.clearChart(self.chartAllSalesPie);
            UtilsDx.clearChart(self.chartAllMemberBar);
        };
        self.updateData = function(allSalesBarUpdOpt, allMemberBarUpdOpt) {
            //self.loadPanel.show();
            //self.loaded = false;
            self.getChartAllSalesBarData(allSalesBarUpdOpt);
            self.getChartAllMemberBarData(allMemberBarUpdOpt);
        };
        self.reRenderView = function() {
            UtilsDx.renderChart(self.chartAllSalesBar);
            UtilsDx.renderChart(self.chartAllSalesPie);
            UtilsDx.renderChart(self.chartAllMemberBar);
        };
        self.clearRtSalesHtml = function() {
            UtilsIsis.clearRtSalesHtml(self.$rTSalesObj);
        };
        self.getRtSalesHtmlData = function(reqOpt) {
            var dataArry = [];
            var cnt = 0;
            var db = reqOpt.localDbSchemaName;
            /* CSRequester reqOpt */
            var requestOpt = $.extend(
                {
                    isDev: window.devconfig_dashboard_fake
                }, reqOpt);
            UtilsIsis.loadData({
                dbName: db,
                request: requestOpt,
                callback: function(result) {
                    // all requests done
                    if (100 == UtilsIsis.calculateProgressStatus(result.progress)) {
                        self.loaded = true;
                        self.loadPanel.hide();
                        result.data[0];
                        // bind data to html
                        UtilsIsis.bindRtSalesHtml(self.$rTSalesObj, result.data[0]);
                    }
                },
                error : function(result) {
                    self.loaded = true;
                    self.loadPanel.hide();
                    // set toast msg & show
                    self.toast.option({type: "error", message: result});
                    self.toast.show();
                }
            });
        };
        self.getChartAllSalesBarData = function(reqOpt) {
            var dataArry = [];
            var cnt = 0;
            var db = reqOpt.localDbSchemaName;
            /* CSRequester reqOpt */
            var requestOpt = $.extend(
                {
                    isDev: window.devconfig_dashboard_fake
                }, reqOpt);
            UtilsIsis.loadData({
                dbName: db,
                request: requestOpt,
                callback: function(result) {
                    // all requests done
                    if (100 == UtilsIsis.calculateProgressStatus(result.progress)) {
                        self.loaded = true;
                        self.loadPanel.hide();
                    }
                    result.data.forEach(function (obj) {
                        // YYYYMMDD to YYY-MM-DD(WD)
                        obj._revDt = UtilsIsis.changeDateFormat(obj.revDt.toString())+obj.revDtNm.toString();
                        dataArry.push(obj);
                    });
                    cnt++;
                    self.chartAllSalesBar.load(dataArry);
                    // pie chart data binding : onDone event 사용
                },
                error : function(result) {
                    self.loaded = true;
                    self.loadPanel.hide();
                    // set toast msg & show
                    self.toast.option({type: "error", message: result});
                    self.toast.show();
                }
            });
        };
        self.getChartAllMemberBarData = function(reqOpt) {
            var dataArry = [];
            var cnt = 0;
            var db = reqOpt.localDbSchemaName;
            /* CSRequester reqOpt */
            var requestOpt = $.extend(
                {
                    isDev: window.devconfig_dashboard_fake
                }, reqOpt);
            UtilsIsis.loadData({
                dbName: db,
                request: requestOpt,
                callback: function(result) {
                    // all requests done
                    if (100 == UtilsIsis.calculateProgressStatus(result.progress)) {
                        self.loaded = true;
                        self.loadPanel.hide();
                    }
                    result.data.forEach(function (obj) {
                        dataArry.push(obj);
                    });
                    cnt++;
                    self.chartAllMemberBar.load(dataArry);
                    // pie chart data binding : onDone event 사용
                },
                error : function(result) {
                    self.loaded = true;
                    self.loadPanel.hide();
                    // set toast msg & show
                    self.toast.option({type: "error", message: result});
                    self.toast.show();
                }
            });
        };
        var chartAllSalesBarOpt =
            {
                palette: "Soft Pastel",
                series: [
                    { valueField: "shopAmt", name: "shop" }
                    ,{ valueField: "bookAmt", name: "book"}
                    ,{ valueField: "entrAmt", name: "ent" }
                    ,{ valueField: "tourAmt", name: "tour" }
                    ,{ axis: "total", type: "spline", valueField: "totalAmt", name: "total", color: "#db5d59", width: 4 }
                ],
                commonSeriesSettings: {
                    argumentField: "_revDt",
                    type: "bar",
                    point: { size: 7 },
                    line: { width: 1 },
                },
                size: {
                    height: 320
                },
                valueAxis: [
                    { grid: { visible: true }, title: { text: "부문 매출" }, label: { format: {type : "millions"} }, axisDivisionFactor: 40 }
                    ,{ name: "total", position: "right", grid: { visible: true }, title: { text: "총 매출" }, label: { format: "millions" }, axisDivisionFactor: 40
                        /* ,constantLines: [
                        {
                        label: {
                        font:{
                        size: 15,
                        color: "#ff7c7c",
                        weight: 600
                        },
                        text: "목표매출!",
                        verticalAlignment: "top",
                        horizontalAlignment: "right",
                        position: "inside"
                        },
                        width: 3,
                        value: 7000000000,
                        color: "#ff7c7c",
                        dashStyle: "dash"
                        }]	  */
                    }
                ],
                argumentAxis: {
                    grid: { visible: true },
                    discreteAxisDivisionMode: "betweenLabels"
                },
                tooltip: {
                    format: {
                        type: "millions",
                        precision: 0
                    }
                }
            }
        var chartAllMemberBarOpt =
            {
                palette: "Soft",
                commonSeriesSettings:{
                    argumentField: "occurYm",
                    type: "stackedbar",	/* fullstackedbar */
                    point: { size: 7 },
                    line: { width: 1 }
                },
                barWidth: 1,
                size: {
                    height: 300
                    /* height: "100%",
                    width: "100%" */
                },
                series: [
                    { axis: "grade", valueField: "memWeCnt", name: "Welcome" }
                    ,{ axis: "grade", valueField: "memFaCnt", name: "Family" }
                    ,{ axis: "grade", valueField: "memViCnt", name: "VIP"}
                    ,{ axis: "grade", valueField: "memVvCnt", name: "VVIP" }
                    ,{ axis: "grade", valueField: "memEtcCnt", name: "ETC" }
                    //,{ axis: "member", valueField: "memNewCnt", name: "신규회원", type: "spline"}
                    //,{ axis: "member", valueField: "memQuitCnt", name: "탈퇴회원", type: "spline"}
                ],
                valueAxis: [
                    { name: "grade", position: "left", title: { text: "등급별 회원수" }, grid: { visible: true }, label: { format: {type : "thousands"}} }
                    //,{ name: "member", position: "right", title: { text: "신규/탈퇴 회원수" }, grid: { visible: true }, label: { format: "fixedPoint" } }
                ],
                argumentAxis: {
                    grid: { visible: true },
                    discreteAxisDivisionMode: "betweenLabels"
                },
                tooltip: {
                    format: {
                        type: "fixedPoint",
                        precision: 0
                    }
                }
            }
        var chartAllSalesPieOpt =
            {
                palette: "Soft Pastel",
                innerRadius: 0.50,
                type: "doughnut",
                dataSource: [],
                series: [{
                    argumentField: "comTpNm",
                    valueField: "amount",
                }],
                size: {
                    height: 350
                },
                legend: {
                    visible: false
                },
                tooltip: {
                    format: {
                        type: "millions",
                        precision: 0
                    }
                }
            }
    };
    $(function() {
        /* real time sales divs */
        var $rTSalesObj = {};
        var rTSalesTagIdArry = ["dmComTp","revDt","dayNm","revHms"
            ,"tRevDt","tDayNm","tRemark","tSaleTotAmt","tSaleOrdAmt","tSaleClmAmt","tCntTotCnt","tCntOrdCnt","tCntClmCnt","tMemOrdCnt","tMemClmCnt","tNonMemOrdCnt","tNonMemClmCnt"
            ,"wRevDt","wDayNm","wRemark","wSaleTotAmt","wSaleOrdAmt","wSaleClmAmt","wCntTotCnt","wCntOrdCnt","wCntClmCnt","wMemOrdCnt","wMemClmCnt","wNonMemOrdCnt","wNonMemClmCnt"
            ,"wSaleTotAmtRt","wSaleOrdAmtRt","wSaleClmAmtRt","wCntTotCntRt","wCntOrdCntRt","wCntClmCntRt","wMemOrdCntRt","wMemClmCntRt","wNonMemOrdCntRt","wNonMemClmCntRt"
            ,"yRevDt","yDayNm","yRemark","ySaleTotAmt","ySaleOrdAmt","ySaleClmAmt","yCntTotCnt","yCntOrdCnt","yCntClmCnt","yMemOrdCnt","yMemClmCnt","yNonMemOrdCnt","yNonMemClmCnt"
            ,"ySaleTotAmtRt","ySaleOrdAmtRt","ySaleClmAmtRt","yCntTotCntRt","yCntOrdCntRt","yCntClmCntRt","yMemOrdCntRt","yMemClmCntRt","yNonMemOrdCntRt","yNonMemClmCntRt"];
        for (var i = 0; i < rTSalesTagIdArry.length; i++) {
            $rTSalesObj[rTSalesTagIdArry[i]] = $("#"+rTSalesTagIdArry[i]);
        }
        /* default setting  */
        /* chart */
        var $chartAllSalesBar = $("#dashboard_allsales_bar");
        var $chartAllSalesPie = $("#dashboard_allsales_pie");
        var $chartAllMemberBar = $("#dashboard_allmember_bar");
        /* chart - etc  */
        var $allSalesPieText = $("#dashboard_allsales_pieText");
        /* loadpanel */
        var $loadPanel = $("#dashboard_loadpanel");
        /* toast */
        var $toast = $("#dashboard_toast");
        /* event setting - request params  */
        var $comTp = $("#dashboard_select_comTp");						// 부문 (02:쇼핑  03:도서  04:ENT  05:투어) ex) 02
        /* request event  */
        $comTp.on("change", function(e) {
            var requestOpt =
                {
                    localDbSchemaName: "AllDashBoardRtSalesDay",
                    byPass: true,
                    url: "/isis/all/dashboard/rtsales/day",
                    aDmComTp: $comTp.val(),									// 부문 (02:쇼핑  03:도서  04:ENT  05:투어) ex) 03
                    aRevDt: moment().format("YYYYMMDD"),				    // 기준일자              --ex) 20171206
                    //aRevDt: "20171206",
                    aAuthComTp: "99"										// 권한부문코드(99:전체) --ex) 99
                };
            AllDashboard.AllDashboardView.clearRtSalesHtml();
            /* AllFactbook.AllFactbookView.clearGrid(); */
            AllDashboard.AllDashboardView.getRtSalesHtmlData(requestOpt);
        });
        // set momont obj - only use once when page loading
        var now = moment();
        //var nowWeekDays = UtilsIsis.getWeekDaysShort(now);
        // init dx view - for chart, loadpanel, etc.
        AllDashboard.AllDashboardView = new AllDashboardView();
        AllDashboard.AllDashboardView.init($toast, $loadPanel, $chartAllSalesBar, $chartAllSalesPie, $chartAllMemberBar, $rTSalesObj);
        // 전부문 bar chart req
        var allSalesBarUpdOpt =
            {
                localDbSchemaName: "AllDashBoardAllSalesBarDay",
                byPass: true,
                url: "/isis/all/dashboard/allsalesbar/day",
                aRevDt: now.format("YYYYMMDD"),				   		// 기준일자              --ex) 20171206
                //aRevDt: "20171206",
                aAuthComTp: "99"										// 권한부문코드(99:전체) --ex) 99
            };
        // 멤버 bar chart req
        var allMemberBarUpdOpt =
            {
                localDbSchemaName: "AllDashBoardAllMemberBarDay",
                byPass: true,
                url: "/isis/all/dashboard/allmemberbar/month",
                aRevDt: now.format("YYYYMM"),				   		// 기준일자              --ex) 201712
                //aRevDt: "201712",
                aAuthComTp: "99"										// 권한부문코드(99:전체) --ex) 99
            };
        // only chart(상단 html 은 별도 update)
        AllDashboard.AllDashboardView.updateData(allSalesBarUpdOpt, allMemberBarUpdOpt);
        // set html view - allSalesBar view(date, weekdays, etc)
        var yDay = now.subtract(1, "days");
        $("#dashboard_allsales_date").html(yDay.format("YYYY-MM-DD"));
        $("#dashboard_allsales_weekd").html("("+UtilsIsis.getWeekDaysShort(yDay)+")");
        // chartAllSalesBar evnet
        AllDashboard.AllDashboardView.chartAllSalesBar.instance.on({
            //"seriesClick":onSeriesClick
            "pointClick": onPointClick,
            "pointSelectionChanged": onPointSelectionChanged,
            "done": onDone
        });
        // all sales bar graph done
        function onDone(info){
            var argumentAxisLength = AllDashboard.AllDashboardView.chartAllSalesBar.instance.getAllSeries()[0].getPoints().length;
            AllDashboard.AllDashboardView.chartAllSalesBar.instance.getAllSeries()[0].getPoints()[argumentAxisLength-1].select();
        }
        function onPointClick(info){
            var clickedPoint = info.target;
            clickedPoint.isSelected() ? clickedPoint.clearSelection() : clickedPoint.select();
        }
        function onPointSelectionChanged(info){
            var selectedPoint = info.target;
            var chartAllSalesBar = AllDashboard.AllDashboardView.chartAllSalesBar;
            var chartAllSalesPie = AllDashboard.AllDashboardView.chartAllSalesPie;
            var totalValue;
            if (selectedPoint.isSelected()) {
                var pieDS = [];
                $.each(chartAllSalesBar.instance.getAllSeries(), function (_, currentSeries) {
                    var point = currentSeries.getPointsByArg(selectedPoint.originalArgument)[0];
                    if (point.series.name != "total") {
                        pieDS.push({ comTpNm: point.series.name, amount: point.originalValue });
                    } else {
                        totalValue = point.originalValue;
                    }
                });
                chartAllSalesPie.load(pieDS);
                $allSalesPieText.html(selectedPoint.originalArgument+"<br>총 매출<br>"+Globalize.formatNumber(totalValue)+"원");
            }
        }
        // Collapse ibox function
        $('.collapse-link').on('click', function () {
            var ibox = $(this).closest('div.ibox');
            var button = $(this).find('i');
            var content = ibox.children('.ibox-content');
            content.slideToggle(500);
            button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
            ibox.toggleClass('').toggleClass('border-bottom');
            setTimeout(function () {
                ibox.resize();
                ibox.find('[id^=map-]').resize();
            }, 50);
        });
        // Close ibox function
        $('.close-link').on('click', function () {
            var content = $(this).closest('div.ibox');
            content.remove();
        });
        // Fullscreen ibox function
        $('.fullscreen-link').on('click', function () {
            //AllDashboard.AllDashboardView.chartAllSalesBar.instance.option("size.height", "800px");
            var ibox = $(this).closest('div.ibox');
            var button = $(this).find('i');
            $('body').toggleClass('fullscreen-ibox-mode');
            button.toggleClass('fa-expand').toggleClass('fa-compress');
            ibox.toggleClass('fullscreen');
            setTimeout(function () {
                $(window).trigger('resize');
            }, 100);
        });
        /* common control  */
        UtilsIsis.initTabCommonFunc(AllDashboard.AllDashboardView, tabObj, userId);
        // request immediately when page loaded.
        $comTp.trigger( "change" );
    });
}(window.AllDashboard || {}, jquery));
