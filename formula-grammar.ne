@{%
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


%}

@lexer lexer

main -> exp (%op exp):* {%flatten%}
exp -> fmlXp {%id%} | %number {%id%} | %posArg {%id%}
fmlXp -> fml {%id%} | dynfml {%id%}
fml -> %fml param:? (";" param):* endFml {%oneString%}
dynfml -> %dynfml param:? (";" param):* endFml {%processFml%}

param -> exp2 {%id%}
exp2 -> fmlXp2 {%id%} | %number {%id%} | %posArg {%id%}
fmlXp2 -> fml2 {%id%} | dynfml2 {%id%}
fml2 -> %fml param:? (";" param):* endFml {%oneString%}
dynfml2 -> %dynfml param:? (";" param):* endFml {%oneString%}
endFml -> %endFml