// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

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

var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": ["exp"], "postprocess": id},
    {"name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "main$ebnf$1$subexpression$1", "symbols": [(lexer.has("op") ? {type: "op"} : op), "main$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "main", "symbols": ["exp", "main$ebnf$1"], "postprocess": stylize},
    {"name": "exp", "symbols": ["fmlXp"], "postprocess": id},
    {"name": "exp", "symbols": ["primitive"], "postprocess": id},
    {"name": "exp", "symbols": [(lexer.has("narg") ? {type: "narg"} : narg)], "postprocess": id},
    {"name": "primitive", "symbols": [(lexer.has("nb") ? {type: "nb"} : nb)], "postprocess": id},
    {"name": "primitive", "symbols": ["quote"], "postprocess": id},
    {"name": "primitive", "symbols": [(lexer.has("bool") ? {type: "bool"} : bool)], "postprocess": id},
    {"name": "primitive", "symbols": ["rng"], "postprocess": id},
    {"name": "primitive", "symbols": [(lexer.has("arr") ? {type: "arr"} : arr)], "postprocess": id},
    {"name": "fmlXp", "symbols": ["fml"], "postprocess": id},
    {"name": "fmlXp", "symbols": ["dynfml"], "postprocess": id},
    {"name": "fml$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "fml$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "fml$ebnf$2", "symbols": []},
    {"name": "fml$ebnf$2$subexpression$1$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "fml$ebnf$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "fml$ebnf$2$subexpression$1", "symbols": [(lexer.has("sep") ? {type: "sep"} : sep), "fml$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "fml$ebnf$2", "symbols": ["fml$ebnf$2", "fml$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fml$ebnf$3", "symbols": [(lexer.has("_fml") ? {type: "_fml"} : _fml)], "postprocess": id},
    {"name": "fml$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "fml", "symbols": [(lexer.has("fml_") ? {type: "fml_"} : fml_), "fml$ebnf$1", "fml$ebnf$2", "fml$ebnf$3"]},
    {"name": "dynfml$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "dynfml$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "dynfml$ebnf$2", "symbols": []},
    {"name": "dynfml$ebnf$2$subexpression$1$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "dynfml$ebnf$2$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "dynfml$ebnf$2$subexpression$1", "symbols": [(lexer.has("sep") ? {type: "sep"} : sep), "dynfml$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "dynfml$ebnf$2", "symbols": ["dynfml$ebnf$2", "dynfml$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dynfml$ebnf$3", "symbols": [(lexer.has("_fml") ? {type: "_fml"} : _fml)], "postprocess": id},
    {"name": "dynfml$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "dynfml", "symbols": [(lexer.has("dynfml_") ? {type: "dynfml_"} : dynfml_), "dynfml$ebnf$1", "dynfml$ebnf$2", "dynfml$ebnf$3"]},
    {"name": "rng", "symbols": [(lexer.has("a1b1") ? {type: "a1b1"} : a1b1)], "postprocess": id},
    {"name": "rng", "symbols": [(lexer.has("r1c1") ? {type: "r1c1"} : r1c1)], "postprocess": id},
    {"name": "quote$ebnf$1", "symbols": [(lexer.has("quoted") ? {type: "quoted"} : quoted)], "postprocess": id},
    {"name": "quote$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "quote$ebnf$2", "symbols": [(lexer.has("_str") ? {type: "_str"} : _str)], "postprocess": id},
    {"name": "quote$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "quote", "symbols": [(lexer.has("str_") ? {type: "str_"} : str_), "quote$ebnf$1", "quote$ebnf$2"], "postprocess": concatAll},
    {"name": "param", "symbols": ["main"], "postprocess": id}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
