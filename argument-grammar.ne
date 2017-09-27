@{%
const moo = require("moo");

module.exports.args = [];

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
    argIndex.value = module.exports.args[Number(argIndex.value)] || "";
    return argIndex;
}
%}

@lexer lexer

main -> exp {%flatten%}
exp -> (%escaped {%id%} | %dynfml {%id%} |
    %quoted {%id%} | %argument {%replaceArg%} |
    %anythingElse {%id%}):*