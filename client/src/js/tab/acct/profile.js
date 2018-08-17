/* eslint-disable no-undef */
(function (Profile, $) {

    $(function () {
        /* tab id, title, url */
        const tabObj = UtilsCmmn.getTabInfo('profile_allwrap');

        /* flag */
        let cntFnDrawCB = 0;
        let isGridReqEnd = false;
        let rNumIfaceGd = 0;

        /* view  */
        const $contentWrap = $('#profile_contentwrap');
        const $dGrid = $('#profile_grid');
        const $delAllBtn = $('#profile_btn_delAll');

        // profile area
        const $updBtn = $('#profile_btn_upd');
        const $createBtn = $('#profile_btn_create');
        const $form = $('#profile_form');                                           // parsley validation form
        const $ifaceDGrid = $('#profile_ifaceGrid');
        const $ifaceSelect = $('#profile_ifaceout');
        const $profileId = $('#profile_id');                                        // hidden - for remember current profile
        const $profileName = $('#profile_name');
        const $profileCmmnt = $('#profile_cmmnt');
        const $profileFieldBpssum = $('#profile_field_bpssum');
        const $profileFieldPeeripsrc = $('#profile_field_peeripsrc');
        const $profileFieldDstnetmask = $('#profile_field_dstnetmask');
        const $profileFieldDstas = $('#profile_field_dstas');

        /* for dynamic select2 options - */
        const ifaceSelect2Opt = {placeholder: 'choose ifaceout...', width: '100%', data: []};

        function getIfaceSelectOptions (ifaceOrg, ifaceProfile, disabled) {
            let i = 0;
            const orgLen = ifaceOrg.length;
            const profileLen = ifaceProfile.length;
            // select2 ifaceout array data
            for (; i < orgLen; i += 1) {
                // profile ifaceout array data
                let j = 0;
                if (!profileLen) {
                    ifaceOrg[i].disabled = disabled;
                } else {
                    for (; j < profileLen; j += 1) {
                        // if (ifaceOrg[i].id === ifaceProfile[j].ifaceOut + '_' + ifaceProfile[j].peerIpSrc) {
                        if (ifaceOrg[i].ifaceOut === ifaceProfile[j].ifaceOut && ifaceOrg[i].peerIpSrc === ifaceProfile[j].peerIpSrc) {
                            ifaceOrg[i].disabled = disabled;
                            break;
                        }
                    }
                }
            }
            return ifaceOrg;
        }

        function resetIfaceSelectOptions () {
            // $ifaceSelect.select2('destroy');
            // $ifaceSelect.val([]);
            $ifaceSelect.empty().trigger('change');
            var newOption = new Option('', '', false, false);
            $ifaceSelect.append(newOption).trigger('change');
        }

        function initIfaceSelect (reqOpt, ifaceProfile) {
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    if (res.status.code === 1) {
                        $.map(res.result.data, function (item) {
                            item.id = item.ifaceOut + '_' + item.peerIpSrc;
                            item.text = item.ifaceOutAs + '[' + item.ifaceOut + ']';
                            item.disabled = false;
                        });
                        // get disabled options
                        ifaceSelect2Opt.data = getIfaceSelectOptions(res.result.data, ifaceProfile, true);
                        // reset select2 options(html)
                        resetIfaceSelectOptions();
                        // init select2
                        $ifaceSelect.select2(ifaceSelect2Opt);
                    } else {
                        $ifaceSelect.select2(ifaceSelect2Opt);
                    }
                },
                error: function (msg) {
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
        }

        /* init views */
        // init select2
        // initIfaceSelect({url: 'api/trf/ifaceout', type: 'get', param: {}});
        // init profile datatables
        let dGrid;
        function initGrid () {
            // init datatables
            // activate spinner
            UtilsCmmn.showOverlay($contentWrap);
            isGridReqEnd = false;
            // datatables
            dGrid = $dGrid.dataTable({
                language: {search: 'Profile Search : '},
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
                ajax: {
                    url: 'api/trf/profile',
                    type: 'get',
                    contentType: 'application/json;charset=UTF-8',
                    data: {},
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
                // sAjaxSource: 'api/acct/profile/grid',
                // sServerMethod: 'POST',
                // fnServerParams: function (aoData) {},
                fnDrawCallback: function (oSettings) {
                    // TODO : temp
                    cntFnDrawCB++;
                    if (cntFnDrawCB === 2 && !isGridReqEnd) {
                        // if (oSettings.aiDisplay.length !== 0 && !isGridReqEnd) {
                        UtilsCmmn.hideOverlay($contentWrap);
                        isGridReqEnd = true;
                        cntFnDrawCB = 0;
                        // 초기 프로파일이 0개 일 경우
                        if (oSettings.aiDisplay.length === 0) {
                            UtilsCmmn.showToast('저장된 프로파일 없음!', false, {});
                            initIfaceGrid();
                        } else {
                            var profileId = parseInt($profileId.val());
                            var selectRowIdx = 0;
                            var profileTdArry = this.api().column(0).data().toArray();

                            for (var j = 0; j < profileTdArry.length; j++) {
                                if (profileId === profileTdArry[j]) {
                                    selectRowIdx = j;
                                    break;
                                }
                            }
                            var pageLength = this.api().page.info().length;
                            var goToPage = Math.floor((selectRowIdx) / pageLength);
                            this.api().page(goToPage).draw('page');

                            if (selectRowIdx > 4) {
                                selectRowIdx = selectRowIdx - 5;
                                // this.api().page('next').draw('page');
                                // this.api().page(1).draw('page');
                            }
                            // this.api().page(parseInt(selectRowIdx / this.api().page.len(), 10)).draw(false);
                            // row selection trigger
                            $('#profile_grid tbody tr:eq(' + selectRowIdx + ')').click();
                        }
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
                    {targets: [0], visible: false, searchable: false},
                    {targets: [3, 4, 5, 6], visible: false, searchable: false},
                    { className: 'text-left', 'targets': [1, 2, 3, 4, 5, 6] },
                    { className: 'text-center', 'targets': [0, 7, 8] }

                ],
                order: [[0, 'desc']],
                fnInitComplete: function () {
                    $dGrid.css('width', '100%');
                }
            });
        }

        // init ifaceout datatables
        function initIfaceGrid (ifaceArry) {
            // datatables
            $ifaceDGrid.dataTable({
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
                data: ifaceArry || [],
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
                    $dGrid.css('width', '100%');
                    setTimeout(function () {
                        // $dGrid.api().columns.adjust().draw();
                    }, 100);
                    // var ifaceSelect2Opt = {placeholder: 'choose ifaceout...', width: '100%', data: []};
                    // $ifaceSelect.select2(ifaceSelect2Opt);

                    // init select2
                    var ifaceDGridArry = $ifaceDGrid.api().data().toArray();
                    if (!ifaceSelect2Opt.data.length) {
                        // requset new data
                        initIfaceSelect({url: 'api/trf/ifaceout', type: 'get', param: {}}, ifaceDGridArry);
                    } else {
                        // use memory - ifaceSelect2Opt
                        $.map(ifaceSelect2Opt.data, function (item) {
                            item.disabled = false;
                        });
                        // get disabled options
                        ifaceSelect2Opt.data = getIfaceSelectOptions(ifaceSelect2Opt.data, ifaceDGridArry, true);
                        // reset select2 options(html)
                        resetIfaceSelectOptions();
                        // init select2
                        $ifaceSelect.select2(ifaceSelect2Opt);
                    }
                },
                createdRow: function (row, data, dataIndex) {
                    if (data.rNum <= 0) {
                        $(row).addClass('update-color');
                    }
                }
            });
        }

        /* view control  */
        /* grid event */
        // profile grid - delete profile
        $dGrid.on('click', 'tbody button', function (e) {
            e.stopPropagation();
            UtilsCmmn.showOverlay($contentWrap);
            var data = $dGrid.api().row($(this).parents('tr')).data();
            var reqOpt = { url: 'api/trf/profile/' + data.profileId, type: 'delete', param: {} };
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    UtilsCmmn.hideOverlay($contentWrap);
                    cntFnDrawCB = 0;
                    isGridReqEnd = false;
                    if (res.status.code === 1) {
                        dGrid.fnClearTable();
                        dGrid.fnReloadAjax();

                        // for sync profileTab crud
                        if (window.nowProfileId === parseInt(res.profileId)) {
                            window.nowProfileStatus = -1;   // 0:normal, 1:update, -1:delete
                        }
                    } else {
                        UtilsCmmn.showToast(res.status.msg, false, {});
                    }
                },
                error: function (msg) {
                    UtilsCmmn.hideOverlay($contentWrap);
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
            // td:not(:has(button))
        });
        // profile grid - change profile detail
        $dGrid.on('click', 'tbody tr', function (e) {
            if (!$(this).hasClass('grid-row-selected')) {
                dGrid.$('tr.grid-row-selected').removeClass('grid-row-selected');
                $(this).addClass('grid-row-selected');
                var data = dGrid.api().row(this).data();
                var profileId = data.profileId;
                $profileId.val(profileId);
                reqProfileDetail({url: 'api/trf/profile/' + profileId, type: 'get'});
            }
        });
        // iface grid - delete ifaceout list
        $ifaceDGrid.on('click', 'i.fa-trash', function () {
            var gridData = $ifaceDGrid.api().data().toArray();

            if (gridData.length > 1) {
                var row = $ifaceDGrid.api().row($(this).parents('tr'));
                var data = row.data();
                ifaceSelect2Opt.data = getIfaceSelectOptions(ifaceSelect2Opt.data, [data], false);
                // reset select2 options(html)
                resetIfaceSelectOptions();
                // init select2
                $ifaceSelect.select2(ifaceSelect2Opt);
                // $ifaceDGrid.api().row($(this).parents('tr')).remove().draw();
                row.remove().draw();
            } else {
                UtilsCmmn.showToast('ifaceout 은 한개 이상 존재해야합니다.', false, {});
            }
        });
        // edit field ifaceout
        $ifaceDGrid.on('click', 'tbody td', function (e) {
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
                el.focus();
            }
        });
        // set profile detail field data to html
        function setProfileDetailHtml (data) {
            $profileName.val(data.profileName);
            $profileCmmnt.val(data.profileCmmnt);
            $profileFieldBpssum.val(data.profileFieldBpssum);
            $profileFieldPeeripsrc.val(data.profileFieldPeeripsrc);
            $profileFieldDstnetmask.val(data.profileFieldDstnetmask);
            $profileFieldDstas.val(data.profileFieldDstas);
        }

        // delete all ifaceout lists
        $delAllBtn.on('click', function (e) {
            $ifaceDGrid.api().clear().draw();
            // get IfaceSelect options (all enable)
            ifaceSelect2Opt.data = getIfaceSelectOptions(ifaceSelect2Opt.data, [], false);
            resetIfaceSelectOptions();
            // init select2
            $ifaceSelect.select2(ifaceSelect2Opt);
        });

        /* select2 event */
        // append iface data to ifaceGrid
        $ifaceSelect.on('select2:select', function (e) {
            var data = e.params.data;
            // validation
            var isNewIface = true;
            var gridData = $ifaceDGrid.api().data().toArray();
            for (var i = 0; i < gridData.length; i++) {
                if (gridData[i].ifaceOut === data.ifaceOut && gridData[i].peerIpSrc === data.peerIpSrc) {
                    isNewIface = false;
                    break;
                }
            }
            if (isNewIface) {
                var addObj = {
                    rNum: rNumIfaceGd--,
                    ifaceName: data.ifaceOutAs + '[' + data.ifaceOut + ']',
                    ifaceOut: data.ifaceOut,
                    ifaceOutAs: data.ifaceOutAs,
                    peerIpSrc: data.peerIpSrc,
                    peerIpSrcAs: data.peerIpSrcAs,
                    fieldIfaceOut: ''
                }
                $ifaceDGrid.api().row.add(addObj).draw(false);
                e.params.data.disabled = true;
                ifaceSelect2Opt.data = getIfaceSelectOptions(ifaceSelect2Opt.data, [addObj], true);

            } else {
                UtilsCmmn.showToast('이미 존재하는 ifaceout 입니다.', false, {});
            }
        });

        /* validation */
        /* parsley validation evnet */
        $form.parsley().on('form:validate', function (formInstance) {
            var isValidAll = $ifaceDGrid.api().data().toArray().length !== 0;

            if (!isValidAll) {
                UtilsCmmn.showToast('ifaceout 은 한개 이상 존재해야합니다.', false, {});
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

        /* event control  */
        // get profile detail data event
        function reqProfileDetail (reqOpt) {
            // isGridReqEnd = false;
            UtilsCmmn.reqDefaultAjax({
                success: function (res) {
                    if (res.status.code === 1) {
                        setProfileDetailHtml(res.result.data);
                        $.map(res.result.data.ifaceArry, function (item) {
                            item.ifaceName = item.ifaceOutAs + '[' + item.ifaceOut + ']';
                        });
                        initIfaceGrid(res.result.data.ifaceArry);
                    } else {
                        UtilsCmmn.showToast(res.status.msg, false, {});
                    }
                },
                error: function (msg) {
                    UtilsCmmn.showToast(msg, false, {});
                }
            }, reqOpt);
        }

        // update profile event
        $updBtn.on('click', function (e) {
            // rest validation
            $form.parsley().reset();
            var isValid = $form.parsley().validate();
            if (isValid) {
                UtilsCmmn.showOverlay($contentWrap);

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
                var gridData = $ifaceDGrid.api().data().toArray();
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
                var reqOpt = { url: 'api/trf/profile/' + updObj.profileId, type: 'put', param: {updObj: updObj} };
                UtilsCmmn.reqDefaultAjax({
                    success: function (res) {
                        UtilsCmmn.hideOverlay($contentWrap);
                        cntFnDrawCB = 0;
                        isGridReqEnd = false;
                        if (res.status.code === 1) {
                            $profileId.val(res.result.profileId);
                            dGrid.fnClearTable();
                            dGrid.fnReloadAjax();

                            // for sync profileTab crud
                            if (window.nowProfileId === parseInt(res.result.profileId)) {
                                window.nowProfileStatus = 1;   // 0:normal, 1:update, -1:delete
                            }
                        } else {
                            UtilsCmmn.showToast(res.status.msg, false, {});
                        }
                    },
                    error: function (msg) {
                        UtilsCmmn.hideOverlay($contentWrap);
                        UtilsCmmn.showToast(msg, false, {});
                    }
                }, reqOpt);
            }
        });

        // create profile event
        $createBtn.on('click', function (e) {
            // rest validation
            $form.parsley().reset();

            var isValid = $form.parsley().validate();
            if (isValid) {
                UtilsCmmn.showOverlay($contentWrap);
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
                var gridData = $ifaceDGrid.api().data().toArray();
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
                var reqOpt = { url: 'api/trf/profile', type: 'post', param: {profileObj: profileObj} };
                UtilsCmmn.reqDefaultAjax({
                    success: function (res) {
                        UtilsCmmn.hideOverlay($contentWrap);
                        cntFnDrawCB = 0;
                        isGridReqEnd = false;
                        if (res.status.code === 1) {
                            $profileId.val(res.result.profileId);
                            dGrid.fnClearTable();
                            dGrid.fnReloadAjax();
                        } else {
                            UtilsCmmn.showToast(res.status.msg, false, {});
                        }
                    },
                    error: function (msg) {
                        UtilsCmmn.hideOverlay($contentWrap);
                        UtilsCmmn.showToast(msg, false, {});
                    }
                }, reqOpt);
            }
        });

        // tab shown event
        $("a[href='#" + tabObj.id + "']").on('shown.bs.tab', function (e) {});

        /* request! */
        initGrid();
    });
}(window.Profile || {}, jquery));
