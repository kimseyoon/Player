var util = {
  $selector : function(selector){
      return document.querySelector(selector);
  },

  changeDuration : function(duration){
      var sec = 0;
      var min = 0;
      var time = 0;
      var str = "";

      //min
      time = duration;
      if(time / 60 >= 1){
          min = Math.floor(time / 60);
          if(min < 10){
              str = str.concat("0"+min+":");
          }else{
              str = str.concat(min+":");
          }
      }else{
          min = 0;
          str = str.concat("00:")
      }
      //sec
      sec = time % 60;
      if(sec < 10){
          str = str.concat("0"+sec);
      }else{
          str = str.concat(sec);
      }

      return str
  },

  addClass : function(el, classNameToAdd){
    el.className += ' ' + classNameToAdd;
  },

  removeClass : function(ele, cls) {
    if (ele.classList) {
        ele.classList.remove(cls);
    } else if (util.containsClass(ele, cls)) {
        ele.setAttribute('class', ele.getAttribute('class').replace(cls, ' '));
    }
  },

  containsClass : function(el, classNameToContains){
    var boolContains = false;
    if(el.className.split(" ").indexOf(classNameToContains) >= 0){
      boolContains = true;
    }
    return boolContains;
  }
}
