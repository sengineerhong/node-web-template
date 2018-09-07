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

    $(function () {
        /* tab info - id, title, url */
        const tabObj = UtilsCmmn.getTabInfo('trfH_allwrap');

        /* flag */
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        let isChartReqEnd = false;
        let searchHisArry = [];
        let isFirstReq = true;
        let isGridInited = false;

        /* view  */
        const $contentWrap = $('#trfH_contentwrap');
        const $dGridWrap = $('#trfH_gridwrap');
        const $dGridTopScroll = $('#trfH_gridtopscroll');
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
        const $gSearchInput = $('#trfH_inputt_gridsearch');

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
                        $timehisMsg.html('&nbsp&nbsp[searched : ' + UtilsCmmn.genSearchTimeHistory(searchHisArry, $drp.val()) + ']');

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
                        // mark text - for go or now request
                        UtilsCmmn.markDtGlobalSearchText($dGrid, $gSearchInput.val());
                        // multi search
                        // UtilsCmmn.markDtMultiSearchText($dGrid);
                    }

                    // mark text - for page changed
                    if (isGridInited) {
                        // global search
                        UtilsCmmn.markDtGlobalSearchText($dGrid, $gSearchInput.val());
                        // multi search
                        UtilsCmmn.markDtMultiSearchText($dGrid);
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
                    // set width 100%
                    $dGrid.css('width', '100%');
                    // footer jq selector
                    var $footer = $($dGrid.api().table().footer());
                    // append input tag to footer
                    $dGrid.api().columns().every(function (idx) {
                        // var title = $(this.footer()).text();
                        $(this.footer()).html('<span class="fa fa-unlock fa-lg badge-td"></span><input type="text" id="multi1_' + idx + '" class="form-control input-sm grid-multi-search" placeholder="search1|search2|..." />');
                    });
                    // set multiple-search event (seperator : | )
                    $dGrid.api().columns().every(function () {
                        var that = this;
                        $('input', this.footer()).on('keyup change', function () {
                            // if (that.search() !== this.value) {
                            var tdIdx = $(this).parent().index() + 1;
                            var markTarget = $('#trfH_allwrap table tr td:nth-child(' + tdIdx + ')');

                            // gen regEx pattern
                            var rexPattern = UtilsCmmn.genGridSearchRegExPattern(this.value);
                            // datable search
                            that.search(rexPattern, true, false).draw();
                            // mark text
                            UtilsCmmn.setRegExMarked(new RegExp(rexPattern, 'g'), markTarget);
                            // }
                        });
                    });
                    // append footer tag to header
                    $($dGrid.api().table().header()).append($footer.children());

                    // set multi-search value(local)
                    if (UtilsCmmn.isSupportLS) {
                        var searched = UtilsCmmn.getObjDataToLS(LS_MULTI_SEARCH) || {};
                        UtilsCmmn.setMultiSearchValue(searched);
                    }

                    // set top-horizontal scroll
                    UtilsCmmn.setTableTopHorizontalScroll($dGridWrap, $dGridTopScroll);
                    // attach mouse wheel event to grid HorizontalScroll (CTRL + mouse wheel)
                    UtilsCmmn.attachMouseWheelEventToTableHScroll($dGridWrap);
                    // for floating component(grid button, global search box)
                    $dGridWrap.scrollEnd(function () {
                        var position = $dGridWrap.scrollLeft();
                        $dGridWrap.find('.html5buttons').animate({left: position}, 300);
                        $dGridWrap.find('#trfH_grid_filter').animate({right: 0 - position}, 300);
                    }, 300);

                    // global search custom logic (union or)
                    $gSearchInput.on('keyup change', function () {
                        // gen regEx pattern
                        var rexPattern = UtilsCmmn.genGridSearchRegExPattern($(this).val());
                        // datable search
                        $dGrid.api().search(rexPattern, true, false).draw();
                        // text mark
                        UtilsCmmn.setRegExMarked(new RegExp(rexPattern, 'g'), $dGrid.find('tbody'));
                        // remark multi search
                        UtilsCmmn.markDtMultiSearchText($dGrid);
                    });
                    // global search custom - replace org position
                    $('#trfH_grid_filter > label > input').hide();
                    $('#trfH_grid_filter').append($gSearchInput.show());

                    // first request flag - for set multi search local storage data
                    isFirstReq = false;
                    // inited flag - for page changed(mark text)
                    isGridInited = true;
                },
                dom: '<"html5buttons"B>lfrtip',
                buttons: [
                    {
                        text: 'Search<br>Off',
                        className: 'badge-btn',
                        action: function (e, dt, node, config) {
                            // toggle search off UI
                            var $SearchOnBtn = $('#trfH_grid_wrapper .badge-btn');
                            var isNowOff = $SearchOnBtn.hasClass('badge-btn-off');
                            if (!isNowOff) {
                                $SearchOnBtn.html('<span>Search<br>On</span>');
                                $SearchOnBtn.addClass('badge-btn-off');
                            } else {
                                $SearchOnBtn.html('<span>Search<br>Off</span>');
                                $SearchOnBtn.removeClass('badge-btn-off');
                            }
                            // toggle multi search badge UI & search on/off
                            $('#trfH_grid th .badge-td').each(function (idx, el) {
                                var $self = $(this);
                                var $parent = $self.parent();
                                var tdIdx = $parent.index() + 1;
                                // toggle multi search badge UI
                                UtilsCmmn.toggleMultiSearchBadge($self, isNowOff);
                                // search false
                                UtilsCmmn.setColumnSearchable($dGrid, tdIdx, isNowOff);
                            });
                            // set grid invalidate
                            UtilsCmmn.setColumnInvalidate($dGrid, -1);
                            // clean multi search
                            $dGrid.api().columns().every(function () {
                                this.search('', true, false);
                            });
                            // redraw grid
                            $dGrid.api().draw(false);
                            // unmark all text & remark global search text (it is toggle logic)
                            UtilsCmmn.setRegExMarked(new RegExp(UtilsCmmn.genGridSearchRegExPattern($gSearchInput.val()), 'g'), $dGrid.find('tbody'));
                        }
                    },
                    {
                        text: 'Clear<br>Filed',
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
                            // redraw grid
                            $dGrid.api().draw(false);
                            // clear mark text all
                            UtilsCmmn.unmarkText($dGrid);
                            // remark global search text
                            UtilsCmmn.markDtGlobalSearchText($dGrid, $gSearchInput.val());
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
            }).on('click', 'th .badge-td', function (e) {
                var $self = $(this);
                var $parent = $self.parent();
                var tdIdx = $parent.index() + 1;
                var isNowOff = $self.hasClass('fa-unlock');

                // grid column search UI on/off
                UtilsCmmn.toggleMultiSearchBadge($self, !isNowOff);
                // grid column search function on/off
                UtilsCmmn.setColumnSearchable($dGrid, tdIdx, !isNowOff);
                // grid invalidate
                UtilsCmmn.setColumnInvalidate($dGrid, tdIdx);
                // grid column search clear
                $dGrid.api().columns(tdIdx).search('', true, false).draw();
                /*
                // for grid redraw
                $self.next().trigger('change');
                // if global search text not empty? redraw grid
                if ($gSearchInput.val() !== '') {
                    // $gSearchInput.trigger('change');
                }
                */
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
            chart.options.title.text = 'bps usage by minute (' + total.toFixed(2) + ' Gbps)';
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
            // isGridInited = false;
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
            setTimeout(UtilsCmmn.setTableTopHorizontalScroll($dGridWrap, $dGridTopScroll), 5);
        });

        /* request! */
        // reset check box(chartRType1-1분)
        // request chart (when load page)
        $chartRType1.iCheck('check');
        // request grid
        initGrid();

        // $('body').on('keydown keyup', function (e) {
        //     console.log('h');
        //     var color = e.type === 'keydown' ? '#faebd72b' : '#ffffff';
        //     if (e.ctrlKey === true || e.keyCode === 17) {
        //         $dGridWrap.css({background: color});
        //     }
        // });

        // $dGridWrap.on('keypress', function (e) {
        //     console.log('h');
        //     if (e.ctrlKey === true) {
        //         $(this).css({background: '#faebd72b'});
        //     }
        // })

        // document.onkeydown = function (e) {
        //     e = e || window.event;
        //     if (e.ctrlKey === true) {
        //         $dGridWrap.css('background-color', '#faebd72b');
        //     }
        // };
        // document.onkeyup = function (e) {
        //     e = e || window.event;
        //     console.log('h');
        //     if (e.keyCode === 17) {
        //         $dGridWrap.css('background-color', '#ffffff');
        //     }
        // };

    });
}(window.TrfHistory || {}, jquery));
