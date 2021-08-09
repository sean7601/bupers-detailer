let optimalMatch = {};



optimalMatch.initializeLarge = function(size){
    let array = [];
    for(let i = 0; i < size; i++) {
        array.push(9e5);
    }
    return array;
}

optimalMatch.findCommandIndex = function(command){
    let index = -1;
    for(let i = 0; i < optimalMatch.commands.length; i++) {
        if(optimalMatch.commands[i] === command) {
            index = i;
            break;
        }
    }
    return index;
}

optimalMatch.organizeData = function(lockins) {

    //will need to pass this in
    let mustFill = ["CPRW-11 WTU / INST req'd / Jacksonville, FL 2"]
    mustFill.push("CPRW-10 WTU / INST req'd / Whidbey Island, WA 3");
    mustFill.push("PERS-44 / Millington, TN");
    mustFill.push("VUP-19 / MC req'd / Jacksonville, FL 5");
    mustFill.push("FRS P-8A or P-3C Only / INST req'd / Jacksonville, FL 6");
    mustFill.push("SERE Instructor / Kittery, ME");
    let data = JSON.parse(JSON.stringify(buildPeople.people));
    optimalMatch.matchData = [];

    //add all the billets
    optimalMatch.commands = [];
    for(let i = 0; i < data[0].preferences.length; i++) {
        let cmd = data[0].preferences[i];
        for(let ii=0;ii<cmd.quantity;ii++){
            optimalMatch.commands.push(cmd.billet + "--" + ii);
        }
    }


    //add all the people and their preferences into the matchData array
    optimalMatch.people = [];
    for(let i = 0; i < data.length; i++) {
        let person = data[i].name;
        let lockedIn = false;
        if(lockins[person]){
            lockedIn = true;
        }
        optimalMatch.people.push(person);
        let prefs = optimalMatch.initializeLarge(optimalMatch.commands.length);

        for(let ii = 0; ii < data[i].preferences.length; ii++) {
            let pref = data[i].preferences[ii].pref;
            let billet = data[i].preferences[ii].billet;
            let quantity = data[i].preferences[ii].quantity;

            if(lockedIn){
                if(lockins[person].includes(billet)){
                    pref = 0;
                }
                else{
                    pref = 9e5
                }
            }
            for(let iii=0;iii<quantity;iii++){
                let index = optimalMatch.findCommandIndex(billet + "--" + iii);
                if(index !== -1) {
                    prefs[index] = pref;
                }
            }
        }
        optimalMatch.matchData.push(prefs)

    }


    //add dummy people and their preferences
    for(let i=0;i<optimalMatch.commands.length - data.length;i++){
        optimalMatch.people.push("DummyPerson" + i);
        let prefs = [];
        for(let ii = 0; ii < data[0].preferences.length; ii++) {
            let quantity = data[0].preferences[ii].quantity;
            let thisPref = 0;
            if(mustFill.includes(data[0].preferences[ii].billet)){
                thisPref = 9e5;
            }
            for(let iii=0;iii<quantity;iii++){
                //pushing 0 here means that the dummy person can fill any of these and the billet is not a mando fill
                prefs.push(thisPref);
            }
            
        }
        optimalMatch.matchData.push(prefs)
    }


    console.log(optimalMatch)
    

    let solution = computeMunkres(optimalMatch.matchData);
    let results = optimalMatch.formatResults(solution,data);
    console.log(results);


    return results

}

optimalMatch.getPreference = function(name,billet){
    let person = optimalMatch.getPerson(name)
    for(let i=0;i<person.preferences.length;i++){
        if(person.preferences[i].billet.includes(billet)){
            return person.preferences[i].pref;
        }
    }
    return null;

}

optimalMatch.getPerson = function(name){
    for(let i=0;i<buildPeople.people.length;i++){
        if(buildPeople.people[i].name === name){
            return buildPeople.people[i];
        }
    }
}

optimalMatch.formatResults = function(solution){
    let results = [];
    for(let i = 0; i < solution.length; i++) {
        let sol = solution[i];
        let person = optimalMatch.people[sol[0]];
        if(person.includes("DummyPerson")){
            continue;
        }
        let billet = optimalMatch.commands[sol[1]];
        if(billet.includes("--")){
            billet = billet.split("--")[0];
        }
        
        let pref = optimalMatch.getPreference(person,billet);
        results.push({name: person, billet: billet, pref:pref});
    }
    return results;
}


optimalMatch.score = function(matches){
    let data = {};
    let total = 0;
    data.over3 = 0; 
    for(let i=0;i<matches.length;i++){
        total += matches[i].pref;
        if(matches[i].pref > 5){
            data.over3++
        }
    }
    
    data.avg = total/matches.length;
    
    return data
}