// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

const moo = require("moo");
var fmlStack = [];
var fmlMap = {};

//[ [sep, param], [sep, param] ]
const processFml = ([fml, firstParam, restParams, endFml]) => {
   // console.log(restParams);
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
    console.log("oneString", flatten(arr));
    arr[0].text = flatten(arr).reduce((reduced, item) => reduced + (item.text || ""), "");
    return arr[0];
    // fml.text = fml.text + firstParam +
    //     restParams.reduce((reduced, item) => {
    //         if(!item) return reduced;
    //         return reduced + (item[0].text || "") + (item[1].text || "");
    //     }, "") +
    //     endFml;
    // return fml;
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

const lexer = moo.states({
    main: {
        posArg: {match: /%[0-9]+/, value: (v) => v.replace(/^./, '')},
        dynfml: {match: /\%[\w]+[ \t]*\(/,
            value: name => name.substring(1, name.length-1), push: "fml"},
        number: {match: /[0-9]+/},
        op: {match: /[\+\-\/\*]/},
        fml: {match: /[A-Za-z][A-Za-z0-9]*\(/, push: "fml"},
    },
    fml: {
        endFml : {match: /\)/, pop:true},
        number: {match: /[0-9]+/},
        dynfml: {match: /\%[\w]+[ \t]*\(/,
            value: name => name.substring(1, name.length-1), push: "fml"},
        fml: {match: /[A-Za-z][A-Za-z0-9]*\(/, push: "fml"},
        posArg: {match: /%[0-9]+/, value: (v) => v.replace(/^./, '')},
        param: { match: /[^;\)]+/, lineBreaks: true},
        sep: ";",
        
    }
})


var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "main$ebnf$1", "symbols": []},
    {"name": "main$ebnf$1$subexpression$1", "symbols": [(lexer.has("op") ? {type: "op"} : op), "exp"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "main", "symbols": ["exp", "main$ebnf$1"], "postprocess": flatten},
    {"name": "exp", "symbols": ["fmlXp"], "postprocess": id},
    {"name": "exp", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": id},
    {"name": "exp", "symbols": [(lexer.has("posArg") ? {type: "posArg"} : posArg)], "postprocess": id},
    {"name": "fmlXp", "symbols": ["fml"], "postprocess": id},
    {"name": "fmlXp", "symbols": ["dynfml"], "postprocess": id},
    {"name": "fml$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "fml$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "fml$ebnf$2", "symbols": []},
    {"name": "fml$ebnf$2$subexpression$1", "symbols": [{"literal":";"}, "param"]},
    {"name": "fml$ebnf$2", "symbols": ["fml$ebnf$2", "fml$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fml", "symbols": [(lexer.has("fml") ? {type: "fml"} : fml), "fml$ebnf$1", "fml$ebnf$2", "endFml"], "postprocess": oneString},
    {"name": "dynfml$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "dynfml$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "dynfml$ebnf$2", "symbols": []},
    {"name": "dynfml$ebnf$2$subexpression$1", "symbols": [{"literal":";"}, "param"]},
    {"name": "dynfml$ebnf$2", "symbols": ["dynfml$ebnf$2", "dynfml$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dynfml", "symbols": [(lexer.has("dynfml") ? {type: "dynfml"} : dynfml), "dynfml$ebnf$1", "dynfml$ebnf$2", "endFml"], "postprocess": processFml},
    {"name": "param", "symbols": ["exp2"], "postprocess": id},
    {"name": "exp2", "symbols": ["fmlXp2"], "postprocess": id},
    {"name": "exp2", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": id},
    {"name": "exp2", "symbols": [(lexer.has("posArg") ? {type: "posArg"} : posArg)], "postprocess": id},
    {"name": "fmlXp2", "symbols": ["fml2"], "postprocess": id},
    {"name": "fmlXp2", "symbols": ["dynfml2"], "postprocess": id},
    {"name": "fml2$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "fml2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "fml2$ebnf$2", "symbols": []},
    {"name": "fml2$ebnf$2$subexpression$1", "symbols": [{"literal":";"}, "param"]},
    {"name": "fml2$ebnf$2", "symbols": ["fml2$ebnf$2", "fml2$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fml2", "symbols": [(lexer.has("fml") ? {type: "fml"} : fml), "fml2$ebnf$1", "fml2$ebnf$2", "endFml"], "postprocess": oneString},
    {"name": "dynfml2$ebnf$1", "symbols": ["param"], "postprocess": id},
    {"name": "dynfml2$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "dynfml2$ebnf$2", "symbols": []},
    {"name": "dynfml2$ebnf$2$subexpression$1", "symbols": [{"literal":";"}, "param"]},
    {"name": "dynfml2$ebnf$2", "symbols": ["dynfml2$ebnf$2", "dynfml2$ebnf$2$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dynfml2", "symbols": [(lexer.has("dynfml") ? {type: "dynfml"} : dynfml), "dynfml2$ebnf$1", "dynfml2$ebnf$2", "endFml"], "postprocess": oneString},
    {"name": "endFml", "symbols": [(lexer.has("endFml") ? {type: "endFml"} : endFml)]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
