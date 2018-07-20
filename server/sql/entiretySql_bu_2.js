/* eslint-disable no-tabs */
module.exports = {

    selectAllLoginPath:
        `select * from board`,
    selectCommonTabledExist:
        `select 
            count(*) tbCnt 
        from information_schema.tables
        where table_schema = ? 
            and table_name = ?
        limit 1;`,
    selectAcctTest1Grid_reqOnce:
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
            -- ,sum(bytes) as byteSum
            ,round(bytes/60/125000000, 6) as bpsSum
        from ??
        where 
            net_dst != '0.0.0.0' and as_dst != 0 
	        and (timestamp_start between date_add(DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'), interval -30 minute) and DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'))
        group by ip_dst
        order by regTime`,
    selectAcctTest1Chart:
        `select regTime, sum(bpsSum) as bpsSum
        from (
            select 
                timestamp_start as orgTime
                ,date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
                -- ,sum(bytes) as byteSum
                ,round(bytes/60/125000000, 6) as bpsSum
            from ??
            where 
                net_dst != '0.0.0.0' and as_dst != 0 
	            and (timestamp_start between date_add(DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'), interval -60 minute) and DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'))
            group by ip_dst
            order by regTime
        ) as a
        group by unix_timestamp(a.orgTime) DIV ?	
        -- group by hour(a.orgTime), floor(minute(a.orgTime)/?)
        -- limit 0, 10`,
    selectAcctTest2Grid_reqOnce:
        `select
            date_format(a.timestamp_start, "%m-%d %H:%i:%s") as regTime
            ,a.iface_out as ifaceOut
            ,b.iface_out_as as ifaceOutAs
            ,a.peer_ip_src as peerIpSrc
            ,b.peer_ip_src_as as peerIpSrcAs
            ,concat(a.iface_out, '_', REPLACE(a.peer_ip_src,'.','')) as ifaceOutPeerIp
            ,concat(a.net_dst, '/', a.mask_dst) as dstNetMask
            -- ,unix_timestamp(a.stamp_updated)-unix_timestamp(a.stamp_inserted) as seconds
            ,count(*) cnt
            ,sum(a.bytes) as byteSum
            ,a.as_dst as dstAsNum
            -- ,concat(d.as_dst, ':', d.as_eng_name, ':', d.as_org_name, ':', d.country_code) as dstAs 
            ,concat(d.as_dst, ':', ifnull(d.as_eng_name, ''), ':', ifnull(d.as_org_name,''), ':', ifnull(d.country_code,'')) as dstAs 
        from ?? as a
        INNER JOIN pmacct.acct_ifacelist AS b
            ON (a.iface_out = b.iface_out and a.peer_ip_src = b.peer_ip_src)
        INNER JOIN pmacct.acct_dstas_info AS d
            ON a.as_dst = d.as_dst
        where 
            a.net_dst != '0.0.0.0' and a.as_dst != 0
            and (a.timestamp_start between date_add(DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'), interval ? minute) and DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'))
            and b.date_time = ( select ifnull(max(date_time), current_date()) from pmacct.acct_ifacelist  where date_time >= date_add(current_date(), interval -30 day) )
            and b.display_yn = 'Y'
        group by a.iface_out, a.peer_ip_src, a.as_dst, dstNetMask
        order by (sum(a.bytes)/count(*)) desc`,
    selectAcctTest2Chart:
        `select 
            c.regTime as regTime
            ,round(avg(c.bps), 6) as bpsAvg
            ,c.dstAs as dstAs
        from (
            select
                date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
                ,round(bytes/60/125000000, 6) as bps
                ,as_dst as dstAs
            from ?? as a
            INNER JOIN pmacct.acct_ifacelist AS b
                ON (a.iface_out = b.iface_out and a.peer_ip_src = b.peer_ip_src)
            where 
                a.net_dst != '0.0.0.0' and a.as_dst != 0
                and (a.timestamp_start between date_add(DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'), interval ? minute) and DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'))
                and b.date_time = ( select ifnull(max(date_time), current_date()) from pmacct.acct_ifacelist  where date_time >= date_add(current_date(), interval -30 day) )
                and b.display_yn = 'Y'
            order by regTime and dstAs    
        ) c
        group by c.dstAs`,
    // selectAcctTest2Chart:
    //     `select
    //         date_format(timestamp_start, "%m-%d %H:%i:%s") as regTime
    //         ,round(avg(bytes)/125000000, 6) as bpsAvg
    //         ,as_dst as dstAs
    //     from ??
    //     where
    //         net_dst != '0.0.0.0' and as_dst != 0
    //         and (timestamp_start between date_add(DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'), interval ? minute) and DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'))
    //     group by as_dst
    //     order by regTime`,
    selectAcctTest2Pie:
        `select 
            c.ifaceOut as ifaceOut
            ,c.ifaceOutAs as ifaceOutAs
            ,round(sum(c.bpsAvg), 2) as bpsSum
        from(
            select
                a.iface_out as ifaceOut
                ,b.iface_out_as as ifaceOutAs
                ,round(sum(a.bytes)/60/125000000, 2) as bpsAvg
                ,concat(a.net_dst, '/', a.mask_dst) as dstNetMask
            from ?? as a
            INNER JOIN pmacct.acct_ifacelist AS b
                ON (a.iface_out = b.iface_out and a.peer_ip_src = b.peer_ip_src)
            where 
                a.net_dst != '0.0.0.0' and a.as_dst != 0
                and (timestamp_start between date_add(DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'), interval ? minute) and DATE_FORMAT(?, '%Y-%m-%d %H:%i:00'))
                and b.date_time = ( select ifnull(max(date_time), current_date()) from pmacct.acct_ifacelist  where date_time >= date_add(current_date(), interval -30 day) )
                and b.display_yn = 'Y'
            group by a.iface_out, a.peer_ip_src, a.as_dst, dstNetMask
        ) c
        group by c.ifaceOutAs
        order by ifaceOut`,

    // selectAcctTest2Pie:
    //     `select
    //         c.ifaceOutAs as ifaceOutAs
    //         ,round(sum(c.bpsAvg), 2) as bpsSum
    //     from(
    //         select
    //             b.iface_out_as as ifaceOutAs
    //             ,round(avg(a.bytes)/125000000, 2) as bpsAvg
    //             ,concat(a.net_dst, '/', a.mask_dst) as dstNetMask
    //         from ?? as a
    //         INNER JOIN pmacct.acct_ifacelist AS b
    //             ON a.iface_out = b.iface_out
    //         where
    //             a.net_dst != '0.0.0.0' and a.as_dst != 0
    //             and (timestamp_start between date_add(?, interval ? second) and ?)
    //         group by a.iface_out, a.as_dst, dstNetMask
    //     ) c
    //     group by c.ifaceOutAs`,
    // selectAcctTest2Pie:
    //     `select
    //         b.iface_out_as as ifaceOutAs
    //         -- ,round(sum(a.bytes/61/125000000), 2) as bpsSum
    //         ,round(sum(a.bytes/1/125000000), 2) as bpsSum
    //     from ?? as a
    //     INNER JOIN pmacct.acct_ifacelist AS b
    //         ON a.iface_out = b.iface_out
    //     where
    //         a.net_dst != '0.0.0.0' and a.as_dst != 0
    //         and (a.timestamp_start between date_add(?, interval -5 minute) and ?)
    //     group by a.iface_out`,
    selectAcctTest2DstAs:
        `select 
            as_dst as dstAsNum
            ,as_eng_name as dstAsEngName
            ,as_org_name as dstAsOrgName
            ,country_code as dstAsCntryCode
        from acct_dstas_info where as_dst=?`,
    updateAcctTest2DstAs:
        `insert into acct_dstas_info (as_dst, as_eng_name, as_org_name, country_code)
            values (?,?,?,?) 
        on duplicate key update 
            as_dst = values(as_dst)`,
    selectAcctTest2Profile:
        `select 
            profile_id as profileId
            ,profile_name as profileName
            ,profile_cmmnt as profileCmmnt
            ,profile_field_bpssum as profileFdBpssum
            ,profile_field_peeripsrc as profileFdPeeripsrc
            ,profile_field_dstnetmask as profileFdDstnetmask
            ,profile_field_dstas as profileFdDstas
            ,date_format(reg_date, "%Y-%m-%d %H:%i:%s") as regDate
        from pmacct.acct_profile
        order by reg_date desc`,
    selectAcctPIfoList:
        `select 
            b.iface_out as ifaceOut
            ,b.peer_ip_src as peerIpSrc
            ,concat(b.iface_out, '_', REPLACE(b.peer_ip_src,'.','')) as ifaceOutPeerIp
            ,c.iface_out_as as ifaceOutAs
            ,c.peer_ip_src_as as peerIpSrcAs
            ,c.date_time as regDate
            ,b.profile_field_ifaceout as fieldIfaceOut
            ,a.profile_id as profileId
            ,a.profile_name as profileName
            ,a.profile_cmmnt as profileCmmnt
            ,a.profile_field_bpssum as profileFieldBpssum
            ,a.profile_field_peeripsrc as profileFieldPeeripsrc
            ,a.profile_field_dstnetmask as profileFieldDstnetmask
            ,a.profile_field_dstas as profileFieldDstas
            ,a.reg_date as profileRegDate
        from pmacct.acct_profile as a
        inner join pmacct.acct_profile_detail AS b ON a.profile_id = b.profile_id
        inner join pmacct.acct_ifacelist AS c ON (b.iface_out = c.iface_out and b.peer_ip_src = c.peer_ip_src)
        where c.date_time = ( select ifnull(max(date_time), current_date()) from pmacct.acct_ifacelist  where date_time >= date_add(current_date(), interval -10 day) )
        and a.profile_id = ?`,
    selectAcctIfoListGrid:
        `select 
            date_time as regTime
            ,iface_out as ifaceOut
            ,iface_out_as as ifaceOutAs
            ,display_yn as displayYn
            ,peer_ip_src as peerIpSrc
            ,peer_ip_src_as as peerIpSrcAs
            ,concat(iface_out, '_', REPLACE(peer_ip_src,'.','')) as ifaceOutPeerIp
        from pmacct.acct_ifacelist
        where date_time=(select max(date_time) from pmacct.acct_ifacelist)
        order by ifaceOut`,
    selectAcctIfoListGridDispFlag:
        `select 
            date_time as regTime
            ,iface_out as ifaceOut
            ,iface_out_as as ifaceOutAs
            ,display_yn as displayYn
            ,peer_ip_src as peerIpSrc
            ,peer_ip_src_as as peerIpSrcAs
            ,concat(iface_out, '_', REPLACE(peer_ip_src,'.','')) as ifaceOutPeerIp
        from pmacct.acct_ifacelist
        where date_time=(select max(date_time) from pmacct.acct_ifacelist) and display_yn =?
        order by ifaceOut`,
    selectAcctIfoListGridUpdate:
        `update pmacct.acct_ifacelist
            set iface_out_as = ?, peer_ip_src_as =?
        where iface_out=? and peer_ip_src=?`,
    selectAcctProfileGrid:
        `select 
            profile_id as profileId
            ,profile_name as profileName
            ,profile_cmmnt as profileCmmnt
            ,profile_field_bpssum as profileFdBpssum
            ,profile_field_peeripsrc as profileFdPeeripsrc
            ,profile_field_dstnetmask as profileFdDstnetmask
            ,profile_field_dstas as profileFdDstas
            ,date_format(reg_date, "%Y-%m-%d %H:%i:%s") as regDate
        from pmacct.acct_profile
        order by reg_date desc`,
    selectAcctProfileDetail:
        `select 
            a.profile_id as profileId
            ,a.profile_name as profileName
            ,a.profile_cmmnt as profileCmmnt
            ,a.profile_field_bpssum as profileFieldBpssum
            ,a.profile_field_peeripsrc as profileFieldPeeripsrc
            ,a.profile_field_dstnetmask as profileFieldDstnetmask
            ,a.profile_field_dstas as profileFieldDstas
            ,a.reg_date as profileRegDate
            ,b.profile_field_ifaceout as fieldIfaceOut
            ,b.iface_out as ifaceOut
            ,b.peer_ip_src as peerIpSrc
            ,c.iface_out_as as ifaceOutAs
            ,c.peer_ip_src_as as peerIpSrcAs
            ,c.date_time as regDate
        from pmacct.acct_profile as a
        inner join pmacct.acct_profile_detail AS b ON a.profile_id = b.profile_id
        left join pmacct.acct_ifacelist AS c ON (b.iface_out = c.iface_out and b.peer_ip_src = c.peer_ip_src)
        where c.date_time = ( select ifnull(max(date_time), current_date()) from pmacct.acct_ifacelist  where date_time >= date_add(current_date(), interval -10 day) )
        and a.profile_id = ?`,
    selectAcctProfileIfaceout:
        `select @RNUM := @RNUM + 1 AS rNum, t.*
        from
        (
            select 
                date_time as regDate
                ,iface_out as ifaceOut
                ,iface_out_as as ifaceOutAs
                ,peer_ip_src as peerIpSrc
                ,peer_ip_src_as as peerIpSrcAs
            from pmacct.acct_ifacelist
            where date_time = ( select ifnull(max(date_time), current_date()) from pmacct.acct_ifacelist  where date_time >= date_add(current_date(), interval -10 day) )
        ) t,
        ( select @RNUM := 0 ) r`,
    selectProfileCnt:
        `select count(profile_id) as profileCnt
        from pmacct.acct_profile`,
    selectProfileTotalCnt:
        `select count(*) as profileTotalCnt
        from pmacct.acct_profile`,
    selectProfileName:
        `select count(replace(profile_name, ' ', '')) as profileCnt
        from pmacct.acct_profile
        where profile_name = replace(?, ' ', '')`,
    selectProfileNameWhenUpd:
        `select 
            profile_name as profileName
            ,profile_id as profileId
        from pmacct.acct_profile as a
        where replace(profile_name, ' ', '') = replace(?, ' ', '')`
};
