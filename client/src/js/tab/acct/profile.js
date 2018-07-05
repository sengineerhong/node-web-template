/* eslint-disable no-undef */
(function (Profile, $) {

    function showToast (msg) {
        // console.log('show toast: ' + msg);
        window.plainToast.option({type: 'error', message: msg});
        window.plainToast.show();
    }

    $(function () {
        /* tab id, title, url */
        const tabObj = UtilsCmmn.getTabInfo('profile_allwrap');
        const allwrapId = 'crosssales_allwrap';
        /* flag */
        // let isChartReqEnd = false;
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        let rNumIfaceGd = 0;
        // let isChartReqEnd = false;
        /* view  */
        const $dtGrid = $('#profile_grid');
        const $dtGridWrap = $('#profile_gridwrap');
        const $updBtn = $('#profile_btn_upd');
        const $createBtn = $('#profile_btn_create');
        // const $intervalRType = $("input[name='profile_inputr_intervalR']");          // radio name
        const $intervalMsg = $('#profile_interval_msg');
        // const $form = $('#profile_form');                                         // parsley validation form
        const $contentWrap = $('#profile_contentwrap');
        const $profileId = $('#profile_id');
        const $profileName = $('#profile_name');
        const $profileCmmnt = $('#profile_cmmnt');
        const $profileFieldBpssum = $('#profile_field_bpssum');
        const $profileFieldPeeripsrc = $('#profile_field_peeripsrc');
        const $profileFieldDstnetmask = $('#profile_field_dstnetmask');
        const $profileFieldDstas = $('#profile_field_dstas');
        const $ifacedtGrid = $('#profile_ifaceGrid');
        const $form = $('#profile_form');


        const $ifaceSelect = $('#profile_ifaceout');


        function reqProfileDetail (reqOpt) {
            // isGridReqEnd = false;
            // $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
            UtilsCmmn.reqDefaultAjax({
                success: function (data) {
                    setProfileDetailHtml(data);
                    $.map(data.ifaceArry, function (item) {
                        item.ifaceName = item.ifaceOutAs + '[' + item.ifaceOut + ']';
                    });
                    initIfaceGrid(data.ifaceArry);
                },
                error: showToast
            }, reqOpt);
        }

        function setProfileDetailHtml (data) {
            // console.log('show toast: ' + msg);
            $profileName.val(data.profileName);
            $profileCmmnt.val(data.profileCmmnt);
            $profileFieldBpssum.val(data.profileFieldBpssum);
            $profileFieldPeeripsrc.val(data.profileFieldPeeripsrc);
            $profileFieldDstnetmask.val(data.profileFieldDstnetmask);
            $profileFieldDstas.val(data.profileFieldDstas);
        }

        // LoadingOverlay
        const LoadingOverlayOpt = {size: '10%', color: 'rgba(255, 255, 255, 0.6)'};

        function initIfaceSelect (reqOpt) {
            // isGridReqEnd = false;
            // $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
            var select2Opt = {placeholder: 'choose ifaceout...', width: '100%', data: []}
            UtilsCmmn.reqDefaultAjax({
                success: function (data) {
                    $.map(data, function (item) {
                        item.id = item.ifaceOut + '_' + item.peerIpSrc;
                        item.text = item.ifaceOutAs + '[' + item.ifaceOut + ']';
                    });
                    select2Opt.data = data;
                    $ifaceSelect.select2(select2Opt);
                },
                error: showToast
            }, reqOpt);
        }

        $ifaceSelect.on('select2:select', function (e) {
            var data = e.params.data;
            // validation
            var isNewIface = true;
            var gridData = $ifacedtGrid.api().data().toArray();
            for (var i = 0; i < gridData.length; i++) {
                if (gridData[i].ifaceOut === data.ifaceOut && gridData[i].peerIpSrc === data.peerIpSrc) {
                    isNewIface = false;
                    break;
                }
            }
            if (isNewIface) {
                $ifacedtGrid.api().row.add(
                    {
                        'rNum': rNumIfaceGd--,
                        'ifaceName': data.ifaceOutAs + '[' + data.ifaceOut + ']',
                        'ifaceOut': data.ifaceOut,
                        'ifaceOutAs': data.ifaceOutAs,
                        'peerIpSrc': data.peerIpSrc,
                        'peerIpSrcAs': data.peerIpSrcAs,
                        'fieldIfaceOut': ''
                    }).draw(false);
            } else {
                showToast('이미 존재하는 ifaceout 입니다.');
            }
        });

        // $('.select2-multiple').select2({
        //     ajax: {
        //         url: 'api/acct/profile/ifaceout',
        //         dataType: 'json',
        //         type: 'POST',
        //         processResults: function (data) {
        //             console.log(data);
        //             return {
        //                 results: $.map(data, function (item) {
        //                     return {
        //                         text: item.ifaceOutAs,
        //                         id: item.ifaceOut + '_' + item.peerIpSrc
        //                     };
        //                 })
        //             };
        //         },
        //         cache: true
        //     },
        //     allowClear: true,
        //     placeholder: 'ifaceout',
        //     tags: false
        // });

        // Add slimscroll to element
        // $('.full-height-scroll').slimscroll({
        //     height: '100px'
        // })

        /* init views */
        // init checkbox - icheckbox
        // UtilsCmmn.initIcheckbox('profile_icheck');
        // init select2
        initIfaceSelect({url: 'api/acct/profile/ifaceout', param: {}});
        // init datatables
        let dtGrid;
        function initGrid () {
            // init datatables
            // activate spinner
            $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
            isGridReqEnd = false;
            // datatables
            dtGrid = $dtGrid.dataTable({
                destroy: true,
                scrollY: '180px',
                autoWidth: true,
                paging: true,
                pageLength: 5,
                // pagingType: 'full_numbers',
                bPaginate: false,
                bLengthChange: false,
                bInfo: false,
                searching: true,
                ordering: true,
                responsive: true,
                // bAutoWidth: false,
                // scrollX: true,
                bProcessing: false,
                // bServerSide: true,
                sAjaxSource: 'api/acct/profile/grid',
                sServerMethod: 'POST',
                fnServerParams: function (aoData) {
                    // aoData.push({ 'name': 'strDateYMD', 'value': $drp.val() });
                },
                fnDrawCallback: function (oSettings) {
                    // TODO : 임시로직
                    cntFnDrawCB++;
                    if (cntFnDrawCB === 2 && !isGridReqEnd) {
                        // if (oSettings.aiDisplay.length !== 0 && !isGridReqEnd) {
                        $contentWrap.LoadingOverlay('hide', true);
                        isGridReqEnd = true;
                        cntFnDrawCB = 0;
                        // if (oSettings.aiDisplay.length === 0) {
                        //     showToast('not exist profile');
                        // }

                        var profileId = $profileId.val();
                        var selectRowIdx = 0;
                        var profileTdArry = [];
                        $('#profile_grid td.profileId').each(function () {
                            profileTdArry.push($(this).html());
                        });
                        for (var j = 0; j < profileTdArry.length; j++) {
                            if (profileId === profileTdArry[j]) {
                                selectRowIdx = j;
                                break;
                            }
                        }
                        //
                        // for (var j = 0; j < oSettings.aiDisplay.length; j++) {
                        //     if (parseInt(profileId) === oSettings.aiDisplay[j]) {
                        //         selectRowIdx = j;
                        //         break;
                        //     }
                        // }
                        // first row selection trigger
                        $('#profile_grid tbody tr:eq(' + selectRowIdx + ')').click();
                    }
                },
                columns: [
                    // {data: 'displayYn'},
                    {data: 'profileId', className: 'profileId'},
                    {data: 'profileName'},
                    {data: 'profileCmmnt'},
                    {data: 'profileFdBpssum'},
                    {data: 'profileFdPeeripsrc'},
                    {data: 'profileFdDstnetmask'},
                    {data: 'profileFdDstas'},
                    {data: 'regDate'},
                    {
                        data: null,
                        defaultContent: '<button class="btn btn-small btn-danger">Delete</button>',
                        orderable: false
                    }
                ],
                columnDefs: [
                    {targets: [3, 4, 5, 6], visible: false, searchable: false},
                    { className: 'text-left', 'targets': [1, 2, 3, 4, 5, 6] },
                    { className: 'text-center', 'targets': [0, 7, 8] }

                ],
                order: [[0, 'desc']],
                fnInitComplete: function () {
                    $dtGrid.css('width', '100%');
                }
            });
        }

        // init datatables
        let ifaceDtGrid;
        function initIfaceGrid (ifaceArry) {
            // datatables
            ifaceDtGrid = $ifacedtGrid.dataTable({
                destroy: true,
                scrollY: '300px',
                scrollCollapse: true,
                autoWidth: true,
                paging: false,
                pageLength: 10,
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
                data: ifaceArry,
                columns: [
                    // {data: 'displayYn'},
                    {data: 'rNum'},
                    {
                        data: null,
                        defaultContent: '<a><i class="fa fa-trash pinkred"></i></a>'
                    },
                    {data: 'ifaceName'},
                    {data: 'ifaceOut'},
                    {data: 'ifaceOutAs'},
                    {data: 'peerIpSrc'},
                    {data: 'peerIpSrcAs'},
                    {data: 'fieldIfaceOut', className: 'text-right editor'}
                ],
                columnDefs: [
                    // { className: 'text-right', 'targets': [0, 1, 2, 3] },
                    {targets: [0], visible: false},
                    {targets: [1], orderable: false},
                    { className: 'text-center', 'targets': '_all' }

                ],
                order: [[0, 'asc']],
                fnInitComplete: function () {
                    $dtGrid.css('width', '100%');
                    setTimeout(function () {
                        // $dtGrid.api().columns.adjust().draw();
                    }, 100);
                },
                createdRow: function (row, data, dataIndex) {
                    if (data.rNum <= 0) {
                        $(row).addClass('update-color');
                    }
                }
            });
        }

        /* event control  */
        /* grid event */
        // delete profile
        $dtGrid.on('click', 'tbody button', function (e) {
            e.stopPropagation();
            $contentWrap.LoadingOverlay('show', true);
            var data = $dtGrid.api().row($(this).parents('tr')).data();
            var reqOpt = { url: 'api/acct/profile/delete', param: {profileId: data.profileId} };
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    $contentWrap.LoadingOverlay('hide', true);
                    if (res.status.code === 1) {
                        cntFnDrawCB = 0;
                        isGridReqEnd = false;
                        dtGrid.fnClearTable();
                        dtGrid.fnReloadAjax();

                        // for sync profileTab crud
                        if (window.nowProfileId === parseInt(res.profileId)) {
                            window.nowProfileStatus = -1;   // 0:normal, 1:update, -1:delete
                        }
                    } else {
                        showToast(res.status.msg);
                    }
                },
                error: function (msg) {
                    $contentWrap.LoadingOverlay('hide', true);
                    showToast(msg);
                }
            }, reqOpt);
            // td:not(:has(button))
        });
        // change profile detail
        $dtGrid.on('click', 'tbody tr', function (e) {
            if (!$(this).hasClass('grid-row-selected')) {
                dtGrid.$('tr.grid-row-selected').removeClass('grid-row-selected');
                $(this).addClass('grid-row-selected');
                var data = dtGrid.api().row(this).data();
                var profileId = data.profileId;
                $profileId.val(profileId);
                reqProfileDetail({url: 'api/acct/profile/detail', param: {profileId: profileId}});
            }
        });
        // delete ifaceout list
        $ifacedtGrid.on('click', 'i.fa-trash', function () {
            var gridData = $ifacedtGrid.api().data().toArray();

            if (gridData.length > 1) {
                $ifacedtGrid.api().row($(this).parents('tr')).remove().draw();
            } else {
                showToast('ifaceout 은 한개 이상 존재해야합니다.');
            }
        });
        // edit field ifaceout
        $ifacedtGrid.on('click', 'tbody td', function (e) {
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

        /* request event */
        $updBtn.on('click', function (e) {

            // rest validation
            $form.parsley().reset();

            var isValid = $form.parsley().validate();
            if (isValid) {
                $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);

                var updObj = {
                    profileId: $profileId.val(),
                    profileName: $profileName.val(),
                    profileCmmnt: $profileCmmnt.val(),
                    profileFieldBpssum: $profileFieldBpssum.val(),
                    profileFieldPeeripsrc: $profileFieldPeeripsrc.val(),
                    profileFieldDstnetmask: $profileFieldDstnetmask.val(),
                    profileFieldDstas: $profileFieldDstas.val(),
                    ifaceArry: []
                };

                // original grid data
                var gridData = $ifacedtGrid.api().data().toArray();
                // edit data - fieldIfaceOut
                var editArry = [];
                // get edit data
                $('#profile_ifaceGrid td.editor').each(function () {
                    editArry.push($(this).html());
                });
                // merge
                gridData.forEach(function (info, idx) {
                    info.fieldIfaceOut = editArry[idx];
                });
                updObj.ifaceArry = gridData;
                // request
                var reqOpt = { url: 'api/acct/profile/update', param: {updObj: updObj} };
                UtilsCmmn.reqDefaultAjax({
                    success: function (res) {
                        $contentWrap.LoadingOverlay('hide', true);
                        if (res.status.code === 1) {
                            $profileId.val(res.result.profileId);
                            cntFnDrawCB = 0;
                            isGridReqEnd = false;
                            dtGrid.fnClearTable();
                            dtGrid.fnReloadAjax();


                            // reqProfileDetail({url: 'api/acct/profile/detail', param: {profileId: res.result.profileId}});
                            console.log(res.profileId);
                            // for sync profileTab crud
                            if (window.nowProfileId === parseInt(res.result.profileId)) {
                                window.nowProfileStatus = 1;   // 0:normal, 1:update, -1:delete
                            }
                        } else {
                            showToast(res.status.msg);
                        }
                    },
                    error: function (msg) {
                        $contentWrap.LoadingOverlay('hide', true);
                        showToast(msg);
                    }
                }, reqOpt);
            }
        });

        $createBtn.on('click', function (e) {

            // rest validation
            $form.parsley().reset();

            var isValid = $form.parsley().validate();
            if (isValid) {
                $contentWrap.LoadingOverlay('show', LoadingOverlayOpt);
                var profileObj = {
                    profileName: $profileName.val(),
                    profileCmmnt: $profileCmmnt.val(),
                    profileFieldBpssum: $profileFieldBpssum.val(),
                    profileFieldPeeripsrc: $profileFieldPeeripsrc.val(),
                    profileFieldDstnetmask: $profileFieldDstnetmask.val(),
                    profileFieldDstas: $profileFieldDstas.val(),
                    ifaceArry: []
                };

                // original grid data
                var gridData = $ifacedtGrid.api().data().toArray();
                // edit data - fieldIfaceOut
                var editArry = [];
                // get edit data
                $('#profile_ifaceGrid td.editor').each(function () {
                    editArry.push($(this).html());
                });
                // merge
                gridData.forEach(function (info, idx) {
                    info.fieldIfaceOut = editArry[idx];
                });
                profileObj.ifaceArry = gridData;
                // request
                var reqOpt = { url: 'api/acct/profile/create', param: {profileObj: profileObj} };
                UtilsCmmn.reqDefaultAjax({
                    success: function (res) {
                        $contentWrap.LoadingOverlay('hide', true);
                        if (res.status.code === 1) {
                            $profileId.val(res.result.profileId);
                            cntFnDrawCB = 0;
                            isGridReqEnd = false;
                            dtGrid.fnClearTable();
                            dtGrid.fnReloadAjax();
                        } else {
                            showToast(res.status.msg);
                        }
                    },
                    error: function (msg) {
                        $contentWrap.LoadingOverlay('hide', true);
                        showToast(msg);
                    }
                }, reqOpt);
            }
        });

        /* validation */
        /* parsley validation evnet */
        $form.parsley().on('form:validate', function (formInstance) {

            var errMsg = '*validation message!';
            var isValidAll = false;

            isValidAll = $ifacedtGrid.api().data().toArray().length !== 0;

            if (!isValidAll) {
                showToast('ifaceout 은 한개 이상 존재해야합니다.');

                $ifaceSelect.next().addClass('parsley_errorBox');
                setTimeout(function () {
                    $ifaceSelect.next().removeClass('parsley_errorBox');
                }, 3000);

                formInstance.validationResult = false;
                return;
            }
            // complete validation!
            formInstance.validationResult = true;
        });
        /* own control  */
        $("a[href='#" + tabObj.id + "']").on('shown.bs.tab', function (e) {

        });

        // request chart, pie, dynamic-grid
        // $reqBtn.trigger('click');
        initGrid();
    });
}(window.Profile || {}, jquery));
