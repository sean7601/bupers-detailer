let buildPeople = new Object();
buildPeople.people = [];

buildPeople.commands = {
	"MPRWS / INST req'd / Jacksonville, FL": 'n',
	'VP-47 / NFO / Whidbey Island, WA': 'n',
};

buildPeople.tableState = {
	activeRow: null,
};

buildPeople.headers = [
	'communityType',
	'lastName',
	'firstName',
	'designation',
	'currCommand',
];
buildPeople.enter = function () {
	console.table(buildPeople.people);
	console.log(buildPeople.people[0]);
	//build intiial UI
	let html = `
        <div id="people" class="container-fluid">
            <div class="row border" style="height: calc(90% - 150px);">
                <div class="col-9 border h-100 table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light table-striped">
                            <th>Community</th>
                            <th>Last Name</th>
                            <th>First Name</th>
                            <th>Designator</th>
                            <th>Curr. Command</th>
                            <th>Details</th>
                            <th></th>
        
                        </thead>
                        <tbody id="build_people_table">
                           
                        </tbody>
                    </table>
                </div>
                <div class="col-3  h-100 container-fluid">
                    <div class="row  justify-content-center align-items-center" style="height: 10%;">
                        <div class="dropdown mr-2">
                            <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown"
                                data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Load
                            </button>
                            <div class="dropdown-menu m-2" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#" onclick="buildPeople.uploadFolder()">
                                    Individual Pref Sheets</a>
                                <a class="dropdown-item" href="#" onclick="alert('Needs to be implemented')">Command Summary File</a>
                                <a class="dropdown-item" href="#" onclick="alert('Needs to be implemented')">Config File</a>
                            </div>
                        </div>
                        <input type="file" hidden id="fileUpload"></input>
                        <div class="dropdown ml-2">
                            <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton"
                                data-toggle="dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Download
                            </button>
                            <div class="dropdown-menu m-2" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#" onclick="buildPeople.writeCommandPreferenceSheet()">Command Summary Sheet</a>
                                <a class="dropdown-item" href="#" onclick="alert('Needs to be implemented')">Command Approval Sheet</a>
                                <a class="dropdown-item" href="#" onclick="buildPeople.saveConfig()">Config File</a>
                            </div>
                        </div>
                    </div>
                    <div class="row " style="height: 80%; overflow-y: scroll;">
                        <form class="w-100 m-2">
                            <div class="form-group">
                                <label for="communityType">Community</label>
                                <input type="text" class="form-control" id="communityType" placeholder="VP">
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name</label>
                                <input type="text" class="form-control" id="lastName" placeholder="Doe">
                            </div>
                            <div class="form-group">
                                <label for="firstName">First Name</label>
                                <input type="text" class="form-control" id="firstName" placeholder="Jane/Joe">
                            </div>
                            <div class="form-group">
                                <label for="designation">Designator</label>
                                <select class="form-control" id="designation">
                                    <option>NFO</option>
                                    <option>Pilot</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="currCommand">Curr. Command</label>
                                <input type="text" class="form-control" id="currCommand" placeholder="VP-30">
                            </div>
                            <div class="form-group">
                                <button class="btn btn-secondary" onclick="alert('Details viewer not implemented')">Details</button>
                            </div>
                        </form>
                    </div>
                    <div class="row bg-transparent justify-content-end align-items-center" style="height: 10%;">
                        <button type="button" id="cancel_editing" class="invisible fab_main_btn bg-danger color-white ml-8"
                            onclick="cancelEdit()">
                            <i class="fas fa-times"></i>
                        </button>
        
                        <button type="button" class="fab_main_btn bg-primary color-white ml-8" id="add_row_btn"
                            onclick="buildPeople.addPerson()">
                            <i class="fas fa-plus"></i>
                        </button>
        
        
                    </div>
                </div>
            </div>
        
        </div>

    `;

	$('#content').html(html);
	$('#header').html('<h3>Personnel</h3>');

	buildPeople.writePeople();
};

buildPeople.writePeople = function () {
	const html = buildPeople.people.reduce((prev, curr, i) => {
		return (prev += `
			<tr data-table-row = ${i} onclick="buildPeople.editRow(${i})">
				<td ondblclick="buildPeople.editCell(this)" oninput="buildPeople.editRow(${i})" data-table-cell=4>${
			curr.type ? curr.type : curr.squadron.match(/VP|VQ|MPRWS|CPRW/g).join('')
		} </td>
				<td ondblclick="buildPeople.editCell(this)" oninput="buildPeople.editRow(${i})" data-table-cell=4>${
			curr.fullName ? curr.fullName.split(',') : curr.name.split('-')[0]
		} </td>
				<td ondblclick="buildPeople.editCell(this)" oninput="buildPeople.editRow(${i})" data-table-cell=4>${
			curr.fullName ? curr.fullName.split(',') : 'UNK'
		} </td>
				<td ondblclick="buildPeople.editCell(this)" oninput="buildPeople.editRow(${i})" data-table-cell=4>${
			curr.designator
				? curr.designator
				: curr.properties['NFO']
				? 'NFO'
				: 'PILOT'
		}</td>
				<td ondblclick="buildPeople.editCell(this)" oninput="buildPeople.editRow(${i})" data-table-cell=4>${
			curr.squadron
		} </td>
				<td ondblclick="buildPeople.editCell(this)" oninput="buildPeople.editRow(${i})" data-table-cell=4>Not Implemented </td>
				<td data-noedit='true'>
					<div class="d-flex align-items-center">
						<span class="text-danger ml-2 mr-4 " style="font-size: 1.5rem;" data-row-delete=${i}
							onclick="buildPeople.deleteRow(${i})">
							<i class="fas fa-trash "></i>
						</span>
					</div>
				</td>
			</tr>
		
		`);
	}, ``);

	$('#build_people_table').html(html);
};

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
	return person;
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
	buildPeople.formatReadData();
};

buildPeople.formatReadData = function () {
	console.log('Running Format data ');

	for (let wb of buildPeople.workbooks) {
		let personalData = wb.personalData[0];
		let preferences = wb.preferences;
		let fName = personalData['First Name'];
		let lastName = personalData['Last Name'];
		let designator = personalData['Designator'];
		let command = personalData['Current Command'];
		let efm = personalData.uploadedDetails.efm;
		let collocated = personalData.uploadedDetails.co_located;

		let type = 'HSM';
		if (command.match(/VP|VQ|MPRWS|CPRW/g)) {
			type = 'VP';
		}

		const person = {
			header: 'buildPeople',
			type: type || null,
			name: `${lastName}-${designator}-${type}`,
			designator: designator,
			fullName: `${lastName},${fName}`,
			breakout: null,
			notes: `${1}/${2}/${3}`,
			lockedIn: false,
			prd: null,
			summaryGroup: null,
			score: null,
			squadron: command,
			uploadedDetails: {
				efm: personalData['EFM (no, or category #)'],
				notes: [personalData['Extra Details']],
				co_located: personalData['Co-located/Dual-Mil (yes/no)'],
				ACTC: personalData['ACTC at Checkout'],
			},
			notes: null,
			preferences: [],
		};

		for (let preference of preferences) {
			const command = preference['Command'];
			const note = preference['Notes'];
			const location = preference['Location'];
			const quantity = preference['Available Billets'];
			const commandString = `${command} / ${note} / ${location} ${quantity}`;
			const billet = {
				billet: commandString,
				pref: preference[`Rank (1-${preferences.length})`],
				quantity: 6,
			};

			person.preferences.push(billet);

			// hashing is faster than searching for duplicates over N commands and M people
			if (buildPeople.commands.hasOwnProperty(commandString)) {
				continue;
			} else {
				buildPeople.commands[commandString] = 'n';
			}
		}

		person.preferences.sort((a, b) => (a.pref > b.pref ? 1 : -1));

		buildPeople.people.push(person);
	}

	buildPeople.people.sort((a, b) => (a.fullName > b.fullName ? 1 : -1));
	buildPeople.writePeople();
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

buildPeople.readFile = function (evt) {
	var files = evt.target.files; // FileList object
	f = files[0];
	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function (theFile) {
		return function (e) {
			// Render thumbnail.
			try {
				JsonObj = JSON.parse(e.target.result);
				buildPeople.people = JsonObj;
				buildPeople.writePeople();
				//if this doesn't work, you uploaded an excel file, so do this isntead
			} catch {
				buildPeople.fullDataHandler(e);
			}
		};
	})(f);

	// Read in the image file as a data URL.
	reader.readAsText(f);
};

buildPeople.fullDataHandler = function (e) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var data = e.target.result;
		if (!rABS) data = new Uint8Array(data);
		console.log(data);
		var workbook = XLSX.read(data, {
			type: rABS ? 'binary' : 'array',
			cellStyles: true,
		});
		console.log(workbook);

		var sheet = workbook.SheetNames[0];
		data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

		console.log(data);
		for (var i = 0; i < data.length; i++) {
			let person = {};
			person.name = data[i].NAME + '/' + data[i].SQUADRON;
			person.breakout = data[i].Breakout;
			person.notes = data[i].Notes;
			person.prd = data[i]['PRD (YYMM)'];
			person.summaryGroup = parseInt(data[i]['Summary Group']);
			let ep = person.breakout.includes('EP');
			if (ep) {
				person.score =
					parseInt(person.breakout.replace(/\D/g, '')) / person.summaryGroup;
			} else {
				person.score =
					(6 + parseInt(person.breakout.replace(/\D/g, ''))) /
					person.summaryGroup;
			}
			person.squadron = data[i].SQUADRON;
			delete data[i].NAME;
			delete data[i].Breakout;
			delete data[i].Notes;
			delete data[i]['PRD (YYMM)'];
			delete data[i].rank;
			delete data[i].SQUADRON;
			delete data[i]['Summary Group'];
			person.preferences = [];
			for (let prop in data[i]) {
				let quantity = parseInt(prop.replace(/\D/g, ''));
				if (isNaN(quantity) || quantity == 60 || quantity == 6060) {
					quantity = 1;
				}
				let pref = data[i][prop];
				if (isNaN(pref)) {
					pref = 9e30;
				}
				person.preferences.push({
					billet: prop,
					pref: pref,
					quantity: quantity,
				});
			}
			person.preferences.sort((a, b) => (a.pref > b.pref ? 1 : -1));
			buildPeople.people.push(person);
		}

		console.log(buildPeople.people);
		buildPeople.organizeData();
	};
	if (rABS) reader.readAsBinaryString(f);
	else reader.readAsArrayBuffer(f);
};

buildPeople.writeCommandPreferenceSheet = function () {
	let wb = XLSX.utils.book_new();
	wb.Props = {
		Title: 'Commander Summary Sheet',
		Subject: 'Commander Summary',
		Author: 'MPRWS SDT',
		CreatedDate: new Date(),
	};

	let ws_data = [
		['RANK', 'NAME', 'SQUADRON', 'PRD (YYMM)', 'Breakout', 'Summary Group'],
	];

	const properties = ['INST', 'MC', 'VQ', 'VP', 'PILOT', 'NFO', 'AAS', 'EP'];

	for (let prop of properties) {
		ws_data[0].push(`*PROPS-${prop}`);
	}
	const commandNames = Object.keys(buildPeople.commands);

	commandNames.sort((a, b) => (a > b ? 1 : -1));

	for (let command of commandNames) {
		ws_data[0].push(command);
	}

	ws_data[0].push('Notes');
	console.log(buildPeople.people[0]);
	for (let person of buildPeople.people) {
		const row = [
			person.rank | '', // Rank
			person.name,
			person.squadron,
			person.prd | '', //PRD
			person.breakout | '', // Breakout
			person.summaryGroup | '', // Summary Group
		];

		for (let prop of properties) {
			if (person.hasOwnProperty('designator')) {
				if (prop === 'NFO' && person.designator.toUpperCase() === 'NFO') {
					row.push('Y');
				} else if (
					prop === 'PILOT' &&
					person.designator.toUpperCase() === 'PILOT'
				) {
					row.push('Y');
				} else {
					row.push('');
				} // Empty String for now until we figure out the shape of the final data and the methods for which they come into the applications
			} else {
				if (prop === 'NFO' && person.properties['NFO']) {
					row.push('Y');
				} else if (prop === 'PILOT' && person.properties['PILOT']) {
					row.push('Y');
				} else {
					row.push('');
				} // Empty String for now until we figure out the shape of the final data and the methods for which they come into the applications
			}
		}
		const commandsCopy = Object.assign({}, buildPeople.commands);

		for (let preference of person.preferences) {
			console.log(preference.billet, '+++++++++');
			commandsCopy[preference.billet] = preference.pref;
		}

		const preferences = Object.entries(commandsCopy).sort((a, b) =>
			a[0] > b[0] ? 1 : -1
		);
		let priOne = 9e30;
		let priOneCommandName = '';
		preferences.forEach((pref) => {
			if (pref[1] < priOne && pref[1] !== 'n') {
				priOne = pref[1];
				priOneCommandName = pref[0];
			}
			row.push(pref[1]);
		});
		console.warn(
			'BUILD PEOPLE WRITE COMMAND PREFERENCES SHEET: The properties pushed to the Excel document are hard coded to a empty string. Fix this before distro. '
		);

		let note;
		if (person.hasOwnProperty('uploadedDetails')) {
			note = `${priOneCommandName.split('/')[0]}/${
				person.uploadedDetails.co_located
					? person.uploadedDetails.co_located.toUpperCase()
					: ''
			}/${
				person.uploadedDetails.efm
					? person.uploadedDetails.efm === 0
						? 'N'
						: 'Y'
					: ''
			}`;
		} else {
			note = person.note;
		}
		row.push(note);
		ws_data.push(row);
	}

	ws = XLSX.utils.aoa_to_sheet(ws_data, { header: 0 });
	XLSX.utils.book_append_sheet(wb, ws, 'Command Summary');

	console.log(wb);
	ws = wb.Sheets;
	console.log(ws);

	XLSX.writeFile(wb, 'Commander_Summary_preferences.xlsx');
};

buildPeople.editRow = function (rowNum) {
	buildPeople.tableState.activeRow = rowNum;
	const entry = Object.entries(buildPeople.people[rowNum]);

	if (
		window.event.target.localName === 'path' ||
		window.event.target.localName === 'svg' ||
		window.event.target.localName === 'span'
	) {
		return;
	}

	const children = $(`[data-table-row = ${rowNum}]`).children('td');
	const values = [];
	children.each((_, c) => values.push($(c).text()));

	for (let i = 0; i < buildPeople.headers.length; i++) {
		console.log(buildPeople.headers.length);
		console.log(buildPeople.headers[i], values[i]);
		$(`#${buildPeople.headers[i]}`).val(values[i]);
	}
	document.getElementById('add_row_btn').onclick = () =>
		buildPeople.saveChange();

	$('#cancel_editing').removeClass('invisible');
	$('#add_row_btn').html('<i class="fas fa-check"></i>').addClass('bg-success');
};
