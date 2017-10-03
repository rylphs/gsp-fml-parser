    const parser = require("./formula-parser.js")

const nearley = require("nearley");
const grammar2 = require("./argument-grammar.js");

var map = {
    f0: "sumproduct(325;%0)",
    formula: "sum(%0;%1)/%0",
    f2: "sum(%0;count(5))/%0",
    f3: "sum(25)*%formula(%0;8)+3",
    f4: "sum(%f0(25))*%0"
}

const test = function(){
    var testInput = [
        {text: "%formula (5 ; \" 6\" ) + sum(10 )", result: "(sum(5;\" 6\")/5)+sum(10)"},
        {text: "%f2( s(32) )+sum(10)", result: "(sum(s(32);count(5))/s(32))+sum(10)"},
        {text: "%f3(9)", result: "(sum(25)*(sum(9;8)/9)+3)"},
        {text: "%f4(56)", result: "(sum((sumproduct(325;25)))*56)"},
        {text: "%f4(%r0c0)", result: "(sum((sumproduct(325;25)))*INDIRECT(\"r0c0\";FALSE))"},
        {text: "%f3(A5)", result: "(sum(25)*(sum(A5;8)/A5)+3)"},
    ];

    for(var i in testInput){
        var input = testInput[i];
        console.log("\n\n");
        console.log("Testing input ", input.text);
        var parsed = parser.parse(map, input.text);
        
        if(parsed !== input.result)
            throw "Expected: " + input.result +" but was: " + parsed;
        console.log("result: ", parsed);
    }
    console.log("All passed!");
}

function teste2(){
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar2));
    grammar2.args = ["$arg1","$arg2","$arg3", "$arg4"];
    parser.feed('teste"%0"%1as%3\\dfa\\%2"sdfgdfg%3"%4');
    var results = parser.results[0];
    var result = "";
    for(var i in results){
        result += results[i].value;
    }
    console.log("result", result);
}

test();

