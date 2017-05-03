function mutualSubsets(s1, s2){
   if (s1.length !== s2.length){
      return false;
   }

   return isSubset(s1,s2) && isSubset(s2,s1);
}

//checks if Set s1 is subset of s2
function isSubset(s1,s2){
   var flag = true;

   for(let i of s1.values()){
      flag = true;
      for(let j of s2.values()){
         if(i == j){
            flag = false;
            break;
         }
      }
      //If flag here, then some value i in s1 is not present in s2
      if(flag) break;
   }

   return !flag;
}

var s1 = {"key":[1,2,3,4,5]};
var s2 = new Set([1,2,3,6,5]);

s1["key2"] = "fuck";
console.log(s1);
