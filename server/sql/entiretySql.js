/* eslint-disable no-tabs */
module.exports = {

    AllLoginPath:
        `select * from board`,
    CommonTabledExist:
        `select 
            count(*) tbCnt 
        from information_schema.tables
        where table_schema = ? 
            and table_name = ?
        limit 1;`,
    AcctTest1Grid_reqOnce:
        `select 
            date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
            ,peer_ip_src as peerIpSrc
            ,iface_in as ifaceIn
            ,iface_out as ifaceOut
            ,ip_src as ipSrc
            ,ip_dst as ipDst
            ,ip_proto as ipProto
            ,tos as tos
            ,src_port as portSrc
            ,dst_port as portDst
            ,tcp_flags as tcpFlag
            ,packets as packets
            ,sum(bytes) as byteSum
        from ??
        where peer_ip_src = '192.168.100.33' and (timestamp_start between ? and date_add(?, interval 1 hour))
        group by ip_dst
        order by regTime
        limit 0, 50`,
    AcctTest1Grid:
        `select 
            timestamp_start as regTime
            ,peer_ip_src as peerIpSrc
            ,iface_in as ifaceIn
            ,iface_out as ifaceOut
            ,ip_src as ipSrc
            ,ip_dst as ipDst
            ,ip_proto as ipProto
            ,tos as tos
            ,src_port as portSrc
            ,dst_port as portDst
            ,tcp_flags as tcpFlag
            ,packets as packets
            ,sum(bytes) as byteSum
        from ??
        where peer_ip_src = '192.168.100.33'
        group by ip_dst
        limit ?, ?`,
    AcctTest1GridTotal:
        `select count(c.ipDst) as iTotalRecords
        from (
            select 
                ip_dst as ipDst
            from ??
            where peer_ip_src = '192.168.100.33'
            group by ip_dst
        ) as c`,
    AcctTest1Chart:
        `select regTime, sum(byteSum) as byteSum
        from (
            select 
                timestamp_start as orgTime
                ,date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
                ,sum(bytes) as byteSum
            from ??
            where peer_ip_src = '192.168.100.33' and (timestamp_start between ? and date_add(?, interval 1 hour))
            group by ip_dst
            order by regTime
        
        ) as a
        group by unix_timestamp(a.orgTime) DIV ?	
        -- group by hour(a.orgTime), floor(minute(a.orgTime)/?)
        -- limit 0, 10`,
    AcctTest2Grid_reqOnce:
        `select
            date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
            -- ,iface_out as ifaceOut
            ,sum(case when iface_out = 33882175 then bytes end) as '33882175'
            ,sum(case when iface_out = 37290047 then bytes end) as '37290047'
            ,sum(case when iface_out = 100991039 then bytes end) as '100991039'
            ,sum(case when iface_out = 103874623 then bytes end) as '103874623'
            ,sum(case when iface_out = 201654335 then bytes end) as '201654335'
            ,sum(case when iface_out = 205586495 then bytes end) as '205586495'
            -- ,net_dst as dstNet
            ,concat(net_dst, '/', mask_dst) as dstNetMask
            ,sum(bytes) as byteSum
            ,as_dst as dstAs
        from ??
        where peer_ip_src = '192.168.100.33' and (timestamp_start between ? and date_add(?, interval 5 minute))
        group by iface_out, as_dst, dstNetMask
        order by regTime`,
    AcctTest2Chart:
        `select
            date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
            ,sum(bytes) as byteSum
            ,as_dst as dstAs
        from ??
        where peer_ip_src = '192.168.100.33' and (timestamp_start between ? and date_add(?, interval 5 minute))
        group by as_dst
        order by regTime`,
    AcctTest2Pie:
        `select
            iface_out as ifaceOut
            ,sum(bytes) as byteSum
        from ??
        where peer_ip_src = '192.168.100.33' and (timestamp_start between ? and date_add(?, interval 5 minute))
        group by iface_out`,
    AcctTest1Grid_reqOnce_alasql:
        `select 
            FIRST(timestamp_start) as regTime
            ,FIRST(peer_ip_src) as peerIpSrc
            ,FIRST(iface_in) as ifaceIn
            ,FIRST(iface_out) as ifaceOut
            ,FIRST(ip_src) as ipSrc
            ,ip_dst as ipDst
            ,FIRST(ip_proto) as ipProto
            ,FIRST(tos) as tos
            ,FIRST(src_port) as portSrc
            ,FIRST(dst_port) as portDst
            ,FIRST(tcp_flags) as tcpFlag
            ,FIRST(packets) as packets
            ,sum(bytes) as byteSum
        from ?
        group by ip_dst
        order by regTime`
};
