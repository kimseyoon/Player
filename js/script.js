var musicPlayer = (function(){
  function init(data){
    var playerView = new PlayerView();
    var musicListView = new MusicListView();
    var playListView = new PlayListView();

    var model = new Model();

    var controller = new Controller({
      playerView : playerView,
      musicListView : musicListView,
      playListView : playListView,
      model : model
    });

    playerView.init();
    musicListView.init();
    playListView.init();

    controller.join();

    dispatcher.emit({"type" : "initView"}, [data]);
  }

  function PlayerView(){
    this.elePlayerSection = util.$selector(".playerSection");
    this.eleInfoArea = this.elePlayerSection.querySelector(".infoArea");
    this.eleUtilArea = this.elePlayerSection.querySelector(".utilArea");
  }

  PlayerView.prototype ={
    init : function(){
      this.regEvent();
    },

    regEvent : function(){
      this.eleUtilArea.addEventListener("click", function(e){
        var target = e.target;
// 재생부 다음음원 이동 버튼
        if(target.id === "nextMusic"){
          dispatcher.emit({"type" : "playNextMusic"}, []);
        }
// 재생부 이전음원 이동 버튼
        else if(target.id === "prevMusic"){
          dispatcher.emit({"type" : "playPrevMusic"}, []);
        }

        else if(target.id === "playMusic"){
          dispatcher.emit({"type" : "clickPlayMusic"}, []);
        }

        else if(target.id === "stopMusic"){
          dispatcher.emit({"type" : "stopPlayMusic"}, []);
        }
      })
    },

    renderView : function(playingMusic){
      var playingMusicTitle = this.eleInfoArea.querySelector(".title");
      var playingMusicTime = this.eleInfoArea.querySelector(".playTime");
      var playTime = util.changeDuration(playingMusic.playTime);

      playingMusicTitle.innerHTML = playingMusic.title;
      playingMusicTime.innerHTML = "-" + playTime;
    },

    changePlayMuisicBtn : function(boolPlayOrStop){
      if(boolPlayOrStop){
          this.eleUtilArea.querySelector("#playMusic").innerHTML = "일시정지";
      }else{
        this.eleUtilArea.querySelector("#playMusic").innerHTML = "재생";
      }
    },

    renderTotalBar : function(secPerWidth, status){
      var eleCurrentBar = util.$selector(".currentBar");
      if(status !== "init"){
        var eleCurrentBarWidth = parseFloat(eleCurrentBar.style.width.match(/\d+(\.?\d*)/)[0]);
        eleCurrentBar.style.width = (eleCurrentBarWidth + secPerWidth) + "%";
      }else{
        eleCurrentBar.style.width = 0 + "%";
      }
    }
  }

  function MusicListView(){
    this.eleMusicList = util.$selector(".listSection .musicList");
    this.eleListArea = this.eleMusicList.querySelector(".listArea");
  }

  MusicListView.prototype ={
    init : function(){
      this.regEvent();
    },

    regEvent : function(){
      this.eleMusicList.addEventListener("click", function(e){
        var target = e.target;
// 음원목록 음원 체크박스 등록
        if(util.containsClass(target, "inputChk")){
          var eleLi = target.parentElement;
          var musicId = parseInt(eleLi.getAttribute("id").match(/\d+/)[0]);
          if(target.checked){
            dispatcher.emit({"type" : "addSelectedMusicItem"}, [musicId]);
          }else{
            dispatcher.emit({"type" : "delSelectedMusicItem"}, [musicId]);
          }
        }
// 음원목록 중 선택된 음원 삭제하는 버튼 이벤트 등록
        else if(target.id === "btnMusicListDel"){
          dispatcher.emit({"type" : "delMusicListItem"}, []);
        }
// 음원목룩 중 선택된 음원을 묶어 재생목록을 만드는 버튼 이벤트 등록
        else if(target.id === "btnAddPlayList"){
          dispatcher.emit({"type" : "addPlayList"}, []);
        }
      })
    },
// 재생목록 등록시 모든 체크박스 초기화
    clearAllCheckBox : function(){
      var eleCheckBoxs = this.eleListArea.querySelectorAll(".inputChk");
      var i = 0;
      var eleCheckBoxsLength = eleCheckBoxs.length;
      for(i; i < eleCheckBoxsLength; i++){
        eleCheckBoxs[i].checked = false;
      }

      dispatcher.emit({"type" : "clearSelectedMusicList"}, [this.playList]);
    },

    renderView : function(data){
      var result = "";
      var i = 0;
      var dataLength = data.length;
      for(i; i < dataLength; i++){
        var playTime = util.changeDuration(data[i].playTime);

        result += '<li id="item'+data[i].musicId+'"><input type="checkbox" class="inputChk"><span class="title">'+data[i].title+'</span><span class="playTime">'+playTime+'</span></li></li>'
      };
      this.eleListArea.innerHTML = result;
    }
  }

  function PlayListView(){
    this.eleListSection = util.$selector(".listSection");
    this.elePlayListWrap = util.$selector(".playListWrap");
  }

  PlayListView.prototype ={
    init : function(){
      this.regEvent();
    },

    regEvent : function(){
      this.eleListSection.addEventListener("click", function(e){
        var target = e.target;
        var eleListTitles = this.eleListSection.querySelectorAll(".listTitle");
// 탭 메뉴 버튼 클릭시 탭 변경 이벤트 등록
        if(util.containsClass(target, "listTitle")){
          this.highlightListTitle(eleListTitles, target);
          var eleCurrentList = target.parentElement;
          if(!util.containsClass(target.parentElement, "playList")){
            eleCurrentList = null;
          }
          dispatcher.emit({"type" : "changeCurrentList"}, [eleCurrentList]);
        }
// 현재 재생목록 삭제 버튼 이벤트 등록
        else if(target.id === "btnDelPlayList"){
          var elePlayList = target.closest(".playList");
          var playListId = parseInt(elePlayList.getAttribute("id").match(/\d+/)[0]);
          dispatcher.emit({"type" : "delPlayList"}, [playListId]);
        }
// 오름차순 / 내림차순 버튼 이벤트 등록
        else if(target.id === "btnOrder"){
          var elePlayList = target.closest(".playList");
          var playListId = parseInt(elePlayList.getAttribute("id").match(/\d+/)[0]);

          if(target.innerHTML === "내림차순"){
            target.innerHTML = "오름차순";
            dispatcher.emit({"type" : "orderDescendingPlayList"}, [playListId]);
          }else{
            target.innerHTML = "내림차순";
            dispatcher.emit({"type" : "orderAscendingPlayList"}, [playListId]);
          }
        }

        else if(util.containsClass(target, "btnDel")){
          var eleMusicItem = target.closest(".musicItem");
          var musicId = parseInt(eleMusicItem.getAttribute("id").match(/\d+/)[0]);
          dispatcher.emit({"type" : "delCurrentListMusicItem"}, [musicId]);
        }

      }.bind(this));
// 재생목록 중 음원 클릭할 경우 하이라이팅 이벤트 등록
      this.elePlayListWrap.addEventListener("click", function(e){
        var target = e.target;
        if(util.containsClass(target, "musicItem") || util.containsClass(target, "title")){
          var eleListArea = target.closest(".listArea");
          var eleMusicItems = eleListArea.children;
          var eleSelectedMusicItem = target.closest(".musicItem");
          this.highlightMusicItem(eleMusicItems, eleSelectedMusicItem, "select");
        }
      }.bind(this));
// 재생목록 중 음원 더블클릭 할 경우 재생 및 하이라이팅 이벤트 등록
      this.elePlayListWrap.addEventListener("dblclick", function(e){
        var target = e.target;
        if(util.containsClass(target, "musicItem") || util.containsClass(target, "title")){
          var eleMusicItem = target.closest(".musicItem");
          var eleListArea = target.closest(".listArea");
          var eleMusicItems = eleListArea.children;
          var eleSelectedMusicItem = target.closest(".musicItem");

          dispatcher.emit({"type" : "highlightMusicItem"}, [eleMusicItems, eleSelectedMusicItem, "playing"])
          //this.highlightMusicItem(eleMusicItems, eleSelectedMusicItem, "playing");
          var playingMusicId = parseInt(eleSelectedMusicItem.getAttribute("id").match(/\d+/)[0]);
          dispatcher.emit({"type" : "playMusic"}, [playingMusicId]);
        }

      }.bind(this));
    },
// 음원 하이라이팅
    highlightMusicItem : function(eleListTitles, target, className){
      var i = 0;
      var parent = null;
      var listTitleLength = eleListTitles.length;

      for(i; i < listTitleLength; i++){
        util.removeClass(eleListTitles[i], className);
      };
      util.addClass(target, className);
    },
// 탭 메뉴 하이라이팅
    highlightListTitle : function(eleListTitles, target){
      var i = 0;
      var parent = null;
      var listTitleLength = eleListTitles.length;

      for(i; i < listTitleLength; i++){
        parent = eleListTitles[i].parentElement;
        util.removeClass(parent, "select");
      };
      util.addClass(target.parentElement, "select");
    },

    renderView : function(playList){
      var eleListSection = util.$selector(".listSection");
      var elePlayListWrap = util.$selector(".playListWrap");
      var templatePlayList = util.$selector("#playList-template").innerHTML;

      var tempResult = "";
      var i = 0;
      var playListLength  = playList.length;

      for(i; i < playListLength; i++){
        var result = "";
        var j = 0;
        var dataLength = playList[i].items.length;

        for(j; j < dataLength; j++){
          var playTime = util.changeDuration(playList[i].items[j].playTime);
          console.log(playTime)
          result += '<li class="musicItem" id="musicId'+playList[i].items[j].musicId+'"><button type="button" name="button" class="btnDel">X</button><span class="title">'+playList[i].items[j].title+'</span><span class="playTime">'+playTime+'</span></li>';
        }

        tempResult += templatePlayList.replace("{{id}}", "playList" + playList[i].id)
                                      .replace("{{title}}", playList[i].title)
                                      .replace("{{items}}", result);
      }
      elePlayListWrap.innerHTML = tempResult;

      var eleListTitles = this.eleListSection.querySelectorAll(".listTitle");
      this.highlightListTitle(eleListTitles, eleListTitles[0]);
    },
// 현재 보여지는 재생목록만 렌더링
    renderPlayListView : function(currentList, playingMusicData){
      var elePlayList = document.querySelectorAll(".playList");
      //var playListIndex = 0;
      var j = 0;
      var elePlayListLength = elePlayList.length;
      var eleSelectedItem = null;
      for(j; j < elePlayListLength; j++){
        if(util.containsClass(elePlayList[j], "select")){
        //  playListIndex = j;
          eleSelectedItem = elePlayList[j];
        }
      };

      var i = 0;
      var playListItemsLength  = currentList.items.length;
      var result ="";



      for(i; i < playListItemsLength; i++){

        var playTime = util.changeDuration(currentList.items[i].playTime);
        console.log(playTime)

        if(playingMusicData === null){
          result += '<li class="musicItem" id="musicId'+currentList.items[i].musicId+'"><button type="button" name="button" class="btnDel">삭제</button><span class="title">'+currentList.items[i].title+'</span><span class="playTime">'+playTime+'</span></li>';
          continue;
        }

        if(currentList.items[i].musicId === playingMusicData.musicId){
          result += '<li class="musicItem playing" id="musicId'+currentList.items[i].musicId+'"><button type="button" name="button" class="btnDel">삭제</button><span class="title">'+currentList.items[i].title+'</span><span class="playTime">'+playTime+'</span></li>';
        }else{
          result += '<li class="musicItem" id="musicId'+currentList.items[i].musicId+'"><button type="button" name="button" class="btnDel">삭제</button><span class="title">'+currentList.items[i].title+'</span><span class="playTime">'+playTime+'</span></li>';
        }
      };

      var eleListArea = eleSelectedItem.querySelector(".listArea");
      eleListArea.innerHTML = result;
    }
  }

  function Controller(obj){
    this.playerView = obj.playerView;
    this.musicListView = obj.musicListView;
    this.playListView = obj.playListView;
    this.model = obj.model;
  }

  Controller.prototype = {
    join : function(){
      dispatcher.register({
        "initView" : function(data){
          this.model.saveArrMusicList(data);
        }.bind(this),

        "musicListRenderView" : function(data){
          this.musicListView.renderView(data);
        }.bind(this),

        "addSelectedMusicItem" : function(musicId){
          this.model.addSelectedMusicItem(musicId);
        }.bind(this),

        "delSelectedMusicItem" : function(musicId){
          this.model.delSelectedMusicItem(musicId);
        }.bind(this),

        "delMusicListItem" : function(){
          this.model.delMusicListItem();
        }.bind(this),

        "addPlayList" : function(){
          this.model.addPlayList();
        }.bind(this),

        "clearAllCheckBox" : function(){
          this.musicListView.clearAllCheckBox();
        }.bind(this),

        "clearSelectedMusicList" : function(){
          this.model.clearSelectedMusicList();
        }.bind(this),

        "initViewPlayList" : function(data){
          this.playListView.renderView(data);
        }.bind(this),

        "delPlayList" : function(playListId){
          this.model.delPlayList(playListId);
          dispatcher.emit({"type" : ""}, )
        }.bind(this),

        "orderDescendingPlayList" : function(playListId){
          this.model.orderDescendingPlayList(playListId)
        }.bind(this),

        "orderAscendingPlayList" : function(playListId){
          this.model.orderAscendingPlayList(playListId)
        }.bind(this),

        "renderPlayListView" : function(playList, playingMusicData){
          this.playListView.renderPlayListView(playList, playingMusicData);
        }.bind(this),

        "changeCurrentList" : function(eleCurrentList){
          this.model.changeCurrentList(eleCurrentList);
        }.bind(this),

        "playMusic" : function(playingMusicId){
          var changePlayId = this.model.getChangePlayId();
          //console.log(changePlayId)
          if(changePlayId !== null){
              clearInterval(changePlayId);
              //clearTimeout(changePlayId);
          }

          var boolPlayOrStop = true;
          this.model.setBoolPlayOrStop(boolPlayOrStop);
          //var boolPlayOrStop = this.model.getBoolPlayOrStop();
          this.playerView.changePlayMuisicBtn(boolPlayOrStop);


          this.model.setPlayingList();
          this.model.setPlayingMusicData(playingMusicId);

          var playingMusicData = this.model.getPlayingMusicData();
          this.playerView.renderView(playingMusicData);
          this.playerView.renderTotalBar(0, "init");

          this.model.setCurrentPlayTime(playingMusicData.playTime);


          dispatcher.emit({"type" : "changePlayTime"}, [changePlayId]);
          //this.player.playMusic(playingMusicData);
        }.bind(this),

        "playNextMusic" : function(){
          var playingMusicData = this.model.getPlayingMusicData();
          this.model.setPlayingMusicData(playingMusicData.musicId);

          var nextMusicData = this.model.getNextMusicData();
          var musicId = this.model.getPlayingMusicData.id;
          dispatcher.emit({"type" : "playMusic"}, [musicId]);

          // this.playerView.renderView(nextMusicData);


          var playingList = this.model.getPlayingList();
          this.playListView.renderPlayListView(playingList, nextMusicData);
        }.bind(this),

        "playPrevMusic" : function(){
          var playingMusicData = this.model.getPlayingMusicData();
          this.model.setPlayingMusicData(playingMusicData.musicId);

          var prevMusicData = this.model.getPrevMusicData();
          var musicId = this.model.getPlayingMusicData.id;
          dispatcher.emit({"type" : "playMusic"}, [musicId]);

          //this.playerView.renderView(prevMusicData);
          var playingList = this.model.getPlayingList();
          this.playListView.renderPlayListView(playingList, prevMusicData);
        }.bind(this),

        "highlightMusicItem" : function(eleMusicItems, eleSelectedMusicItem, className){
          this.playListView.highlightMusicItem(eleMusicItems, eleSelectedMusicItem, className);
        }.bind(this),

        "delCurrentListMusicItem" : function(musicId){
          this.model.delCurrentListMusicItem(musicId);
          dispatcher.emit({"type" : "playNextMusic"}, []);
        }.bind(this),

        "changePlayTime" : function(changePlayId){
          changePlayId = setInterval(function(){
            this.model.setChangePlayId(changePlayId);
            var playTime = this.model.getCurrentPlayTime();

            if(playTime === 0){
              this.playerView.renderTotalBar(secPerWidth, "init");
              clearInterval(changePlayId);
              dispatcher.emit({"type" : "playNextMusic"}, []);
            }else{
              playTime--;
              this.model.setCurrentPlayTime(playTime);
              var playingMusicData = this.model.getPlayingMusicData();
              var objPlayingMusicData = {
                "title" : playingMusicData.title,
                "playTime" : playTime
              }
              var secPerWidth = (100 / playingMusicData.playTime);

              this.playerView.renderTotalBar(secPerWidth, "add");

              this.playerView.renderView(objPlayingMusicData);
            }

          }.bind(this), 1000);

        }.bind(this),

        "clickPlayMusic" : function(){
//this.playingMusic 있으면 재생중이므로
          if(this.model.getPlayingMusicData()){
            var boolPlayOrStop = this.model.getBoolPlayOrStop();
//playList 중 select 된 것에서 listArea의 musicItem중  playing 있으면
            if(boolPlayOrStop){
              var changePlayId = this.model.getChangePlayId();
              clearInterval(changePlayId);
              this.model.setBoolPlayOrStop(false);
              this.playerView.changePlayMuisicBtn(false);
            }
//playList 중 select 된 것에서 listArea의 musicItem중  playing 없으면
            else{
              var changePlayId = this.model.getChangePlayId();
              dispatcher.emit({"type" : "changePlayTime"}, [changePlayId]);
              this.model.setBoolPlayOrStop(true);
              this.playerView.changePlayMuisicBtn(true);
            }

          }else{
//playList 중 select 된 것에서 listArea의 musicItem중  playing 없으면
            var firstMusicId = this.model.getCurrentList().items[0].musicId
            dispatcher.emit({"type" : "playMusic"}, [firstMusicId]);
          }
        }.bind(this),

        "stopPlayMusic" : function(){
          var changePlayId = this.model.getChangePlayId();
          clearInterval(changePlayId);
          var playingMusicData = this.model.getPlayingMusicData();
          this.model.setCurrentPlayTime(playingMusicData.playTime);

          var objPlayingMusicData = {
            "title" : playingMusicData.title,
            "playTime" : playingMusicData.playTime
          }
          this.playerView.renderView(objPlayingMusicData);
          this.playerView.renderTotalBar(0, "init");

          this.model.setBoolPlayOrStop(false);
          this.playerView.changePlayMuisicBtn(false);

        }.bind(this)

      })
    }
  }

  function Model(){
// 음원목록 음원 배열
    this.arrMusicList = [];
// 음원목록 중 선택되어진 음원 배열
    this.arrSelectedMusicList = [];
// 생성되어진 재생목록 배열
    this.playList = [];
// 현재 선택되어진 목록
    this.currentList = {};
// 현재 재생중인 음원의 재생목록
    this.playingList = [];
// 현재 재생중인 음원의 재생목록의 인덱스값
    this.playingMusicIndex = null;
// 현재 재생중인 음원 객체값
    this.playingMusicData = null;

//현재 재생중인 콜백함수 Id
    this.changePlayId = null;
//현재 재생중인 음원의 복사된 재생시간
    this.currentPlayTime = 0;
// playBtn 상태값
    this.boolPlayOrStop = false;
  }

  Model.prototype = {
// 오름차순 정렬
    orderAscending : function(data){
      data.sort(function(a, b) {
        return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
      });
    },
// 내림차순 정렬
    orderDescending : function(data){
      data.sort(function(a, b) {
        return a.title > b.title ? -1 : a.title < b.title ? 1 : 0;
      });
    },
// 현재 재생 중인 재생목록의 데이터 오름차순 정렬
    orderDescendingPlayList : function(playListId){
      var arrTemp = [];
      var i = 0;
      var playListLength = this.playList.length;
      for(i; i < playListLength; i++){
        if(this.playList[i].id === playListId){
          arrTemp = this.playList[i];
        }
      };
      this.orderDescending(arrTemp.items);

      if(this.currentList.id === this.playingList.id){
        this.playingList = this.currentList;
      }

      var playingMusicData = this.getPlayingMusicData();
      dispatcher.emit({"type" : "renderPlayListView"}, [this.playingList, playingMusicData]);
    },
// 현재 재생 중인 재생목록의 데이터 내림차순 정렬
    orderAscendingPlayList : function(playListId){
      var arrTemp = [];
      var i = 0;
      var playListLength = this.playList.length;
      for(i; i < playListLength; i++){
        if(this.playList[i].id === playListId){
          arrTemp = this.playList[i];
        }
      };
      this.orderAscending(arrTemp.items);

      if(this.currentList.id === this.playingList.id){
        this.playingList = this.currentList;
      }

      var playingMusicData = this.getPlayingMusicData();
      dispatcher.emit({"type" : "renderPlayListView"}, [this.playingList, playingMusicData]);
    },
// 음원의 PlayTime 형태 00:00 변환하기
    changePlayTime : function(data){
      var i = 0;
      var dataLength = data.length;
      for(i; i < dataLength; i++){
        data[i].playTime = util.changeDuration(data[i].playTime);
      }
    },
// 음원 목록 데이터 등록
    saveArrMusicList : function(data){
      //this.changePlayTime(data);


      this.orderAscending(data);
      this.arrMusicList = data;
      dispatcher.emit({"type" : "musicListRenderView"}, [data]);
    },
// 음원 목록 중 체크되어 있는 데이터 등록
    addSelectedMusicItem : function(musicId){
      var i = 0;
      var musicListLength = this.arrMusicList.length;

      for(i; i < musicListLength; i++){
        if(this.arrMusicList[i].musicId === musicId){
          this.arrSelectedMusicList.push(this.arrMusicList[i]);
        }
      };
    },
// 음원 목록 중 체크 한 뒤 체크를 해제한 데이터 삭제
    delSelectedMusicItem : function(musicId){
      var i = 0;
      var tempIndex = 0;
      var arrSelectedMusicListLength = this.arrSelectedMusicList.length;

      for(i; i < arrSelectedMusicListLength; i++){
        if(this.arrSelectedMusicList[i].musicId === musicId){
          tempIndex = i;
        }
      };
      this.arrSelectedMusicList.splice(tempIndex, 1);
    },
// 음원 목록 데이터 중 선택된 데이터 삭제
    delMusicListItem : function(){
      if(this.arrSelectedMusicList.length === 0){
        alert("음악을 최소 1개 이상 선택해 주세요");
        return;
      }

      var i = 0;
      var arrSelectedMusicListLength = this.arrSelectedMusicList.length;

      for(i; i < arrSelectedMusicListLength; i++){
        var j = 0;
        var boolAccordItem = false;
        var tempIndex = 0;
        var musicListLength = this.arrMusicList.length;

        for(j; j < musicListLength; j++){
          if(this.arrSelectedMusicList[i].musicId === this.arrMusicList[j].musicId){
            tempIndex = j;
            boolAccordItem = true;
          }
        };

        if(boolAccordItem){
          this.arrMusicList.splice(tempIndex, 1);
        }
      };

      dispatcher.emit({"type" : "musicListRenderView"}, [this.arrMusicList]);
    },
// 음원 목록 중 선택된 데이터 묶음을 새로 생성되는 재생목록에 등록
    addPlayList : function(){
      if(this.arrSelectedMusicList.length === 0){
        alert("음악을 최소 1개 이상 선택해 주세요");
        return;
      }

      var arrSelectedMusicList = this.arrSelectedMusicList;
      var playListId = (parseInt(this.playList.length) + 1);
      var playListTitle = "PlayList " + (playListId);

      this.playList.push({
        "id" : playListId,
        "title" : playListTitle,
        "items" : arrSelectedMusicList
      })
      dispatcher.emit({"type" : "clearAllCheckBox"}, []);
    },
// 음원 목록에서 선택되어진 데이터 배열 비움
    clearSelectedMusicList : function(){
      this.arrSelectedMusicList = [];
      dispatcher.emit({"type" : "initViewPlayList"}, [this.playList]);
    },
// 재생목록이 들어있는 배열에서 해당 재생목록만 삭제
    delPlayList : function(playListId){
      var i = 0;
      var tempIndex = 0;
      var playListLength = this.playList.length;

      for(i; i < playListLength; i++){
        if(this.playList[i].id === playListId){
          tempIndex = i;
        }
      };

      this.playList.splice(tempIndex, 1);
      dispatcher.emit({"type" : "initViewPlayList"}, [this.playList]);
    },
// 현재 열려있는 목록 변경하기
    changeCurrentList : function(currentList){
      if(currentList === null){
        this.currentList = {};
        return;
      }

      var currentListId = parseInt(currentList.getAttribute("id").match(/\d+/)[0]);
      var i = 0;
      var playListLength = this.playList.length;
      for(i; i < playListLength; i++){
        if(this.playList[i].id === currentListId){
          this.currentList = this.playList[i];
        }
      }

      if(this.currentList.id !== this.playingList.id){
        dispatcher.emit({"type" : "renderPlayListView"}, [this.currentList, null]);
      }else{
        dispatcher.emit({"type" : "renderPlayListView"}, [this.currentList, this.playingMusicData]);
      }
    },
// 현재 재생중인 재생목룩 리스트 설정
    setPlayingList : function(){
      this.playingList = this.currentList;
    },

    getCurrentList : function(){
      return this.currentList;
    },

// 현재 재생중인 음원 데이터 설정
    setPlayingMusicData : function(playingMusicId){
      var i = 0;
      var playingListItemsLength = this.playingList.items.length;
      for(i; i < playingListItemsLength; i++){
        if(this.playingList.items[i].musicId === playingMusicId){
          this.playingMusicIndex = i;
          this.playingMusicData = this.playingList.items[i];
        }
      }
    },
// 현재 재생중인 음원 데이터 가져오기
    getPlayingMusicData : function(){
      return this.playingMusicData;
    },
// 현재 재생중인 음원 데이터의 다음 데이터 가져오기
    getNextMusicData : function(){
      var playingListItemsLength = this.playingList.items.length;
      if(playingListItemsLength - 1 > this.playingMusicIndex){
        this.playingMusicIndex++;
      }else{
        this.playingMusicIndex = 0;
      }

      this.setPlayingMusicData(this.playingList.items[this.playingMusicIndex].musicId);
      return this.playingList.items[this.playingMusicIndex];
    },
// 현재 재생중인 음원 데이터의 이전 데이터 가져오기
    getPrevMusicData : function(){
      var playingListItemsLength = this.playingList.items.length;
      if(0 === this.playingMusicIndex){
        this.playingMusicIndex =  playingListItemsLength - 1;
      }else{
        this.playingMusicIndex--;
      }

      this.setPlayingMusicData(this.playingList.items[this.playingMusicIndex].musicId);

      return this.playingList.items[this.playingMusicIndex];
    },
// 현재 재생중인 재생목록 가져오기
    getPlayingList : function(){
      return this.playingList;
    },

    delCurrentListMusicItem : function(musicId){
      var i = 0;
      var currentListItemsLength = this.currentList.items.length;
      var tempIndex = 0;

      for(i; i < currentListItemsLength; i++){
        if(this.currentList.items[i].musicId === musicId){
          tempIndex = i;
        }
      }

      this.currentList.items.splice(tempIndex, 1);
      dispatcher.emit({"type" : "renderPlayListView"}, [this.currentList, this.playingMusicData]);
    },

    getChangePlayId : function(){
      return this.changePlayId;
    },

    setChangePlayId : function(changePlayId){
      this.changePlayId = changePlayId;
    },

    getCurrentPlayTime : function(){
      return this.currentPlayTime;
    },

    setCurrentPlayTime : function(playTime){
      this.currentPlayTime = playTime;
    },

    setBoolPlayOrStop : function(boolPlayOrStop){
      this.boolPlayOrStop = boolPlayOrStop;
    },

    getBoolPlayOrStop : function(){
      return this.boolPlayOrStop;
    }

  }

  var dispatcher = {
    register: function(fnlist) {
      this.fnlist = fnlist;
    },
    emit: function(o, data) {
      this.fnlist[o.type].apply(null, data);
    }
  }

  return {
    init : init
  }

})();

document.addEventListener("DOMContentLoaded", function(){
  musicPlayer.init(dummy);
})
