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
        where 
            net_dst != '0.0.0.0' and as_dst != 0 
	        and (timestamp_start between date_add(?, interval -1 hour) and ?)
        group by ip_dst
        order by regTime
        limit 0, 50`,
    AcctTest1Chart:
        `select regTime, sum(byteSum) as byteSum
        from (
            select 
                timestamp_start as orgTime
                ,date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
                ,sum(bytes) as byteSum
            from ??
            where 
                net_dst != '0.0.0.0' and as_dst != 0 
	            and (timestamp_start between date_add(?, interval -1 hour) and ?)
            group by ip_dst
            order by regTime
        
        ) as a
        group by unix_timestamp(a.orgTime) DIV ?	
        -- group by hour(a.orgTime), floor(minute(a.orgTime)/?)
        -- limit 0, 10`,
    AcctTest2Grid_reqOnce:
        `select
            date_format(a.timestamp_start, "%m-%d %H:%i:%s") as regTime
            ,a.iface_out as ifaceOut
            ,b.iface_out_as as ifaceOutAs
            ,concat(a.net_dst, '/', a.mask_dst) as dstNetMask
            ,unix_timestamp(a.stamp_updated)-unix_timestamp(a.stamp_inserted) as seconds
            ,sum(a.bytes) as byteSum
            ,a.as_dst as dstAs
        from ?? as a
        INNER JOIN pmacct.acct_ifacelist AS b
            ON a.iface_out = b.iface_out
        where 
            a.net_dst != '0.0.0.0' and a.as_dst != 0
            and (a.timestamp_start between date_add(?, interval -5 minute) and ?)
        group by a.iface_out, a.as_dst, dstNetMask, seconds
        order by sum(bytes) desc`,
    AcctTest2Chart:
        `select
            date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
            ,round(avg(bytes/61/125000000), 6) as bpsAvg
            ,as_dst as dstAs
        from ??
        where 
            net_dst != '0.0.0.0' and as_dst != 0
            and (timestamp_start between date_add(?, interval -5 minute) and ?)
        group by as_dst
        order by regTime`,
    AcctTest2Pie:
        `select
            b.iface_out_as as ifaceOutAs
            ,round(sum(a.bytes/61/125000000), 2) as bpsSum
        from ?? as a
        INNER JOIN pmacct.acct_ifacelist AS b
            ON a.iface_out = b.iface_out
        where 
            a.net_dst != '0.0.0.0' and a.as_dst != 0 
            and (a.timestamp_start between date_add(?, interval -5 minute) and ?)
        group by a.iface_out`,
    AcctIfoListGrid:
        `select 
            date_time as regTime
            ,iface_out as ifaceOut
            ,iface_out_as as ifaceOutAs
            ,display_yn as displayYn
        from pmacct.acct_ifacelist
        where date_time=(select max(date_time) from pmacct.acct_ifacelist)`,
    AcctIfoListGridUpdate:
        `update pmacct.acct_ifacelist
            set iface_out_as = ?
        where iface_out=?`
};
