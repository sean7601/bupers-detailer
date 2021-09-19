let buildPeople = new Object();
buildPeople.people = [];
buildPeople.enter = function () {
	//build intiial UI
	let html = `
        <div class="row mb-3 justify-content-center">
            <button class="btn btn-secondary" onclick="buildPeople.load()">Load Config</button>
            <input type="file" hidden id="fileUpload"></input>
            <button class="btn btn-secondary ml-3" onclick="buildPeople.loadReturnedData()">Load Preference Sheets</button>
            <input  style='visibility:hidden;width:0px;height:0px' type='file'  id='folderUpload' webkitdirectory mozdirectory></input>
            <button class="btn btn-primary ml-3" onclick="buildPeople.saveConfig()">Download Config</button>
            <button class="btn btn-primary ml-3" onclick="buildPeople.buildPreferenceSheet()">Download Cmd Preference Sheet</button>
        </div>
        <h3>Personnel</h3>
        <button class="btn btn-outline-primary" onclick='buildPeople.addPerson("","","","Pilot")'>Add Personnel</button>
        <div id="people"></div>

    `;

	$('#content').html(html);
	$('#header').html('');

	buildPeople.writePeople();
};

buildPeople.writePeople = function () {
	let people = buildPeople.people;
	let html = '';
	for (let i = 0; i < people.length; i++) {
		html += `      
        <hr style="border-top: 5px dotted #8c8b8b">
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">First Name</label>
                    <input type="text" class="form-control" oninput='buildPeople.saveChange("${i}-firstName")' id="${i}-firstName" value="${people[i].firstName}">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Last Name</label>
                    <input type="text" class="form-control" oninput='buildPeople.saveChange("${i}-lastName")' id="${i}-lastName" value="${people[i].lastName}">
                </div>
            </div>

            <div class="col-md-4">
                <button class="btn btn-danger mt-4" onclick="buildPeople.deletePerson(${i})">Delete</button>
            </div>
        </div>
        <div class="row mb-3">
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Current Command</label>
                    <input type="text" class="form-control" oninput='buildPeople.saveChange("${i}-location")' id="${i}-location"  value="${people[i].location}">
                </div>
            </div>
            <div class="col-md-4">
                <div class="form-group">
                    <label class="form-control-label">Designator</label>
                    <select type="text" class="form-control" oninput='buildPeople.saveChange("${i}-designator")' id="${i}-designator"  value="${people[i].designator}">
                        <option value="Pilot">Pilot</option>
                        <option value="NFO">NFO</option>
                    </select>
                </div>
            </div>
            
        </div>
        `;
	}

	if (people.length > 0) {
		html += `
        <hr style="border-top: 5px dotted #8c8b8b">
        <button class="btn btn-outline-primary" onclick='buildPeople.addPerson("","","","Pilot")'>Add Personnel</button>
        `;
	}

	$('#people').html(html);

	for (let i = 0; i < people.length; i++) {
		$('#' + i + '-designator').val(people[i].designator);
	}
};

buildPeople.load = function () {};

buildPeople.addPerson = function (
	firstName,
	lastName,
	currentCommand,
	designator
) {
	let person = {};
	person.firstName = firstName;
	person.lastName = lastName;
	person.location = currentCommand;
	person.designator = designator;
	person.uploadedDetails = {};

	buildPeople.people.push(person);

	buildPeople.writePeople();
};

buildPeople.deletePerson = function (index) {
	buildPeople.people.splice(index, 1);
	buildPeople.writePeople();
};

buildPeople.saveChange = function (id) {
	var index = id.split('-')[0];
	var prop = id.split('-')[1];

	buildPeople.people[index][prop] = $('#' + id).val();
};

buildPeople.saveConfig = function () {
	//from https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
	let exportName = 'peopleConfig';
	var dataStr =
		'data:text/json;charset=utf-8,' +
		encodeURIComponent(JSON.stringify(buildPeople.people));
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute('href', dataStr);
	downloadAnchorNode.setAttribute('download', exportName + '.json');
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
};

buildPeople.load = function () {
	document
		.getElementById('fileUpload')
		.addEventListener('change', buildPeople.readFile, false);
	$('#fileUpload').click();
};

buildPeople.loadReturnedData = function () {
	$('#folderUpload').on('change', function (e) {
		buildPeople.uploadFolder(e);
	});
	$('#folderUpload').click();
};

buildPeople.uploadFolder = function (event) {
	buildPeople.uploadedData = [];
	if (event.target.files && event.target.files.length) {
		buildPeople.uploadedFiles = event.target.files;
	}

	console.log(buildPeople.uploadedFiles);
	buildPeople.readFiles();
};

buildPeople.readFiles = function () {
	for (var i = 0; i < buildPeople.uploadedFiles.length; i++) {
		console.log(buildPeople.uploadedFiles[i], '+-+-+-');
		buildPeople.readExcelFile(buildPeople.uploadedFiles[i]);
	}

	buildPeople.checkForCompletion();
};

buildPeople.checkForCompletion = function () {
	setTimeout(function () {
		if (buildPeople.uploadedFiles.length == buildPeople.uploadedData.length) {
			buildPeople.parseAsWorkbooks();
		} else {
			buildPeople.checkForCompletion();
		}
	}, 1000);
};

buildPeople.readExcelFile = function (file) {
	console.log('+++++');
	var fileReader = new FileReader();

	fileReader.readAsBinaryString(file); /// This was as readAsText. I am embarrassed that I spent an hour figuring out that was the problem. Hopefully this doesnt mess anything else up for you
	fileReader.onload = () => {
		var obj = fileReader.result;

		try {
			buildPeople.uploadedData.push(obj);
		} catch {
			console.log('this was not a valid file');
			console.log(file);
		}
	};
};

buildPeople.parseAsWorkbooks = function (file) {
	buildPeople.workbooks = [];
	for (let file of buildPeople.uploadedData) {
		console.log(buildPeople.uploadedData);
		var workbook = XLSX.read(file, { type: 'binary' }); /// switched this to buffer to match the methods you used.

		var data = {};
		//get the first sheet
		var sheet = workbook.SheetNames[0];
		data.personalData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

		sheet = workbook.SheetNames[1];
		data.preferences = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

		console.log(data);
		buildPeople.workbooks.push(data);
	}

	console.log(buildPeople.workbooks);
};

var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer

buildPeople.organizeData = function () {
	var peoplePreferences = {};
	var commandPreferences = {};

	for (var i = 0; i < buildPeople.people.length; i++) {
		var person = buildPeople.people[i].name;
		var prefs = [];
		for (var ii = 0; ii < buildPeople.people[i].preferences.length; ii++) {
			let billet = buildPeople.people[i].preferences[ii];
			for (var j = 0; j < billet.quantity; j++) {
				prefs.push(billet.billet + ' ' + j);
			}
		}

		peoplePreferences[person] = prefs;
	}

	console.log(peoplePreferences, commandPreferences);

	buildPeople.people.sort((a, b) => (a.score > b.score ? 1 : -1));
	for (var i = 0; i < buildPeople.people[0].preferences.length; i++) {
		for (var j = 0; j < buildPeople.people[0].preferences[i].quantity; j++) {
			var command = buildPeople.people[0].preferences[i].billet + ' ' + j;
			var people = [];
			for (var ii = 0; ii < buildPeople.people.length; ii++) {
				people.push(buildPeople.people[ii].name);
			}
			commandPreferences[command] = people;
		}
	}

	let matches = findMatches(peoplePreferences, commandPreferences);
	scoreMatches(matches);
};
