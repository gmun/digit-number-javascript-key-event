/**
 * 
 */
(function($, undefined) {
	"use strict"; // 엄격모드
	var defaults = {
			author: "Moon"
		   ,since: "2018-12-21"
		   ,project: "digitNumber"
	};

	var nk = $.digitNumber = {version: "1.0"}
	$.fn.digitNumber = function(){
		var callFn	= ""
		   ,options = {};

		for(var i in arguments){
			switch (typeof arguments[i]){
				case "string":
					callFn = arguments[i];
				break;
				case "object":
					options = arguments[i];
				break;
			}
		}

		this.each(function(i, _element) {
			var element = $(_element);
			var nKinds = new DigitNumber(element, callFn, options);
			element.data("digitNumber", nKinds);
			nKinds.render();
		});
	}

	function DigitNumber(element, callFn, options){
		var t = this;

		//export
		t.render 		= render;
		t.core			= core;
		t.initSelectors	= initSelectors(element, options);
		t.options		= options;

		function render(){
			EventManager.call(t, element);
		}

	}

	function EventManager(element){
		var t = this;

		//import
		t.core.call(t);
		t.event.call(t);

		//constract
		(function(){
			var selectors = t.initSelectors;
				setImeMode(selectors);

			t.addEvent(selectors);
		})();


		//ime-mode:disabled
		function setImeMode(selectors){
			$(selectors).css("-webkit-ime-mode", "disabled")
					    .css("-moz-ime-mode", "disabled")
					    .css("-moz-ime-mode", "disabled")
					    .css("-ms-ime-mode", "disabled")
					    .css("ime-mode", "disabled");
		}
	}

	function core(){
		var t = this;

		//import
		t.format = foramt;
		t.event  = event;
		t.digit	 = digit;
		t.regexp = regexp;
	}

	function event(){
		var t = this;

		//import
		t.core.call(t);
		t.regexp.call(t);
		t.format.call(t);
		t.digit.call(t);

		//export
		t.addEvent   = addEvent;
		t.disConnect = disConnect;

		function addEvent(selectors){
			fetchEventSource(selectors);
		}

		function disConnect(event){
			event.preventDefault();				// 현재 이벤트의 기본 동작을 중단한다.
			event.stopPropagation();			// 현재 이벤트가 상위로 전파되지 않도록 중단한다.
			event.stopImmediatePropagation();	// 현재 이벤트가 상위뿐 아니라 현재 레벨에 걸린 다른 이벤트도 동작하지 않도록 중단한다.
		}

		function fetchEventSource(selectors) {
			for(var i in selectors){
				var _selector = selectors[i];

				$(_selector).bind("change blur", function(){
					t.overLimitNumSlice(this);
					$(this).val(t.decimalComma(this, $(this).data("commaYN")));
				}).bind("keydown", function(event){
					event = event || window.event;	// chorme, ie 이벤트 구별

					//value
					var _key = event.key
					   ,_value = $(this).val();

					//위치
					var _point 	  = t.cursorPosition(this)
					   ,_dotPoint = _value.indexOf(".");

					//포함여부
					var _dotIncludeFlag = _dotPoint > -1 ? true : false;

					//자릿수 obj
					var _realLimitDigitObj = t.realLimitDigitObj(this) // 현재
					   ,_realPreDigit  = _realLimitDigitObj[0]
					   ,_realPostDigit = _realLimitDigitObj[1]
					   ,_stdLimitDigitObj  = t.stdLimitDigitObj(this)  // 기준 자릿수 obj
					   ,_stdPreDigit   = _stdLimitDigitObj[0]
					   ,_stdPostDigit  = _stdLimitDigitObj[1];

					var eventActionFlag = (_stdPreDigit === -1 && _stdPostDigit === -1) ? false : true;

					if(	   _key == "Tab"
						|| _key == "ArrowRight"
						|| _key == "ArrowLeft"
						|| _key == "Backspace"
						|| _key == "Delete"
						|| _key == "Home"
						|| _key == "End"
						){
						return;
					}else{
						if(eventActionFlag){
							if(!t.getRegexp("dotAndOnlyNumber").test(_key)){
								t.disConnect(event);
								return false;
							}

							if(_dotIncludeFlag){ //dot include
								if(_key == "."){
									t.disConnect(event);
									return false;
								}
							}else{
								if(_key == "."){
									return;
								}
							}

							if(_point > _dotPoint
								&& _dotPoint > -1){
								//dot post
								if(_stdPostDigit !== -1){
									if(_realPostDigit == _stdPostDigit
										&& !(_stdPreDigit == 0 && _key == 0)){
										t.disConnect(event);
										return false;
									}
								}
							}else{
								//dot pre
								if(_stdPreDigit !== -1){
									if(_realPreDigit == _stdPreDigit){
										if(!(_stdPreDigit == 0 && _key == 0)){
											t.disConnect(event);
											return false;
										}
									}else{
										if( _realPreDigit >_stdPreDigit){
											if(!(!_dotIncludeFlag && _key == ".")){
												t.disConnect(event);
												return false;
											}
										}
									}
								}
							}
						}
					}
					return;
				});
			}
		}


	}

	function regexp(_type){
		var t = this;
		t.getRegexp = (function(_type){
			switch (_type) {
				case "onlyNumber":	//only number
					return /^[0-9]*$/;
				break;
				case "dotAndOnlyNumber": // number or dot
					return /^[0-9]*$|\./;
				break;
				case "stdDigitClass": // stdDigitClass
					return /digitLimit/;
				break;
			}
		});
	}


	function foramt(){
		var t = this;

		//export
		t.decimalComma = decimalComma;

		function decimalComma(_selector, _comma){

			var _value = $(_selector).val().toString().replace(/[^(0-9|\.)]/gi,"") || "";

			var _realObj = _value.split(".")
			   ,_preNum  = _realObj[0] || ""
			   ,_postNum = _realObj[1] || "";

			while(/^0/gi.test(_preNum) && _preNum.length > 1){
				_preNum = _preNum.replace(/^0/gi, "");
			}

			while(/0$/gi.test(_postNum)){
				_postNum = _postNum.replace(/0$/gi, "");
			}

			var dot = _postNum === "" ? "" : ".";

			_preNum = dot === "." && _preNum == "" ? "0" : _preNum;

			if(t.options.comma !== false && !_comma){
				_preNum = comma(_preNum);
			}

			_value = _preNum + dot + _postNum;
			return _value;
		}

		function comma(_x){
			_x = decomma(_x);
			return _x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

		function decomma(_x){
			return _x.toString().replace(/[^(0-9)]/gi,"");
		}
	}

	function digit(){
		var t = this;

		//import
		t.regexp.call(t);

		//export
		t.cursorPosition 	= cursorPosition;		// 현재 자릿수 반환
		t.overLimitNumSlice = overLimitNumSlice;	// 자릿수 넘어가면 자르기
		t.realLimitDigitObj = realLimitDigitObj;	// 현재 자릿수 obj
		t.stdLimitDigitObj	= stdLimitDigitObj;		// 기준 자릿수 obj

		function cursorPosition(_selector) {
			_selector = $(_selector);
		    var start = _selector[0].selectionStart
		       ,end   = _selector[0].selectionEnd
		       ,diff  = end - start;

			/*
		    if (start >= 0 && start == end) {
		        // do cursor position actions, example:
		        //'Cursor Position: ' + start
		    } else if (start >= 0) {
		        // do ranged select actions, example:
		        //'Cursor Position: ' + start + ' to ' + end + ' (' + diff + ' selected chars)'
		    }
		    */
	  	  return start;
		}

		function overLimitNumSlice(_selector){
			var _realLimitDigitObj = t.realLimitDigitObj(_selector)
			   ,_stdLimitDigitObj  = t.stdLimitDigitObj(_selector);

			var eventActionFlag = (_stdLimitDigitObj[0] === -1 && _stdLimitDigitObj[1] === -1) ? false : true;

			if(eventActionFlag){
				var _value = $(_selector).val().toString().replace(/[^(0-9)|\.]/gi,"");
				if(_value === ""){
					return;
				}
				var _stdPreDigit  = _stdLimitDigitObj[0]
				   ,_stdPostDigit = _stdLimitDigitObj[1]
				   ,realPreDigit  = _realLimitDigitObj[0]
				   ,realPostDigit = _realLimitDigitObj[1];

				var tmpObj = _value.split(".");
				var _preNumb  = tmpObj[0] || "0"
				   ,_postNumb = tmpObj[1] || "0";

				if(_stdPreDigit !== -1){
					_preNumb = _preNumb.substring(0, _stdPreDigit) || 0;
				}

				if(_stdPostDigit !== -1){
					_postNumb = _postNumb.substring(0, _stdPostDigit) || 0;
				}

				_value = _preNumb + "." + _postNumb;

				$(_selector).val(_value);
			}
		}

		function realLimitDigitObj(_selector){
			var _limitObj = [0, 0];

			var _value = $(_selector).val().toString().replace(/[^(0-9)|\.]/gi,"");

			var _tmpObj = _value.split(".");
			if(_tmpObj.length > 0){
				var _preNumb  = _tmpObj[0] || ""
				   ,_postNumb = _tmpObj[1] || "";

				//자릿수
				_preNumb  = _preNumb.length;  // 정수
				_postNumb = _postNumb.length; // 소수점

				_limitObj = [_preNumb, _postNumb];
			}

			return _limitObj;

		}

		function stdLimitDigitObj (_selector){
			var _limitObj = [-1, -1];

			var _classList = $(_selector)[0].classList;
			var _limitDigit = "";

			var _classPattern = t.getRegexp("stdDigitClass");

			for(var i=0, objLength = _classList.length; i<objLength; i++){
				var _className = _classList[i];

				if(_classPattern.test(_className)){
					_limitDigit = _className.replace(_classPattern, "");
				}
			}

			if(_limitDigit !== ""){
				_limitObj = _limitDigit.split(".");
				var _preNumb  = _limitObj[0] || -1
				   ,_postNumb = _limitObj[1] || -1;

				_limitObj = [_preNumb, _postNumb];
			}

			return _limitObj;
		}
	}

	function initSelectors(element, options){
		var _reObj = new Array();

		if(element !== undefined){
			if(element[0].id == ""){
				console.error("ERROR :: Should must you have to ID, not a class name. \nex) $('#id').digitNumber(..);");
				return _reObj;
			}

			var inputSeletors = $("#" + element[0].id + " input");

			var notSeletors = options.notSelectors || "";
				notSeletors = notSeletors.replace(/ /gi, "");

			var _notObj = notSeletors.split(",");

			for(var i=0, tot=inputSeletors.length; i<tot; i++){
				var include = true;

				$(inputSeletors[i]).data("commaYN", $(inputSeletors[i]).hasClass("nComma"));

				for(var idx in _notObj){
					var selector = _notObj[idx].substring(0, 1);
					if(selector !== ""){
						var _nS 	 = _notObj[idx].replace(new RegExp("\\" + selector), "");
						var _nSRegex = new RegExp("\\b(" + _nS + ")\\b", "g");

						var selectorStr;
						switch (selector) {
							case "#":	// id
								selectorStr = inputSeletors[i].id;
							break;

							case ".":	// class
								selectorStr = inputSeletors[i].classList.toString();
							break;
						}

						if(_nSRegex.test(selectorStr)){
							include = false;
							break;
						}
					}
				}

				if(include){
					_reObj.push(inputSeletors[i]);
				}

			}
		}
		return _reObj;
	}

})(jQuery);
