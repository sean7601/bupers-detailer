let slate = new Object;
slate.matches = [];
var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
slate.lastTime;
slate.enter = function() {
    //build intiial UI
    let html = 
    `
        <div class="row mb-3 justify-content-center">
            <button class="btn btn-secondary" onclick="slate.load()">Load Data</button>
            <input type="file" hidden id="fileUpload"></input>
            <button onclick="slate.writeSlate()" class="btn btn-primary ml-3">View Personnel</button>
            <button onclick="slate.writeCommands()" class="btn btn-primary ml-3">View Commands</button>
            <button onclick="slate.reRun()" class="btn btn-warning ml-3">Re-Build w/ Lock-Ins</button>

            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle ml-3" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    Save
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" href="#" onclick="slate.downloadJson()" >JSON</a></li>
                    <li><a class="dropdown-item" href="#"onclick="slate.writeExcelSlate()" >Excel</a></li>
                </ul>
            </div>

        </div>
        <h3>Slate</h3>
        <div id="slate"></div>

    `


    $("#content").html(html);
    $("#header").html("")

}


slate.writeCommands = function(){
    let html = slate.writeStats()
    html += "<table class='table'>"
    html += `
        <tr>
            <th>Name</th>
            <th>Billets Allowed</th>
            <th>Billets Allocated</th>
            <th>Names</th>
        </tr>


    `

    for(let i = 0; i < buildPeople.people[0].preferences.length; i++){
        let theCommand = buildPeople.people[0].preferences[i].billet;
        let amountAllowed = buildPeople.people[0].preferences[i].quantity;
        let peopleBilleted = slate.commands[theCommand];
        let numberPeopleBilleted
        let string;
        try{
            numberPeopleBilleted = peopleBilleted.length;
            string = ""
            for(let j = 0; j < numberPeopleBilleted; j++){
                let theName = peopleBilleted[j];
                string += theName
                if(j < numberPeopleBilleted-1){
                    string += ", "
                }
            }
        }catch{
            numberPeopleBilleted = 0
            string = "None"
        }
        if(numberPeopleBilleted < amountAllowed){
            html += `<tr style="background-color:#ff8d85">`
        }
        else{
            html += "<tr>"
        }
        html += `
            <td>
                ${theCommand}
            </td>
            <td>
                ${numberPeopleBilleted}
            </td>
            <td>
                ${amountAllowed}
            </td>
            <td>
                ${string}
            </td>
        </tr>

        
        `
    }
    html += "</table>"
    $("#slate").html(html);

}

slate.writeStats = function(){
    let html = `
        <div>Avg Preference: ${slate.stats.avg}</div>
        <div>Number with > Third Choice: ${slate.stats.over3}</div>
        <div class="form-group w-25 text-center">
            <label>Alternative Choice Impact</label>
            <select onchange="slate.getImpactOfChange()" class="form-control"  id="assess-billet-impact-title">`
            let person = buildPeople.people[0]
            for(let i = 0; i < person.preferences.length; i++){
                let theBillet = person.preferences[i].billet;
                html += `<option value="${theBillet}">${theBillet}</option>`
            }
            html += `</select>
        </div>
    
    `
    return html

}
slate.writeSlate = function(){
    let html = slate.writeStats()
    html += "<table class='table'>"
    html += `
        <tr>
            <th>Name</th>
            <th>Billet</th>
            <th>Pref</th>
            <th>Lock-In</th>
            <th>Notes</th>
            <th>
                Impact
            
            </th>
        </tr>


    `
    console.log(slate.matches)
    for(let match in slate.matches){
        let theMatch = slate.matches[match];
        let personIndex = findWithAttr(buildPeople.people, "name", theMatch.name)
        let person = buildPeople.people[personIndex];
        html += 
        `
        <tr>
            <td>
                ${theMatch.name}
            </td>
            <td>
                <select class="form-control" style="min-width:300px" id="${person.name}-billet">`
                    for(let i = 0; i < person.preferences.length; i++){
                        let theBillet = person.preferences[i].billet;
                        let thePreference = person.preferences[i].pref;
                        html += `<option value="${theBillet}">${thePreference}) - ${theBillet}</option>`
                    }
                html += `</select>
            </td>
            <td>
                ${theMatch.pref}
            </td>
            <td>`
                if(person.lockedIn){
                    html += `<input class="form-check-input ml-3" type="checkbox" id="${person.name}-lockedIn" checked>`
                }
                else{
                    html += `<input class="form-check-input ml-3" type="checkbox" id="${person.name}-lockedIn">`
                }
            html += `</td>
            <td>
                ${person.notes || ""}
            </td>
            <td id="${person.name}-impact">
            </td>
        </tr>


        
        `
    }
    html += "</table>"
    $("#slate").html(html);

    slate.setToBilletedJob()
    slate.getImpactOfChange();

}

slate.getImpactOfChange = function(){
    console.log(slate.matches)
    let impactMatch = $("#assess-billet-impact-title").val()
    //go over all people
    for(let i = 0; i < buildPeople.people.length; i++){
        let person = buildPeople.people[i];
        let currentMatch = $("#"+person.name+"-billet").val();
        let impactPref = 9e5;
        let currentPref = 9e5
        //find the pref of this billet and of the current billet
        for(let ii = 0; ii < person.preferences.length; ii++){
            let pref = person.preferences[ii];
            if(pref.billet == impactMatch){
                impactPref = pref.pref;
            }
            if(pref.billet == currentMatch){
                currentPref = pref.pref;
            }
        }

        //find the difference between the two
        let impact = impactPref - currentPref;
        let text = "";
        
        if(impact < 0){
            text = "<span style='color:green;'>"+impactPref + "("+impact+")</span>"
        }
        else if(impact > 0){
            text = "<span style='color:red;'>"+impactPref + "(+"+impact+")</span>"

        }
        else{
            text = "<span>No Change</span>"
        }

        if(impactPref == 9e5){
            text = "<span style='color:red;'>Unqualified</span>"
        }
        $("#"+person.name+"-impact").html(text);

    }
}

slate.setToBilletedJob = function(){
    console.log(slate.matches)
    for(let match in slate.matches){
        let theMatch = slate.matches[match];
        $("#"+theMatch.name+"-billet").val(theMatch.billet);
    }
}

slate.load = function(){
    document.getElementById('fileUpload').addEventListener('change', slate.fullDataHandler, false);
    $("#fileUpload").click();
}

slate.downloadJson = function(){
    var data = {people:buildPeople.people,matches:slate.matches};
    let exportName = "savedSlate"
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
      
}

slate.readFile = function(evt){
    var files = evt.target.files; // FileList object
     f = files[0];
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {

            slate.fullDataHandler(e,f)

        };
      })(f);

      // Read in the image file as a data URL.
      reader.readAsText(f);
}


slate.fullDataHandler = function(e) {
    var files = e.target.files; // FileList object
    f = files[0];
    let extension = files[0].name.split('.').pop().toLowerCase()
    console.log(extension)

    var reader = new FileReader();
    reader.onload = function(e) {
        slate.lastTime = performance.now();
        var data = e.target.result;
        if(extension == "json"){
            let data = JSON.parse(e.target.result);
            console.log(data)
            buildPeople.people = (data.people);
            slate.matches = (data.matches);
            slate.stats = {avg:5,over3:5};
            
            slate.writeSlate()
            slate.reRun()
            return;
        }
        if(!rABS) data = new Uint8Array(data);
        var workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array', cellStyles: true});

        var sheet = workbook.SheetNames[0];
        data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);


        for(var i=0;i<data.length;i++){
            
            let person = {};
            let lastName =data[i].NAME.split(",")[0]
            let desig = data[i].NAME.split("-")[1] 
            person.name = lastName + "-" + desig + "-" + data[i].SQUADRON.replace(/[^a-zA-Z]+/g, '');
            person.breakout = data[i].Breakout;
            person.notes = data[i].Notes;
            person.lockedIn = false;
            person.prd = data[i]["PRD (YYMM)"];
            person.summaryGroup = parseInt(data[i]["Summary Group"]);
            let ep;
            if(!isNaN(person.breakout)){
                ep = 100 - person.breakout;
                person.score = 1 / person.breakout;
            }
            else{
            ep = person.breakout.includes("EP");
                if(ep){
                    person.score = parseInt(person.breakout.replace(/\D/g, "")) / person.summaryGroup;
                }
                else{
                    person.score = (6 + parseInt(person.breakout.replace(/\D/g, ""))) / person.summaryGroup;
                }
            }
            if(isNaN(person.score)){
                person.score = 1;
            }

            person.squadron = data[i].SQUADRON;

            delete data[i].NAME;
            delete data[i].Breakout;
            delete data[i].Notes;
            delete data[i]["PRD (YYMM)"];
            delete data[i].RANK;
            delete data[i].rank
            delete data[i].SQUADRON;
            delete data[i]["Summary Group"];

            person.preferences = [];
            for(let prop in data[i]){
                let propArray = prop.split(" ");
                let quantity = parseInt(propArray[propArray.length-1]);
                if(isNaN(quantity) || quantity == 60 || quantity == 6060){
                    quantity = 1;
                }
                let pref = data[i][prop];
                if(pref == "n"){
                    pref = 9e5;
                }
                person.preferences.push({billet:prop,pref:pref,quantity:quantity})
            }

            person.preferences.sort((a, b) => (a.pref > b.pref) ? 1 : -1)
            buildPeople.people.push(person)

        }


        slate.organizeData()
	}
  if(rABS) reader.readAsBinaryString(f); else reader.readAsArrayBuffer(f);
}


slate.organizeData = function(){
    var peoplePreferences = {};
    var commandPreferences = {};

    for(var i=0;i<buildPeople.people.length;i++){
        var person = buildPeople.people[i].name;
        var prefs = [];
        for(var ii=0;ii<buildPeople.people[i].preferences.length;ii++){
            let billet = buildPeople.people[i].preferences[ii];
            for(var j=0;j<billet.quantity;j++){
                prefs.push(billet.billet + " " + j)
            }
        }

        peoplePreferences[person] = prefs;
    }

    buildPeople.people.sort((a, b) => (a.score > b.score) ? 1 : -1)
    for(var i=0;i<buildPeople.people[0].preferences.length;i++){
        for(var j =0;j<buildPeople.people[0].preferences[i].quantity;j++){
            var command = buildPeople.people[0].preferences[i].billet + " " + j;
            var people = []
            for(var ii=0;ii<buildPeople.people.length;ii++){
                people.push(buildPeople.people[ii].name);
            }
            commandPreferences[command] = people;
        }
    }
    console.log(peoplePreferences,commandPreferences)

    //this is the stable marriage implementation
    slate.matches = findMatches(peoplePreferences,commandPreferences)
    console.log(JSON.parse(JSON.stringify(slate.matches)))
    slate.matches = optimalMatch.organizeData()
    console.log(slate.matches);
    let stats = scoreMatches(slate.matches)
    //slate.matches = stats.summary

    slate.stats = {avg:stats.avg,over3:stats.over3}
    slate.commands = {};

    for(let command in commandPreferences){
        commandPreferences[command] = [];
    }
    for(let match in slate.matches){
        let theMatch = slate.matches[match];
        let command = theMatch.billet;
        try{
            slate.commands[command].push(theMatch.name);
        }
        catch{
            slate.commands[command] = [];
            slate.commands[command].push(theMatch.name);
        }
    }


    slate.writeSlate()
    console.log(performance.now() - slate.lastTime)
    console.log(slate.stats);

}



slate.reRun = function(){
    var lockins = {}
    //find out who is locked in
    for(let i=0;i<buildPeople.people.length;i++){
        let thisName = buildPeople.people[i].name;

        let lockedIn = $("#"+thisName+"-lockedIn").is(':checked')
        console.log("************")
        console.log(thisName,lockedIn)
        if(!lockedIn){
            buildPeople.people[i].lockedIn = false;
            continue;
        }
        else{
            buildPeople.people[i].lockedIn = true;
            lockins[thisName] = $("#"+thisName+"-billet").val()
        }       
    }

    console.log(lockins)



    var peoplePreferences = {};
    var shadowPeoplePreferences = {};
    var commandPreferences = {};

    for(var i=0;i<buildPeople.people.length;i++){
        var person = buildPeople.people[i].name;
        var prefs = [];
        for(var ii=0;ii<buildPeople.people[i].preferences.length;ii++){
            let billet = buildPeople.people[i].preferences[ii];
            for(var j=0;j<billet.quantity;j++){
                if(person=="ff"){
                    console.log(i,person,billet.billet,lockins[i],billet,lockins[i] == billet.billet);
                }
                if(lockins[person] == billet.billet){
                    prefs.unshift(billet.billet + " " + j)
                }
                else{
                    prefs.push(billet.billet + " " + j)
                }
            }
        }
        if(person=="ff"){
            console.log(prefs)
        }
        peoplePreferences[person] = JSON.parse(JSON.stringify(prefs));
        shadowPeoplePreferences[person] = JSON.parse(JSON.stringify(prefs));
    }


    buildPeople.people.sort((a, b) => (a.score > b.score) ? 1 : -1)
    for(var i=0;i<buildPeople.people[0].preferences.length;i++){
        for(var j =0;j<buildPeople.people[0].preferences[i].quantity;j++){
            var command = buildPeople.people[0].preferences[i].billet + " " + j;
            var people = []
            for(var ii=0;ii<buildPeople.people.length;ii++){
                
                if(lockins[buildPeople.people[ii].name] == buildPeople.people[0].preferences[i].billet){
                    console.log(lockins[buildPeople.people[ii].name], buildPeople.people[0].preferences[i].billet,buildPeople.people[ii].name)
                    people.unshift(""+buildPeople.people[ii].name);
                }
                else{
                    people.push(""+buildPeople.people[ii].name);
                }
            }
            commandPreferences[command] = people;
        }
    }

    strongConsole(commandPreferences)
    strongConsole(peoplePreferences)
    //this is the stable marriage implementation
    //slate.matches = findMatches(peoplePreferences,commandPreferences)
    slate.matches = optimalMatch.organizeData()
    let stats = scoreMatches(slate.matches)
    //slate.matches = stats.summary
    slate.stats = {avg:stats.avg,over3:stats.over3}
    slate.commands = {};


    for(let match in slate.matches){
        let theMatch = slate.matches[match];
        let command = theMatch.billet;
        try{
            slate.commands[command].push(theMatch.name);
        }
        catch{
            slate.commands[command] = [];
            slate.commands[command].push(theMatch.name);
        }
    }


    slate.writeSlate()

    
}




slate.writeExcelSlate = function(){
    let wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Slate",
        Subject: "Preferences",
        Author: "MPRWS SDT",
        CreatedDate: new Date()
    };

    //add headers
    let ws_data = [['Name', 'Command', 'Choice']];
    

    //add slate
    for(let i = 0; i < slate.matches.length; i++){
        let match = slate.matches[i];
        ws_data.push([match.name, match.billet, match.pref]);
    }
    let ws = XLSX.utils.aoa_to_sheet(ws_data, {header: 0});
    XLSX.utils.book_append_sheet(wb, ws, "Slate");

    console.log(wb)

    XLSX.writeFile(wb, "slate.xlsx");
}