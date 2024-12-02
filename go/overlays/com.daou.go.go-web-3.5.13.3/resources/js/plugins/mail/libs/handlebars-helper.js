Handlebars.registerHelper('equal', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

Handlebars.registerHelper('notEqual', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue!=rvalue ) {
    	return options.fn(this);
    } else {
    	return options.inverse(this);
    }
});

Handlebars.registerHelper('greateThen', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if(Number(lvalue) > Number(rvalue)) {
        return options.fn(this);
    } else {
    	return options.inverse(this);
    }
});

Handlebars.registerHelper('lessThen', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if(Number(lvalue) < Number(rvalue)) {
        return options.fn(this);
    } else {
    	return options.inverse(this);
    }
});

Handlebars.registerHelper('contains', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if(lvalue && lvalue.indexOf(rvalue) > -1) {
    	return options.fn(this);
    } else {
    	return options.inverse(this);
    }
});

Handlebars.registerHelper('startWidth', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if(lvalue && lvalue.indexOf(rvalue) == 0) {
    	return options.fn(this);
    } else {
    	return options.inverse(this);
    }
});

Handlebars.registerHelper('notStartWidth', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if( lvalue.indexOf(rvalue) == -1) {
    	return options.fn(this);
    } else {
    	return options.inverse(this);
    }
});

Handlebars.registerHelper('each_with_index', function(context, options) {
	  var fn = options.fn, inverse = options.inverse;
	  var ret = "";

	  if(context && context.length > 0) {
	    for(var i=0, j=context.length; i<j; i++) {
	    	var item = context[i];
	    	var itemObject = {};
	    	if(typeof  item != 'object'){
	    	   itemObject.name=item;
	    	   itemObject.isFirst = (i==0);
               itemObject.isLast = (i==(context.length-1));
               itemObject.index = i+1;
               ret = ret + fn(itemObject);
	    	}else{
	    	  item.isFirst = (i==0);
              item.isLast = (i==(context.length-1));
              item.index = i+1;
              ret = ret + fn(item);    
	    	}
	    	
	    }
	  } else {
	    ret = inverse(this);
	  }
	  return ret;
});

Handlebars.registerHelper('replaceAll', function(text, oldText, replaceText, options) {
	if (!text) text = "";
	return text.split(oldText).join(replaceText);
});

Handlebars.registerHelper('calcMod', function(lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if((Number(lvalue) % Number(rvalue)) == 0) {
    	return options.fn(this);
    } else {
    	return options.inverse(this);
    }
});

Handlebars.registerHelper('applyTemplate', function(name, context, options){
   var subTemplate = Handlebars.compile(jQuery('#'+name).html()); 
   var subTemplateContext = jQuery.extend(context,this,options.hash);
   return new Handlebars.SafeString(subTemplate(subTemplateContext));
});

Handlebars.registerHelper('empty', function(data, options) {
	data = jQuery.trim(data);
	if(!data || data == ""|| data.length == 0) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});
Handlebars.registerHelper('notEmpty', function(data, options) {
	data = jQuery.trim(data);
	if(data != "") {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});
Handlebars.registerHelper('formatSize', function(data, options) {
	return printSize(data);
});
Handlebars.registerHelper('isArray', function(data, options) {
	
	if(data && data.length > 0  ) {
		  return options.fn(this);
	   } else {
	    	return options.inverse(this);
	   }
});
Handlebars.registerHelper('isImgFile', function(fileName, options) {
	if(isImgFile(fileName)) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});
Handlebars.registerHelper("debug", function(optionalValue) { 
	console.log("===================="); 
	if (optionalValue) { 
		console.log("Value"); 
		console.log(optionalValue); 
	}
	console.log("===================="); 
});
Handlebars.registerHelper("printThis", function(optionalValue) { 
	return optionalValue;
});

Handlebars.registerHelper('getEmailNotInCompanyDomain', getEmailNotInCompanyDomain);

Handlebars.registerHelper("printEmailAddress", function(optionalValue) {
	return getFormatName(optionalValue, MAIL_EXPOSURE==false , LOCAL_DOMAIN);
});

Handlebars.registerHelper('ifAnd', function(option1, option2, options) {
	if(option1 && option2){
		return options.fn(this);
	}
	return options.inverse(this);
});