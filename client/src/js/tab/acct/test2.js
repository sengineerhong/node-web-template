/* eslint-disable no-undef */
(function (Acct2, $) {
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
        chart.data.datasets[0].label = '';

        chart.options.title.text = '';
        // chart.update();
    }

    function updateChart (chart, data) {
        var min =  Math.min.apply(Math, data.map(function (o) { return o.byteSum; }));
        var unit = checkByteUnit(min);
        data.forEach(function (item) {
            // chart.data.labels.push(item.dstNetMask);
            // chart.data.datasets[0].data.push(genByteUnit(item.byteSum, unit));
            chart.data.labels.push(item.byteSum);
            chart.data.datasets[0].data.push(item.dstAs);
        });
        chart.data.datasets[0].label = 'packet usage by dstAs (' + unit + ')'
        chart.update();
    }

    function updatePie (pie, data) {
        var min =  Math.min.apply(Math, data.map(function (o) { return o.byteSum; }));
        var unit = checkByteUnit(min);
        data.forEach(function (item) {
            pie.data.labels.push(item.ifaceOut);
            pie.data.datasets[0].data.push(genByteUnit(item.byteSum, unit));
        });
        pie.options.title.text = 'packet usage by ifaceOut (' + unit + ')'
        pie.update();
    }

    function showToast (msg) {
        console.log('show toast: ' + msg);
        window.plainToast.option({type: 'error', message: msg});
        window.plainToast.show();
    }

    function checkByteUnit (num) {
        if (num < 1024)             { return 'Bytes'; }
        if (num < 1048576)          { return 'KB'; }
        if (num < 1073741824)       { return 'MB'; }
        if (num < 1099511600000)    { return 'GB'; }
        return 'TB';
    }

    function genByteUnit (num, unit) {
        var genNum;
        switch (unit) {
            case 'Bytes':
                genNum = num;
                break;
            case 'KB':
                genNum = num / 1024;
                break;
            case 'MB':
                genNum = num / 1024 / 1024;
                break;
            case 'GB':
                genNum = num / 1024 / 1024 / 1024;
                break;
            default:
                genNum = num / 1024 / 1024 / 1024 / 1024;
                break;
        }
        return genNum;
    }

    function formatBytes (bytes, decimals) {
        if (bytes === 0) return '0 Bytes';
        var k = 1024;
        var dm = decimals || 2;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    }

    function byteFormatter (data, type, row) {
        if (!$.isNumeric(data)) return data;
        else return formatBytes(data);
    }

    $(function () {
        /* flag */
        let isChartReqEnd = false;
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        /* view  */
        const $dGrid = $('#acct2_grid');
        const $chart = $('#acct2_chart');
        const $pie = $('#acct2_pie');
        const $reqBtn = $('#acct2_btn_req');
        const $drp = $('#acct2_drp_date');
        const $chartYn = $('#acct2_inputc_chartYn');
        const $chartRow = $('#acct2_chartRow');
        // const $form = $('#acct2_form');                                         // parsley validation form
        const $contentWrap = $('#acct2_contentwrap');

        /* options */
        // LoadingOverlay
        const LoadingOverlayOpt = {size: '10%', color: 'rgba(255, 255, 255, 0.6)'};
        // daterangepicker
        const drpOptions = {
            singleDatePicker: true,
            // startDate: moment().subtract(1, 'days'),
            startDate: moment('2018-03-12 14:00:00', 'YYYY-MM-DD HH:mm:ss'),
            minDate: moment('2018-03-11 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
            maxDate: moment().subtract(1, 'hours'),
            timePicker: true,
            timePicker24Hour: true,
            locale: {
                format: 'YYYY-MM-DD HH:mm:ss'
            },
            isInvalidDate: function (date) {
                if (moment(date).format('YYYY-MM-DD') === '2018-03-15') {
                    return true;
                }
            }
        };
        // chart
        const chartOptions = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'packet usage by dstAs',
                    data: [],
                    backgroundColor: '#F67280',
                    borderColor: '#F67280',
                    borderWidth: 1,
                    fill: 'origin'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: false,
                            labelString: 'dstAs',
                            fontSize: 15,
                            padding: 1,
                            fontColor: '#000'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'packet'
                        }
                    }]
                }
            }
        };
        // pie
        const pieOptions = {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#6C567B', '#C06C84', '#F67280', '#51ADCF', '#35B0AB', '#F8B195']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'packet usage by ifaceOut'
                }
            }
        };

        /* init views */
        // init checkbox - icheckbox
        UtilsCmmn.initIcheckbox('acct2_icheck');
        // init drp
        UtilsCmmn.initDaterangepicker($drp, drpOptions);
        // init chart
        var chart = new Chart($chart, chartOptions);
        // init chart
        var pie = new Chart($pie, pieOptions);
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
                sAjaxSource: 'api/acct/test2/grid',
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
                    {'data': '33882175', render: byteFormatter},
                    {'data': '37290047', render: byteFormatter},
                    {'data': '100991039', render: byteFormatter},
                    {'data': '103874623', render: byteFormatter},
                    {'data': '201654335', render: byteFormatter},
                    {'data': '205586495', render: byteFormatter},
                    {'data': 'dstNetMask'},
                    {'data': 'byteSum', render: byteFormatter},
                    {'data': 'dstAs'}
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
            var reqOpt = {url: 'api/acct/test2/chart', param: {strDate: $drp.val()}};
            reqChartData(reqOpt);
            var reqOptPie = {url: 'api/acct/test2/pie', param: {strDate: $drp.val()}};
            reqPieData(reqOptPie);
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

        function reqPieData (reqOpt) {
            clearChartData(pie);
            reqAjax({
                success: function (data) {
                    updatePie(pie, data);
                },
                error: showToast
            }, reqOpt);
        }

        // request chart
        reqChartData({url: 'api/acct/test2/chart', param: {strDate: $drp.val()}});
        reqPieData({url: 'api/acct/test2/pie', param: {strDate: $drp.val()}});
        initGrid();
    });
}(window.Acct2 || {}, jquery));
