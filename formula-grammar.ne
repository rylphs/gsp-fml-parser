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

const token = function(name, opt:any = {}){
    var tks = {
        posArg: {match: /%[0-9]+/, value: (v) => v.replace(/^./, '')},
        dynfml: {match: /\%[\w]+[ \t]*\(/,
            value: name => name.substring(1, name.length-1)},
        number: {match: /[0-9]+/},
        op: {match: /[\+\-\/\*]/},
        fml: {match: /[A-Za-z][A-Za-z0-9]*\(/},
        a1b1: {match: /(?:[a-zA-Z]+[0-9]+(?:\:[a-zA-Z]+[0-9]+)?|[a-zA-Z]+\:[a-zA-Z]+|[0-9]+\:[0-9]+)/},
        endFml : {match: /\)/, pop:true},
        dynrng2: {match: /\%(?:[RrCc]|[Rr][Cc])/},
        dynrng: {match: /\%(?:[RrCc]|[Rr][Cc])(?:[\>\<\+\-][0-9]+[RrCc]?)*/},
        r1c1: {match: /[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?/,
            value: (r1c1) => 'INDIRECT("'+r1c1+'";FALSE)'},
        param: { match: /[^;\)]+/, lineBreaks: true},
        sep: ";",
        rngop: {match: /[\>\<\+\-]/},
        rngcount: {match: /[0-9]+/, value: n => Number(n)},
        rngtp: {match:/(?:rows|cols)/},
        rp: {match: /\)/, pop: true},
        pspl: {match: /;/, pop:true},
        spc: {match: /[\t ]+/, pop:true}
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
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        dynrng: token("dynrng"),
    },
    fml: {
        endFml : token("endFml", {pop:true}),
        number: token("number"),
        dynfml: token("dynfml", {push: "fml"}),
        fml: token("fml", {push: "fml"}),
        posArg: token("posArg"),
        r1c1: token("r1c1"),
        a1b1: token("a1b1"),
        dynrng: token("dynrng"),
        //param: token("param"),
        sep: token("sep"),
    }
})


%}

@lexer lexer

main -> exp (%op exp):* {%flatten%}
exp -> fmlXp {%id%} | %number {%id%} | %posArg {%id%} | rng {%id%}
fmlXp -> fml {%id%} | dynfml {%id%}
fml -> %fml param:? (";" param):* endFml
dynfml -> %dynfml param:? (";" param):* endFml {%processFml%}
rng -> %a1b1 {%id%} | %r1c1 {%id%}

param -> exp2 {%id%}
exp2 -> fmlXp2 {%id%} | %number {%id%} | %posArg {%id%} | rng {%id%}
fmlXp2 -> fml2 {%id%} | dynfml2 {%id%}
fml2 -> %fml param:? (";" param):* endFml {%oneString%}
dynfml2 -> %dynfml param:? (";" param):* endFml {%processFml%}
endFml -> %endFml