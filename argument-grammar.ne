@preprocessor typescript
@{%
declare var exports:any;
declare var require:any;
declare var module:any;

var module = module || {exports};
const context:any = !!module ? module.exports : {}

const moo = require("moo");

const lexer = moo.compile({
    arr: {match: /\{[^{}]+\}/},
 //   escaped: {match: /\\%[0-9]+/, value: (str) => str.replace(/^\\+/, '')},
    quoted: {match: /"[^"]*"/},
    argument: {match: /%[0-9]+/, value: (arg) => arg.replace(/^\%/, '')},
    dynfml: {match: /\%[\w]+[ \t]*\(/ },
    r2c2: {match: /\s*\%[Rr][\+\-][0-9]+[Cc][\+\-][0-9]+\s*/},
    r1c1: {match: /\s*\%[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\])(?:[Rr](?:[0-9]+|\[-?[0-9]+\])[Cc](?:[0-9]+|\[-?[0-9]+\]))?\s*/},
    
    anythingElse: {match: /[^%]+/, lineBreaks: true},
    
});

const nuller = () => null;
const flatten = (arr) => arr[0][0];
const replaceArg = ([argIndex]) => { console.log("processed? ", argIndex.processed)
    if(!!argIndex.processed) return argIndex;

    argIndex.processed = true;
    argIndex.value = context.args[Number(argIndex.value)] || "";
    argIndex.text = argIndex.value;
    return argIndex;
}
%}

@lexer lexer

main -> exp {%flatten%}
exp -> (%dynfml {%id%} |
    %quoted {%id%} | %argument {%replaceArg%} | %r1c1 {%id%} | %r2c2 {%id%} | 
    %anythingElse {%id%}):*