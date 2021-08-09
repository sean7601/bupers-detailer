function strongConsole(obj){
  console.log(JSON.parse(JSON.stringify(obj)));
}




function findMatches(menPreferences,womenPreferences){
  console.log(menPreferences,womenPreferences);
    var engaged = {}
    const bachelors = Object.entries(menPreferences)
    .map(([man, preferences]) => [man, preferences])


    while (bachelors.length) {
    const [man, preferences] = bachelors.shift()
    const woman = preferences.shift()
    if (!engaged[woman]) {
        engaged[woman] = man
        engaged[man] = woman
    } else {
        const currentMan = engaged[woman]
        const womanPreferences = womenPreferences[woman]


        if(man == "ff"){
          console.log(woman,man,currentMan,womanPreferences,preferences)
        }
        // Smaller index value is more preferable.
        if (womanPreferences.indexOf(man) < womanPreferences.indexOf(currentMan)) {
        engaged[woman] = man
        engaged[man] = woman
        bachelors.unshift([currentMan, menPreferences[currentMan]])
        } else {
        // Reject.
        
       // console.log('man is rejected', man)
        bachelors.unshift([man, preferences])
        }
    }
    }


    return engaged;

}

function scoreMatches(matches){
  console.log(matches)
  let count = 0
  let over3 = 0
  let total = 0
  let matchSummary = [];
  console.log(matches)
  for(let prop in matches){
    if(findWithAttr(buildPeople.people, "name", prop) == -1){
      continue;
    }
    total++

    let matchPropArray = matches[prop].split(" ")
    let matchProp = ""
    for(let i=0;i<matchPropArray.length-1;i++){
      matchProp += matchPropArray[i]
      if(i<matchPropArray.length-2){
        matchProp += " "
      }
      
    }
    let personIndex = findWithAttr(buildPeople.people, 'name', prop);
    let person = buildPeople.people[personIndex]
    
  
    let match = findWithAttr(person.preferences,"billet",matchProp)
    match = buildPeople.people[personIndex].preferences[match]
    matchSummary.push({name:person.name,billet:match.billet,pref:match.pref})
    count += match.pref;
    if(match.pref > 3)
      over3 += 1;
  }

  console.log(count)
  console.log(over3)
  console.log(matchSummary)

  return {summary:matchSummary,avg:count/total,over3:over3}
}



function findWithAttr(array, attr, value) {
  for(var i = 0; i < array.length; i += 1) {
      if(array[i][attr] === value) {
          return i;
      }
  }
  return -1;
}