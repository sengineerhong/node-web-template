module.exports = {

    AllLoginPath :
        `SELECT * FROM board`,
    AcctTest1Grid_reqOnce :
        `SELECT 
            DATE_FORMAT(timestamp_start, "%m-%d %H:%i:%s") as regTime
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
        FROM pmacct.acct_20180204
        WHERE peer_ip_src = '192.168.100.33'
        GROUP BY ip_dst
        ORDER by regTime`,
    AcctTest1Grid :
        `SELECT 
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
        FROM pmacct.acct_20180204
        WHERE peer_ip_src = '192.168.100.33'
        GROUP BY ip_dst
        LIMIT ?, ?`,
    AcctTest1GridTotal :
        `SELECT count(c.ipDst) as iTotalRecords
        FROM (
            SELECT 
                ip_dst as ipDst
            FROM pmacct.acct_20180204
            WHERE peer_ip_src = '192.168.100.33'
            GROUP BY ip_dst
        ) as c`,
    AcctTest1Chart :
        `SELECT regTime, byteSum
        FROM (
            SELECT 
                timestamp_start as orgTime
                ,DATE_FORMAT(timestamp_start, "%m-%d %H:%i:%s") as regTime
                ,sum(bytes) as byteSum
            FROM pmacct.acct_20180205
            WHERE peer_ip_src = '192.168.100.33'
            GROUP BY ip_dst
            ORDER by regTime
        
        ) as a	
        GROUP BY hour(a.orgTime), floor(minute(a.orgTime)/10)
        -- LIMIT 0, 10`

}
