const parser = require("./formula-parser.js")

var map = {
    f0: "sumproduct(325;%0)",
    formula: "sum(%0;%1)/%0",
    f2: "sum(%0;count(5))/%0",
    f3: "sum(25)*%formula(%0;8)+3",
    f4: "sum(%f0(25))*%0"
}

const test = function(){
    var testInput = [
       /* {text: "%formula(5;6)+sum(10)", result: "(sum(5;6)/5)+sum(10)"},
        {text: "%f2(s(32))+sum(10)", result: "(sum(s(32);count(5))/s(32))+sum(10)"},*/
        {text: "%f3(9)", result: "(sum(25)*(sum(9;8)/9)+3)"},
        {text: "%f4(56)", result: "(sum(sumproduct(325;25))*56)"},
    ];

    for(var i in testInput){
        var input = testInput[i];
        var parsed = parser.parse(map, input.text);
        console.log("Testing input ", input.text);
        if(parsed !== input.result)
            throw "Expected: " + input.result +" but was: " + parsed;
        console.log("result: ", parsed);
    }
    console.log("All passed!");
}

test();

