(function ($, global) {
    var window = global;
    window.UtilsDx = function () {
        return new UtilsDx.fn.init();
    };

    UtilsDx.fn = UtilsDx.prototype =
        {
            init: function () {
                return this;
            },
            about: 'isis general functions',
            version: '0.1'
        };

    /* general function */
    UtilsDx.isMinusNum = function (num) {
        return $.isNumeric(num) && num < 0;
    };

    UtilsDx.getExcelFileName = function (preStr) {
        return preStr + '_' + UtilsCmmn.getDateStringFormat();
    };

    /* pivotgrid function */
    UtilsDx.initPivotGrid = function ($grid, options) {
        var grid = $grid.dxPivotGrid(options).dxPivotGrid('instance');

        return {
            instance: grid,
            reload: function (fields, dataArry) {
                grid.option('dataSource', {
                    // fields: pivotGridDataSourceFields,
                    store: dataArry
                });
                // grid.getDataSource().reload();
                grid.getDataSource().load();
                // grid.repaint();
            }
        };
    };

    UtilsDx.clearPivotGrid = function (grid, gridFields) {
        if (grid) grid.reload(gridFields, []);
    };

    UtilsDx.repaintPivotGrid = function (grid) {
        if (grid) grid.instance.repaint();
    };

    /* datagrid function */
    UtilsDx.initGrid = function ($grid, options) {
        var grid = $grid.dxDataGrid($.extend(true, {}, gridCommonOpt, options)).dxDataGrid('instance');

        return {
            instance: grid,
            load: function (dataArry) {
                grid.option('dataSource', {store: dataArry});
            }
        };
    };

    UtilsDx.clearGrid = function (grid) {
        if (grid) grid.load([]);
    };

    UtilsDx.setGridColumn = function (grid, columnsArray) {
        if (grid) grid.instance.option('columns', columnsArray);
    };

    UtilsDx.repaintGrid = function (grid) {
        if (grid) grid.instance.repaint();
    };

    UtilsDx.clearGroupingGrid = function (grid) {
        if (grid) grid.instance.clearGrouping();
    };

    /* loadpanel function */
    UtilsDx.initLoadPanel = function ($loadPanel, options) {
        return $loadPanel.dxLoadPanel($.extend({

            shadingColor: 'rgba(0,0,0,0.1)',
            visible: true,
            showIndicator: true,
            showPane: false,
            shading: true,
            closeOnOutsideClick: false,
            position: {my: 'top', at: 'top', of: window},
            onShown: function () {
            },
            onHidden: function () {
            }

        }, options)).dxLoadPanel('instance');
    };

    /* toast function */
    UtilsDx.initToast = function ($toast, options) {
        return $toast.dxToast($.extend({
            position: {my: 'top right', at: 'top right', offset: '-15 15', of: window},
            message: '에러 발생!',
            type: 'error',
            height: 55,
            width: 300,
            displayTime: 3000,
            closeOnClick: true,
            closeOnOutsideClick: true
        }, options)).dxToast('instance');
    };

    /* chart function */
    UtilsDx.initChart = function ($chart, options) {
        // var testObj = $.extend({}, chartCommonOpt, options);
        // var testObjDeep = $.extend(true, {}, chartCommonOpt, options);
        // console.log(testObj);
        // console.log(testObjDeep);
        var chart = $chart.dxChart($.extend(true, {}, chartCommonOpt, options)).dxChart('instance');

        return {
            instance: chart,
            load: function (dataArry) {
                chart.option('dataSource', dataArry);
            }
        };
    };

    UtilsDx.clearChart = function (chart) {
        if (chart) chart.load([]);
    };

    UtilsDx.renderChart = function (chart) {
        if (chart) chart.instance.render();
    };

    /* piechart function */
    UtilsDx.initPieChart = function ($chart, options) {
        var chart = $chart.dxPieChart($.extend(true, {}, chartPieCommonOpt, options)).dxPieChart('instance');

        return {
            instance: chart,
            load: function (dataArry) {
                chart.option('dataSource', dataArry);
            }
        };
    };

    // for pie chart dynamic load event - use grid data
    // factbook pie chart!
    UtilsDx.getPieChartDSFromGridData = function (gridDataArry, mergeInfo) {
        /*
        var gridDataArry =
        [
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'WELCOME','gen': '미상','ageRange': '미상','ordMemCnt': 2000,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851},
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'FAMILY','gen': '미상','ageRange': '미상','ordMemCnt': 3000,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851},
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'VIP','gen': '미상','ageRange': '미상','ordMemCnt': 4000,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851},
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'VVIP','gen': '미상','ageRange': '미상','ordMemCnt': 5000,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851},
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'WELCOME','gen': '미상','ageRange': '미상','ordMemCnt': 2879,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851},
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'FAMILY','gen': '미상','ageRange': '미상','ordMemCnt': 2879,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851},
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'VIP','gen': '미상','ageRange': '미상','ordMemCnt': 2879,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851},
            {'cdDtlNm': '쇼핑','revDt': '201709','memLevel': 'VVIP','gen': '미상','ageRange': '미상','ordMemCnt': 2879,'ordCnt': 3310,'ordQty': 13922,'ordAmt': 221936851}
        ]
        */

        // target key array : ex> ['ordMemCnt', 'ordCnt', 'ordQty', 'ordAmt']
        var targetArry = mergeInfo.targetArry;
        // merge key : ex> 'memLevel'
        var mergeKey = mergeInfo.mergeKey;
        // merge value array : ex> ['WELCOME', 'FAMILY', 'VIP', 'VVIP']
        var mergeValArry = mergeInfo.mergeValArry;
        // console.log(mergeValArry.length);
        // merge data array - mergeKey와 같은  length 의 array 를 생성하며, 각 array 는 targetArry 의 value 값들로 이뤄진 map 으로 구성됨
        var mergeDataArry = Array.apply(null, Array(mergeValArry.length))
            .map(function (x, i) {
                var map = new Map();
                for (var j = 0; j < targetArry.length; j++) {
                    map.set(targetArry[j], 0);
                }
                return map;
            });

        // sum data - 일단 sum. 추후 데이터 merge 형식은 추가 예정
        gridDataArry.forEach(function (obj) {
            var idx = $.inArray(obj[mergeKey], mergeValArry);
            // console.log(idx);
            for (var i = 0; i < targetArry.length; i++) {
                mergeDataArry[idx].set(targetArry[i], mergeDataArry[idx].get(targetArry[i]) + obj[targetArry[i]]);
            }
        });
        // console.log(mergeDataArry);

        // set data format - pie chart datasource 형식에 맞도록 data format 재구성
        var resultArry = [];
        for (var j = 0; j < mergeValArry.length; j++) {
            var resultObj = {};
            resultObj.id = mergeValArry[j];
            for (var i = 0; i < targetArry.length; i++) {
                resultObj[targetArry[i]] = mergeDataArry[j].get(targetArry[i]);
            }
            resultArry.push(resultObj);
        }
        // console.log(resultArry);
        return resultArry;
    };

    UtilsDx.getCommonPalette = function (sepKey) {
        var palette;

        switch (sepKey) {
            case 'memLevel':            // 회원등급
                palette = 'Pastel';
                break;
            case 'gen':                 // 성별
                palette = 'Ocean';
                break;
            case 'ageRange':            // 연령별
                palette = 'Soft';
                break;
            case 'dailysales_02':       // dailysales shop 당기/yoy + uv/pv chart
                palette = ['#ffd698', '#cbe9a2', '#60a69f', '#7dd3cb'];
                break;
            case 'dailysales_03':       // dailysales book 당기/yoy + uv/pv chart
                palette = ['#ffd698', '#cbe9a2', '#78b6d9', '#b0e0fa'];
                break;
            case 'dailysales_04':       // dailysales entr 당기/yoy + uv/pv chart
                palette = ['#ffd698', '#cbe9a2', '#6682bb', '#a1bcf4'];
                break;
            case 'dailysales_05':       // dailysales tour 당기/yoy + uv/pv chart
                palette = ['#ffd698', '#cbe9a2', '#a37182', '#e2a9bd'];
                break;
            default:
                palette = 'Default';
                break;
        }
        return palette;
    };
    /*
    shop #60a69f
    book #78b6d9
    entr #6682bb
    tour #a37182
    UV #eeba69
    PV #90ba58
    */

    /* ui common options */
    /* dxDataGrid common options */
    var gridCommonOpt =
        {
            dataSource: {},
            columns: [],
            height: '750px',
            allowColumnReordering: true,
            allowColumnResizing: true,
            columnAutoWidth: true,
            columnChooser: {
                enabled: false
            },
            showColumnLines: true,
            showRowLines: true,
            rowAlternationEnabled: true,
            showBorders: true,
            paging: {enabled: false},
            scrolling: {
                mode: 'virtual', /* standard, virtual, infinite' */
                preloadEnabled: true, /* when using virtual. preloading  */
                scrollByThumb: true,
                showScrollbar: 'always', /* onScroll, onHover, always, never  */
                useNative: false
            },
            groupPanel: {visible: true},
            grouping: {
                expandMode: 'rowClick'
                // autoExpandAll: true

            },
            'export': {
                enabled: true,
                fileName: 'hong'
            },
            loadPanel: {
                enabled: true,
                showPane: false
            },
            onCellPrepared: function (e) {
                if (e.row === undefined) return;
                if (e.rowType === 'data') {
                    if (UtilsDx.isMinusNum(e.value)) {
                        e.cellElement.css('color', 'red');
                    }
                } else if (e.rowType === 'group') {
                    var summaryItem = e.cellElement.find('.dx-datagrid-summary-item');
                    if (summaryItem.length > 0) {
                        $.each(summaryItem, function (_, item) {
                            if (UtilsDx.isMinusNum($(item).text())) {
                                $(item).html('<div style="color: red;">' + $(item).text() + '</div>');
                            }
                        });
                    }
                }
            }
        };

    /* dxChart common options */
    var chartCommonOpt =
        {
            title: {text: '', subtitle: {text: ''}},
            palette: 'Soft Pastel',
            dataSource: [],
            series: [],
            commonSeriesSettings: {
                argumentField: 'year',
                type: 'bar',
                border: {width: 1}
            },
            size: {
                height: 700
                // width: 500
            },
            scrollingMode: 'all',
            // zoomingMode: 'all',
            scrollBar: {
                visible: false
            },
            valueAxis: [
                {
                    grid: {visible: true},
                    valueMarginsEnabled: true,
                    label: {format: {type: 'thousands'}},
                    axisDivisionFactor: 40
                }
            ],
            argumentAxis: {
                grid: {visible: true},
                discreteAxisDivisionMode: 'crossLabels' // or betweenLabels
            },
            tooltip: {
                enabled: true,
                shared: true,
                format: {
                    type: 'thousands',
                    precision: 0
                },
                customizeTooltip: function (arg) {
                    var items = arg.valueText.split('\n');
                    var color = arg.point.getColor();
                    $.each(items, function (index, item) {
                        if (item.indexOf(arg.seriesName) === 0) {
                            items[index] = $('<b>')
                                .text(item)
                                .css('color', color)
                                // .css('text-align', 'left')
                                .prop('outerHTML');
                        }
                    });
                    return {html: '<div style="text-align:left">' + items.join('<br>') + '</div>'};
                }
            },
            legend: {
                position: 'outside',
                verticalAlignment: 'top',
                horizontalAlignment: 'right',
                itemTextPosition: 'right',
                font: {size: 11},
                backgroundColor: 'transparent',
                margin: {
                    bottom: 5,
                    left: 5,
                    right: 5,
                    top: 5
                }
            },
            'export': {
                enabled: false
            },
            loadingIndicator: {
                show: true
            }
            /* ,onLegendClick: function(e) {
                var series = e.target;
                if(series.isVisible()) {
                    series.hide();
                } else {
                    series.show();
                }
            } */
        };

    /* dxPieChart common options */
    var chartPieCommonOpt =
        {
            onIncidentOccurred: null,
            innerRadius: 0.50,
            loadingIndicator: {
                text: ''
            },
            type: 'doughnut',
            palette: 'Soft Pastel',
            dataSource: [],
            series: [{
                argumentField: 'key',
                valueField: 'value',
                label: {
                    visible: true,
                    backgroundColor: 'transparent',
                    format: 'thousands',
                    position: 'inside',
                    radialOffset: 0,
                    customizeText: function (arg) {
                        return arg.argumentText + ' ( ' + arg.percentText + ')';
                    },
                    connector: {
                        visible: false
                    },
                    font: {color: '#000000'}
                }
            }],
            size: {
                height: undefined
            },
            title: '',
            tooltip: {
                enabled: true,
                format: {
                    type: 'thousands',
                    precision: 0
                },
                customizeTooltip: function (arg) {
                    var percentText = Globalize.formatNumber(arg.percent, {
                        style: 'percent',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });

                    return {
                        text: arg.valueText + ' - ' + percentText
                    };
                }
            },
            legend: {
                visible: true
            }
        };
    UtilsDx.fn.init.prototype = UtilsDx.fn;
})(jQuery, window);
