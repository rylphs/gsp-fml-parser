@preprocessor typescript
@{%
declare var exports:any;
declare var require:any;
declare var module:any;

const moo = require("moo");
var fmlStack = [];
var fmlMap = {};

const processFml = ([fml, firstParam, restParams, endFml]) => {
    fml.args = firstParam ? 
        [firstParam.value].concat(restParams.map((item)=> item[1].value)) :
        [];
    return fml;
}

const text2Value = ([item]) =>{
    item.text = item.value;
    return item;
}

const processParam = (arr) => {
    var arg = arr[0];
    if(fmlStack.length <= 0) return arg;
    var fml = fmlStack.pop();
    
    fml.args = fml.args || [];
    fml.args.push(arg.value);
    fmlStack.push(fml);
    return arg;
}

const oneString = (arr) => {
    arr[0].text = flatten(arr).reduce((reduced, item) => {
        reduced += (item.text || "")
        return reduced;
    }, "");
    arr[0].value = arr[0].text;
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

const trim = (v) => v.trim();
const removePercent = (v) => v.trim().replace(/^\%/, '');
const formatFml = (v) => v.trim().replace(/\s*\%([\w]+)[\s]*\(\s*/, '$1');
const removeSpaces = (v) => v.replace(/\s*/g, '');

const token = function(name, opt:any = {}){
    var tks = {
        lp: {match:/\(/, value: trim},
        rp: {match:/\)/, value: trim},
        posArg: {match: /\s*%[0-9]+\s*/, value: removePercent},
        dynfml: {match: /\s*\%[\w]+[\s]*\(\s*/, value: formatFml},
        number: {match: /\s*(?:[0-9]?[,\.])?[0-9]+\s*/, value: trim},
        op: {match: /\s*(?:<>|<=|>=|[\^\+\-\/\*><=])\s*/, value: trim},
        fml: {match: /\s*(?:[A-Za-z][A-Za-z0-9]*)?\s*\(\s*/, value: removeSpaces},
        a1b1: {
            match: /\s*(?:[a-zA-Z]+[0-9]+(?:\:[a-zA-Z]+[0-9]+)?|[a-zA-Z]+\:[a-zA-Z]+|[0-9]+\:[0-9]+)\s*/,
            value: trim},
        endFml : {match: /\s*\)\s*/, pop:true, value: trim},
        r1c1: {match: /\s*\%[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?\s*/,
            value: (r1c1) => 'INDIRECT("'+trim(r1c1).toUpperCase().replace(/^\%/,'')+'";FALSE)'},
        r2c2: {match: /\s*\%[Rr][\+\-][0-9]+[Cc][\+\-][0-9]+\s*/, 
            value: (r1c1) => 'INDIRECT("' + 
                trim(r1c1).toUpperCase().replace(/^\%/,'').replace(/([\+\-][0-9]+)/g, '[$1]').replace(/\+/g, '') + 
                '";FALSE)'},
        sep: {match: /\s*;\s*/, value:trim},
        quote_: {match:/\s*"/, value: trim},
        _quote: {match:/"\s*/, value: trim},
        boolean: {match: /(?:[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee])/, value: trim},
        arr: {match: /\{[^\{\}]+\}/, value: trim}
    };

    var tk = tks[name];
    for(var i in opt){
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
        r2c2: token("r2c2"),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        quote_: token("quote_", {push: "quote"}),
        boolean: token("boolean"),
        arr: token("arr")
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
        op: token("op"),
        dynfml: token("dynfml", {push: "fml"}),
        fml: token("fml", {push: "fml"}),
        posArg: token("posArg"),
        r2c2: token("r2c2"),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        sep: token("sep"),
        arr: token("arr")
    }
})


%}

@lexer lexer

main -> exp (%op exp):* {%flatten%}
exp -> fmlXp {%id%} | primitive {%id%} | %posArg {%id%} 
primitive -> %number {%id%} | quote {%id%} | %boolean {%id%} | rng {%id%} | %arr {%id%}
fmlXp -> fml {%id%} | dynfml {%id%}
fml -> %fml param:? (%sep param):* endFml {%processFml%}
dynfml -> %dynfml param:? (%sep param):* endFml {%processFml%}
rng -> %a1b1 {%id%} | %r1c1 {%text2Value%} | %r2c2 {%text2Value%}
quote -> %quote_ %quoted:? %_quote {%oneString%}
endFml -> %endFml {%id%}

param -> main2 {%id%}

main2 -> exp2 (%op exp2):* {%oneString%}
exp2 -> fmlXp2 {%id%} | primitive {%id%} | %posArg {%id%}
fmlXp2 -> fml2 {%id%} | dynfml2 {%id%}
fml2 -> %fml param:? (%sep param):* endFml {%oneString%}
dynfml2 -> %dynfml param:? (%sep param):* endFml {%oneString%}

