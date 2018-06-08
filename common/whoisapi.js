const axios = require('axios');
const nconf = require('nconf');

const kisaUrl = nconf.get('whoisapi:kosaUrl') || 'http://whois.kisa.or.kr/openapi/whois.jsp?key=2018012009311480903763&answer=json&query=AS';
const RipeStatUrl = nconf.get('whoisapi:ripeUrl') || 'http://stat.ripe.net/data/abuse-contact-finder/data.json?resource=';

async function getWhoisFromKisa (opt) {
    const response = await axios({
        method: 'GET',
        url: kisaUrl + opt.dstAsNum
    });
    // console.log('=================================getWhoisFromKisa:' + JSON.stringify(response.data));
    return response.data;
};

async function getWhoisFromRipeStat (opt) {
    const response = await axios({
        method: 'GET',
        url: RipeStatUrl + opt.dstAsNum
    });
    // console.log('=================================getWhoisFromRipeStat:' + JSON.stringify(response.data));
    return response.data;
};

module.exports = async function (opt) {
    // rCode: 1(succ), -1(fail), 0(not exist)
    const rObj = {dstAsNum: opt.dstAsNum, rCode: 1};

    try {
        const kisa = await getWhoisFromKisa(opt);
        const cCode = kisa.whois.countryCode;

        // use kisa(korea) or ripe(other country)
        if (cCode === 'KR') {
            if (kisa.whois.english) {
                if (kisa.whois.english.asName)          rObj.dstAsEngName = kisa.whois.english.asName;
                if (kisa.whois.english.orgInfo.name)    rObj.dstAsOrgName = kisa.whois.english.orgInfo.name;
                rObj.dstAsCntryCode = kisa.whois.countryCode;
            } else if (kisa.whois.korean) {
                if (kisa.whois.korean.asName)           rObj.dstAsEngName = kisa.whois.korean.asName || kisa.whois.english.asName;
                if (kisa.whois.korean.orgInfo.name)     rObj.dstAsOrgName = kisa.whois.korean.orgInfo.name || kisa.whois.english.orgInfo.name;
                rObj.dstAsCntryCode = kisa.whois.countryCode;
            } else {
                const ripe = await getWhoisFromRipeStat(opt);
                if (ripe.status === 'ok' && ripe.data.holder_info.name) {
                    rObj.dstAsEngName = ripe.data.holder_info.name;
                    rObj.dstAsOrgName = null;
                    rObj.dstAsCntryCode = null;
                } else {
                    rObj.dstAsEngName = null;
                    rObj.dstAsOrgName = null;
                    rObj.dstAsCntryCode = null;
                    rObj.rCode = 0;
                }
            }
        } else {
            const ripe = await getWhoisFromRipeStat(opt);
            if (ripe.status === 'ok' && ripe.data.holder_info.name) {
                rObj.dstAsEngName = ripe.data.holder_info.name;
                rObj.dstAsOrgName = null;
                rObj.dstAsCntryCode = kisa.whois.countryCode;
            } else {
                rObj.dstAsEngName = null;
                rObj.dstAsOrgName = null;
                rObj.dstAsCntryCode = null;
                rObj.rCode = 0;
            }
        }
    // 값이 없을 경우, 혹은 whoisapi 를 실패했을 경우, client 에 결과로 알려줘야 함. rCode: -1 로 변경
    } catch (error) {
        rObj.dstAsEngName = '';
        rObj.dstAsOrgName = '';
        rObj.dstAsCntryCode = '';
        rObj.rCode = -1;
        return rObj;
    }
    return rObj;
};
