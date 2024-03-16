let A={
    "001":[11],
    "002":[8,10,11,12],
}

let time=10;
let flag=false;

for (var i in A) {
    checker(A[i], time, flag);
    console.log(flag);
}

function checker(arr, tar, flag){
    for(var i=0; i<arr.length; i++){
        if(arr[i]===tar){
            console.log("empty room is there");
            flag=true;
        }
    }
}

