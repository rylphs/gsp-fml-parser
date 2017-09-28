@preprocessor typescript
@{%
declare var exports:any;
declare var require:any;
declare var module:any;

var module = module || {exports};
const context:any = !!module ? module.exports : {}

const moo = require("moo");

const lexer = moo.compile({
    escaped: {match: /\\%[0-9]+/, value: (str) => str.replace(/^\\+/, '')},
    quoted: {match: /"[^"]*"/},
    argument: {match: /%[0-9]+/, value: (arg) => arg.replace(/^\%/, '')},
    dynfml: {match: /\%[\w]+[ \t]*\(/ },
    anythingElse: {match: /(?:\\[^%])?[^%"\\]+/, lineBreaks: true} 
});

const nuller = () => null;
const flatten = (arr) => arr[0][0];
const replaceArg = ([argIndex]) => {
    argIndex.value = context.args[Number(argIndex.value)] || "";
    return argIndex;
}
%}

@lexer lexer

main -> exp {%flatten%}
exp -> (%escaped {%id%} | %dynfml {%id%} |
    %quoted {%id%} | %argument {%replaceArg%} |
    %anythingElse {%id%}):*