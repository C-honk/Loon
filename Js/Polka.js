let url=$request.url;
let body=$response.body;
let hasError=false;

function safeSet(obj,key,value){
    try{
        obj[key]=value;
    }catch(e){
        hasError=true;
        console.log(`处理失败>>>${key}`);
    }
}

try{
    let obj=JSON.parse(body);

    if(/api\/(ucenter\/users\/(pub|login)|advert\/free\/config)/.test(url)){
        if(obj&&obj.data){
            if(obj.data.allDayConfig&&obj.data.allDayConfig.fmRewards){
                try{ delete obj.data.allDayConfig.fmRewards }catch(e){ hasError=true; }
            }

            const expireTime=new Date('2099-09-09T09:09:00+08:00').getTime();

            if(obj.data.payInfo){
                let p=obj.data.payInfo;
                safeSet(p,"redFlower",999);
                safeSet(p,"isSignedBoolean",true);
                safeSet(p,"isCtVipBoolean",true);
                safeSet(p,"isCtPayVipBoolean",false);
                safeSet(p,"ctExpireDate",expireTime);
                safeSet(p,"isVip",1);
                safeSet(p,"signedCount",999);
                safeSet(p,"isVipBoolean",true);
                safeSet(p,"isBigVipBoolean",true);
                safeSet(p,"bigExpireDate",expireTime);
                safeSet(p,"ctPayExpireDate",0);
                safeSet(p,"signType",1);
                safeSet(p,"bigPayExpireDate",0);
                safeSet(p,"actVipType",0);
                safeSet(p,"vipType",1);
                safeSet(p,"isBigPayVipBoolean",false);
                safeSet(p,"payExpireDate",expireTime);
                safeSet(p,"actExpireDate",expireTime);
                safeSet(p,"isActVipBoolean",true);
                safeSet(p,"isPayVipBoolean",true);
                safeSet(p,"lastOrderPrice",0);
                safeSet(p,"lastOrderSigned",0);
                safeSet(p,"payVipType",1);
                safeSet(p,"isSigned",1);
                safeSet(p,"expireDate",expireTime);
            }else{ hasError=true; }

            if(obj.data.userInfo){
                let u=obj.data.userInfo;
                safeSet(u,"status",1);
                safeSet(u,"isVip",1);
                safeSet(u,"vipType",1);
                safeSet(u,"gender",1);
                safeSet(u,"payVipType",1);
                safeSet(u,"authType",1);
            }else{ hasError=true; }
        }
    }
    else if(/api\/service\/global\/config\/scene/.test(url)){
        if(obj.data){
            safeSet(obj.data,'showShopEntry',false);
            safeSet(obj.data,'idolTabShow',false);
            safeSet(obj.data,'playingPageCollectPagList',[]);
            safeSet(obj.data,'adsNotFinishVipPop4DayInterval',9999);
            safeSet(obj.data,'AllDialogIntervals',9999);
            if(obj.data.warmStartDialog) safeSet(obj.data.warmStartDialog,'count',0);
            safeSet(obj.data,'offlineFavTipsGuide',0);
            if(obj.data.downLoadZoneConfig) safeSet(obj.data.downLoadZoneConfig,'freeTimeRemindTip',0);
            if(obj.data.iapNewConfig) safeSet(obj.data.iapNewConfig,'enable',0);
            if(obj.data.iapConfig) safeSet(obj.data.iapConfig,'enable',0);
            safeSet(obj.data,'iosAudioSessionManager_ErrAlert',false);
        }
    }
    else if(/api\/service\/home\/index/.test(url)){
        if(obj.data && Array.isArray(obj.data.moduleList)){
            try{ obj.data.moduleList=obj.data.moduleList.filter(m=>![6,2,1,8,9].includes(m.type)) }catch(e){ hasError=true; }
        }
    }
    else if(/api\/play\/sound\/effect\/list/.test(url)){
        if(obj.data && Array.isArray(obj.data.list)){
            try{
                obj.data.list.forEach(item=>{
                    safeSet(item,'vipType','free');
                    safeSet(item,'audition',0);
                });
            }catch(e){ hasError=true; }
        }
    }

    body=JSON.stringify(obj);
}catch(e){
    hasError=true;
}

$done({body});
