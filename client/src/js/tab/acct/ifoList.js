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
        let ifoListGridOrg = [];                // ifoList gird original data array for update at once!

        /* view  */
        const $contentWrap = $('#ifoList_contentwrap');
        const $dGrid = $('#ifoList_grid');
        const $reqBtn = $('#ifoList_btn_req');
        const $drp = $('#ifoList_drp_date');
        const $form = $('#ifoList_form');                                         // parsley validation form
        const $updAllBtn = $('#ifoList_btn_delAll');
        const $markTarget = $('#ifoList_allwrap table');
        const $markTargetIfoAs = $('#ifoList_allwrap table tr td:nth-child(2)');
        const $markTargetpIpAs = $('#ifoList_allwrap table tr td:nth-child(4)');

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
                scroller: true,
                scrollY: '500px',
                scrollCollapse: true,
                autoWidth: true,
                paging: true,
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

                    ifoListGridOrg = $dGrid.api().data().toArray();
                    console.log(ifoListGridOrg);
                }
            });
        }

        function reqGridUpdate (reqOpt) {
            UtilsCmmn.showOverlay($contentWrap);
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    UtilsCmmn.hideOverlay($contentWrap);
                    if (res.status.code === 1) {
                        // refresh
                        $reqBtn.trigger('click');
                    } else {
                        UtilsCmmn.showToast('alias 업데이트 실패', false, {});
                    }
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

        function hasDuplicates (array) {
            var rObj = {invalidIdx: -1, value: ''};
            var valuesSoFar = Object.create(null);
            for (var i = 0; i < array.length; ++i) {
                var value = array[i];
                if (value in valuesSoFar) {
                    rObj.invalidIdx = i;
                    rObj.value = value;
                    return rObj;
                }
                valuesSoFar[value] = true;
            }
            rObj.invalidIdx = -1;
            rObj.value = '';
            return rObj;
        }

        function getErrorMsg (invalidType) {
            var errMsg = 'validateion error';

            if (invalidType === 1 || invalidType === 2) {
                errMsg = '알파벳 또는 숫자 또는 []{}|-_<>()/# 사용 가능';
            } else if (invalidType === 3 || invalidType === 4) {
                errMsg = '글자는 최대 256자를 넘을 수 없음';
            } else if (invalidType === 5 || invalidType === 6) {
                errMsg = '동일한 alias 를 사용할 수 없음';
            }
            return errMsg;
        }

        function setEditable ($div) {
            var el = $div;
            el.attr('contenteditable', 'true');
            // do not use enter key
            el.keypress(function (e) {
                return e.which !== 13;
            });
            el.keydown(function (e) {
                $markTarget.unmark();
            });
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

        function setInvalidNotiWhenUpdOnce (invalidType, invalidIdx) {
            console.log(invalidType + '|' + invalidIdx);

            // 1. getErrorMsg
            var errMsg = getErrorMsg(invalidType);
            // 2. show toast
            UtilsCmmn.showToast(errMsg, false, {});
            // 3. set focus
            var $div;
            var rowIdx = invalidIdx + 1;
            if (invalidType % 2 === 0) {
                $div = $dGrid.find('tr:eq(' + rowIdx + ')').find('td:eq(3)');
            } else {
                $div = $dGrid.find('tr:eq(' + rowIdx + ')').find('td:eq(1)');
            }
            setEditable($div);
            dtGrid.api().scroller().scrollToRow(invalidIdx);
        }

        // update all(update at once) event
        $updAllBtn.on('click', function (e) {

            // clear mark text
            $markTarget.unmark();
            // var $focused = $(':focus').blur();

            let isValidAll = true;
            let invalidIdx = -1;
            let invalidType = -1;
            let i = 0;
            let len = ifoListGridOrg.length;
            // let len = 5;
            let uptArry = [];
            let uptIfaceAs = [];
            let uptPeerAs = [];

            // get edit data
            $('#ifoList_grid td.editor-iface').each(function () { uptIfaceAs.push($(this).html()); });
            $('#ifoList_grid td.editor-peer').each(function () { uptPeerAs.push($(this).html()); });

            console.log('hh');

            // check each data
            for (; i < len; i += 1) {

                let ifaceOutAs = ifoListGridOrg[i].ifaceOutAs;
                let uptIfaceOutAs = uptIfaceAs[i];
                let peerIpSrcAs = ifoListGridOrg[i].peerIpSrcAs;
                let uptPeerIpSrcAs = uptPeerAs[i];
                invalidIdx = i;

                // 1. check ifaceOutAs & check peerIpSrcAs
                if (uptIfaceOutAs.length === 0 || ifaceOutAs !== uptIfaceOutAs || uptPeerIpSrcAs.length === 0 || peerIpSrcAs !== uptPeerIpSrcAs) {
                    // a. ifaceOutAs length, character set
                    if (uptIfaceOutAs.length === 0 || !/^[a-zA-Z0-9()[\]{}/<>|\-_#]*$/.test(uptIfaceOutAs)) {
                        invalidType = 1;
                        isValidAll = false;
                    // b. ifaceOutAs max length
                    } else if (uptIfaceOutAs.length > 256) {
                        invalidType = 3;
                        isValidAll = false;
                    // c. peerIpSrcAs length, character set
                    } else if (uptPeerIpSrcAs.length === 0 || !/^[a-zA-Z0-9()[\]{}/<>|\-_#]*$/.test(uptPeerIpSrcAs)) {
                        invalidType = 2;
                        isValidAll = false;
                    // d. peerIpSrcAs max length
                    } else if (uptPeerIpSrcAs.length > 256) {
                        invalidType = 4;
                        isValidAll = false;
                    } else {
                        ifoListGridOrg[i].ifaceOutAs = uptIfaceOutAs;
                        ifoListGridOrg[i].peerIpSrcAs = uptPeerIpSrcAs;
                        isValidAll = true;
                    }

                    // 2. check ifaceOutAs and peerIpSrcAs invalid type
                    if (isValidAll) {
                        uptArry.push(ifoListGridOrg[i]);
                    } else {
                        setInvalidNotiWhenUpdOnce(invalidType, invalidIdx);
                        break;
                        // return;
                    }
                }

                // 3. reset flag
                // isValidAll = true;
            }

            if (isValidAll) {
                // check data duplication // if ((new Set(uptIfaceAs)).size !== uptIfaceAs.length) {}
                // 1. check ifaceOutAs

                let dupInfo = hasDuplicates(uptIfaceAs);
                // let dupInfo = hasDuplicates(uptIfaceAs.slice(0, 4));
                let invalidValue = dupInfo.value;
                invalidIdx = dupInfo.invalidIdx;
                if (invalidIdx !== -1) {
                    const $markTargetIfoAs = $('#ifoList_allwrap table tr td:nth-child(2)');
                    setTextMarked(invalidValue, $markTargetIfoAs);
                    invalidType = 5;
                    setInvalidNotiWhenUpdOnce(invalidType, invalidIdx);
                    return;
                }
                // 2. check peerIpSrcAs
                dupInfo = hasDuplicates(uptIfaceAs);
                // dupInfo = hasDuplicates(uptPeerAs.slice(0, 4));
                invalidValue = dupInfo.value;
                invalidIdx = dupInfo.invalidIdx;
                if (invalidIdx !== -1) {
                    const $markTargetpIpAs = $('#ifoList_allwrap table tr td:nth-child(4)');
                    setTextMarked(invalidValue, $markTargetpIpAs);
                    invalidType = 6;
                    setInvalidNotiWhenUpdOnce(invalidType, invalidIdx);
                    return;
                }
                if (uptArry.length) {
                    // request update event!
                    var reqOpt = {url: 'api/trf/ifaceout/alias', type: 'put', param: {ifoAsArray: uptArry}};
                    reqGridUpdate(reqOpt);
                } else {
                    UtilsCmmn.showToast('변경된 내용이 없습니다', false, {});
                }
            }
            console.log(uptArry);
        });

        function setTextMarked (text, $target) {
            $target.unmark({
                done: function () {
                    $target.mark(text, {className: 'mark-red', caseSensitive: true});
                }
            });
        }

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
                UtilsCmmn.showToast('동일한 alias 를 사용할 수 없음', false, {});
            } else {
                var reqOpt = {url: 'api/trf/ifaceout/alias/' + data.ifaceOut, type: 'put', param: {strDate: $drp.val(), ifaceOutAs: ifaceOutAs, peerIpSrc: data.peerIpSrc, peerIpSrcAs: peerIpSrcAs}};
                reqGridUpdate(reqOpt);
            }
        });

        /* own control  */
        // edit div(cell)
        $dGrid.on('click', 'tbody td:not(:has(button))', function (e) {

            if ($(e.target).hasClass('editor-iface') || $(e.target).hasClass('editor-peer')) {
                setEditable($(this));
            }
        });

        /* request! */
        reqAvailableDate({ url: 'api/trf/ifaceout/date', type: 'get', param: {} });

    });
}(window.IfoList || {}, jquery));
