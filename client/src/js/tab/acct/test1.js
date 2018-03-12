(function(Test1, $) {




    $(function() {

        var ctx = document.getElementById('test2').getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'minute usage on acct',
                    data: [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderWidth: 1,
                    fill: "origin"
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });

        $.ajax({
            url: "api/acct/test1/chart",
            type: "POST",
            data: {strDate : 1234}
        }).done(function (data) {

            data.forEach(function (item) {
                myChart.data.labels.push(item.regTime);
                myChart.data.datasets[0].data.push(item.byteSum);
            });

            myChart.update();
        });


        $('#test1').DataTable({
            pageLength: 25,
            //pagingType : "full_numbers",
            bPaginate: true,
            bLengthChange: false,
            bInfo: true,
            searching: true,
            ordering: true,
            responsive: true,
            //bAutoWidth: false,
            //scrollX: true,
            bProcessing: true,
            //bServerSide: true,
            sAjaxSource : "api/acct/test1/grid",
            sServerMethod: "POST",
            fnServerParams: function ( aoData ) {
                aoData.push( { "name": "strDate", "value": 1234 } );
            },
            /*ajax: {
                url: "api/acct/test1/grid",
                type: "POST",
                data: {strDate : 1234},
                //contentType: "application/json;charset=UTF-8"
            },*/
            columns: [
                {"data":"regTime"},
                {"data":"peerIpSrc"},
                {"data":"ifaceIn"},
                {"data":"ifaceOut"},
                {"data":"ipSrc"},
                {"data":"ipDst"},
                {"data":"ipProto"},
                {"data":"tos"},
                {"data":"portSrc"},
                {"data":"portDst"},
                {"data":"tcpFlag"},
                {"data":"packets"},
                {"data":"byteSum"}
            ],
            fnInitComplete: function() {
                $("#test1").css("width","100%");
            },
            dom: '<"html5buttons"B>lfrtip',
            buttons: [
                { extend: 'copy'},
                {extend: 'csv'},
                {extend: 'excel', title: 'ExampleFile'},
                {extend: 'pdf', title: 'ExampleFile'},

                {extend: 'print',
                    customize: function (win){
                        $(win.document.body).addClass('white-bg');
                        $(win.document.body).css('font-size', '10px');

                        $(win.document.body).find('table')
                            .addClass('compact')
                            .css('font-size', 'inherit');
                    }
                }
            ]

        });



    });

}(window.Test1 || {}, jquery));
