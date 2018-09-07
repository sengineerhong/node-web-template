/* eslint-disable no-undef */
(function (TrfViewer, $) {
    /* local storage name */
    const LS_MULTI_SEARCH = 'trfV_multi_search';
    /* options */
    // random color
    const defColor = ['#51574a', '#447c69', '#74c493', '#8e8c6d', '#e4bf80', '#e9d78e', '#e2975d', '#f19670', '#e16552', '#c94a53', '#be5168', '#a34974', '#993767', '#65387d', '#4e2472', '#9163b6', '#e279a3', '#e0598b', '#7c9fb0', '#5698c4', '#9abf88'].map(function (item) { return UtilsCmmn.hexToRGB(item, '0.7'); });
    const ranColor = randomColor({hue: 'random', luminosity: 'dark', count: 100}).map(function (item) { return UtilsCmmn.hexToRGB(item, '0.4'); });
    const pieColor = defColor.concat(ranColor);
    // daterangepicker
    const drpOptions = {
        autoUpdateInput: true,
        singleDatePicker: true,
        startDate: moment(),
        minDate: moment().subtract(1, 'days'),
        maxDate: moment().add(1, 'days'),
        timePicker: true,
        timePicker24Hour: true,
        timePickerSeconds: true,
        locale: {
            format: 'YYYY-MM-DD HH:mm:ss'
        }
    };
    // chart
    const chartOptions = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '',
                data: [],
                backgroundColor: [],
                // borderColor: '#F67280',
                borderWidth: 1,
                fill: 'origin'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: 'bps sum by iface out (0 Gbps)',
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
                        autoSkip: false,
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
                        fontColor: '#3f4141'
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
                backgroundColor: pieColor
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: 'packet usage by ifaceOut',
                fontColor: '#505253'
            },
            legend: {
                display: true,
                labels: {
                    boxWidth: 10,
                    fontColor: '#505253',
                    filter: function (item, chart) {
                        // skip label if data is 0.00
                        return (parseFloat(chart.datasets[0].data[item.index]));
                    }
                }
            },
            pieceLabel: {
                mode: 'percentage',
                position: 'border',
                precision: 0,
                textShadow: false,
                fontColor: '#3f4141',
                fontStyle: 'bold',
                overlap: false,
                fontSize: 13
            }
        }
    };

    function getValidProfileFromUserInfo (profileArry) {
        var isValidProfile = false;
        // default is -1 (all ifaceout)
        var profileSelectVal = -1;
        // temp : get history data from local db
        if (UtilsCmmn.isSupportLS) {
            var userInfo = UtilsCmmn.getObjDataToLS('userInfo') || {};
            profileSelectVal = userInfo.profileId || -1;
        }
        for (var k = 0; k < profileArry.length; k++) {
            var item = profileArry[k];
            if (parseInt(item.profileId) === profileSelectVal) {
                isValidProfile = true;
                break;
            }
        }
        return isValidProfile ? profileSelectVal : -1;
    }

    $(function () {
        /* tab id, title, url */
        const tabObj = UtilsCmmn.getTabInfo('trfV_allwrap');

        /* flag */
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        let searchHisArry = [];
        let isChartLinked = true;
        let isGridInited = false;

        /* view  */
        const $contentWrap = $('#trfV_contentwrap');
        const $dGridWrap = $('#trfV_gridwrap');
        const $dGridTopScroll = $('#trfV_gridtopscroll');
        let $dGrid;
        const $chart = $('#trfV_chart');
        const $pie = $('#trfV_pie');
        const $reqBtn = $('#trfV_btn_req');
        const $nowBtn = $('#trfV_btn_now');
        const $drp = $('#trfV_drp_date');
        const $chartYn = $('#trfV_inputc_chartYn');
        const $chartRow = $('#trfV_chartRow');
        const $form = $('#trfV_form');                                         // parsley validation form
        const $intervalRType = $("input[name='trfV_inputr_intervalR']");          // radio name
        const $intervalMsg = $('#trfV_interval_msg');
        const $timehisMsg = $('#trfV_timehis_msg');
        const $linkChartYn = $('#trfV_inputc_linkChartYn');
        const $profileSelect = $('#trfV_sel2_profile');
        // ifo as modal
        const $ifoasModal = $('#trfV_modal_ifoas');
        const $ifoasModalBody = $('#trfV_body_ifoas');
        const $ifoasModalBtn = $('#trfV_btn_ifoas');
        const $gSearchInput = $('#trfV_inputt_gridsearch');

        /* init views */
        // init checkbox - icheckbox
        UtilsCmmn.initIcheckbox('trfV_icheck');
        // init drp
        var cal = UtilsCmmn.initDaterangepicker($drp, drpOptions);
        // init chart
        var chart = new Chart($chart, chartOptions);
        // init pie
        var pie = new Chart($pie, pieOptions);
        // init datatables
        let dtGrid;
        function initGrid (options) {
            var searchTimer;
            // init datatables
            // activate spinner
            UtilsCmmn.showOverlay($contentWrap);
            isGridReqEnd = false;
            // datatables
            dtGrid = $dGrid.dataTable({
                language: {search: 'Global Search(OR) : ', searchPlaceholder: 'search1|search2|...'},
                autoWidth: false,
                pageLength: 20,
                // pagingType: 'full_numbers',
                bPaginate: true,
                bLengthChange: false,
                bInfo: true,
                searching: true,
                ordering: true,
                order: [[ options.ifaceLength + 1, 'desc' ]],
                responsive: true,
                // bAutoWidth: false,
                // scrollX: true,
                bProcessing: false,
                // bServerSide: true,
                ajax: {
                    url: 'api/trf/viewer',
                    type: 'get',
                    data: {strDate: $drp.val(), interval: $intervalRType.filter(':checked').val(), profileId: $profileSelect.val()},
                    contentType: 'application/json;charset=UTF-8',
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
                // sAjaxSource: 'api/acct/test2/grid',
                // sServerMethod: 'POST',
                // fnServerParams: function (aoData) {
                //     aoData.push({ name: 'strDate', value: $drp.val() });
                //     aoData.push({ name: 'interval', value: $intervalRType.filter(':checked').val() });
                //     aoData.push({ name: 'profileId', value: $profileSelect.val() });
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
                        // footer sum - use footer seconds tr
                        var graphArry = [];
                        var api = this.api();
                        for (let i = 1; i < options.ifaceLength + 2; i++) {
                            var tdIdx = i - 1;
                            var sum = (api.column(i).data().sum()).toFixed(2);
                            var title = api.column(i).title();
                            var titleAs = title.substr(0, title.indexOf('['));
                            var lastIdx = options.ifaceLength + 1;
                            // var colDataCnt = (i === lastIdx) ? 0 : oSettings.json.colDataCnt[i].cnt;
                            var headerColor = pieColor[i - 1];
                            if (i !== lastIdx) {
                                if (parseFloat(sum) === 0.00) {
                                    $(api.column(i).footer()).closest('tr').next().find('td:eq(' + tdIdx + ')').html(sum + ' Gbps');
                                } else {
                                    $(api.column(i).footer()).closest('tr').next().find('td:eq(' + tdIdx + ')').css('background-color', headerColor).html(sum + ' Gbps');
                                }
                                graphArry.push({title: title, titleAs: titleAs, sum: sum, color: headerColor});
                            } else {
                                $(api.column(i).footer()).closest('tr').next().find('td:eq(' + tdIdx + ')').html(sum + ' Gbps');
                            }
                        }
                        updateChart(chart, graphArry);
                        updatePie(pie, graphArry);
                        // mark global search text - for go or now request
                        UtilsCmmn.markDtGlobalSearchText($dGrid, $gSearchInput.val());
                    }
                    // mark text - for page changed
                    if (isGridInited) {
                        // global search
                        UtilsCmmn.markDtGlobalSearchText($dGrid, $gSearchInput.val());
                        // multi search
                        UtilsCmmn.markDtMultiSearchText($dGrid);
                    }
                },
                columns: options.columns,
                columnDefs: [
                    {targets: [0], visible: false, searchable: false},
                    {targets: '_all', className: 'text-right'},
                    {targets: [options.ifaceLength + 4],
                        render: function (data, type, row, meta) {
                            var cValue = data.split('_');
                            if (type === 'display' && cValue[0] === 'reqwhois') {
                                data = '<button class="btn btn-small btn-warning margin-b-reset" data-dstas="' + cValue[1] + '">Update</button>';
                            }
                            return data;
                        }
                    }
                ],
                fnInitComplete: function (oSettings, json) {
                    // set width 100%
                    $dGrid.css('width', '100%');
                    // footer jq selector tr1(search), tr2(sum)
                    var $footer = $($dGrid.api().table().footer());
                    // set class to tr2(sum)
                    $footer.find('tr:eq(1)').addClass('sum');
                    // set input to tr1(search)
                    $footer.find('tr:eq(0)').children('td').each(function (idx) {
                    // <i class="fa fa-unlock fa-lg badge"></i>
                        $(this).html('<span class="fa fa-unlock fa-lg badge-td"></span><input type="text" id="field_' + idx + '" class="form-control input-sm grid-multi-search" placeholder="search1|search2|..." />');
                    });
                    // set event to tr1(search)
                    $dGrid.api().columns().every(function () {
                        var that = this;
                        $('input', this.footer()).on('keyup change', function () {
                            // if (that.search() !== this.value) {
                            // if ($gSearchInput.val() !== this.value) {
                            var tdIdx = $(this).parent().index() + 1;
                            var markTarget = $('#trfV_allwrap table tr td:nth-child(' + tdIdx + ')');

                            // gen regEx pattern
                            var rexPattern = UtilsCmmn.genGridSearchRegExPattern(this.value);
                            // datable search
                            that.search(rexPattern, true, false).draw();
                            // mark text
                            UtilsCmmn.setRegExMarked(new RegExp(rexPattern, 'g'), markTarget);
                            // }
                        });
                    });
                    // append from footer to header
                    $($dGrid.api().table().header()).append($footer.children());

                    // use profile only
                    if (options.useProfile) {
                        var fieldObj = {};
                        for (let i = 0; i < options.profileData.length; i++) {
                            fieldObj['field_' + i] = options.profileData[i].fieldIfaceOut;
                            if (i === options.profileData.length - 1) {
                                // fieldObj['field_' + (i + 1)] = options.profileData[i].profileFieldBpssum;
                                fieldObj['field_' + (i + 2)] = options.profileData[i].profileFieldPeeripsrc;
                                fieldObj['field_' + (i + 3)] = options.profileData[i].profileFieldDstnetmask;
                                fieldObj['field_' + (i + 4)] = options.profileData[i].profileFieldDstas;
                            }
                        }
                        // console.log(fieldObj);
                        UtilsCmmn.setMultiSearchValue(fieldObj);
                    }
                    // set top-horizontal scroll
                    UtilsCmmn.setTableTopHorizontalScroll($dGridWrap, $dGridTopScroll);
                    // attach mouse wheel event to grid HorizontalScroll (CTRL + mouse wheel)
                    UtilsCmmn.attachMouseWheelEventToTableHScroll($dGridWrap);
                    // for floating component(grid button, global search box)
                    $dGridWrap.scrollEnd(function () {
                        var position = $dGridWrap.scrollLeft();
                        $dGridWrap.find('.html5buttons').animate({left: position}, 300);
                        $dGridWrap.find('#trfV_grid_filter').animate({right: 0 - position}, 300);
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
                    $('#trfV_grid_filter > label > input').hide();
                    $('#trfV_grid_filter').append($gSearchInput.show());

                    // inited flag
                    isGridInited = true;
                },
                dom: '<"html5buttons"B>lfrtip',
                buttons: [
                    {
                        text: 'Search<br>Off',
                        className: 'badge-btn',
                        action: function (e, dt, node, config) {
                            // toggle search off UI
                            var $SearchOnBtn = $('#trfV_grid_wrapper .badge-btn');
                            var isNowOff = $SearchOnBtn.hasClass('badge-btn-off');
                            if (!isNowOff) {
                                $SearchOnBtn.html('<span>Search<br>On</span>');
                                $SearchOnBtn.addClass('badge-btn-off');
                            } else {
                                $SearchOnBtn.html('<span>Search<br>Off</span>');
                                $SearchOnBtn.removeClass('badge-btn-off');
                            }
                            // toggle multi search badge UI & search on/off
                            $('#trfV_grid td .badge-td').each(function (idx, el) {
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
                            // clean input field and search function
                            $dGrid.api().columns().every(function (idx) {
                                $('input', this.footer()).val('');
                                this.search('');
                                // remove multi-search value
                                // if (UtilsCmmn.isSupportLS) {
                                //     UtilsCmmn.removeDataToLS('searched2');
                                // }
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
            // when search fired, re-caculate footer data
            }).on('search.dt', function () {
                clearTimeout(searchTimer);
                var graphArry = [];
                var api = $dGrid.api();
                for (let i = 1; i < options.ifaceLength + 2; i++) {
                    var tdIdx = i - 1;
                    var sum = (api.column(i, {filter: 'applied'}).data().sum()).toFixed(2);
                    var title = api.column(i).title();
                    var titleAs = title.substr(0, title.indexOf('['));
                    var lastIdx = options.ifaceLength + 1;
                    var headerColor = pieColor[i - 1];
                    if (i !== lastIdx) {
                        if (parseFloat(sum) === 0.00) {
                            $(api.column(i).footer()).closest('tr').next().find('td:eq(' + tdIdx + ')').html(sum + ' Gbps');
                        } else {
                            $(api.column(i).footer()).closest('tr').next().find('td:eq(' + tdIdx + ')').css('background-color', headerColor).html(sum + ' Gbps');
                        }
                        graphArry.push({title: title, titleAs: titleAs, sum: sum, color: headerColor});
                    } else {
                        $(api.column(i).footer()).closest('tr').next().find('td:eq(' + tdIdx + ')').html(sum + ' Gbps');
                    }
                }
                searchTimer = setTimeout(function () {
                    if (isChartLinked) {
                        updateChart(chart, graphArry);
                        updatePie(pie, graphArry);
                    }
                }, 2000);
            // get empty dstAs
            }).on('click', 'td button', function (e) {
                var $self = $(this);
                $self.html('<i class="fa fa-spinner fa-pulse fa-fw grid-dstAs-spinner"></i>');
                $self.prop('disabled', true);
                var tr = $self.closest('tr');
                var td = $self.closest('td');
                var dstAsNum = $self.data('dstas');
                var reqOpt = {url: 'api/trf/dstas/' + dstAsNum, type: 'get', param: {}};

                UtilsCmmn.reqDefaultAjax({
                    success: function (res) {
                        var uptCellIdx = options.ifaceLength + 4;
                        if (res.status.code === 1) {
                            dtGrid.fnUpdate(UtilsCmmn.genObjValueJoinStr(res.result, ':'), tr, uptCellIdx, false);
                            dtGrid.fnStandingRedraw();
                            td.addClass('orange');
                        } else {
                            dtGrid.fnUpdate('update failure', tr, uptCellIdx, false);
                            dtGrid.fnStandingRedraw();
                            td.addClass('pinkred');
                        }
                    },
                    error: function (msg) {
                        dtGrid.fnUpdate(msg, tr, uptCellIdx, false);
                        dtGrid.fnStandingRedraw();
                        td.addClass('pinkred');
                    }
                }, reqOpt);
            // search toggle badge
            }).on('click', 'td .badge-td', function (e) {
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
            });
        }

        function initProfileSelect (reqOpt, isFirstInit) {
            var select2Opt = {placeholder: 'choose profile ...', width: '100%', data: []};
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    if (res.status.code === 1) {
                        if (isFirstInit) {
                            $.map(res.result.data, function (item) {
                                item.id = item.profileId;
                                item.text = item.profileName;
                            });
                            select2Opt.data = res.result.data;
                            $profileSelect.select2(select2Opt);
                            $profileSelect.val(getValidProfileFromUserInfo(select2Opt.data)).trigger('change');

                            // for sync profileTab crud
                            window.nowProfileId = parseInt(res.result.data[0].profileId);
                            window.nowProfileStatus = 0;    // 0:normal, 1:update, -1:delete

                            // request chart, pie, dynamic-grid
                            $reqBtn.trigger('click');
                        } else {
                            var isProfileExist = false;
                            $.map(res.result.data, function (item) {
                                item.id = item.profileId;
                                item.text = item.profileName;
                                if (window.nowProfileId === parseInt(item.profileId)) {
                                    isProfileExist = true;
                                }
                            });
                            // nowProfileId 이 -1(profile 선택안함) 일 경우 예외처리
                            if (!isProfileExist && window.nowProfileId === -1) {
                                isProfileExist = true;
                            }

                            select2Opt.data = res.result.data;
                            $profileSelect.select2(select2Opt);
                            if (isProfileExist) {
                                $profileSelect.val(window.nowProfileId).trigger('change');
                                if (window.nowProfileStatus === 1) {    // 0:normal, 1:update, -1:delete
                                    // request chart, pie, dynamic-grid
                                    $reqBtn.trigger('click');
                                }
                            } else {
                                $profileSelect.val(getValidProfileFromUserInfo(select2Opt.data)).trigger('change');
                                $reqBtn.trigger('click');
                            }
                        }
                    } else {
                        $profileSelect.select2(select2Opt);
                        $profileSelect.val(-1).trigger('change');

                        // for sync profileTab crud
                        window.nowProfileId = -1;
                        window.nowProfileStatus = 0;    // 0:normal, 1:update, -1:delete

                        // request chart, pie, dynamic-grid
                        $reqBtn.trigger('click');
                    }
                },
                error: function (msg) {
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
        }

        /* view control  */
        // update chart
        function updateChart (chart, data) {
            UtilsCmmn.clearChart(chart);
            var color = [];
            var total = 0;
            data.forEach(function (item, idx) {
                chart.data.labels.push(item.title);
                chart.data.datasets[0].data.push(item.sum);
                total += Number(item.sum);
                color.push(item.color);
            });
            // console.log(color);
            chart.data.datasets[0].backgroundColor = color;
            // chart.data.datasets[0].label = 'bps sum by iface out (' + total.toFixed(2) + ' Gbps)'
            chart.options.title.text = 'bps sum by iface out (' + total.toFixed(2) + ' Gbps)';
            chart.update();
        }

        // update pie
        function updatePie (pie, data) {
            UtilsCmmn.clearChart(pie);
            var total = 0;
            data.forEach(function (item) {
                pie.data.labels.push(item.titleAs);
                pie.data.datasets[0].data.push(item.sum);
                total += Number(item.sum);
            });
            pie.options.title.text = 'bps sum by iface out (' + total.toFixed(2) + ' Gbps)';
            pie.update();
        }

        // get grid columns - for dynamic columns
        function getColumns (objArry) {
            var ifCol = [];
            objArry.data.forEach(function (obj) {
                // ifCol.push({data: obj.ifaceOutAs});
                ifCol.push({data: obj.ifaceOutPeerIp});
            });
            return [{data: 'regTime'}].concat(ifCol, [{data: 'bpsSum'}, {data: 'peerIpSrcAndAs'}, {data: 'dstNetMask'}, {data: 'dstAs', className: 'text-left grid_dstAs'}]);
        }

        // request grid
        function reqDynamicGrid (reqOpt) {
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    // res.status.code is always 1
                    if (res.result.data.length) {
                        repaintHtml(res.result);
                        $dGrid = $('#trfV_grid');
                        var options = {};
                        options.columns = getColumns(res.result);
                        options.ifaceLength = res.result.data.length;
                        options.useProfile = parseInt(reqOpt.param.profileId) !== -1;
                        options.profileData = res.result.data;
                        // for sync profileTab crud
                        window.nowProfileId = parseInt(reqOpt.param.profileId);
                        window.nowProfileStatus = 0;    // 0:normal, 1:update, -1:delete
                        initGrid(options);
                        // $contentWrap.LoadingOverlay('hide', true);
                        // temp : set history data from local db
                        if (UtilsCmmn.isSupportLS) {
                            UtilsCmmn.setObjDataToLS('userInfo', {profileId: parseInt(reqOpt.param.profileId)});
                        }
                    } else {
                        UtilsCmmn.showToast('기준 데이터(ifaceout) 없음', false, {});
                    }
                },
                error: function (msg) {
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
        }

        // reset thead & tfoot
        function repaintHtml (objArry) {
            // header
            var tHeader = '';
            objArry.data.forEach(function (obj) {
                tHeader += '<th>' + obj.ifaceOutAs + '<br>[' + obj.ifaceOut + ']' + '</th>';
            });
            // footer
            var tFooter = '';
            for (var i = 0; i < objArry.data.length + 5; i++) {
                tFooter += '<td></td>';
            }
            $dGridWrap.empty();
            $dGridWrap.append(
                '<table id="trfV_grid" class="table table-striped table-bordered table-hover dataTables-example dataTable">' +
                '   <thead>' +
                '       <tr>' +
                '           <th rowspan="2" style="vertical-align: middle">regTime</th>' +
                '           <th colspan="' + objArry.data.length + '"style="vertical-align: middle">iface out</th>' +
                '           <th rowspan="2" style="vertical-align: middle">bpsSum</th>' +
                '           <th rowspan="2" style="vertical-align: middle">peerIpSrc</th>' +
                '           <th rowspan="2" style="vertical-align: middle">dstNetMask</th>' +
                '           <th rowspan="2" style="vertical-align: middle">dstAs</th>' +
                '       </tr>' +
                '       <tr>' + tHeader + '</tr>' +
                '   </thead>' +
                '   <tfoot>' +
                '       <tr>' + tFooter + '</tr>' +
                '       <tr>' + tFooter + '</tr>' +
                '   </tfoot>' +
                '</table>'
            );
        }

        /* event control  */
        function reqEvent () {
            // reset drow cb cnt!
            cntFnDrawCB = 0;
            // for check grid init complete(catch page event)
            isGridInited = false;
            // request grid - 1.create html from ifoList/grid query / 2. initgrid test2/grid query
            // reqDynamicGrid({url: 'api/acct/ifoList/grid', param: {strDateYMD: $drp.val(), displayYn: 'Y'}});
            reqDynamicGrid({url: 'api/trf/ifaceList', type: 'get', param: {profileId: $profileSelect.val()}});
        }

        // request event
        $reqBtn.on('click', function (e) {
            reqEvent();
        });

        // request(now) event
        $nowBtn.on('click', function (e) {
            var now = moment().format('YYYY-MM-DD HH:mm:ss');
            cal.setStartDate(now);
            $drp.val(now);
            reqEvent();
        });

        /* own control  */
        // profile select2
        $profileSelect.on('select2:select', function (e) {
            // var data = e.params.data;
        });

        // chart-row show/hide
        $chartYn.on('ifToggled', function (e) {
            if (this.checked) {
                $chartRow.show(800);
                $chartRow.fadeIn('slow', function () {});
            } else {
                $chartRow.hide(800);
                $chartRow.fadeOut('slow');
            }
        });

        // radio checked event
        $intervalRType.on('ifChecked', function (e) {
            $intervalMsg.html('&nbsp&nbsp' + $(this).val());
        });

        // modal-open
        $ifoasModalBtn.on('click', function () {
            $ifoasModalBody.load('/view/acct/ifoList', function () {
                $ifoasModal.modal({show: true});
            });
        });

        // modal-close
        $ifoasModal.on('hidden.bs.modal', function () {
            $nowBtn.trigger('click');
        });

        // chart-row show/hide
        $linkChartYn.on('ifToggled', function (e) {
            isChartLinked = this.checked;
        });

        // tab shown event
        $("a[href='#" + tabObj.id + "']").on('shown.bs.tab', function (e) {
            setTimeout(UtilsCmmn.setTableTopHorizontalScroll($dGridWrap, $dGridTopScroll), 5);
            initProfileSelect({url: 'api/trf/profile', type: 'get', param: {}}, false);
        });

        /* request! */
        initProfileSelect({url: 'api/trf/profile', type: 'get', param: {}}, true);
    });
}(window.TrfViewer || {}, jquery));
