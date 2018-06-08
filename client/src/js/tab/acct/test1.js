/* eslint-disable no-undef */
(function (Acct1, $) {
    function clearChartData (chart) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        chart.data.datasets[0].label = '';
        // chart.update();
    }

    function updateChart (chart, data) {
        data.forEach(function (item) {
            chart.data.labels.push(item.regTime);
            chart.data.datasets[0].data.push(item.bpsSum);
        });
        chart.data.datasets[0].label = 'bps usage by minute (Gbps)';
        chart.update();
    }

    function showToast (msg) {
        console.log('show toast: ' + msg);
        window.plainToast.option({type: 'error', message: msg});
        window.plainToast.show();
    }

    function getMultiSearchValue (length) {
        var obj = {};
        for (var i = 0; i < length; i++) {
            var k = 'multi1_' + i;
            var v = $('#' + k).val() || '';
            obj[k] = v;
        }
        return obj;
    }

    function setMultiSearchValue (obj) {
        // console.log('setMultiSearchValue' + JSON.stringify(obj));
        for (var idx in obj) {
            if (obj.hasOwnProperty(idx)) {
                $('#' + idx).val(obj[idx]).keyup();
            }
        }
    }

    $(function () {
        /* flag */
        let isChartReqEnd = false;
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        let isFirstReq = true;
        /* view  */
        const $dGrid = $('#acct1_grid');
        const $chart = $('#acct1_chart');
        const $reqBtn = $('#acct1_btn_req');
        const $drp = $('#acct1_drp_date');
        const $chartYn = $('#acct1_inputc_chartYn');
        const $chartRow = $('#acct1_chartRow');
        // const $form = $('#acct1_form');                                         // parsley validation form
        const $chartRType = $("input[name='acct1_inputr_chartR']");             // radio name
        const $chartRType1 = $('#acct1_inputr_chartR_1');
        const $contentWrap = $('#acct1_contentwrap');

        /* options */
        // LoadingOverlay
        const LoadingOverlayOpt = {size: '10%', color: 'rgba(255, 255, 255, 0.6)'};
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
            // isInvalidDate: function (date) {
            //     if (moment(date).format('YYYY-MM-DD') === '2018-03-15') {
            //         return true;
            //     }
            // }
        };
        // chart
        const chartOptions = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'bps usage by minute (Gbps)',
                    data: [],
                    backgroundColor: ['#F67280'],
                    borderWidth: 1,
                    fill: 'origin'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        },
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Gbps'
                        }
                    }]
                }
            }
        };

        /* init views */
        // init checkbox - icheckbox
        UtilsCmmn.initIcheckbox('acct1_icheck');
        // init drp
        UtilsCmmn.initDaterangepicker($drp, drpOptions);
        // init chart
        var chart = new Chart($chart, chartOptions);
        // init datatables
        let dtGrid;
        function initGrid () {
            // init datatables
            // activate spinner
            $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
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
                // bServerSide: true,
                sAjaxSource: 'api/acct/test1/grid',
                sServerMethod: 'POST',
                fnServerParams: function (aoData) {
                    aoData.push({ 'name': 'strDate', 'value': $drp.val() });
                },
                fnDrawCallback: function (oSettings) {
                    // TODO : 임시로직
                    cntFnDrawCB++;
                    if (cntFnDrawCB === 2 && !isGridReqEnd) {
                        // if (oSettings.aiDisplay.length !== 0 && !isGridReqEnd) {
                        $contentWrap.LoadingOverlay('hide', true);
                        isGridReqEnd = true;
                        cntFnDrawCB = 0;
                        if (oSettings.aiDisplay.length === 0) {
                            showToast('해당 기간 데이터 없음');
                        }
                    }
                },
                /*
                ajax: reqAjax({
                    success: function (data) {
                        $('#test1').DataTable().api().ajax.reload();
                    },
                    error: showToast
                }, {url: 'api/acct/test1/grid', param: {strDate: $drp.val()}}),
                ajax: {
                    url: 'api/acct/test1/grid',
                    type: 'POST',
                    data: {strDate: 1234},
                    // contentType: 'application/json;charset=UTF-8'
                },
                */
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
                                that.search(this.value.replace(/\s+/g, '|'), false).draw();
                            }
                        });
                    });
                    // set multi-search value(local)
                    if (UtilsCmmn.isSupportLS) {
                        var searched = UtilsCmmn.getObjDataToLS('searched1') || {};
                        setMultiSearchValue(searched);
                    }
                    isFirstReq = false;
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

        /* event control  */
        /* request event */
        $reqBtn.on('click', function (e) {
            // get multi-search value
            if (!isFirstReq) {
                var searched = getMultiSearchValue($dGrid.api().columns().header().length);
                // save multi-search value(local)
                if (UtilsCmmn.isSupportLS) {
                    UtilsCmmn.setObjDataToLS('searched1', searched);
                }
            }
            // request chart
            var reqOpt = {url: 'api/acct/test1/chart', param: {strDate: $drp.val(), range: $chartRType.filter(':checked').val()}};
            reqChartData(reqOpt);
            // request grid
            isGridReqEnd = false;
            cntFnDrawCB = 0;
            $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
            dtGrid.fnClearTable();
            dtGrid.fnReloadAjax();
        });
        /* own control  */
        // chart-row show/hide
        $chartYn.on('ifToggled', function (e) {
            if (this.checked) {
                $chartRow.show(800);
                $chartRow.fadeIn('slow', function () {
                    // setTimeout(AllDailySales.AllDailySalesView.reRenderView, 5);
                });
                // check chart request done
                if (!isChartReqEnd) $chartRow.LoadingOverlay('show', LoadingOverlayOpt);
            } else {
                $chartRow.LoadingOverlay('hide', true);
                $chartRow.hide(800);
                $chartRow.fadeOut('slow');
            }
        });

        // radio checked event
        $chartRType.on('ifChecked', function (e) {
            var chartR = $(this).val();
            var reqOpt = {url: 'api/acct/test1/chart', param: {strDate: $drp.val(), range: chartR}};

            reqChartData(reqOpt);
        });

        function reqChartData (reqOpt) {
            $chartRow.LoadingOverlay('show', LoadingOverlayOpt);
            isChartReqEnd = false;
            clearChartData(chart);
            UtilsCmmn.reqDefaultAjax({
                success: function (data) {
                    updateChart(chart, data);
                    $chartRow.LoadingOverlay('hide', true);

                    isChartReqEnd = true;
                },
                error: showToast
            }, reqOpt);
        }

        // reset check box(chartRType1-1분)
        // update chart (when load page)
        $chartRType1.iCheck('check');
        initGrid();
    });
}(window.Acct1 || {}, jquery));
