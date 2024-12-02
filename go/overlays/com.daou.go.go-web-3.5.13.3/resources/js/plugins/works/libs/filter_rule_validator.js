define('works/libs/filter_rule_validator', function(require) {
	
	var worksLang = require("i18n!works/nls/works");
	var lang = {
		"문법에 맞지 않는 입력이 있습니다." : worksLang["문법에 맞지 않는 입력이 있습니다."],	
		"AND 또는 OR 논리연산자를 예상했지만 다른 문자가 입력되었습니다." : worksLang["AND 또는 OR 논리연산자를 예상했지만 다른 문자가 입력되었습니다."],	
		"필터명이 누락되었습니다." : worksLang["필터명이 누락되었습니다."],	
		"필터명이 유효하지 않습니다." : worksLang["필터명이 유효하지 않습니다."],	
		"문자를 예상했지만" : worksLang["문자를 예상했지만"],	
		"문자가 입력되었습니다." : worksLang["문자가 입력되었습니다."],	
		"공백문자를 예상했지만 다른 문자가 입력되었습니다." : worksLang["공백문자를 예상했지만 다른 문자가 입력되었습니다."]
	};
	
	var FilterRuleValidator = function (filters, rule) {
		if (filters === undefined) throw "filters param required.";
		if (rule === undefined) throw "rule param required.";

		this.filters = filters;
		this.scanner = new CharScanner(rule.trim());

		function CharScanner(input) {
			if (input === undefined) throw "Input param required.";
			this.input = input;
			this.cursor = 0;
		}

		CharScanner.prototype.hasNext = function() {
			return this.input.length > this.cursor;
		};

		CharScanner.prototype.next = function(length) {
			if(!length) length = 1;
			var scanned = this.input.substring(this.cursor, this.cursor + length);
			this.cursor += length;
			return scanned;
		};

		CharScanner.prototype.nextUntil = function(endChar) {

			var scanned = '';
			while (this.hasNext()) {
				var ch = this.next();
				if(ch == endChar) {
					this.backward();
					break;
				}
				scanned += ch;
			}

			return scanned;
		};

		CharScanner.prototype.lookahead = function(length) {
			if(!length) length = 1;
			return this.input.substring(this.cursor, this.cursor + length);
		};

		CharScanner.prototype.lookaheadIgnoreSpace = function() {
			var ch = 0;
			var pos = 0;
			while (this.hasNext()) {
				ch = this.input.charAt(this.cursor + pos++);
				if (!/\s/.test(ch)) {
					break;
				}
			}

			return ch;
		};

		//CharScanner.prototype.previousChar = function() {
		//	return this.input.charAt(this.cursor -1);
		//};

		CharScanner.prototype.backward = function(length) {
			if(!length) length = 1;
			this.cursor -= length;
		};

		CharScanner.prototype.forward = function() {
			this.cursor++;
		};

		CharScanner.prototype.getCursor = function() {
			return this.cursor;
		};

		//CharScanner.prototype.scanned = function() {
		//	return this.input.substring(0, this.cursor);
		//};
	};

	/*
	query ::= statement(space operator space statement)*
	operator ::= 'AND' | 'OR'
	space ::= \s*
	statement ::= filter | left-parenthesis space? query space? right-parenthesis
	filter ::= char+
	char ::= 문자
	*/

	FilterRuleValidator.prototype.createResult = function(validate, beginCursor, endCursor, debugMessage) {

		if (validate === undefined) throw "validate parameter cannot be empty.";

		return {
			"validate": validate,
			"beginCursor" : beginCursor,
			"endCursor" : endCursor,
			"debugMessage" : debugMessage
		};
	};

	FilterRuleValidator.prototype.evaluate = function() {

		if(!this.scanner.hasNext()) return this.createResult(true);

		try {
			this.scanQuery();
		} catch(err) {
			return err;
		}

		// TODO n번째 문자에서 문법 오류가 발견됨.
		if(this.scanner.hasNext()) {
			return this.createResult(false, this.scanner.getCursor(), this.scanner.input.length, worksLang["문법에 맞지 않는 입력이 있습니다."]);
		}

		return this.createResult(true);
	};
	// query ::= statement(space operator space statement)*
	FilterRuleValidator.prototype.scanQuery = function() {
		this.scanStatement();
		while(this.scanner.hasNext() && this.scanner.lookaheadIgnoreSpace() != ')') {
			this.scanSpace();
			this.scanOperator();
			this.scanSpace();
			this.scanStatement();
		}
	};
	// operator ::= 'AND' | 'OR'
	FilterRuleValidator.prototype.scanOperator = function() {

		var scanLength = 0;
		if("OR" == this.scanner.lookahead(2).toUpperCase()) {
			scanLength = 2;
		} else if ("AND" == this.scanner.lookahead(3).toUpperCase()) {
			scanLength = 3;
		} 

		if(scanLength > 0) {
			this.scanner.next(scanLength);
			return;
		}

		var beginCursor = this.scanner.getCursor();
		this.scanner.nextUntil(' ');
		var endCursor = this.scanner.getCursor();

		throw this.createResult(false, beginCursor, endCursor, worksLang["AND 또는 OR 논리연산자를 예상했지만 다른 문자가 입력되었습니다."]);
	};

	// statement ::= filter | left-parenthesis space? query space? right-parenthesis
	FilterRuleValidator.prototype.scanStatement = function() {

		var ch = this.scanner.lookahead();
		if(ch == '(') {
			this.scanChar('(');
			this.skipSpace();
			this.scanQuery();
			this.skipSpace();
			this.scanChar(')');
			return;
		}

		this.scanFilter();
	};
	// filter ::= char+
	FilterRuleValidator.prototype.scanFilter = function() {
		// filter명으로 올 수 없는 문자들: 공백, 닫히는 괄호
		var filterName = '';
		var beginCursor = this.scanner.getCursor();
		while(this.scanner.hasNext()) {
			var ch = this.scanner.next();
			if(/\s|\(|\)/.test(ch)) {
				this.scanner.backward();
				break;
			}
			filterName += ch;
		}

		var endCursor = this.scanner.getCursor();
		if(filterName == '') throw this.createResult(false, beginCursor, endCursor, worksLang["필터명이 누락되었습니다."]);

		if(this.filters.indexOf(filterName)<0) {
			throw this.createResult(false, beginCursor, endCursor, worksLang["필터명이 유효하지 않습니다."]);
		}
	};

	//left-parenthesis ::= '('
	//right-parenthesis ::= ')'
	FilterRuleValidator.prototype.scanChar = function(ch) {
		var lookahead = this.scanner.lookahead();
		if (ch == lookahead) {
			this.scanner.forward();
			return;
		}

		throw this.createResult(false, this.scanner.getCursor(), this.scanner.getCursor() + 1, "'" + ch + "' " + worksLang["문자를 예상했지만"] + " '" + lookahead + "' " + worksLang["문자가 입력되었습니다."]);
	};

	// space ::= \s*
	FilterRuleValidator.prototype.scanSpace = function() {
		if (!this.skipSpace()) {
			throw this.createResult(false, this.scanner.getCursor(), this.scanner.getCursor() + 1, worksLang["공백문자를 예상했지만 다른 문자가 입력되었습니다."]);
		}
	};


	FilterRuleValidator.prototype.skipSpace = function() {
		var space = false;
		while(this.scanner.hasNext() && /\s/.test(this.scanner.lookahead())) {
			this.scanner.next();
			space = true;
		}

		return space;
	};

	FilterRuleValidator.prototype.cursor = function() {
		return this.scanner.getCursor();
	};

	return FilterRuleValidator;
});
