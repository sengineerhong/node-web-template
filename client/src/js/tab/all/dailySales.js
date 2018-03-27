(function(AllDailySales, $) {

    // 임시 로직 - 최초 로딩 여부
    var isFirstReq = true;

    /* static  */
    /* view  */
    var allwrapId = "dailysales_allwrap";
    /* tab id, title, url */
    var tabObj = UtilsCmmn.getTabInfo(allwrapId);
    /* user id */
    var userId = "${sessionScope.userInfo.userId}";

    /* for progress animation*/
    var preProgressPercent = 0;

    var AllDailySalesView = function () {

        var self = this;

        self.isFirstLoad = true;

        // TODO : grid 로 부터 모든 data 를 가져오는 로직 추가 필요
        self.chartData = [];

        self.init = function($grid, $loadPanel, $progress, $chart, $toast) {
            self.grid = UtilsDx.initGrid($grid, gridOptions);
            self.chart = UtilsDx.initChart($chart, chartOptions);
            self.loadPanel = UtilsDx.initLoadPanel($loadPanel,  { position: { of: "#"+allwrapId }, message:"dailysales" });
            self.loadPanel.hide();
            self.loaded = true;
            self.$progress = $progress;
            self.toast = UtilsDx.initToast($toast, { message:"dailysales error" });
        }

        self.clearGrid = function() {
            UtilsDx.clearGrid(self.grid);
        };

        self.clearChart = function() {
            UtilsDx.clearChart(self.chart);
        };

        self.updateData = function(updOptGrid, updOptChart) {
            self.loadPanel.show();
            self.loaded = false;
            self.getGridData(updOptGrid);
            self.getChartData(updOptChart);
        };

        self.reRenderView = function() {
            UtilsDx.repaintGrid(self.grid);
            UtilsDx.renderChart(self.chart);
        };

        self.getGridData = function(reqOpt) {

            var dataArry = [];
            var cnt = 0;
            var db = reqOpt.localDbSchemaName;

            /* CSRequester reqOpt */
            var requestOpt = $.extend(
                {
                    isDev: window.devconfig_dailysales_fake
                }, reqOpt);

            UtilsCmmn.loadData({

                dbName: db,
                request: requestOpt,
                callback: function(result) {

                    // for fake request
                    if (requestOpt.isDev) UtilsCmmn.setKnobFake(self.$progress);

                    var currentProgressPercent = UtilsCmmn.calculateProgressStatus(result.progress);
                    UtilsCmmn.animateKnobProgress(self.$progress, preProgressPercent, currentProgressPercent);
                    preProgressPercent = currentProgressPercent;

                    // all requests done
                    if (100 == UtilsCmmn.calculateProgressStatus(result.progress)) {
                        self.loaded = true;
                        self.loadPanel.hide();
                    }

                    result.data.forEach(function (obj) {
                        dataArry.push(obj);
                    });
                    cnt++;

                    self.grid.load(dataArry);

                    if (cnt != 1)
                        self.grid.instance.refresh();
                },
                error : function(result) {

                    // knob 100% & change knob color(error)
                    UtilsCmmn.animateKnobProgress(self.$progress, "0", "100");
                    UtilsCmmn.setKnobError(self.$progress);
                    // hide loadPanel
                    self.loaded = true;
                    self.loadPanel.hide();
                    // set toast msg & show
                    self.toast.option({type: "error", message: result});
                    self.toast.show();
                }
            });
        };

        self.getChartData = function(reqOpt) {

            var dataArry = [];
            var cnt = 0;
            var db = reqOpt.localDbSchemaName;

            /* CSRequester reqOpt */
            var requestOpt = $.extend(
                {
                    isDev: window.devconfig_dailysales_fake
                }, reqOpt);

            UtilsCmmn.loadData({

                dbName: db,
                request: requestOpt,
                callback: function(result) {

                    // for fake request
                    if (requestOpt.isDev) UtilsCmmn.setKnobFake(self.$progress);

                    var currentProgressPercent = UtilsCmmn.calculateProgressStatus(result.progress);
                    UtilsCmmn.animateKnobProgress(self.$progress, preProgressPercent, currentProgressPercent);
                    preProgressPercent = currentProgressPercent;

                    // all requests done
                    if (100 == UtilsCmmn.calculateProgressStatus(result.progress)) {
                        self.loaded = true;
                        self.loadPanel.hide();
                    }

                    // clear global chart data
                    self.chartData = [];

                    result.data.forEach(function (obj) {

                        // YYYYMMDD to YYY-MM-DD(WD)
                        obj._stdRevDt = UtilsCmmn.changeDateFormat(obj.stdRevDt.toString());
                        if (obj.dmComTp == "02") {
                            dataArry.push(obj);
                        }
                        self.chartData.push(obj);
                    });
                    cnt++;

                    self.chart.load(dataArry);

                    // 임시 로직 - 최초 로딩 여부
                    isFirstReq = false;
                },
                error : function(result) {

                    // knob 100% & change knob color(error)
                    UtilsCmmn.animateKnobProgress(self.$progress, "0", "100");
                    UtilsCmmn.setKnobError(self.$progress);
                    // hide loadPanel
                    self.loadPanel.hide();
                    // set toast msg & show
                    self.toast.option({type: "error", message: result});
                    self.toast.show();
                }
            });
        };

        var gridOptions =
            {
                height: "650px",
                columns: [
                    { caption: "기간", name:"revDt", dataField: "revDt", alignment: "left", width: 100, fixed: true, /* groupIndex: 0, */ sortOrder: 'desc'}
                    ,{ caption: "쇼핑", name: "shop", alignment: "center", columns:
                            [
                                { caption: "금액", name: "shopAmt", dataField: "shopAmt", alignment: "center", format: {type : "fixedPoint"} }
                                ,{ caption: "건수", name: "shopCnt", dataField: "shopCnt", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "UV", name: "shopUV", dataField: "shopUV", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "PV", name: "shopPV", dataField: "shopPV", alignment: "center", format: {type : "fixedPoint"}}
                            ]}
                    ,{ caption: "도서", name: "book", alignment: "center", columns:
                            [
                                { caption: "금액", name: "bookAmt", dataField: "bookAmt", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "건수", name: "bookCnt", dataField: "bookCnt", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "UV", name: "bookUV", dataField: "bookUV", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "PV", name: "bookPV", dataField: "bookPV", alignment: "center", format: {type : "fixedPoint"}}
                            ]
                    }
                    ,{ caption: "ENTR", name: "entr", alignment: "center", columns:
                            [
                                { caption: "금액", name: "entrAmt", dataField: "entrAmt", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "건수", name: "entrCnt", dataField: "entrCnt", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "UV", name: "entrUV", dataField: "entrUV", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "PV", name: "entrPV", dataField: "entrPV", alignment: "center", format: {type : "fixedPoint"}}
                            ]
                    }
                    ,{ caption: "투어", name: "tour", alignment: "center", columns:
                            [
                                { caption: "금액", name: "tourAmt", dataField: "tourAmt", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "건수", name: "tourCnt", dataField: "tourCnt", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "UV", name: "tourUV", dataField: "tourUV", alignment: "center", format: {type : "fixedPoint"}}
                                ,{ caption: "PV", name: "tourPV", dataField: "tourPV", alignment: "center", format: {type : "fixedPoint"}}
                            ]
                    }
                ],
                "export" : {
                    fileName : UtilsDx.getExcelFileName(tabObj.title)
                }
            };

        var chartOptions =
            {
                palette: UtilsDx.getCommonPalette("dailysales_02"),			// default UtilsDx.getCommonPalette("dailysales_02");
                series: [
                    { axis: "uvpv", valueField: "dmComUV", name: "UV" }
                    ,{ axis: "uvpv", valueField: "dmComPV", name: "PV" }
                    ,{ axis: "sales", type: "spline", valueField: "tOrdclmAmt", name: "당기금액", width: 5 }
                    ,{ axis: "sales", type: "spline", valueField: "yOrdclmAmt", name: "YOY금액", point: { visible: true, size: 4 } }
                ],
                commonSeriesSettings: {
                    argumentField: "_stdRevDt",
                    type: "bar",
                    point: { size: 7 },
                    line: { width: 1 },
                },
                size: {
                    height: 320
                },
                valueAxis: [
                    { name: "uvpv", position: "left", grid: { visible: true }, title: { text: "UV/PV" }, label: { format: {type : "thousands"} }, minorTick: {visible: true}, minorTickCount: 10}
                    ,{ name: "sales", position: "right", grid: { visible: true }, title: { text: "매출" }, label: { format: {type : "millions" } }, axisDivisionFactor: 40}
                ],
                argumentAxis: {
                    grid: { visible: true },
                    placeholderSize: 25,
                    discreteAxisDivisionMode: "crossLabels",
                    hoverMode:"allArgumentPoints",
                    valueMarginsEnabled: true,
                },
                legend: {
                    position: "outside",
                    verticalAlignment: "top",
                    horizontalAlignment: "right"
                    /* orientation: "horizontal", */
                },
                margin: {
                    bottom: 20
                },
                tooltip: {
                    format: {
                        type: "millions",
                        precision: 0
                    }
                }
            };
    };

    $(function() {

        /* default setting  */
        /* grid */
        var $grid = $("#dailysales_grid");
        /* chart */
        var $chart = $("#dailysales_chart");
        /* loadpanel */
        var $loadPanel = $("#dailysales_loadpanel");
        /* event knob progress canvas */
        var $progress = $("#dailysales_knob");
        /* request btn */
        var $reqBtn = $("#dailysales_btn_req");
        /* toast */
        var $toast = $("#dailysales_toast");

        // init daterangepicker - for use pick day rage only
        UtilsCmmn.initDaterangepicker("dailysales_drp_strDate", { singleDatePicker: true, startDate: moment().subtract(1, "days") });

        // init knob - for progress circle
        UtilsCmmn.initKnob("dailysales_knob");
        // init checkbox - icheckbox
        UtilsCmmn.initIcheckbox("dailysales_icheck");

        // init dx view - for grid, loadpanel, etc.
        AllDailySales.AllDailySalesView = new AllDailySalesView();
        AllDailySales.AllDailySalesView.init($grid, $loadPanel, $progress, $chart, $toast);


        /* event setting - request params  */
        var $strDate = $("#dailysales_drp_strDate");						// 시작월일	ex)20170801
        var $form = $("#dailysales_form");									// parsley validation form
        var $dmComTpType = $("input[name='dailysales_inputr_dmComTp']");	// 당기/yoy chart 부문선택 radio name
        var $chartYn2 = $("#dailysales_inputc_chartYn");					// chart-row show/hide

        /* request event */
        $reqBtn.on("click", function(e) {

            // 임시 로직 - 최초 로딩 여부
            if (isFirstReq) {
                $chartYn2.iCheck('check');
            }

            var requestOptGrid =
                {
                    localDbSchemaName: "AllDailySalesGrid",
                    byPass: true,
                    url: "/api/all/dailysales/grid",
                    //strDate: $strDate.val().replace(/[^0-9]/g, '').substring(0, 8),
                    strDate: $strDate.val()
                };

            var requestOptChart =
                {
                    localDbSchemaName: "AllDailySalesChart",
                    byPass: true,
                    url: "/api/all/dailysales/yoy",
                    //strDate: $strDate.val().replace(/[^0-9]/g, '').substring(0, 8),
                    strDate: $strDate.val()
                };

            AllDailySales.AllDailySalesView.clearGrid();
            AllDailySales.AllDailySalesView.clearChart();
            UtilsCmmn.setKnobValue($progress, "0");
            UtilsCmmn.resetKnob($progress);
            AllDailySales.AllDailySalesView.updateData(requestOptGrid, requestOptChart);

            // request weblog
            Logger.info("[weblog]", UtilsCmmn.genWebLogJson(userId, tabObj.id, tabObj.title, "search", [requestOptGrid, requestOptChart]));

        });

        /* event control  */
        /* own control  */
        // chart-row show/hide
        $chartYn2.on('ifToggled', function(event){
            if (this.checked) {
                //$("#factbook_chartRow").hide();
                $("#dailysales_chartRow").show(800);
                $("#dailysales_chartRow").fadeIn('slow', function(){

                    setTimeout(AllDailySales.AllDailySalesView.reRenderView, 5);

                });
            } else {
                $("#dailysales_chartRow").hide(800);
                $("#dailysales_chartRow").fadeOut('slow');
            }
        });

        // radio checked event
        $dmComTpType.on('ifChecked', function(event){
            //var mergeKey = $mergeType.filter(":checked").val();
            var dmComTp = $(this).val();
            var chartAllData = AllDailySales.AllDailySalesView.chartData;
            var dmComTpArry = [];

            if (chartAllData) {
                chartAllData.forEach(function (obj) {
                    if (obj.dmComTp == dmComTp) {
                        dmComTpArry.push(obj);
                    }
                });

                // set palette
                var paletteColor = UtilsDx.getCommonPalette("dailysales_"+dmComTp.toString());
                AllDailySales.AllDailySalesView.chart.instance.option("palette", paletteColor);
                // load data
                AllDailySales.AllDailySalesView.chart.load(dmComTpArry);
            } else {
                // TODO : error toast~
            }
        });


        /* common control  */
        UtilsCmmn.initTabCommonFunc(AllDailySales.AllDailySalesView, tabObj, userId);

        // request immediately when page loaded.
        $reqBtn.trigger( "click" );

    });
}(window.AllDailySales || {}, jquery));
