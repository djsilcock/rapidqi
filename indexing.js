
const tags=process.argv.slice(2).map(Number).sort()
const numTags=Math.max(...tags)
var combinations=[]
function getCombinations(prefix){
  
  for (let a=prefix[prefix.length-1]+1;a<numTags;a++){	
	if (tags.includes(a)) getCombinations(prefix.concat([a]))
	}
	
	combinations.push(prefix.concat([numTags]).slice(1))
}
time1=Date.now()
getCombinations([0])
time2=Date.now()
console.log(combinations)
console.log(combinations.length)
console.log(time2-time1)


