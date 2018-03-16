/* eslint-disable no-undef */
(function (Acct1, $) {
    // TODO: need common ajax request
    function reqAjax (callback, options) {
        $.ajax({
            url: options.url,
            type: options.type || 'POST',
            data: options.param,
            success: function (resData) {
                callback.success(resData);
            },
            error: function (jqXHR, exception) {
                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status === 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status === 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'session time out! Please, Login.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                callback.error(msg);
            }
        });
    }

    function clearChartData (chart) {
        chart.data.labels = [];
        chart.data.datasets[0].data = [];
        // chart.update();
    }

    function updateChart (chart, data) {
        data.forEach(function (item) {
            chart.data.labels.push(item.regTime);
            chart.data.datasets[0].data.push(item.byteSum);
        });
        chart.update();
    }

    function showToast (msg) {
        console.log('show toast: ' + msg);
    }

    $(function () {
        /* flag */
        let isChartReqEnd = false;
        let isGridReqEnd = false;
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
            startDate: moment('2018-03-12 14:00:00', 'YYYY-MM-DD HH:mm:ss'),
            minDate: moment('2018-03-12 14:00:00', 'YYYY-MM-DD HH:mm:ss'),
            maxDate: moment('2018-03-12 23:59:00', 'YYYY-MM-DD HH:mm:ss'),
            timePicker: true,
            timePicker24Hour: true,
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
                    label: 'packet usage by minute',
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
                            labelString: 'byte'
                        }
                    }]
                }
            }
        };

        /* init views */
        // init checkbox - icheckbox
        UtilsIsis.initIcheckbox('acct1_icheck');
        // init drp
        UtilsIsis.initDaterangepicker($drp, drpOptions);
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
                pageLength: 25,
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
                    if (oSettings.aiDisplay.length !== 0 && !isGridReqEnd) {
                        $contentWrap.LoadingOverlay('hide', true);
                        isGridReqEnd = true;
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
                    {'data': 'peerIpSrc'},
                    {'data': 'ifaceIn'},
                    {'data': 'ifaceOut'},
                    {'data': 'ipSrc'},
                    {'data': 'ipDst'},
                    {'data': 'ipProto'},
                    {'data': 'tos'},
                    {'data': 'portSrc'},
                    {'data': 'portDst'},
                    {'data': 'tcpFlag'},
                    {'data': 'packets'},
                    {'data': 'byteSum'}
                ],
                fnInitComplete: function () {
                    $dGrid.css('width', '100%');
                },
                dom: '<"html5buttons"B>lfrtip',
                buttons: [
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
            // request chart
            var reqOpt = {url: 'api/acct/test1/chart', param: {strDate: $drp.val(), range: $chartRType.filter(':checked').val()}};
            reqChartData(reqOpt);

            // request grid
            isGridReqEnd = false;
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
            reqAjax({
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
