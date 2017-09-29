@preprocessor typescript
@{%
declare var exports:any;
declare var require:any;
declare var module:any;

const moo = require("moo");

const lexer = moo.compile({
    rngst: {match:/%(?:row|col|cell)/},
    op: {match: /[\<\>\+\-]/},
    count: {match: /[0-9]+/},
    opType: {match: /(?:row|col)s?/}
});

var values = [];
var currentValue = [0,0,0,0];
var shiftPlus;
var signal;
var count;
var colRow;

const ungroup = (arr) => {
    return [arr[0]].concat(arr[1].reduce((flat, item)=>{
        flat.push.apply(flat, item);
        return flat;
    }, []));
}

const parseStart = ([rng]) => rng.value;

const parseOp = ([op]) => {
    currentValue = [0,0,0,0]
    values.push(currentValue);
    signal = ("+>".indexOf(op.value) >= 0) ? 1 : -1;
    shiftPlus = ("<>".indexOf(op.value) >= 0) ? 0 : 1;
    return null;
}

const parseCount = ([c]) => {
    count = c.value;
    return null;
}

const parseOpType = ([op]) => { console.log("cols".indexOf(op.value));
    var paramArray = [0,0];
    colRow = ("cols".indexOf(op.value) >= 0) ? 1 : 0;
    var index = 2 * shiftPlus + colRow;
    paramArray[index] = signal * count;
    return paramArray; 
}

%}
@lexer lexer

main -> rngst (op count opType):* {%ungroup%}
rngst -> %rngst {%parseStart%}
op -> %op {%parseOp%}
count -> %count {%parseCount%}
opType -> %opType {%parseOpType%}

