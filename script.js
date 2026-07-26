let state = {coins:0,totalClicks:0,giftIdx:0,giftClicks:0,clickPower:1,autoClick:0,permaLuck:0,unlocked:[0],bought:[],potions:{luck:0,power:0,auto:0},gems:10,name:"Игрок",questsCompleted:[],questsClaimed:[],playTime:0,questsGeneratedAt:0,language:"ru"};

let ysdk = null;
let yandexPlayer = null;
let yandexLeaderboard = null;
let sdkReady = false;

async function initSDK() {
  try {
    ysdk = await YaGames.init();
    yandexPlayer = ysdk.getPlayer();
    yandexLeaderboard = ysdk.getLeaderboards();
    
    // ===== ВАЖНО: Сигнал "игра загружена" =====
    ysdk.features.LoadingAPI.ready();
    console.log('✅ SDK инициализирован, LoadingAPI.ready() отправлен');
    
    const data = await yandexPlayer.getData();
    if (data && data.nftClicker) { 
      state = Object.assign({}, state, JSON.parse(data.nftClicker)); 
    }
    
    // ===== ЗАГРУЗКА ЯЗЫКА ИЗ SDK (ДЛЯ МОДЕРАЦИИ) =====
    try {
      const lang = await yandexPlayer.getLang();
      if (lang && (lang === 'ru' || lang === 'by')) {
        state.language = lang;
        console.log('🌐 Язык загружен из SDK:', lang);
      }
    } catch(e) {
      console.log('Не удалось загрузить язык из SDK, используем сохранённый');
    }
    // ===== КОНЕЦ ЗАГРУЗКИ ЯЗЫКА =====
    
    const name = await yandexPlayer.getPublicName();
    if (name) state.name = name;
    if (!state.language) state.language = 'ru';
    sdkReady = true;
    applyLanguage();
    update();
  } catch(e) {
    console.warn('⚠️ SDK не инициализирован (локальный режим):', e);
    load(); 
    update(); 
  }
}

function save() {
  try { localStorage.setItem("nftClicker_v10", JSON.stringify(state)); } catch(e) {}
  if (sdkReady && yandexPlayer) { 
    yandexPlayer.setData({nftClicker: JSON.stringify(state)}).catch(function(){}); 
  }
}

function submitScore() {
  if (sdkReady && yandexLeaderboard) { 
    yandexLeaderboard.setLeaderboardScore('nft_gifts_score', state.coins).catch(function(){}); 
  }
}

function load() {
  try { const s=localStorage.getItem("nftClicker_v10"); if(s)state=Object.assign({},state,JSON.parse(s)); } catch(e) {}
  if (!state.language) state.language = 'ru';
}

function fmt(n){
  if(n>=1e15)return(n/1e15).toFixed(1)+"Q";if(n>=1e12)return(n/1e12).toFixed(1)+"T";
  if(n>=1e9)return(n/1e9).toFixed(1)+"B";if(n>=1e6)return(n/1e6).toFixed(1)+"M";
  if(n>=1e3)return(n/1e3).toFixed(1)+"K";return n.toString()
}

function toast(msg){
  const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");
  setTimeout(function(){t.classList.remove("show")},2600)
}

function update(){
  const g=GIFTS[state.giftIdx];
  const pct=Math.min(100,(state.giftClicks/g.clicks)*100);
  document.getElementById("coinDisplay").textContent=fmt(state.coins);
  document.getElementById("giftImg").src=g.src;
  document.getElementById("giftImg").alt=g.name;
  document.getElementById("giftGlow").style.background=g.color;
  document.getElementById("giftName").textContent=g.name+" "+t("gift_name");
  document.getElementById("giftLevel").textContent=t("level")+" "+(state.giftIdx+1)+" / "+GIFTS.length;
  document.getElementById("progressFill").style.width=pct+"%";
  document.getElementById("currentClicks").textContent=fmt(state.giftClicks);
  document.getElementById("targetClicks").textContent=fmt(g.clicks)+" "+t("clicks_word");

  var power=state.clickPower;if(state.potions.power>Date.now())power*=2;
  var tp=document.getElementById("tagPower");tp.textContent=t("power_tag")+": x"+power;tp.classList.toggle("active",power>1||state.potions.power>Date.now());

  var auto=state.autoClick;if(state.potions.auto>Date.now())auto*=2;
  var ta=document.getElementById("tagAuto");ta.textContent=auto>0?t("auto_tag")+": +"+auto+"/"+t("sec"):t("auto_tag")+": "+t("off");ta.classList.toggle("active",auto>0||state.potions.auto>Date.now());

  var luck=state.permaLuck;if(state.potions.luck>Date.now())luck=luck*2;
  var tl=document.getElementById("tagLuck");tl.textContent=t("luck_tag")+": "+Math.round(Math.min(luck,1)*100)+"%";tl.classList.toggle("active",luck>0||state.potions.luck>Date.now());

  document.getElementById("statClicks").textContent=fmt(state.totalClicks);
  document.getElementById("statCoins").textContent=fmt(state.coins);
  document.getElementById("statGifts").textContent=state.unlocked.length;
  document.getElementById("statLevel").textContent=state.giftIdx+1;
  document.getElementById("profileRank").textContent=getRankTitle(state.giftIdx);

  var now=Date.now();
  ["luck","power","auto"].forEach(function(type){
    var el=document.getElementById("pot"+type.charAt(0).toUpperCase()+type.slice(1));
    if(!el)return;
    var active=state.potions[type]>now;
    var cost=getPotionCost();
    el.classList.toggle("active-potion",active);
    el.classList.toggle("disabled",state.gems<cost&&!active);
    var costEl=el.querySelector(".potion-cost");
    if(costEl)costEl.textContent=cost+" 💎";
    var rem=Math.max(0,Math.ceil((state.potions[type]-now)/1000));
    var timer=el.querySelector(".potion-timer");
    if(active){if(!timer){timer=document.createElement("div");timer.className="potion-timer";el.appendChild(timer)}timer.textContent=rem+t("sec_short")}
    else if(timer){timer.remove()}
  });
  
  var gemDisplay=document.getElementById("gemDisplay");
  if(!gemDisplay){
    var cd=document.querySelector(".coin-display");
    if(cd){
      gemDisplay=document.createElement("div");
      gemDisplay.className="coin-display";gemDisplay.id="gemDisplay";gemDisplay.style.marginLeft="8px";
      gemDisplay.innerHTML='<span style="color:#ec4899;font-weight:800">💎</span><span id="gemCount">'+state.gems+'</span>';
      cd.parentNode.appendChild(gemDisplay);
    }
  }else{var gc=document.getElementById("gemCount");if(gc)gc.textContent=state.gems;}

  updateQuestProgress();
  renderUpgrades();renderLeaders();renderCollection();renderQuests();
}

var giftBox=document.getElementById("giftBox");
giftBox.addEventListener("click",function(e){
  e.preventDefault();
  var rect=giftBox.getBoundingClientRect();
  var x=e.clientX||(e.touches&&e.touches[0]?e.touches[0].clientX:rect.left+rect.width/2);
  var y=e.clientY||(e.touches&&e.touches[0]?e.touches[0].clientY:rect.top+rect.height/2);
  doClick(x,y);
});
giftBox.addEventListener("touchstart",function(e){e.preventDefault()},{passive:false});

// ===== ОСНОВНАЯ ФУНКЦИЯ КЛИКА =====
function doClick(x, y){
  // ===== ВАЖНО: Сигнал "игрок начал играть" =====
  if (ysdk) {
    ysdk.features.GameplayAPI.start();
  }
  
  var g=GIFTS[state.giftIdx];
  var earned=state.clickPower;
  if(state.potions.power>Date.now())earned*=2;
  var luck=state.permaLuck;if(state.potions.luck>Date.now())luck=luck*2;
  if(Math.random()<luck){earned*=2}
  state.coins+=earned;state.totalClicks+=1;state.giftClicks+=1;
  var box=document.getElementById("giftBox");box.classList.remove("pop");void box.offsetWidth;box.classList.add("pop");
  var wrap=document.getElementById("gameWrap");var wrapRect=wrap.getBoundingClientRect();
  var fx=document.createElement("div");fx.className="float-text";fx.textContent="+"+fmt(earned);
  fx.style.left=(x-wrapRect.left-20)+"px";fx.style.top=(y-wrapRect.top-30)+"px";
  wrap.appendChild(fx);setTimeout(function(){fx.remove()},900);
  spawnParticles(x-wrapRect.left,y-wrapRect.top,g.color);playClickSound();
  if(state.giftClicks>=g.clicks){levelUp()}update();save();
}

function spawnParticles(x,y,color){
  var wrap=document.getElementById("gameWrap");var cont=document.createElement("div");cont.className="particles";
  cont.style.left=x+"px";cont.style.top=y+"px";
  for(var i=0;i<10;i++){
    var p=document.createElement("div");p.className="particle";p.style.background=color;
    var angle=(Math.PI*2*i)/10;var dist=50+Math.random()*40;
    p.style.setProperty("--tx",Math.cos(angle)*dist+"px");p.style.setProperty("--ty",Math.sin(angle)*dist+"px");
    cont.appendChild(p);
  }
  wrap.appendChild(cont);setTimeout(function(){cont.remove()},800);
}

function levelUp(){
  var g=GIFTS[state.giftIdx];state.coins+=g.reward;state.giftClicks=0;submitScore();
  if(state.giftIdx<GIFTS.length-1){
    state.giftIdx+=1;if(state.unlocked.indexOf(state.giftIdx)===-1)state.unlocked.push(state.giftIdx);
    var ng=GIFTS[state.giftIdx];
    showLevelUp(ng.src,ng.name+" "+t("gift_new"),t("gift_opened")+" #"+(state.giftIdx+1),"+"+fmt(g.reward)+" "+t("coins_word"));
    playLevelSound();
  }else{
    showLevelUp(GIFTS[GIFTS.length-1].src,t("gift_max"),t("gift_all"),"+"+fmt(g.reward)+" "+t("coins_word"));
    playLevelSound();
  }
}

function showLevelUp(img,title,sub,reward){
  document.getElementById("levelUpImg").src=img;document.getElementById("levelUpTitle").textContent=title;
  document.getElementById("levelUpSub").textContent=sub;document.getElementById("levelUpReward").textContent=reward;
  document.getElementById("levelUpOverlay").classList.add("show");
}

function closeLevelUp(){
  document.getElementById("levelUpOverlay").classList.remove("show");
  
  // ===== ВАЖНО: Игрок вернулся к игре =====
  if (ysdk) {
    ysdk.features.GameplayAPI.start();
  }
  
  update();save();
}

var audioCtx=null;
function getAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();return audioCtx}
function playClickSound(){
  try{var ctx=getAudio();var osc=ctx.createOscillator();var gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.type="sine";osc.frequency.setValueAtTime(800,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.1);gain.gain.setValueAtTime(0.1,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.1);osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.1);}catch(e){}
}
function playLevelSound(){
  try{var ctx=getAudio();[523,659,784,1047].forEach(function(freq,i){var osc=ctx.createOscillator();var gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.type="sine";osc.frequency.setValueAtTime(freq,ctx.currentTime+i*0.12);gain.gain.setValueAtTime(0.12,ctx.currentTime+i*0.12);gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.12+0.3);osc.start(ctx.currentTime+i*0.12);osc.stop(ctx.currentTime+i*0.12+0.3);});}catch(e){}
}

function usePotion(type){
  var cost=getPotionCost();
  if(state.gems<cost){toast(t("toast_potion_need")+" "+cost+" 💎");return}
  if(state.potions[type]>Date.now()){toast(t("toast_potion_active"));return}
  state.gems-=cost;state.potions[type]=Date.now()+POTION_DURATIONS[type];
  toast(t("toast_potion_ok"));update();save();
}

function renderUpgrades(){
  var list=document.getElementById("upgradesList");if(!list)return;list.innerHTML="";
  var groups={};
  UPGRADES.forEach(function(u){if(!groups[u.group])groups[u.group]={name:u.groupName,items:[],currentLevel:0,maxLevel:u.maxLevel};groups[u.group].items.push(u);});
  for(var key in groups){var g=groups[key];for(var i=g.items.length-1;i>=0;i--){if(state.bought.indexOf(g.items[i].id)!==-1){g.currentLevel=i+1;break;}}}
  for(var key in groups){
    var g=groups[key];var nextLevel=g.currentLevel+1;var nextUpgrade=null;
    if(nextLevel<=g.maxLevel){nextUpgrade=g.items[nextLevel-1];}
    var header=document.createElement("div");
    header.style.cssText="padding:8px 4px;margin-top:8px;font-size:13px;font-weight:700;color:var(--accent-2);display:flex;justify-content:space-between;align-items:center";
    header.innerHTML='<span>'+t(g.name.toLowerCase().replace(/ /g,'_'))+'</span><span style="font-size:11px;color:var(--text-3)">'+g.currentLevel+'/'+g.maxLevel+'</span>';
    list.appendChild(header);
    if(nextUpgrade){
      var canBuy=state.coins>=nextUpgrade.price;var div=document.createElement("div");div.className="upgrade-card";div.style.opacity=canBuy?"1":"0.6";
      div.innerHTML='<div class="upgrade-ico">'+nextUpgrade.icon+'</div><div class="upgrade-info"><div class="upgrade-title">'+t(g.name.toLowerCase().replace(/ /g,'_'))+' '+t("lvl")+'.'+nextLevel+'</div><div class="upgrade-desc">'+nextUpgrade.desc+'</div></div><button class="upgrade-btn" onclick="buyUpgrade(\''+nextUpgrade.id+'\')">'+fmt(nextUpgrade.price)+' 🪙</button>';
      list.appendChild(div);
    }else{
      var div=document.createElement("div");div.className="upgrade-card bought";
      div.innerHTML='<div class="upgrade-ico">✅</div><div class="upgrade-info"><div class="upgrade-title">'+t(g.name.toLowerCase().replace(/ /g,'_'))+'</div><div class="upgrade-desc">'+t("upgrade_max")+'</div></div><button class="upgrade-btn bought-btn">MAX</button>';
      list.appendChild(div);
    }
  }
}

function buyUpgrade(id){
  var u=UPGRADES.find(function(x){return x.id===id});if(!u||state.bought.indexOf(u.id)!==-1)return;
  if(state.coins<u.price){toast(t("toast_upgrade_no_money"));return}
  state.coins-=u.price;state.bought.push(id);
  if(u.type==="power")state.clickPower=u.val;if(u.type==="auto")state.autoClick=u.val;if(u.type==="luck")state.permaLuck=u.val;
  toast(t(u.groupName.toLowerCase().replace(/ /g,'_'))+" "+t("lvl")+"."+u.level+" "+t("toast_upgrade_bought"));update();save();
}

function renderLeaders(){
  var list=document.getElementById("leadersList");if(!list)return;
  if(sdkReady&&yandexLeaderboard){
    list.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-3)">'+t("leaders_loading")+'</div>';
    yandexLeaderboard.getLeaderboardEntries('nft_gifts_score',{quantityTop:20,includeUser:true}).then(function(entries){
      list.innerHTML='';
      if(entries.length===0){list.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-3)">'+t("leaders_empty")+'</div>';return;}
      entries.forEach(function(entry,i){
        var row=document.createElement("div");row.className="leader-row";var rc=i===0?"rank-1":i===1?"rank-2":i===2?"rank-3":"rank-n";
        var isMe=false;try{isMe=entry.player.getUniqueID()===yandexPlayer.getUniqueID();}catch(e){}
        entry.player.getPublicName().then(function(name){
          row.innerHTML='<div class="leader-rank '+rc+'">'+(i+1)+'</div><div class="leader-name" style="'+(isMe?"color:var(--accent-2)":"")+'">'+name+(isMe?" "+t("leader_you"):"")+'</div><div class="leader-score">'+fmt(entry.score)+'</div>';
        });
        list.appendChild(row);
      });
    }).catch(function(){renderLocalLeader(list);});
  }else{renderLocalLeader(list);}
}

function renderLocalLeader(list){
  list.innerHTML="";
  list.innerHTML='<div class="leader-row"><div class="leader-rank rank-1">1</div><div class="leader-name" style="color:var(--accent-2)">'+(state.name||"Игрок")+' '+t("leader_you")+'</div><div class="leader-score">'+fmt(state.coins)+'</div></div>';
}

function renderCollection(){
  var grid=document.getElementById("collectionGrid");if(!grid)return;grid.innerHTML="";
  GIFTS.forEach(function(g,i){
    var unlocked=state.unlocked.indexOf(i)!==-1;var nextUnlock=i===state.unlocked.length;
    var div=document.createElement("div");div.className="col-item "+(unlocked?"unlocked":"locked");
    if(unlocked){div.style.background=g.color+"18";div.innerHTML='<img src="'+g.src+'" alt="'+g.name+'"><div class="col-name" style="color:var(--text)">'+g.name+'</div><div class="col-clicks" style="color:var(--text-2)">'+fmt(g.clicks)+' '+t("clicks_word")+'</div>';}
    else if(nextUnlock){div.style.background='rgba(139,92,246,0.05)';div.style.borderColor='rgba(139,92,246,0.3)';div.innerHTML='<div style="font-size:36px;opacity:0.3">🎁</div><div class="col-name" style="color:var(--accent-2)">'+t("collection_next")+'</div><div class="col-clicks" style="color:var(--text-3)">'+fmt(g.clicks)+' '+t("clicks_word")+'</div>';}
    else{div.style.background='rgba(255,255,255,0.02)';div.innerHTML='<div style="font-size:36px;opacity:0.2;filter:grayscale(100%)">❓</div><div class="col-name" style="color:var(--text-3)">???</div><div class="col-clicks" style="color:var(--text-3)">'+fmt(g.clicks)+' '+t("clicks_word")+'</div>';}
    grid.appendChild(div);
  });
}

const ALL_QUESTS = [
  {id:"clicks100",title_key:"quest_clicks100",icon:"👆",target:100,type:"clicks",reward:5},
  {id:"clicks1000",title_key:"quest_clicks1000",icon:"👆👆",target:1000,type:"clicks",reward:10},
  {id:"coins100k",title_key:"quest_coins100k",icon:"💰",target:100000,type:"coins",reward:20},
  {id:"coins1m",title_key:"quest_coins1m",icon:"💰💰",target:1000000,type:"coins",reward:40},
  {id:"newNFT",title_key:"quest_newNFT",icon:"🎁",target:1,type:"newNFT",reward:15},
  {id:"newNFT2",title_key:"quest_newNFT2",icon:"🎁🎁",target:2,type:"newNFT",reward:30},
  {id:"play10m",title_key:"quest_play10m",icon:"⏱️",target:600,type:"playTime",reward:25},
  {id:"play60m",title_key:"quest_play60m",icon:"⏱️⏱️",target:3600,type:"playTime",reward:125},
  {id:"upgrade1",title_key:"quest_upgrade1",icon:"⚡",target:1,type:"upgrades",reward:10}
];

let currentQuests=[];
let questStartValues={};

function generateQuests(){
  var shuffled=ALL_QUESTS.sort(function(){return Math.random()-0.5});currentQuests=shuffled.slice(0,4);questStartValues={};
  state.questsGeneratedAt=Date.now();state.questsCompleted=[];state.questsClaimed=[];
  currentQuests.forEach(function(q){
    if(q.type==="clicks")questStartValues[q.id]=state.totalClicks;
    if(q.type==="coins")questStartValues[q.id]=state.coins;
    if(q.type==="playTime")questStartValues[q.id]=state.playTime;
    if(q.type==="newNFT")questStartValues[q.id]=state.unlocked.length;
    if(q.type==="upgrades")questStartValues[q.id]=state.bought.length;
  });
  save();
}

function getQuestProgress(q){
  if(!questStartValues[q.id])questStartValues[q.id]=0;
  if(q.type==="clicks")return Math.max(0,state.totalClicks-questStartValues[q.id]);
  if(q.type==="coins")return Math.max(0,state.coins-questStartValues[q.id]);
  if(q.type==="playTime")return Math.max(0,state.playTime-questStartValues[q.id]);
  if(q.type==="newNFT")return Math.max(0,state.unlocked.length-questStartValues[q.id]);
  if(q.type==="upgrades")return Math.max(0,state.bought.length-questStartValues[q.id]);
  return 0;
}

function updateQuestProgress(){
  if(currentQuests.length===0)return;
  currentQuests.forEach(function(q){var prog=getQuestProgress(q);if(prog>=q.target&&state.questsCompleted.indexOf(q.id)===-1){state.questsCompleted.push(q.id);toast(t("toast_quest_done"));}});
}

function renderQuests(){
  var list=document.getElementById("questsList");var timer=document.getElementById("questsTimer");if(!list||!timer)return;
  if(currentQuests.length===0)generateQuests();
  var elapsed=Date.now()-state.questsGeneratedAt;var remaining=Math.max(0,10800000-elapsed);
  var hours=Math.floor(remaining/3600000);var mins=Math.floor((remaining%3600000)/60000);
  timer.textContent=remaining>0?t("quests_refresh")+" "+hours+t("hour_short")+" "+mins+t("min_short"):t("quests_refresh_soon");
  if(remaining<=0&&currentQuests.length>0){generateQuests();return;}
  list.innerHTML="";
  currentQuests.forEach(function(q){
    var prog=getQuestProgress(q);var completed=prog>=q.target;var claimed=state.questsClaimed.indexOf(q.id)!==-1;
    var pct=Math.min(100,(prog/q.target)*100);var div=document.createElement("div");
    div.className="quest-card"+(claimed?" claimed":(completed?" completed":""));
    div.innerHTML='<div class="quest-icon">'+q.icon+'</div><div class="quest-info"><div class="quest-title">'+t(q.title_key)+'</div><div class="quest-progress">'+Math.min(prog,q.target)+'/'+q.target+'</div><div class="quest-progress-bar"><div class="quest-progress-fill" style="width:'+pct+'%"></div></div></div><div class="quest-reward">+'+q.reward+' 💎</div><button class="quest-claim '+(claimed||!completed?"done":"")+'" onclick="claimQuest(\''+q.id+'\')">'+(claimed?t("quest_claimed"):t("quest_claim"))+'</button>';
    list.appendChild(div);
  });
}

function claimQuest(id){
  if(state.questsClaimed.indexOf(id)!==-1)return;var q=currentQuests.find(function(x){return x.id===id});if(!q)return;
  if(getQuestProgress(q)<q.target)return;state.questsClaimed.push(id);state.gems+=q.reward;
  toast(t("toast_quest_claimed")+" +"+q.reward+" 💎");update();save();
}

function switchTab(tab,btn){
  document.querySelectorAll(".tab").forEach(function(t){t.classList.remove("active")});
  document.querySelectorAll(".nav-btn").forEach(function(b){b.classList.remove("active")});
  document.getElementById("tab-"+tab).classList.add("active");if(btn)btn.classList.add("active");update();
}

setInterval(function(){
  state.playTime+=1;var auto=state.autoClick;if(state.potions.auto>Date.now())auto*=2;
  if(auto>0){var g=GIFTS[state.giftIdx];
    for(var i=0;i<auto;i++){var earned=state.clickPower;if(state.potions.power>Date.now())earned*=2;var luck=state.permaLuck;if(state.potions.luck>Date.now())luck=luck*2;if(Math.random()<luck){earned*=2}state.coins+=earned;state.totalClicks+=1;state.giftClicks+=1;}
    if(state.giftClicks>=g.clicks)levelUp();}update();save();
},1000);

const PROMOS = {"free":{reward:10000000000,used:false},"gems":{reward:0,gems:1000,used:false}};

function openPromo(){document.getElementById("promoModal").style.display="flex";}
function closePromo(){document.getElementById("promoModal").style.display="none";}

function usePromo(){
  var code=document.getElementById("promoInput").value.trim().toLowerCase();
  if(PROMOS[code]){if(PROMOS[code].used){toast(t("toast_promo_used"));return;}
    if(PROMOS[code].reward)state.coins+=PROMOS[code].reward;if(PROMOS[code].gems)state.gems+=PROMOS[code].gems;
    PROMOS[code].used=true;var msg=t("toast_promo_ok");if(PROMOS[code].reward)msg+=" +"+fmt(PROMOS[code].reward)+" "+t("coins_word");if(PROMOS[code].gems)msg+=" +"+PROMOS[code].gems+" 💎";
    toast(msg);closePromo();update();save();}else{toast(t("toast_promo_wrong"));}
}

// ===== ПЕРЕВОДЫ =====
const TRANSLATIONS = {
  ru: {
    gift_name:"подарок",level:"Уровень",clicks_word:"кликов",power_tag:"Сила",auto_tag:"Авто",off:"выкл",sec:"с",luck_tag:"Удача",sec_short:"с",
    cool:"Круто!",potions_title:"⚗️ Зелья",luck:"Удача",power:"Сила",auto:"Авто",
    promo_btn:"Промокоды",promo_title:"Промокод",promo_placeholder:"Введите код...",promo_hint:"Введите секретный код",activate:"Активировать",
    stat_clicks:"Всего кликов",stat_coins:"Монет",stat_nft:"NFT собрано",stat_level:"Уровень",
    quests_title:"📋 Квесты",settings_title:"⚙️ Настройки",language:"🌐 Язык",
    nav_home:"Главная",nav_profile:"Профиль",nav_upgrades:"Улучшения",nav_leaders:"Лидеры",nav_collection:"Коллекция",nav_quests:"Квесты",nav_settings:"Настройки",
    toast_potion_active:"Уже активно!",toast_potion_need:"Нужно гемов",toast_potion_ok:"Зелье активировано! x2 буст",
    toast_upgrade_no_money:"Недостаточно монет",toast_upgrade_bought:"куплено!",
    toast_promo_used:"Этот код уже использован!",toast_promo_wrong:"Неверный промокод!",toast_promo_ok:"Промокод активирован!",
    toast_quest_done:"Квест выполнен! Заберите награду",toast_quest_claimed:"Квест выполнен! +",
    upgrade_max:"Максимальный уровень!",lvl:"ур",
    leaders_loading:"Загрузка...",leaders_empty:"Пока нет игроков",leader_you:"(ты)",
    collection_next:"Следующий",quests_refresh:"Обновление через",quests_refresh_soon:"Обновление скоро",
    quest_claim:"Забрать",quest_claimed:"✓",hour_short:"ч",min_short:"м",coins_word:"монет",
    rank_novice:"Новичок коллекционер",rank_collector:"Коллекционер",rank_expert:"Эксперт",rank_master:"Мастер",rank_legend:"Легенда",rank_god:"Бог",rank_titan:"Титан",rank_immortal:"Бессмертный",rank_omega:"Омега",
    gift_new:"подарок!",gift_opened:"Ты открыл новый NFT",gift_max:"Максимум!",gift_all:"Все NFT собраны! Ты легенда!",
    сила_клика:"Сила клика",автокликер:"Автокликер",удача:"Удача",
    quest_clicks100:"Сделать 100 кликов",quest_clicks1000:"Сделать 1000 кликов",quest_coins100k:"Накопить 100K монет",quest_coins1m:"Накопить 1M монет",
    quest_newNFT:"Открыть новый NFT",quest_newNFT2:"Открыть NFT 0/2",quest_play10m:"Провести 10 мин в игре",quest_play60m:"Провести 60 мин в игре",quest_upgrade1:"Купить 1 улучшение"
  },
  by: {
    gift_name:"падарунак",level:"Узровень",clicks_word:"клікаў",power_tag:"Сіла",auto_tag:"Аўта",off:"выкл",sec:"с",luck_tag:"Удача",sec_short:"с",
    cool:"Крута!",potions_title:"⚗️ Зелля",luck:"Удача",power:"Сіла",auto:"Аўта",
    promo_btn:"Прамокоды",promo_title:"Прамокод",promo_placeholder:"Увядзіце код...",promo_hint:"Увядзіце сакрэтны код",activate:"Актываваць",
    stat_clicks:"Усяго клікаў",stat_coins:"Манет",stat_nft:"NFT сабрана",stat_level:"Узровень",
    quests_title:"📋 Квэсты",settings_title:"⚙️ Налады",language:"🌐 Мова",
    nav_home:"Галоўная",nav_profile:"Профіль",nav_upgrades:"Паляпшэнні",nav_leaders:"Лідэры",nav_collection:"Калекцыя",nav_quests:"Квэсты",nav_settings:"Налады",
    toast_potion_active:"Ужо актыўна!",toast_potion_need:"Патрэбна гемаў",toast_potion_ok:"Зелле актывавана! x2 буст",
    toast_upgrade_no_money:"Недастаткова манет",toast_upgrade_bought:"куплена!",
    toast_promo_used:"Гэты код ужо выкарыстаны!",toast_promo_wrong:"Няправільны прамокод!",toast_promo_ok:"Прамокод актываваны!",
    toast_quest_done:"Квэст выкананы! Збярыце ўзнагароду",toast_quest_claimed:"Квэст выкананы! +",
    upgrade_max:"Максімальны ўзровень!",lvl:"ур",
    leaders_loading:"Загрузка...",leaders_empty:"Пакуль няма гульцоў",leader_you:"(ты)",
    collection_next:"Наступны",quests_refresh:"Абнаўленне праз",quests_refresh_soon:"Абнаўленне хутка",
    quest_claim:"Забраць",quest_claimed:"✓",hour_short:"г",min_short:"хв",coins_word:"манет",
    rank_novice:"Пачатковец калекцыянер",rank_collector:"Калекцыянер",rank_expert:"Эксперт",rank_master:"Майстар",rank_legend:"Легенда",rank_god:"Бог",rank_titan:"Тытан",rank_immortal:"Несмяротны",rank_omega:"Амега",
    gift_new:"падарунак!",gift_opened:"Ты адкрыў новы NFT",gift_max:"Максімум!",gift_all:"Усе NFT сабраны! Ты легенда!",
    сила_клика:"Сіла кліку",автокликер:"Аўтаклікер",удача:"Удача",
    quest_clicks100:"Зрабіць 100 клікаў",quest_clicks1000:"Зрабіць 1000 клікаў",quest_coins100k:"Назбіраць 100K манет",quest_coins1m:"Назбіраць 1M манет",
    quest_newNFT:"Адкрыць новы NFT",quest_newNFT2:"Адкрыць NFT 0/2",quest_play10m:"Правесці 10 хв у гульні",quest_play60m:"Правесці 60 хв у гульні",quest_upgrade1:"Купіць 1 паляпшэнне"
  }
};

function t(key){var lang=state.language||'ru';return TRANSLATIONS[lang][key]||TRANSLATIONS['ru'][key]||key;}

function setLanguage(lang){
  state.language=lang;document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.lang-btn').forEach(function(b){if(b.textContent.includes(lang==='ru'?'Русский':'Беларуская'))b.classList.add('active');});
  applyLanguage();save();update();
}

function applyLanguage(){
  var translations=TRANSLATIONS[state.language]||TRANSLATIONS['ru'];
  document.querySelectorAll('[data-i18n]').forEach(function(el){var key=el.getAttribute('data-i18n');if(translations[key])el.textContent=translations[key];});
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){var key=el.getAttribute('data-i18n-placeholder');if(translations[key])el.placeholder=translations[key];});
  document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.remove('active');});
  document.querySelectorAll('.lang-btn').forEach(function(b){if(b.textContent.includes(state.language==='ru'?'Русский':'Беларуская'))b.classList.add('active');});
}

function getRankTitle(level){
  var ranks=['rank_novice','rank_collector','rank_expert','rank_master','rank_legend','rank_god','rank_titan','rank_immortal','rank_omega'];
  return t(ranks[Math.min(Math.floor(level/7),ranks.length-1)]);
}

// ===== ОБРАБОТЧИК ПАУЗЫ (ВАЖНО ДЛЯ МОДЕРАЦИИ) =====
document.addEventListener('visibilitychange', function() {
  if (document.hidden) {
    // Игрок ушёл с вкладки — ставим на паузу
    if (ysdk) {
      ysdk.features.GameplayAPI.stop();
      console.log('⏸️ Игра на паузе');
    }
  } else {
    // Игрок вернулся — продолжаем
    if (ysdk) {
      ysdk.features.GameplayAPI.start();
      console.log('▶️ Игра продолжена');
    }
  }
});

// ===== ЗАПУСК, ЕСЛИ SDK НЕ ЗАГРУЗИЛСЯ =====
setTimeout(function(){
  if(!sdkReady){
    load();
    applyLanguage();
    update();
  }
},3000);