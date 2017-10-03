@preprocessor typescript
@{%
declare var exports:any;
declare var require:any;
declare var module:any;

const moo = require("moo");
var fmlStack = [];
var fmlMap = {};

const processFml = ([fml, firstParam, restParams, endFml]) => {
    fml.args = [firstParam.text].concat(restParams.map((item)=> item[1].text))
    return fml;
}

const processParam = (arr) => {
    var arg = arr[0];
    if(fmlStack.length <= 0) return arg;
    var fml = fmlStack.pop();
    
    fml.args = fml.args || [];
    fml.args.push(arg.text);
    fmlStack.push(fml);
    return arg;
}

const oneString = (arr) => {
    arr[0].text = flatten(arr).reduce((reduced, item) => reduced + (item.text || ""), "");
    return arr[0];
}

const cpValue2Text = ([item]) => {
    item.text = item.value;
    return item;
}

const processEndFml = (arr) => {
    fmlStack.pop();
    return null;
} 

const flatten = (arr) => {
    return arr.reduce((flat, item) =>{
        if(item instanceof Array)
            flat.push.apply(flat, flatten(item));
        else if(!!item) flat.push(item);
        return flat;
    },[]);
}

const trim = (v) => v.replace(/^\s*([^"]+)\s*$/, '$1');
const removePercent = (v) => trim(v).replace(/^\%/, '');
const formatFml = (v) => v.replace(/\s*\%([\w]+)[\s]*\(\s*/, '$1');
const removeSpaces = (v) => v.replace(/\s*/g, '');

const token = function(name, opt:any = {}){
    var tks = {
        posArg: {match: /\s*%[0-9]+\s*/, value: removePercent},
        dynfml: {match: /\s*\%[\w]+[\s]*\(\s*/, value: formatFml},
        number: {match: / *[0-9]+ */, value: removeSpaces},
        op: {match: /\s*[\+\-\/\*]\s*/, value: removeSpaces},
        fml: {match: /\s*[A-Za-z][A-Za-z0-9]*\s*\(\s*/, value: removeSpaces},
        a1b1: {
            match: /\s*(?:[a-zA-Z]+[0-9]+(?:\:[a-zA-Z]+[0-9]+)?|[a-zA-Z]+\:[a-zA-Z]+|[0-9]+\:[0-9]+)\s*/,
            value: trim},
        endFml : {match: /\s*\)\s*/, pop:true, value: trim},
        r1c1: {match: /\s*\%[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?\s*/,
            value: (r1c1) => 'INDIRECT("'+trim(r1c1).replace(/^\%/,'')+'";FALSE)'},
        sep: {match: /\s*;\s*/, value:trim},
        spc: {match: /[\t ]+/, pop:true},
        quote_: {match:/\s*"/, value: trim},
        _quote: {match:/"\s*/, value: trim},
        boolean: {match: /(?:[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])/}
    };

    var tk = tks[name];
    for(var i in opt){ console.log(name, tk);
        tk[i] = opt[i];
    }
    return tk;
}


const lexer = moo.states({
    main: {
        posArg: token("posArg"),
        dynfml: token("dynfml", {push: "fml"}),
        number: token("number"),
        op: token("op"),
        fml: token("fml", {push: "fml"}),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        quote_: token("quote_", {push: "quote"}),
        boolean: token("boolean")
    },
    quote:{
        _quote: token("_quote", {pop: true}),
        quoted: {match: /[^"]+/, lineBreaks: true}
    },
    fml: {
        boolean: token("boolean"),
        quote_: token("quote_", {push: "quote"}),
        endFml : token("endFml", {pop:true}),
        number: token("number"),
        dynfml: token("dynfml", {push: "fml"}),
        fml: token("fml", {push: "fml"}),
        posArg: token("posArg"),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        sep: token("sep"),
    }
})


%}

@lexer lexer

main -> exp (%op exp):* {%flatten%}
exp -> fmlXp {%id%} | primitive {%id%} | %posArg {%id%} | rng {%id%}
primitive -> %number {%cpValue2Text%} | quote {%id%} | %boolean {%id%}
fmlXp -> fml {%id%} | dynfml {%id%}
fml -> %fml param:? (%sep param):* endFml
dynfml -> %dynfml param:? (%sep param):* endFml {%processFml%}
rng -> %a1b1 {%id%} | %r1c1 {%cpValue2Text%}
quote -> %quote_ %quoted %_quote {%oneString%}

param -> exp2 {%id%}
exp2 -> fmlXp2 {%id%} | %posArg {%id%} | rng {%id%} | primitive {%id%}
fmlXp2 -> fml2 {%id%} | dynfml2 {%id%}
fml2 -> %fml param:? (%sep param):* endFml {%oneString%}
dynfml2 -> %dynfml param:? (%sep param):* endFml {%processFml%}

endFml -> %endFml {%cpValue2Text%}