(function ($, global) {
    var window = global;
    window.UtilsIsis = function () {
        return new UtilsIsis.fn.init();
    };

    UtilsIsis.fn = UtilsIsis.prototype =
	{
	    init: function () {
	        return this;
	    },
	    about: 'isis general functions',
	    version: '0.1'
	};

    /******************************************************************************************
	 * common request wrapper function (now use CSRequester)
     * @param options     			: options(callback function, etc)
     * @return
     * ****************************************************************************************/
    UtilsIsis.loadData = function (options) {
        return CSRequester.get(options.dbName).request(options.request, {

        	complete: function (resultMap) {
        		var result = resultMap.get('all');
        		options.callback(result);
        	},
        	partial: function (result) {
        		Logger.debug('[dev]', 'partial :' + JSON.stringify(result));
        	},
        	status: function (status) {
        		Logger.debug('[dev]', 'status:' + JSON.stringify(status));
        	},
        	error: function (errorMsg) {
        		options.error(errorMsg);
        		Logger.debug('[dev]', 'errorMsg:' + errorMsg);
        	}
        });
    };

    UtilsIsis.getTabInfo = function (allwrapId) {
        var tabObj = {};

    	var tabId = $('#' + allwrapId).parent('div').attr('id');
    	var $tabInfo = $("a[href='#" + tabId + "']");

    	tabObj.id = $tabInfo.data('id');
    	tabObj.title = $tabInfo.data('title');
    	tabObj.url = $tabInfo.data('url');

    	return tabObj;
    };

    UtilsIsis.genTabInfoObjToString = function (tabId, tabTitle, tabUrl) {
        var obj = {};
        obj.id = tabId;	obj.title = tabTitle;	obj.url = tabUrl;
        return JSON.stringify(obj);
    };

    /******************************************************************************************
	 * set event - when resize tab width
     * @param View      	: control-view object
     * @param tabId      	: tabId
     * @return
     * ****************************************************************************************/
    UtilsIsis.initTabCommonFunc = function (View, tabObj, userId) {
        UtilsIsis.setTabShowEvent(View, tabObj.id, tabObj.title, userId);
        UtilsIsis.setTabHideEvent(View, tabObj.id);
        UtilsIsis.setTabAddTriger(View, tabObj.id);
        UtilsIsis.setTabResizeWidthTriger(View, tabObj.id);
        UtilsIsis.setTabIconClickEvent(View, tabObj);
    };

    /******************************************************************************************
	 * set event - when show tab (request weblog 포함)
     * @param View      	: control-view object
     * @param tabId      	: tabId
     * @param tabName      	: tabName(need to request weblog)
     * @param userId      	: userId (need to request weblog)
     * @return
     * ****************************************************************************************/
    UtilsIsis.setTabShowEvent = function (View, tabId, tabName, userId) {
        /* tab show event (or shown.bs.tab?) */
        $("a[href='#" + tabId + "']").on('shown.bs.tab', function (e) {
            // var target = $(e.target).attr("href");
            Logger.debug('[dev]', 'shown.bs.tab:' + tabId);
            //			console.log(tabId);
            // reRenderView
            setTimeout(View.reRenderView, 5);
            // validate which view/request loaded
            if (!View.loaded) {
                View.loadPanel.show();
            }
            // request weblog
            Logger.info('[weblog]', UtilsIsis.genWebLogJson(userId, tabId, tabName, 'addTab', []));
        });
    };

    /******************************************************************************************
	 * set event - when hide tab
     * @param View      	: control-view object
     * @param tabId      	: tabId
     * @return
     * ****************************************************************************************/
    UtilsIsis.setTabHideEvent = function (View, tabId) {
        /* tab hide event */
        $("a[href='#" + tabId + "']").on('hide.bs.tab ', function (e) {
            Logger.debug('[dev]', 'hide.bs.tab:' + tabId);
            View.loadPanel.hide();
        });
    };

    /******************************************************************************************
	 * set event - when add tab(custom trigger)
     * @param View      	: control-view object
     * @param tabId      	: tabId
     * @return
     * ****************************************************************************************/
    UtilsIsis.setTabAddTriger = function (View, tabId) {
        /* TODO: renew trgger event */
        /* add new tab trigger */
        $('#tabs').on('addTabEvent', function (e) {
            var actTabId = $('#tabs > ul > li.active > a').data('id');

            Logger.debug('[dev]', 'addTabEvent:actTabId(' + actTabId + ')/tabId(' + tabId + ')');

            if (tabId != actTabId) {
                // hide loadpanel
                View.loadPanel.hide();
            }
        });
    };

    /******************************************************************************************
	 * set event - when resize tab width
     * @param View      	: control-view object
     * @param tabId      	: tabId
     * @return
     * ****************************************************************************************/
    UtilsIsis.setTabResizeWidthTriger = function (View, tabId) {
        /* TODO: renew trgger event */
        /* topMenu(resize width) button click triger */
        $("a[href='#" + tabId + "']").on('resizeWidth', function (e) {
            setTimeout(View.reRenderView, 5);
            View.loadPanel.repaint();
        });
    };

    /******************************************************************************************
	 * set event - when resize tab width
     * @param View      	: control-view object
     * @param tabId      	: tabId
     * @return
     * ****************************************************************************************/
    UtilsIsis.setTabIconClickEvent = function (View, tabObj) {
        // activation tab star icon click event
        $('#tabs > ul > li.active > a > i').on('click', function (e) {
            console.log('activation tab star icon click:' + e);

            // TODO : save favorite tab - use localDB
            var actTabId = $('#tabs > ul > li.active > a').data('id');
            var itemName = 'isis_favorite';
            Logger.debug('[tabId]', tabObj.id);
            Logger.debug('[actTabId]', actTabId);

            if (tabObj.id != actTabId) return;

            if (UtilsIsis.isSupportLS) {
                var favTabIdArry = UtilsIsis.getObjDataToLS(itemName) || [];
                var actTabIdIndex = favTabIdArry.indexOf(actTabId);

                // not exist - push - change icon color to yellow
                if (actTabIdIndex == -1) {
                    favTabIdArry.push(actTabId);
                    $(this).addClass('color-f-star');

                    // add menu
                    var li = $('<li/>').addClass('tab_go').attr('data-id', tabObj.id).attr('data-info', UtilsIsis.genTabInfoObjToString(tabObj.id, tabObj.title, tabObj.url));
                    var a = $('<a/>').appendTo(li);
                    var i = $('<i/>').addClass('fa fa-star color-f-star');
                    var span = $('<span/>').addClass('nav-label').html(tabObj.title);
                    a.append(i).append(span);
                    $('#side-menu3').append(li);

                    View.toast.option({type: 'success', message: '관심 메뉴에 추가되었습니다.'});
                    View.toast.show();
                    // exist - delete - change icon color to none
                } else {
                    favTabIdArry.splice(actTabIdIndex, 1);
                    $(this).removeClass('color-f-star');

                    // delete menu
                    var a = $('#side-menu3').find("li[data-id='" + tabObj.id + "']").remove();
                    // {"id":"all_dashboard","title":"dashboard","url":"/isis/all/dashboard"}

                    View.toast.option({type: 'error', message: '관심 메뉴에서 삭제되었습니다.'});
                    View.toast.show();
                }

                Logger.debug('[favTabIdArry]', favTabIdArry);
                // then, reset local storage item
                UtilsIsis.setObjDataToLS(itemName, favTabIdArry);
            }
        });
    };

    // 임시 localStorage item crud
    UtilsIsis.isSupportLS = function () {
        return (('localStorage' in window) && window['localStorage'] !== null);
    };

    UtilsIsis.setObjDataToLS = function (k, v) {
        localStorage.setItem(k, JSON.stringify(v));
    };

    UtilsIsis.getObjDataToLS = function (k) {
        // localStorage.getItem(k) ==

        return JSON.parse(localStorage.getItem(k));
    };

    UtilsIsis.removeDataToLS = function (k) {
        localStorage.removeItem(k);
    };

    /******************************************************************************************
     * init daterangepicker - http://www.daterangepicker.com/
     * @param id        : datetimepicker html attr id
     * @param options   : datetimepicker options
     * @return          : daterangepicker
     * ****************************************************************************************/
    UtilsIsis.initDaterangepicker = function ($drp, options, cb) {
        $drp.daterangepicker($.extend(
            {
                dateLimit: { 'months': 1 },
                locale: { format: 'YYYYMMDD' },
                startDate: moment(),
                minDate: moment('20150101', 'YYYYMMDD'),
                maxDate: moment(),
                showCustomRangeLabel: false,
                alwaysShowCalendars: true,
                applyClass: 'btn-primary',
                autoApply: false,
                showDropdowns: true,
                showWeekNumbers: true,
                linkedCalendars: false

            }, options), cb
            // function(start, end, label) { console.log(start.toISOString(), end.toISOString(), label);}
        );
        return $drp.data('daterangepicker');
    };

    /******************************************************************************************
	 * init datetimepicker - http://eonasdan.github.io/bootstrap-datetimepicker/
     * @param id     	: datetimepicker html attr id
     * @param options	: datetimepicker options
     * @return			: datetimepicker
     * ****************************************************************************************/
    UtilsIsis.initDatetimepicker = function (id, options) {
        // console.log(id);
        return $('#' + id).datetimepicker($.extend(
            {
                allowInputToggle: true,
                minDate: moment('20150101', 'YYYYMMDD'),
                // useCurrent: true,
                defaultDate: moment(),
                locale: 'ko'
            }, options)
        );
    };

    /******************************************************************************************
	 * init knob - http://anthonyterrien.com/knob/
     * @param id      : datetimepicker html attr id
     * @return
     * ****************************************************************************************/
    UtilsIsis.initKnob = function (id) {
        $('#' + id).knob({
            fgColor: '#26B99A',
            inputColor: '#26B99A',
            width: '40',
            height: '40',
            displayPrevious: true,
            angleOffset: 0,
            readOnly: true,
            linecap: 'round',
            change: function (value) {},
            release: function (value) {},
            cancel: function () {},
            format: function (value) { return value + '%'; }
        });
    };

    UtilsIsis.resetKnob = function ($id) {
        $id.trigger('configure', { fgColor: '#26B99A', inputColor: '#26B99A', format: function (value) { return value + '%'; } });
    };

    UtilsIsis.setKnobError = function ($id) {
        $id.trigger('configure', { fgColor: '#d9534f', inputColor: '#d9534f', format: function (value) { return 'error'; } });
    };

    UtilsIsis.setKnobFake = function ($id) {
        $id.trigger('configure', { fgColor: '#f0ad4e', inputColor: '#f0ad4e', format: function (value) { return 'fake'; } });
    };

    UtilsIsis.setKnobValue = function ($id, intValue) {
        $id.val(intValue).trigger('change');
    };

    /******************************************************************************************
	 * calculate Progress Status - for set knob value
     * @param progress     : ex> progress = "1/30";
     * @return current status value
     * ****************************************************************************************/
    UtilsIsis.calculateProgressStatus = function (progress) {
        var status = progress.split('/');
        var now = Number(status[0]);
        var all = Number(status[1]);

        if (all != now) { return Math.round(now * 100 / all); } else { return 100; }
    };

    /******************************************************************************************
	 * animate Progress - for knob progress animate
     * @param progressJqId     			: knob html attr $id
     * @param preProgressPercent    	: pre-value
     * @param nowProgressPercent     	: current-value
     * @return
     * ****************************************************************************************/
    UtilsIsis.animateKnobProgress = function (progressJqId, preProgressPercent, nowProgressPercent) {
        $({val: preProgressPercent}).animate({val: nowProgressPercent}, {
		       duration: 1200,
		       easing: 'swing',
		       step: function () {
                progressJqId.val(this.val).trigger('change');
		       }
        });
    };

    /******************************************************************************************
	 * init icheckbox - radio & checkbox
     * @param cName    		: tag class name
     * @return
     * ****************************************************************************************/
    UtilsIsis.initIcheckbox = function (cName) {
        // init checkbox - icheckbox
        // set checkbox format
        $('.' + cName).iCheck({
            checkboxClass: 'icheckbox_flat-green',
            radioClass: 'iradio_flat-green'
        });
    };

    /******************************************************************************************
	 * init custom textarea - for overay fullscreen
     * @param $id    		: jquery selector(tag $id)
     * @param options      	: options(property fullscreen)
     * @return
     * ****************************************************************************************/
    UtilsIsis.initCustomTextarea = function ($id, options) {
        // console.log(options);
        $id.textareafullscreen($.extend({
            overlay: true,
            maxWidth: '80%',
            maxHeight: '80%'
        }, (options.fullscreen == undefined ? {} : options.fullscreen))
        );
    };

    /******************************************************************************************
	 * text validation - ex> 111,2234,1256,1800 -> true
     * @param text     					: string value
     * @return	validation result
     * ****************************************************************************************/
    UtilsIsis.isValidNumAndCommaSeperate = function (text) {
        var pattern = /^\d+(,\d+)*$/;
	    return pattern.test(text);
    };

    /******************************************************************************************
	 * compare date - is same or after
     * @param sDate     				: start date
     * @param eDate    					: end date
     * @param format    				: date format(ex> YYYYMMDD)
     * @param precision     			: validation precision(year, month, day)
     * @return
     * ****************************************************************************************/
    UtilsIsis.isSameOrAfterDate = function (sDate, eDate, format, precision) {
        return moment(eDate, format).isSameOrAfter(moment(sDate, format), precision);
    };

    /******************************************************************************************
	 * get weekdaysShort - ko : 월, 화, 수, 목, 금, 토, 일
     * @param momentObj     			: moment obj
     * @return	 weekdaysShort
     * ****************************************************************************************/
    UtilsIsis.getWeekDaysShort = function (momentObj) {
        var koLocaleData = moment.localeData('ko');
        return koLocaleData.weekdaysShort(momentObj);
    };

    /******************************************************************************************
	 * add/remove parsley validation & view disabled/enable toggle - for validation
     * @param $id     				: jquery selector(tag $id)
     * @param validatorAttr    		: [attrName, attrValue]
     * @param isOn    				: add or remove validation & toggle disabled
     * @return
     * ****************************************************************************************/
    UtilsIsis.toggleParsleyValidation = function ($id, validatorAttr, isOn) {
        if (isOn) {
            $id.attr(validatorAttr[0], validatorAttr[1]).prop('disabled', !isOn);
        } else {
            // $('#crosssales_tarea_prdValue1').prev().css("display", "none");

            if (validatorAttr[1] == 'digits') {
                // set default value (0)
                $id.removeAttr(validatorAttr[0]).prop('disabled', !isOn).val('0');
            } else {
                $id.removeAttr(validatorAttr[0]).prop('disabled', !isOn).val('');
            }
        }
    };

    /******************************************************************************************
	 * select all text - for ui event
     * @param _this     			: this
     * @return
     * ****************************************************************************************/
    UtilsIsis.selectAllText = function (_this) {
        var $this = $(_this);
	    $this.select();

	    $this.mouseup(function () {
	        $this.unbind('mouseup');
	        return false;
	    });
    };

    /******************************************************************************************
	 * replace value(분류코드, 상풍코드 등) to valid text - ex> 111,2234,1256,1800
     * @param srcText     			: src text
     * @return text					: cleaned text
     * ****************************************************************************************/
    UtilsIsis.replaceValueToValidText = function (srcText) {
        // TODO : 구분자로 사용될 몇몇 문자에 대한 정제 작업 필요
        var text = srcText;
        text = text.replace(/[\n\r]/g, ',');
        // text = text.replace(/\n/g, ",");
        // text = text.replace(/\\r\\n/g, ",");
        // text = text.replace(new RegExp('\r?\n','g'), ',');
        if (text.lastIndexOf(',') == text.length - 1) {
            text = text.substring(0, text.length - 1);
        }

        return text;
    };

    /******************************************************************************************
	 * toggle parsley error ui - 해당 view 에 css 효과
	 * (setTimeout 사용 : 동시에 parsley validation 이 설정된 필드자체가 error 인 경우와 구분하기 위해)
     * @param $id     			: jquery selector(tag $id)
     * @return isShow			: show or hide all
     * ****************************************************************************************/
    UtilsIsis.toggleParsleyErrorUi = function ($id, parentDivId, isShow) {
        if (isShow) {
            $id.addClass('parsley_errorBox');
            $id.focus();
            $id.blur(function (e) {
                setTimeout(function () {
                    $id.removeClass('parsley_errorBox');
			    }, 2000);
            });
            //			var elem = $id.parsley();
            //			elem.addError("testhong", {message: 'My custom error msg', updateClass: false});
        } else {
            $('#' + parentDivId).find('.parsley_errorBox').removeClass('parsley_errorBox');
        }
    };

    /******************************************************************************************
	 * get date format yyyymmdd
     * @param yyyymmdd     			: string yyyymmdd
     * @return new Date				: Date
     * ****************************************************************************************/
    UtilsIsis.getDateYYYYMMDD = function (yyyymmdd) {
        if (!/^(\d){8}$/.test(yyyymmdd)) return 'invalid date';
	    var y = yyyymmdd.substr(0, 4);
        var m = yyyymmdd.substr(4, 2) - 1;
        var d = yyyymmdd.substr(6, 2);
	    return new Date(y, m, d);
    };

    /******************************************************************************************
	 * get string format yyyymmdd
     * @param date     				: Date v
     * @return yyyymmdd     		: String yyyymmdd
     * ****************************************************************************************/
    UtilsIsis.getYYYYMMDDFromDate = function (v) {
        var y = v.getFullYear().toString(), m = (v.getMonth() + 1).toString(), d = v.getDate().toString();
        return y + (m.length == 2 ? m : '0' + m) + (d.length == 2 ? d : '0' + d);
    };

    /******************************************************************************************
	 * get number with thousands format
     * @param num     				: number
     * @return formatNum			: string number
     * ****************************************************************************************/
    UtilsIsis.getNumberWithThousands = function (num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    /******************************************************************************************
	 * get string format yyyymmdd
     * @param d     				: Date v
     * @param f     				: format (default YYYYMMDD-HHmmss)
     * @return formatted v     		: String formatted v
     * ****************************************************************************************/
    UtilsIsis.getDateStringFormat = function (d, f) {
        var dateTime = d == undefined ? new Date() : d;
        var format = f == undefined ? 'YYYYMMDD-HHmmss' : f;
        return moment(dateTime).format(format);
    };

    /******************************************************************************************
	 * change date format(default string YYYYMMDD to YYYY-MM-DD)
     * @param sD     				: String source date
     * @param sF     				: String source format
     * @param tF     				: String target format
     * @return formatted v     		: String formatted v
     * ****************************************************************************************/
    UtilsIsis.changeDateFormat = function (sD, sF, tF) {
        var sDate = sD == undefined ? new Date() : sD;
        var sFormat = sF == undefined ? 'YYYYMMDD' : sF;
        var tFormat = tF == undefined ? 'YYYY-MM-DD' : tF;

        return moment(sDate, sFormat).format(tFormat);
    };

    /******************************************************************************************
	 * bind realtime sales data-dashboard
     * @param $tagObjs     			: jquery objects
     * @param bObj     				: bind object
     * @return
     * ****************************************************************************************/
    UtilsIsis.bindRtSalesHtml = function ($tagObjs, bObj) {
        // key는 json key 값을 이용함
        for (var k in bObj) {
            var resParam = bObj[k];		// response param			ex> dmComTp 의 json value
            var $tId = $tagObjs[k];		// jquery tagId selector	ex> $("#dmComTp")
            UtilsIsis.setRtSalesHtmlTag(k, resParam, $tId);		// ex> ("dmComTp", "02", "$("#dmComTp")")
            //			$tId.remove tag 안
            // $tId.html(html);
            // $tId.empty();
            // $tId.html("<i class='fa fa-spinner fa-pulse fa-fw'></i>");
        }

        if (bObj.tRemark == '미집계') {
            $tagObjs.revHms.html("<div class='dashbd-danger'>" + bObj.tRemark + '</div>');
        }
    };

    /******************************************************************************************
	 * remove realtime sales class-dashboard(html 상의 아이콘 색상변경 리셋 & set loading image)
     * @param $tagObjs     			: jquery objects
     * @return
     * ****************************************************************************************/
    UtilsIsis.clearRtSalesHtml = function ($tagObjs) {
        for (var k in $tagObjs) {
            var $tId = $tagObjs[k];
            $tId.removeClass('dashbd-success').removeClass('dashbd-danger').removeClass('dashbd-warning');
            // $tId.empty(); // faster but..
            $tId.html("<i class='fa fa-spinner fa-pulse fa-fw'></i>");
        }
    };

    /******************************************************************************************
	 * set realtime sales data to html tag-dashboard
     * @param key     			: json object key("dmComTp")
     * @param resParam     		: json object value("02")
     * @param $tId     			: jquery object($("#dmComTp"))
     * @return
     * ****************************************************************************************/
    UtilsIsis.setRtSalesHtmlTag = function (key, resParam, $tId) {
        // rate 증감관련 html ex> 전주_거래금액_거래액(증감)
        if (key.substr(key.length - 2) == 'Rt') {
            $tId.removeClass('dashbd-success').removeClass('dashbd-danger').removeClass('dashbd-warning');
	    	if (resParam == 0) {
	    		$tId.addClass('dashbd-warning');
	    		$tId.html(resParam + "% <i class='fa fa-minus'>");
	    	} else if (resParam > 0) {
	    		$tId.addClass('dashbd-success');
	    		$tId.html(resParam + "% <i class='fa fa-level-up'>");
	    	} else {
	    		$tId.addClass('dashbd-danger');
	    		$tId.html(resParam + "% <i class='fa fa-level-down'>");
	    	}
	    // 집계일의 특이사항 여부
        } else if (key.substr(key.length - 6) == 'Remark') {
            if (resParam == null || resParam == '') resParam = '특이사항 없음';
            $tId.html(resParam);
            // 수량의 경우 포멧터 적용
        } else if (key.substr(key.length - 3) == 'Amt' || key.substr(key.length - 3) == 'Cnt') {
            $tId.html(Globalize.formatNumber(resParam));
            // 날짜 포멧변경
        } else if (key.substr(key.length - 2) == 'Dt') {
            $tId.html(moment(resParam, 'YYYYMMDD').format('YYYY-MM-DD'));
            // 시간 포멧변경
        } else if (key == 'revHms') {
            $tId.html(moment(resParam, 'HHmmss').format('HH:mm:ss'));
            // 나머지 text
        } else {
            $tId.html(resParam);
        }
    };

    // 공통 코드 메시지
    UtilsIsis.getCommonErrorMsg = function (errCode) {
        var errMsg;

        switch (errCode) {
	    case '00':
	    	errMsg = '정상처리되었습니다.';
	    	break;

	    case '-11':
	    	errMsg = '아이디를 확인해 주세요.';
	    	break;

	    case '-12':
	    	errMsg = '비밀번호를 확인해 주세요.';
	    	break;
	    case '-13':
	    	errMsg = '접근할 수 없는 사용자입니다.';
	    	break;
        }
        return errMsg;
    };

    // weblog request json format
    UtilsIsis.genWebLogJson = function (uId, tId, tTitle, eName, eDetail) {
        var jsonObj =
		{
		    userId: uId,
		    time: new Date(),
		    tabId: tId,
		    tabTitle: tTitle,
		    eventName: eName,
		    eventDetail: eDetail
		};

        return JSON.stringify(jsonObj);
    };

    UtilsIsis.bulidHtmlTag = function (tag, html, attrs) {
        if (typeof (html) !== 'string') {
            attrs = html;
            html = null;
        }
        var h = '<' + tag;
        for (attr in attrs) {
            if (attrs[attr] === false) { continue; }
            h += ' ' + attr + '="' + attrs[attr] + '"';
        }
        return h += html ? '>' + html + '</' + tag + '>' : '/>';
    };

    /***************************************************************************
	 *
	 * @param s :
	 *            날짜문자
	 * @param format :
	 *            표현식(예:yyyy-mm-dd hh:mi:ss)
	 * @return 표현식으로 치환된 문자열
	 **************************************************************************/
    /* UtilsIsis.getDateTime = function(s, format)
    {
    	var dt = new Date();
    	var yyyy, mm, dd, hh, mi, ss;

		s = CastUtilsIsis.trimChar(s);
		format =  StringUtilsIsis.nvl(format, "yyyy-mm-dd");

		yyyy = StringUtilsIsis.nvl(s.substr( 0, 4),                  dt.getFullYear()          );
		mm   = StringUtilsIsis.nvl(s.substr( 4, 2), StringUtilsIsis.lpad(dt.getMonth() + 1, 2, "0"));
		dd   = StringUtilsIsis.nvl(s.substr( 6, 2), StringUtilsIsis.lpad(dt.getDate()     , 2, "0"));
		hh   = StringUtilsIsis.nvl(s.substr( 8, 2), StringUtilsIsis.lpad(dt.getHours()    , 2, "0"));
		mi   = StringUtilsIsis.nvl(s.substr(10, 2), StringUtilsIsis.lpad(dt.getMinutes()  , 2, "0"));
		ss   = StringUtilsIsis.nvl(s.substr(12, 2), StringUtilsIsis.lpad(dt.getSeconds()  , 2, "0"));

		if ( format == "date" )
			return dt;
		else
	    	return (
	    			format.toLowerCase()
			    	      .replace("yyyy", yyyy)
			    	      .replace("mm"  , mm  )
			    	      .replace("dd"  , dd  )
			    	      .replace("hh"  , hh  )
			    	      .replace("mi"  , mi  )
			    	      .replace("ss"  , ss  )
    			);
    };
*/

    UtilsIsis.fn.init.prototype = UtilsIsis.fn;
})(jQuery, window);
