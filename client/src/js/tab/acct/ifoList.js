/* eslint-disable no-undef */
(function (IfoList, $) {
    /* options */
    // daterangepicker
    const drpOptions = {
        singleDatePicker: true,
        startDate: moment(),
        // startDate: moment('2018-04-02', 'YYYY-MM-DD'),
        minDate: moment('2018-04-01', 'YYYY-MM-DD'),
        maxDate: moment(),
        timePicker: false,
        timePicker24Hour: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    };

    $(function () {
        /* flag */
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;

        /* view  */
        const $contentWrap = $('#ifoList_contentwrap');
        const $dGrid = $('#ifoList_grid');
        const $reqBtn = $('#ifoList_btn_req');
        const $drp = $('#ifoList_drp_date');
        const $form = $('#ifoList_form');                                         // parsley validation form

        /* init views */
        // init checkbox - icheckbox
        UtilsCmmn.initIcheckbox('ifoList_icheck');
        // init drp
        var cal = UtilsCmmn.initDaterangepicker($drp, drpOptions);
        // init datatables
        let dtGrid;
        function initGrid () {
            // init datatables
            // activate spinner
            UtilsCmmn.showOverlay($contentWrap);
            isGridReqEnd = false;
            // datatables
            dtGrid = $dGrid.dataTable({
                scrollY: '500px',
                scrollCollapse: true,
                autoWidth: true,
                paging: false,
                pageLength: 10,
                // pagingType: 'full_numbers',
                bPaginate: false,
                bLengthChange: false,
                bInfo: false,
                searching: false,
                ordering: true,
                responsive: true,
                // bAutoWidth: false,
                // scrollX: true,
                bProcessing: false,
                // bServerSide: true,
                ajax: {
                    url: 'api/trf/ifaceout/alias',
                    type: 'get',
                    contentType: 'application/json;charset=UTF-8',
                    data: function (data) {
                        data.strDate = $drp.val();
                    },
                    dataSrc: function (res) {
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
                // sAjaxSource: 'api/acct/ifoList/grid',
                // sServerMethod: 'POST',
                // fnServerParams: function (aoData) {
                //     aoData.push({ 'name': 'strDateYMD', 'value': $drp.val() });
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
                            UtilsCmmn.showToast('해당 기간 데이터 없음', false, {});
                        }
                    }
                },
                columns: [
                    // {data: 'displayYn'},
                    {data: 'ifaceOut'},
                    {data: 'ifaceOutAs', className: 'text-right editor editor-iface'},
                    {data: 'peerIpSrc'},
                    {data: 'peerIpSrcAs', className: 'text-right editor editor-peer'},
                    {
                        data: 'displayYn',
                        width: 20,
                        render: function (d, t, r, m) {
                            var $select = $('<select></select>', {
                                'id': 'displayYn_' + m.row,
                                'class': 'editor'
                            });
                            var falg = ['Y', 'N'];
                            $.each(falg, function (k, v) {
                                var $option = $('<option></option>', {
                                    'text': v,
                                    'value': v
                                });
                                if (d === v) {
                                    $option.attr('selected', 'selected');
                                }
                                $select.append($option);
                            });
                            return $select.prop('outerHTML');
                        }
                    },
                    {
                        data: null,
                        defaultContent: '<button class="btn btn-small btn-warning">Update</button>',
                        orderable: false
                    }
                ],
                columnDefs: [
                    {targets: [4], visible: false, searchable: false},
                    { className: 'text-right', 'targets': [0, 1, 2, 3] },
                    { className: 'text-center', 'targets': [4, 5] }

                ],
                fnInitComplete: function () {
                    $dGrid.css('width', '100%');
                    setTimeout(function () {
                        $dGrid.api().columns.adjust().draw();
                    }, 100);
                }
            });
        }

        function reqGridUpdate (reqOpt) {
            UtilsCmmn.showOverlay($contentWrap);
            UtilsCmmn.reqDefaultAjax({
                success: function (data) {
                    // console.log('ifoListGridUpdate : ' + JSON.stringify(data));
                    UtilsCmmn.hideOverlay($contentWrap);
                    // refresh
                    $reqBtn.trigger('click');
                },
                error: function (msg) {
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
        }

        function reqAvailableDate (reqOpt) {
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    if (res.status.code === 1) {
                        // get last date & set date to daterangepicker
                        var reqDate = res.result.data[res.result.data.length - 1].regDate;
                        cal.setStartDate(reqDate);
                        cal.setEndDate(reqDate);        // daterangepicker bug?

                        initGrid();
                    }
                },
                error: function (msg) {
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
        }

        /* event control  */
        // request event
        $reqBtn.on('click', function (e) {
            // request grid
            isGridReqEnd = false;
            cntFnDrawCB = 0;
            UtilsCmmn.showOverlay($contentWrap);
            console.log($drp.val());
            dtGrid.fnClearTable();
            dtGrid.fnReloadAjax();
        });

        // update event
        $dGrid.on('click', 'tbody button', function () {
            cntFnDrawCB = 0;
            // datatable row data
            var data = $dGrid.api().row($(this).parents('tr')).data();
            // edit data
            var ifaceOutAs = $(this).closest('td').prev('td').prev('td').prev('td').html();
            var peerIpSrcAs = $(this).closest('td').prev('td').html();
            // clone datatable column data (ifaceOut)
            var ifaceOutArry = $dGrid.api().columns('.editor-iface').data().eq(0).slice(0);
            var peerIpArry = $dGrid.api().columns('.editor-peer').data().eq(0).slice(0);
            // slice this-row-ifaceOutAs
            var idx = ifaceOutArry.indexOf(data.ifaceOutAs);
            if (idx !== -1) ifaceOutArry.splice(idx, 1);
            // check same alias name
            var sameNameCnt = 0;
            for (var j = 0; j < ifaceOutArry.length; j++) {
                if (ifaceOutArry[j] === ifaceOutAs) {
                    sameNameCnt++;
                }
            }
            if (ifaceOutAs.length === 0 || !/^[a-zA-Z0-9()[\]{}/<>|\-_#]*$/.test(ifaceOutAs) || peerIpSrcAs.length === 0 || !/^[a-zA-Z0-9()[\]{}/<>|\-_#.]*$/.test(peerIpSrcAs)) {
                UtilsCmmn.showToast('알파벳 또는 숫자 또는 []{}|-_<>()/# 사용 가능', false, {});
            } else if (ifaceOutAs.length > 256 || peerIpSrcAs.length > 256) {
                UtilsCmmn.showToast('글자는 최대 256자를 넘을 수 없음', false, {});
            } else if (sameNameCnt >= 1) {
                UtilsCmmn.showToast('동일한 alias 를 사용할 수 없음(ifaceOutAs)', false, {});
            } else {
                var reqOpt = {url: 'api/trf/ifaceout/alias/' + data.ifaceOut, type: 'put', param: {strDate: $drp.val(), ifaceOutAs: ifaceOutAs, peerIpSrc: data.peerIpSrc, peerIpSrcAs: peerIpSrcAs}};
                reqGridUpdate(reqOpt);
            }
        });

        /* own control  */
        // edit div(cell)
        $dGrid.on('click', 'tbody td:not(:has(button))', function (e) {

            if ($(e.target).hasClass('editor-iface') || $(e.target).hasClass('editor-peer')) {
                $(this).attr('contenteditable', 'true');
                var el = $(this);
                var range = document.createRange();
                var sel = window.getSelection();
                if (el[0].childNodes.length > 0) {
                    range.setStart(el[0].childNodes[0], el[0].childNodes[0].length);
                    range.collapse(true);
                    // sel.removeAllRanges();
                    sel.addRange(range);
                }
                el.focus();
            }
        });

        /* request! */
        reqAvailableDate({ url: 'api/trf/ifaceout/date', type: 'get', param: {} });

    });
}(window.IfoList || {}, jquery));
