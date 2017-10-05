@{%
/*declare var exports:any;
declare var require:any;
declare var module:any;*/

const moo = require("moo");

var ext = function(base, extension) {
    extension = extension || {};

    for(var i in base){
        extension[i] = extension[i] || base[i];
    }

    return extension;
}

var token = function(name, xt){
    var tokens = {
        lp: {match:/\(/},
        rp: {match:/\)/},
        narg: {match: /\s*%[0-9]+\s*/},
        dynfml: {match: /\s*\%[\w]+[\s]*\(\s*/},
        number: {match: /\s*[0-9]+\s*/},
        op: {match: /\s*[\+\-\/\*]\s*/},
        fml: {match: /\s*(?:[A-Za-z][A-Za-z0-9]*)?\s*\(\s*/},
        a1b1: {
            match: /\s*(?:[a-zA-Z]+[0-9]+(?:\:[a-zA-Z]+[0-9]+)?|[a-zA-Z]+\:[a-zA-Z]+|[0-9]+\:[0-9]+)\s*/},
        endfml : {match: /\s*\)\s*/},
        r1c1: {match: /\s*\%[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?\s*/},
        sep: {match: /\s*;\s*/},
        str_: {match:/\s*"/},
        _str: {match:/"\s*/},
        bool: {match: /(?:[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])/},
        arr: {match: /\{[^\{\}]+\}/}
    };

    return ext(tokens[name], xt);
}

const mainState = {
    nb: token("number"),
    fml_: token("fml"),
    a1b1: token("a1b1"),
    r1c1:  token("r1c1"),
    
    op: token("op"),
    str_: token("str_", {push: "str"}),
    
    dynfml_: token("dynfml"),
    _fml: token("endfml"),
    arr: token("arr"),
    narg: token("narg"),
    bool: token("bool"),
    sep: token("sep"),
}

const fmlState = ext(mainState, {
    _fml: token("endfml", {pop:true})
});

const dynfmlState = ext(mainState, {
    _fml: token("endfml", {pop:true})
});

const strState = {
    quoted: {match: /[^"]+/, lineBreaks: true},
    _str: token("_str", {pop: true})
}



const lexer = moo.states({
    main: mainState,
    str: strState
});

const concatAll = (arr) => { 
   arr[0].value = arr.reduce((text, item)=> text + (!item ? "" : item.value), "");
    return arr[0];
}

const flatten = (arr) => {
    return arr.reduce((flat, item) =>{
        if(item instanceof Array)
            flat.push.apply(flat, flatten(item));
        else if(!!item) flat.push(item);
        return flat;
    },[]);
}

const stylize = (arr) => { 
    return flatten(arr).map((token) => {
        if(token.type == '_fml') {
            token.text = token.value + '</span>';
            return token;
        }
        token.text = '<span class="tk ' +
            token.type +
            '">' + token.value;
        if(token.type == 'fml_' || token.type == 'dynfml_') return token;
        token.text += '</span>';

        return token;
    });
}

%}
@lexer lexer

main -> exp (%op exp:?):* {%stylize%}
exp -> fmlXp {%id%} | primitive {%id%} | %narg {%id%} 
primitive -> %nb {%id%} | quote {%id%} | %bool {%id%} | rng {%id%} | %arr {%id%}
fmlXp -> fml {%id%} | dynfml {%id%}
fml -> %fml_ param:? (%sep param:?):* %_fml:?
dynfml -> %dynfml_ param:? (%sep param:?):* %_fml:?
rng -> %a1b1 {%id%} | %r1c1 {%id%}
quote -> %str_ %quoted:? %_str:? {%concatAll%}
param -> main {%id%}

