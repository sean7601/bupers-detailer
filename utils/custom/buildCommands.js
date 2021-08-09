let buildCommands = new Object;

buildCommands.commands = [];

buildCommands.enter = function(){
    let html = 
    `
        <div class="row mb-3 justify-content-center">
            <button class="btn btn-secondary" onclick="buildCommands.load()">Load Config</button>
            <input type="file" hidden id="fileUpload"></input>
            <button class="btn btn-primary ml-3" onclick="buildCommands.saveConfig()">Download Config</button>
            <button class="btn btn-primary ml-3" onclick="buildCommands.buildPreferenceSheet()">Download Preferences Sheet</button>
        </div>
        <h3>Commands</h3>
        <button class="btn btn-outline-primary" onclick="buildCommands.addCommand('',0,0,0,'')">Add Command</button>
        <div id="commands"></div>

    `


    $("#content").html(html);
    $("#header").html("")

    buildCommands.writeCommands();
}


buildCommands.writeCommands = function(){
    let commands = buildCommands.commands;
    let html = "";
    for(let i = 0; i < commands.length; i++){
        html += `
        <hr style="border-top: 5px dotted #8c8b8b">
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="form-group">
                    <label class="form-control-label">Name</label>
                    <input type="text" class="form-control" oninput='buildCommands.saveChange("${i}-name")' id="${i}-name" value="${commands[i].name}">
                </div>
            </div>

            <div class="col-md-4">
                <button class="btn btn-danger mt-4" onclick="buildCommands.deleteCommand(${i})">Delete</button>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Location</label>
                    <input type="text" class="form-control" oninput='buildCommands.saveChange("${i}-location")' id="${i}-location"  value="${commands[i].location}">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Min Billets</label>
                    <input type="text" class="form-control" oninput='buildCommands.saveChange("${i}-minBillets")' id="${i}-minBillets"  value="${commands[i].minBillets}">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Max Billets</label>
                    <input type="text" class="form-control" oninput='buildCommands.saveChange("${i}-maxBillets")' id="${i}-maxBillets"  value="${commands[i].maxBillets}">
                </div>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">EFM Category</label>
                    <input type="text" class="form-control" oninput='buildCommands.saveChange("${i}-efmCat")' id="${i}-efmCat"  value="${commands[i].efmCat}">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Allowed Designators</label>
                    <select type="text" class="form-control" oninput='buildCommands.saveChange("${i}-designator")' id="${i}-designator"  value="${commands[i].designator}">
                        <option value="Pilot">Pilot</option>
                        <option value="NFO">NFO</option>
                        <option value="Either">Either</option>
                    </select>
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Min ACTC</label>
                    <select type="text" class="form-control" oninput='buildCommands.saveChange("${i}-minACTC")' id="${i}-minACTC" value="${commands[i].minACTC}">
                        <option value="300">300</option>
                        <option value="400M">400M</option>
                        <option value="400I">400I</option>
                        <option value="500">500 (Rec)</option>
                    </select>
                </div>
            </div>
        </div>
        `;
    }

    if(commands.length > 0){
        html += `
        <hr style="border-top: 5px dotted #8c8b8b">
        <button class="btn btn-outline-primary" onclick="buildCommands.addCommand('',0,0,0,'')">Add Command</button>
        `
    }

    $("#commands").html(html);

    for(let i = 0; i < commands.length; i++){
        $("#"+i+"-minACTC").val(commands[i].minACTC);
        $("#"+i+"-designator").val(commands[i].designator);
        $("#"+i+"-efmCat").val(commands[i].efmCat);
    }
}

buildCommands.saveChange = function(id){
    var index = id.split("-")[0];
    var prop = id.split("-")[1];

    buildCommands.commands[index][prop] = $("#"+id).val();
}

buildCommands.load = function(){
    document.getElementById('fileUpload').addEventListener('change', buildCommands.readFile, false);
    $("#fileUpload").click();
}

buildCommands.readFile = function(evt){
        var files = evt.target.files; // FileList object
         f = files[0];
          var reader = new FileReader();
    
          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
              // Render thumbnail.
             JsonObj = JSON.parse(e.target.result);
             buildCommands.commands = JsonObj;
             buildCommands.writeCommands();
            };
          })(f);
    
          // Read in the image file as a data URL.
          reader.readAsText(f);
        
}

buildCommands.saveConfig = function(){
    //from https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    let exportName = "commandsConfig"
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(buildCommands.commands));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

buildCommands.buildPreferenceSheet = function(){
    let wb = XLSX.utils.book_new();
    wb.Props = {
        Title: "Personnel Preference Sheet",
        Subject: "Preferences",
        Author: "MPRWS SDT",
        CreatedDate: new Date()
    };

    //add personal data
    let ws_data = [['First Name' , 'Last Name', 'Designator', 'Current Command', 'ACTC at Checkout', "Co-located/Dual-Mil (yes/no)","EFM (no, or category #)","WTI Rec (yes/no)","Extra Details"]];
    let ws = XLSX.utils.aoa_to_sheet(ws_data, {header: 0});
    XLSX.utils.book_append_sheet(wb, ws, "Personal Details");
    

    //add preferences
    ws_data = [['Command' , 'Location', 'ACTC', `Rank (1-${buildCommands.commands.length})`, 'Unable due to EFM (yes,no)' ]];
    //add each command to the sheet
    for(let i = 0; i < buildCommands.commands.length; i++){
        ws_data.push([buildCommands.commands[i].name, buildCommands.commands[i].location, buildCommands.commands[i].minACTC]);
    }
    ws = XLSX.utils.aoa_to_sheet(ws_data, {header: 0});
    XLSX.utils.book_append_sheet(wb, ws, "Individual Preferences");

    console.log(wb)

    XLSX.writeFile(wb, "slate_preferences.xlsx");
}

buildCommands.addCommand = function(name, minBillets, maxBillets, minACTC, location, efmCat, designator){
    let command = {name:name, minBillets:minBillets, maxBillets:maxBillets, minACTC:minACTC,location:location,efmCat:efmCat,designator:designator}
    buildCommands.commands.push(command);
    buildCommands.writeCommands();
}

buildCommands.deleteCommand = function(index){
    buildCommands.commands.splice(index, 1);
    buildCommands.writeCommands();
}

