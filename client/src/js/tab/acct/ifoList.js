/* eslint-disable no-undef */
(function (IfoList, $) {
    function showToast (msg) {
        // console.log('show toast: ' + msg);
        window.plainToast.option({type: 'error', message: msg});
        window.plainToast.show();
    }

    $(function () {
        /* flag */
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        /* view  */
        const $dGrid = $('#ifoList_grid');
        const $reqBtn = $('#ifoList_btn_req');
        const $drp = $('#ifoList_drp_date');
        // const $form = $('#ifoList_form');                                         // parsley validation form
        const $contentWrap = $('#ifoList_contentwrap');

        /* options */
        // LoadingOverlay
        const LoadingOverlayOpt = {size: '10%', color: 'rgba(255, 255, 255, 0.6)'};
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

        /* init views */
        // init checkbox - icheckbox
        UtilsCmmn.initIcheckbox('ifoList_icheck');
        // init drp
        UtilsCmmn.initDaterangepicker($drp, drpOptions);

        // init datatables
        let dtGrid;
        function initGrid () {
            // init datatables
            // activate spinner
            $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
            isGridReqEnd = false;
            // datatables
            dtGrid = $dGrid.dataTable({
                pageLength: 10,
                // pagingType: 'full_numbers',
                bPaginate: true,
                bLengthChange: false,
                bInfo: false,
                searching: false,
                ordering: true,
                responsive: true,
                // bAutoWidth: false,
                // scrollX: true,
                bProcessing: false,
                // bServerSide: true,
                sAjaxSource: 'api/acct/ifoList/grid',
                sServerMethod: 'POST',
                fnServerParams: function (aoData) {
                    aoData.push({ 'name': 'strDateYMD', 'value': $drp.val() });
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
                columns: [
                    // {data: 'displayYn'},
                    {
                        data: 'displayYn',
                        width: 20,
                        render: function (d, t, r, m) {
                            var $select = $('<select></select>', {
                                'id': 'displayYn_' + m.row
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
                    {data: 'ifaceOut'},
                    {data: 'ifaceOutAs', className: 'text-right editor'},
                    {
                        data: null,
                        defaultContent: '<button class="btn btn-small btn-warning">Update</button>',
                        orderable: false
                    }
                ],
                columnDefs: [
                    { className: 'text-right', 'targets': [1, 2] },
                    { className: 'text-center', 'targets': [0, 3] }

                ],
                fnInitComplete: function () {
                    $dGrid.css('width', '100%');
                    $($dGrid.api().column(2)).addClass('sum');
                    //
                    // $(api.column(i).footer()).html('-');
                    //
                    // var $footer = $($dGrid.api().table().footer());
                    // $($dGrid.api().table().header()).append($footer.children().addClass('sum'));
                }
            });
        }

        function reqGridUpdate (reqOpt) {
            $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
            UtilsCmmn.reqDefaultAjax({
                success: function (data) {
                    // console.log('ifoListGridUpdate : ' + JSON.stringify(data));
                    $contentWrap.LoadingOverlay('hide', true);
                    // refresh
                    $reqBtn.trigger('click');
                },
                error: showToast
            }, reqOpt);
        }

        /* event control  */
        /* request event */
        $reqBtn.on('click', function (e) {
            // request grid
            isGridReqEnd = false;
            $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
            dtGrid.fnClearTable();
            dtGrid.fnReloadAjax();
        });

        /* own control  */
        $dGrid.on('click', 'tbody button', function () {
            // datatable row data
            var data = $dGrid.api().row($(this).parents('tr')).data();
            // edit data
            var ifaceOutAs = $(this).closest('td').prev('td').html();
            var displayYn = $(this).closest('td').prev('td').prev('td').prev('td').children('select').children('option').filter(':selected').val();
            // clone datatable column data (ifaceOut)
            var ifaceOutArry = $dGrid.api().columns('.editor').data().eq(0).slice(0);
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

            // length 0 이상 / chatAt(0) alphabet / all char alphabet or number or _ / can use differ alias name
            if (ifaceOutAs.length === 0 || !/^\w+$/.test(ifaceOutAs)) {
                showToast('알파벳 또는 숫자 또는 _ 만 사용 가능');
            } else if (!/^[a-zA-Z]+$/.test(ifaceOutAs.charAt(0))) {
                showToast('첫번째 글짜는 반드시 알파벳을 사용해야 함');
            } else if (ifaceOutAs.length > 20) {
                showToast('글자는 최대 20자를 넘을 수 없음');
            } else if (sameNameCnt >= 1) {
                showToast('동일한 alias 를 사용할 수 없음');
            } else {
                var reqOpt = {url: 'api/acct/ifoList/grid/update', param: {strDateYMD: $drp.val(), displayYn: displayYn, ifaceOut: data.ifaceOut, ifaceOutAs: ifaceOutAs}};
                reqGridUpdate(reqOpt);
            }
        });

        $dGrid.on('click', 'tbody td:not(:has(button))', function (e) {
        // $('.editor').on( 'click', function () {

            // $dGrid.api().cell( this );
            if ($(e.target).hasClass('editor')) {
                $(this).attr('contenteditable', 'true');
                var el = $(this);
                // We put the cursor at the beginning
                var range = document.createRange();
                var sel = window.getSelection();
                if (el[0].childNodes.length > 0) {
                    range.setStart(el[0].childNodes[0], el[0].childNodes[0].length);
                    range.collapse(true);
                    // sel.removeAllRanges();
                    sel.addRange(range);
                }
                // The cell have now the focus
                // el.focus(endEdition);
                el.focus();
            }
        });
        function endEdition () {
            // We get the cell
            var el = $(this);
            // We tell to datatable to refresh the cache with the DOM, like that the filter will find the new data added in the table.
            // BUT IF WE EDIT A ROW ADDED DYNAMICALLY, THIS INSTRUCTION IS A PROBLEM
            $dGrid.api().cell(el).invalidate().draw();
            // When the user finished to edit a cell and click out of the cell, the cell can't be editable, unless the user double click on this cell another time
            el.attr('contenteditable', 'false');
            el.off('blur', endEdition); // To prevent another bind to this function
        }

        // req
        initGrid();
    });
}(window.IfoList || {}, jquery));
