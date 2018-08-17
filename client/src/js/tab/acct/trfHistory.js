/* eslint-disable no-undef */
(function (TrfHistory, $) {
    /* local storage name - trfViewer 의 경우는 profile 로 대체함 */
    const LS_MULTI_SEARCH = 'trfH_multi_search';
    /* options */
    // daterangepicker
    const drpOptions = {
        singleDatePicker: true,
        // startDate: moment().subtract(1, 'days'),
        startDate: moment(),
        minDate: moment('2018-04-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
        // maxDate: moment(),
        timePicker: true,
        timePicker24Hour: true,
        timePickerSeconds: true,
        locale: {
            format: 'YYYY-MM-DD HH:mm:ss'
        }
    };
    // chart
    const chartOptions = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'bps usage by minute (0 Gbps)',
                data: [],
                backgroundColor: ['#F67280'],
                borderWidth: 1,
                fill: 'origin',
                fontColor: '#505253'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'bps usage by minute (0 Gbps)',
                fontColor: '#505253'
            },
            legend: {
                display: false,
                labels: {
                    boxWidth: 10
                }
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'iface out',
                        fontSize: 15,
                        padding: 1
                    },
                    ticks: {
                        autoSkip: true,
                        fontColor: '#3f4141'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Gbps'
                    },
                    ticks: {
                        beginAtZero: true,
                        fontColor: '#3f4141'
                    }
                }]
            }
        }
    };

    function getMultiSearchValue (length) {
        var obj = {};
        for (var i = 0; i < length; i++) {
            var k = LS_MULTI_SEARCH + '_' + i;
            var v = $('#' + k).val() || '';
            obj[k] = v;
        }
        return obj;
    }

    function setMultiSearchValue (obj) {
        for (var idx in obj) {
            if (obj.hasOwnProperty(idx)) {
                $('#' + idx).val(obj[idx]).keyup();
            }
        }
    }

    function genSearchTimeHistory (arry, time) {
        arry.unshift(time);
        // keep history length (under 3)
        if (arry.length > 3) {
            arry.splice(3, 1);
        }
        var first = '<div class="pinkred inline">' + arry[0] + '</div>';
        // 2018-04-26 11:26:21
        return first + arry.join(', ').substring(19);
    }

    function setTableTopHorizontalScroll () {
        var tableContainer = $('#trfH_gridwrap');
        var table = $('#trfH_gridwrap table');
        var fakeContainer = $('#trfH_gridtopscroll');
        var fakeDiv = $('#trfH_gridtopscroll div');

        var tableWidth = table.width();
        fakeDiv.width(tableWidth);

        fakeContainer.scroll(function () {
            tableContainer.scrollLeft(fakeContainer.scrollLeft());
        });
        tableContainer.scroll(function () {
            fakeContainer.scrollLeft(tableContainer.scrollLeft());
        });
    }

    $(function () {
        /* tab info - id, title, url */
        const tabObj = UtilsCmmn.getTabInfo('trfH_allwrap');

        /* flag */
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        let isFirstReq = true;
        let isChartReqEnd = false;
        let searchHisArry = [];
        let reqStrDate = '';

        /* view  */
        const $contentWrap = $('#trfH_contentwrap');
        const $dGrid = $('#trfH_grid');
        const $chart = $('#trfH_chart');
        const $reqBtn = $('#trfH_btn_req');
        const $nowBtn = $('#trfH_btn_now');
        const $drp = $('#trfH_drp_date');
        const $chartYn = $('#trfH_inputc_chartYn');
        const $chartRow = $('#trfH_chartRow');
        const $form = $('#trfH_form');                                         // parsley validation form
        const $chartRType = $("input[name='trfH_inputr_chartR']");             // radio name
        const $chartRType1 = $('#trfH_inputr_chartR_1');
        const $timehisMsg = $('#trfH_timehis_msg');

        /* init views */
        // init checkbox - icheckbox
        UtilsCmmn.initIcheckbox('trfH_icheck');
        // init drp
        var cal = UtilsCmmn.initDaterangepicker($drp, drpOptions);
        // init chart
        var chart = new Chart($chart, chartOptions);
        // init datatables
        let dtGrid;
        function initGrid () {
            // init datatables
            // activate spinner
            UtilsCmmn.showOverlay($contentWrap);
            isGridReqEnd = false;
            // datatables
            dtGrid = $dGrid.dataTable({
                deferRender: true,
                language: {search: 'Global Search : '},
                pageLength: 20,
                // pagingType: 'full_numbers',
                bPaginate: true,
                bLengthChange: false,
                bInfo: true,
                searching: true,
                ordering: true,
                responsive: true,
                // bAutoWidth: false,
                // scrollX: true,
                bProcessing: false,
                ajax: {
                    url: 'api/trf/history',
                    type: 'get',
                    contentType: 'application/json;charset=UTF-8',
                    data: function (data) {
                        data.strDate = $drp.val();
                    },
                    dataSrc: function (res) {
                        // update searched-date filed
                        $timehisMsg.html('&nbsp&nbsp[searched : ' + genSearchTimeHistory(searchHisArry, $drp.val()) + ']');

                        if (res.status.code === 1) {
                            return res.result.data;
                        } else {
                            UtilsCmmn.showToast(res.status.msg, false, {});
                            return [];
                        }
                    },
                    error: function (jqXHR, exception) {
                        var msg = UtilsCmmn.getAjaxErrorMsg(jqXHR, exception);
                        UtilsCmmn.showToast(msg, false, {});
                    }

                },
                // fnServerParams: function (aoData) {
                //     aoData.push({ 'name': 'strDate', 'value': $drp.val() });
                // },
                fnDrawCallback: function (oSettings) {
                    // TODO : 임시로직
                    cntFnDrawCB++;
                    if (cntFnDrawCB === 2 && !isGridReqEnd) {
                        // if (oSettings.aiDisplay.length !== 0 && !isGridReqEnd) {
                        UtilsCmmn.hideOverlay($contentWrap);
                        isGridReqEnd = true;
                        cntFnDrawCB = 0;
                        if (oSettings.aiDisplay.length === 0) {
                            UtilsCmmn.showToast('해당 시간 데이터 없음', false, {});
                        }
                    }
                },
                columns: [
                    {'data': 'regTime'},
                    {'data': 'ifaceIn'},
                    {'data': 'ifaceOut'},
                    {'data': 'peerIpSrc'},
                    {'data': 'ipSrc'},
                    {'data': 'ipDst'},
                    {'data': 'ipProto'},
                    {'data': 'tos'},
                    {'data': 'portSrc'},
                    {'data': 'portDst'},
                    {'data': 'tcpFlag'},
                    {'data': 'packets'},
                    {'data': 'bpsSum'}
                ],
                columnDefs: [
                    { targets: [0], visible: false, searchable: false },
                    { className: 'text-right', 'targets': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
                ],
                fnInitComplete: function () {
                    $dGrid.css('width', '100%');
                    // append input tag to footer
                    var api = $dGrid.api();
                    api.columns().every(function (idx) {
                        // var title = $(this.footer()).text();
                        $(this.footer()).html('<input type="text" id="multi1_' + idx + '" class="form-control input-sm grid-multi-search" placeholder="search1|search2|..." />');
                    });
                    // append footer tage to header
                    var $footer = $(api.table().footer());
                    $(api.table().header()).append($footer.children());
                    // set multiple-search event (seperator : | )
                    api.columns().every(function () {
                        var that = this;
                        $('input', this.footer()).on('keyup change', function () {
                            if (that.search() !== this.value) {
                                // that.search(this.value.replace(/\s+/g, '|'), true).draw();
                                // that.search(this.value, true, false).draw();
                                that.search(this.value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$]/g, '\\$&'), true, false).draw();
                            }
                        });
                    });
                    // set multi-search value(local)
                    if (UtilsCmmn.isSupportLS) {
                        var searched = UtilsCmmn.getObjDataToLS(LS_MULTI_SEARCH) || {};
                        setMultiSearchValue(searched);
                    }
                    isFirstReq = false;

                    // set top-horizontal scroll
                    setTableTopHorizontalScroll();
                },
                dom: '<"html5buttons"B>lfrtip',
                buttons: [
                    {
                        text: 'clear filed',
                        className: 'grid-dom-btn1',
                        action: function (e, dt, node, config) {
                            $dGrid.api().columns().every(function () {
                                $('input', this.footer()).val('');
                                // this.search('').draw();
                                this.search('');
                                // remove multi-search value
                                if (UtilsCmmn.isSupportLS) {
                                    UtilsCmmn.removeDataToLS('searched1');
                                }
                            });
                            $dGrid.api().draw();
                        }
                    },
                    {extend: 'copy'},
                    {extend: 'csv'},
                    {extend: 'excel', title: 'ExampleFile'},
                    {extend: 'pdf', title: 'ExampleFile'},
                    {extend: 'print',
                        customize: function (win) {
                            $(win.document.body).addClass('white-bg');
                            $(win.document.body).css('font-size', '10px');
                            $(win.document.body).find('table')
                                .addClass('compact')
                                .css('font-size', 'inherit');
                        }
                    }
                ]
            });
        }

        /* view control  */
        // request chart
        function reqChartData (reqOpt) {
            UtilsCmmn.showOverlay($chartRow);
            isChartReqEnd = false;

            UtilsCmmn.clearChart(chart);

            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    UtilsCmmn.hideOverlay($chartRow);
                    isChartReqEnd = true;
                    if (res.status.code === 1) {
                        updateChart(chart, res.result.data);
                    } else {
                        UtilsCmmn.showToast(res.status.msg, false, {});
                    }
                },
                error: function (msg) {
                    UtilsCmmn.hideOverlay($chartRow);
                    isChartReqEnd = true;
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
        }
        // update chart
        function updateChart (chart, data) {
            var total = 0;
            data.forEach(function (item) {
                chart.data.labels.push(item.regTime);
                chart.data.datasets[0].data.push(item.bpsSum);
                total += Number(item.bpsSum);
            });
            chart.options.title.text = 'bps usage by minute (' + total.toFixed(2) + ' Gbps)'
            chart.update();
        }

        /* event control  */
        function reqEvent (strDate) {
            // get multi-search value
            if (!isFirstReq) {
                var searched = getMultiSearchValue($dGrid.api().columns().header().length);
                // save multi-search value(local)
                if (UtilsCmmn.isSupportLS) {
                    UtilsCmmn.setObjDataToLS(LS_MULTI_SEARCH, searched);
                }
            }
            // request chart
            var reqOpt = {url: 'api/trf/bpsUsage', type: 'get', param: {strDate: $drp.val(), range: $chartRType.filter(':checked').val()}};
            // var reqOpt = {url: 'api/acct/test1/chart', param: {strDate: $drp.val(), range: $chartRType.filter(':checked').val()}};
            reqChartData(reqOpt);
            // request grid
            isGridReqEnd = false;
            cntFnDrawCB = 0;
            UtilsCmmn.showOverlay($contentWrap);
            dtGrid.fnClearTable();
            dtGrid.fnReloadAjax();
        }

        // request event
        $reqBtn.on('click', function (e) {
            reqEvent();
        });

        // request(now) event
        $nowBtn.on('click', function (e) {
            // get now & set now to cal
            var now = moment().format('YYYY-MM-DD HH:mm:ss');
            cal.setStartDate(now);
            $drp.val(now);
            reqEvent();
        });

        /* own control  */
        // chart-row show/hide
        $chartYn.on('ifToggled', function (e) {
            if (this.checked) {
                $chartRow.show(800);
                $chartRow.fadeIn('slow', function () {});
                if (!isChartReqEnd) UtilsCmmn.showOverlay($chartRow);
            } else {
                UtilsCmmn.hideOverlay($chartRow);
                $chartRow.hide(800);
                $chartRow.fadeOut('slow');
            }
        });

        // radio checked event
        $chartRType.on('ifChecked', function (e) {
            var chartR = $(this).val();
            var reqOpt = {url: 'api/trf/bpsUsage', type: 'get', param: {strDate: $drp.val(), range: chartR}};
            reqChartData(reqOpt);
        });

        // tab shown event
        $("a[href='#" + tabObj.id + "']").on('shown.bs.tab', function (e) {
            setTimeout(setTableTopHorizontalScroll, 5);
        });

        /* request! */
        // reset check box(chartRType1-1분)
        // request chart (when load page)
        $chartRType1.iCheck('check');
        // request grid
        initGrid();
    });
}(window.TrfHistory || {}, jquery));
