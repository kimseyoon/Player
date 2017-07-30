 /*
  * addEventListener polyfill
  * 참고 : https://developer.mozilla.org/ko/docs/Web/API/EventTarget/addEventListener
  */

 (function() {
   if (!Event.prototype.preventDefault) {
     Event.prototype.preventDefault=function() {
       this.returnValue=false;
     };
   }
   if (!Event.prototype.stopPropagation) {
     Event.prototype.stopPropagation=function() {
       this.cancelBubble=true;
     };
   }
   if (!Element.prototype.addEventListener) {
     var eventListeners=[];

     var addEventListener=function(type,listener /*, useCapture (will be ignored) */) {
       var self=this;
       var wrapper=function(e) {
         e.target=e.srcElement;
         e.currentTarget=self;
         if (typeof listener.handleEvent != 'undefined') {
           listener.handleEvent(e);
         } else {
           listener.call(self,e);
         }
       };
       if (type=="DOMContentLoaded") {
         var wrapper2=function(e) {
           if (document.readyState=="complete") {
             wrapper(e);
           }
         };
         document.attachEvent("onreadystatechange",wrapper2);
         eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper2});

         if (document.readyState=="complete") {
           var e=new Event();
           e.srcElement=window;
           wrapper2(e);
         }
       } else {
         this.attachEvent("on"+type,wrapper);
         eventListeners.push({object:this,type:type,listener:listener,wrapper:wrapper});
       }
     };
     var removeEventListener=function(type,listener /*, useCapture (will be ignored) */) {
       var counter=0;
       while (counter<eventListeners.length) {
         var eventListener=eventListeners[counter];
         if (eventListener.object==this && eventListener.type==type && eventListener.listener==listener) {
           if (type=="DOMContentLoaded") {
             this.detachEvent("onreadystatechange",eventListener.wrapper);
           } else {
             this.detachEvent("on"+type,eventListener.wrapper);
           }
           eventListeners.splice(counter, 1);
           break;
         }
         ++counter;
       }
     };
     Element.prototype.addEventListener=addEventListener;
     Element.prototype.removeEventListener=removeEventListener;
     if (HTMLDocument) {
       HTMLDocument.prototype.addEventListener=addEventListener;
       HTMLDocument.prototype.removeEventListener=removeEventListener;
     }
     if (Window) {
       Window.prototype.addEventListener=addEventListener;
       Window.prototype.removeEventListener=removeEventListener;
     }
   }
 })();


/*
 * closest polyfill
 * 참고 : https://developer.mozilla.org/ko/docs/Web/API/Element/closest
 */

if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest =
    function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i,
            el = this;
        do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) {};
        } while ((i < 0) && (el = el.parentElement));
        return el;
    };
}

/*
 * bind polyfill
 * 참고 : https://gist.github.com/edeustace/7786722
 */

if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function () {},
      fBound = function () {
        return fToBind.apply(this instanceof fNOP && oThis? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

/*
 * indexOf polyfill
 * 참고 : https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
 */
 
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(searchElement, fromIndex) {

    var k;

    // 1. 이 값을 인수로 전달하는 ToObject를 호출 한 결과를
    // o라고합니다.
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var o = Object(this);

    // 2. lenValue를 Get 함수를 호출 한 결과로 둡니다.
     // 인수가 "length"인 o의 내부 메소드.
     // 3. len을 ToUint32 (lenValue)로 지정합니다.
    var len = o.length >>> 0;

    // 4. len이 0이면 -1을 반환합니다.
    if (len === 0) {
      return -1;
    }

    // 5.Index에서 인수가 전달 된 경우 n을
    // ToInteger (fromIndex); 그렇지 않으면 n은 0이됩니다.
    var n = fromIndex | 0;

    // 6. If n >= len, return -1.
    if (n >= len) {
      return -1;
    }

   // 7. n> = 0 인 경우 k를 n이라고 합니다.
   // 8. 그렇지 않으면 n <0, k는 len - abs (n)이됩니다.
   // k가 0보다 작은 경우 k를 0으로 만듭니다.
    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. k <len 인 동안 반복한다.
    while (k < len) {
       // a. Pk를 ToString (k)이라고합시다.
       // 이것은 in 연산자의 LHS 피연산자에 대해 암시 적입니다.
       // b. kPresent를 호출 한 결과라고합시다.
       // Hasproperty 인수에 Pk가있는 o의 내부 메소드.
       //이 단계는 c와 결합 될 수 있습니다.
       // c. kPresent가 참이면
       // i. elementK를 Get을 호출 한 결과로합시다.
       // ToString (k) 인수를 가진 o의 내부 메쏘드.
       // ii. 적용한 결과와 동일하게 봅시다.
       // 엄격한 평등 비교 알고리즘
       // searchElement 및 elementK.
       // iii. 동일하면 k를 반환합니다.
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };
}
