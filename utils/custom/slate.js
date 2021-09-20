let slate = new Object();
slate.matches = [];
var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
slate.lastTime;
const state = {
	isDataLoaded: false,
};
slate.enter = function () {
	//build intiial UI
	let html = `
        <div class="row mb-3 justify-content-center">
            <button class="btn btn-secondary" onclick="slate.load()" id="slate_load_data">Load Data</button>
            <input type="file" hidden id="fileUpload"></input>
            <button onclick="slate.writeSlate()" class="btn btn-primary ml-3" disabled>View Personnel</button>
            <button onclick="slate.writeCommands()" class="btn btn-primary ml-3" disabled>View Commands</button>
            <button onclick="slate.reRun()" class="btn btn-warning ml-3" disabled>Re-Build</button>

            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle ml-3" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" disabled>
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

    `;

	$('#content').html(html);
	$('#header').html('');
};

slate.getAmountOfBilletsAllowed = function (billetName) {
	for (let i = 0; i < buildPeople.people[0].preferences.length; i++) {
		if (buildPeople.people[0].preferences[i].billet == billetName) {
			return {
				quantity: buildPeople.people[0].preferences[i].quantity,
				index: i,
			};
		}
	}
	return { quantity: 0, index: -1 };
};

slate.writeCommands = function () {
	let html = slate.writeStats();

	html += "<table class='table'>";
	html += `
        <tr>
            <th>Name</th>
            <th>Billets Allowed</th>
            <th>Billets Allocated</th>
            <th>Must Fill</th>
            <th>Req's</th>
            <th>Names</th>
        </tr>


    `;

	for (let i = 0; i < slate.commandOrder.length; i++) {
		let theCommand = slate.commandOrder[i];
		let index = slate.getAmountOfBilletsAllowed(theCommand);
		let amountAllowed = index.quantity;
		index = index.index;
		let mustFill = false;
		if (slate.mustFills.includes(theCommand)) {
			mustFill = true;
		}
		let peopleBilleted = slate.commands[theCommand];
		let numberPeopleBilleted;
		let string;
		try {
			numberPeopleBilleted = peopleBilleted.length;
			string = '';
			for (let j = 0; j < numberPeopleBilleted; j++) {
				let theName = peopleBilleted[j];
				string += theName;
				if (j < numberPeopleBilleted - 1) {
					string += ', ';
				}
			}
		} catch {
			numberPeopleBilleted = 0;
			string = 'None';
		}
		if (numberPeopleBilleted < amountAllowed) {
			html += `<tr style="background-color:#ff8d85">`;
		} else {
			html += '<tr>';
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
            <td>`;
		if (mustFill) {
			html += `<input class="form-check-input ml-3 mustFill" onclick="slate.buildMustFills()" type="checkbox" id="${index}-mustFill" checked>`;
		} else {
			html += `<input class="form-check-input ml-3 mustFill" onclick="slate.buildMustFills()" type="checkbox" id="${index}-mustFill">`;
		}
		html += `</td>
            <td>
                <button class="btn btn-secondary ml-3" onclick="slate.getRequirementsUi(${index})">Set</button>
            </td>
            <td>
                ${string}
            </td>
        </tr>

        
        `;
	}
	html += '</table>';
	$('#slate').html(html);
	slate.recordImpactSlider = $('#rankImportSlider').slider();
	slate.recordImpactSlider.on('slideStop', (e) => {
		slate.updateRecordImpact();
	});
};

slate.getRequirementsUi = function (index) {
	let billet = buildPeople.people[0].preferences[index].billet;
	let reqs = slate.commandReqs[billet];
	console.log(reqs);
	let html = `
        <h3>${billet}</h3>
        <button class="btn btn-secondary ml-3 mb-3" onclick="slate.writeCommands()">Go Back</button>
        <table class="table">
            <tr>
            <th>#</th>`;
	for (let i = 0; i < reqs[0].length; i++) {
		let prop = reqs[0][i];
		html += `<th>${prop.prop}</th>`;
	}
	html += `</tr>`;
	for (let i = 0; i < reqs.length; i++) {
		html += `<tr>`;
		html += `<td>${i + 1}</td>`;
		for (let ii = 0; ii < reqs[i].length; ii++) {
			let val = reqs[i][ii].val;
			html += '<td>';
			if (val) {
				html += `<input class="form-check-input ml-3 mustFill" onclick="slate.storeReqChange(${index},${i},${ii})" type="checkbox" id="${index}-${i}-${ii}-req" checked>`;
			} else {
				html += `<input class="form-check-input ml-3 mustFill" onclick="slate.storeReqChange(${index},${i},${ii})" type="checkbox" id="${index}-${i}-${ii}-req">`;
			}
			html += '</td>';
		}
		html += `</tr>`;
	}

	html += `
        </table>    
    `;
	$('#slate').html(html);
};

slate.storeReqChange = function (billetIndex, reqIndex, propIndex) {
	let billet = buildPeople.people[0].preferences[billetIndex].billet;
	let reqs = slate.commandReqs[billet];
	let val = $(`#${billetIndex}-${reqIndex}-${propIndex}-req`).is(':checked');
	console.log(reqs, val, reqIndex, propIndex, reqs[reqIndex][propIndex]);
	reqs[reqIndex][propIndex].val = val;
};
slate.buildMustFills = function () {
	slate.mustFills = [];
	for (let i = 0; i < buildPeople.people[0].preferences.length; i++) {
		let theCommand = buildPeople.people[0].preferences[i].billet;
		let mustFill = $('#' + i + '-mustFill').is(':checked');
		console.log(theCommand, mustFill);
		if (mustFill) {
			slate.mustFills.push(theCommand);
		}
	}
};

slate.writeStats = function () {
	let html = `
        <div>Number with > Fifth Choice: ${slate.stats.over3}</div>
        <table class="table">
            <tr>
                <th>Stat</th>
                <th>Total</th>
                <th>Top 20%</th>
                <th>21%-40%</th>
                <th>41%-60%</th>
                <th>61%-80%</th>
                <th>Bottom 20%</th>
            </tr>
            <tr>
                <td>Avg Preference</td>
                <td> ${Math.round(100 * slate.stats.avg) / 100}</td>
                <td>${Math.round(100 * slate.stats.quintiles[0]) / 100}</td>
                <td>${Math.round(100 * slate.stats.quintiles[1]) / 100}</td>
                <td>${Math.round(100 * slate.stats.quintiles[2]) / 100}</td>
                <td>${Math.round(100 * slate.stats.quintiles[3]) / 100}</td>
                <td>${Math.round(100 * slate.stats.quintiles[4]) / 100}</td>
        </table>
        <hr>
        <div class="row"> 
            <div class="form-group col-4 text-center">
                <label>Alternative Choice Impact</label>
                <select onchange="slate.getImpactOfChange()" class="form-control"  id="assess-billet-impact-title">`;
	let person = buildPeople.people[0];
	for (let i = 0; i < person.preferences.length; i++) {
		let theBillet = person.preferences[i].billet;
		html += `<option value="${theBillet}">${theBillet}</option>`;
	}
	html += `</select>
            </div>
            <div class="form-group col-4 text-center">
                <label>Importance of Record</label></br>
                <input id="rankImportSlider" 
                
                data-slider-min="1"
                data-slider-max="10"
                data-slider-step="1"
                scale="logarithmic"
                data-slider-value="${slate.recordImpact}">
                </input>
            </div>
        </div>

    
    `;
	return html;
	// slate.updateRecordImpact();
};

slate.updateRecordImpact = function () {
	let val = slate.recordImpactSlider.slider('getValue');

	slate.recordImpact = val;
	slate.reRun();
};

slate.findMatchByPersonName = function (name) {
	for (let match in slate.matches) {
		let theMatch = slate.matches[match];
		if (theMatch.name == name) {
			return theMatch;
		}
	}
	return null;
};
slate.writeSlate = function () {
	let html = slate.writeStats();
	html += "<table class='table'>";
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


    `;

	for (let i = 0; i < buildPeople.people.length; i++) {
		let person = buildPeople.people[i];
		let theMatch = slate.findMatchByPersonName(person.name);

		html += `
        <tr>
            <td>
                ${theMatch.name}
            </td>
            <td>
                <select class="form-control" onchange="slate.saveLockins()" style="min-width:300px" id="${person.name}-billet">`;
		for (let i = 0; i < person.preferences.length; i++) {
			let theBillet = person.preferences[i].billet;
			let thePreference = person.preferences[i].pref;
			html += `<option value="${theBillet}">${thePreference}) - ${theBillet}</option>`;
		}
		html += `</select>
            </td>
            <td>`;
		if (theMatch.pref > 5) {
			html += "<span style='color:red'><b>" + theMatch.pref + '</b></span>';
		} else {
			html += theMatch.pref;
		}
		html += `</td>
            <td>`;
		if (person.lockedIn) {
			html += `<input class="form-check-input ml-3" onclick="slate.saveLockins()"  type="checkbox" id="${person.name}-lockedIn" checked>`;
		} else {
			html += `<input class="form-check-input ml-3" onclick="slate.saveLockins()" type="checkbox" id="${person.name}-lockedIn">`;
		}
		html += `</td>
            <td>
                ${person.notes || ''}
            </td>
            <td id="${person.name}-impact">
            </td>
        </tr>


        
        `;
	}
	html += '</table>';
	$('#slate').html(html);

	slate.setToBilletedJob();
	slate.getImpactOfChange();
	slate.recordImpactSlider = $('#rankImportSlider').slider();
	slate.recordImpactSlider.on('slideStop', (e) => {
		slate.updateRecordImpact();
	});
};

slate.saveLockins = function () {
	var lockins = {};
	//find out who is locked in
	for (let i = 0; i < buildPeople.people.length; i++) {
		let thisName = buildPeople.people[i].name;

		let lockedIn = $('#' + thisName + '-lockedIn').is(':checked');
		if (!lockedIn) {
			buildPeople.people[i].lockedIn = false;
			continue;
		} else {
			buildPeople.people[i].lockedIn = true;
			lockins[thisName] = $('#' + thisName + '-billet').val();
		}
	}

	slate.lockins = lockins;
};

slate.getImpactOfChange = function () {
	console.log(slate.matches);
	let impactMatch = $('#assess-billet-impact-title').val();
	//go over all people
	for (let i = 0; i < buildPeople.people.length; i++) {
		let person = buildPeople.people[i];
		let currentMatch = $('#' + person.name + '-billet').val();
		let impactPref = 9e30;
		let currentPref = 9e30;
		//find the pref of this billet and of the current billet
		for (let ii = 0; ii < person.preferences.length; ii++) {
			let pref = person.preferences[ii];
			if (pref.billet == impactMatch) {
				impactPref = pref.pref;
			}
			if (pref.billet == currentMatch) {
				currentPref = pref.pref;
			}
		}

		//find the difference between the two
		let impact = impactPref - currentPref;
		let text = '';

		if (impact < 0) {
			text =
				"<span style='color:green;'>" + impactPref + '(' + impact + ')</span>';
		} else if (impact > 0) {
			text =
				"<span style='color:red;'>" + impactPref + '(+' + impact + ')</span>';
		} else {
			text = '<span>No Change</span>';
		}

		if (impactPref >= 9e5) {
			text = "<span style='color:red;'>Unqualified</span>";
		}
		$('#' + person.name + '-impact').html(text);
	}
};

slate.setToBilletedJob = function () {
	for (let match in slate.matches) {
		let theMatch = slate.matches[match];
		$('#' + theMatch.name + '-billet').val(theMatch.billet);
	}
};

slate.load = function () {
	document
		.getElementById('fileUpload')
		.addEventListener('change', slate.fullDataHandler, false);
	$('#fileUpload').click();
};

slate.downloadJson = function () {
	var data = {
		people: buildPeople.people,
		matches: slate.matches,
		lockins: slate.lockins,
		mustFills: slate.mustFills,
		commandReqs: slate.commandReqs,
		commandOrder: slate.commandOrder,
	};
	let exportName = 'savedSlate';
	var dataStr =
		'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute('href', dataStr);
	downloadAnchorNode.setAttribute('download', exportName + '.json');
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
};

slate.readFile = function (evt) {
	var files = evt.target.files; // FileList object
	f = files[0];
	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function (theFile) {
		return function (e) {
			slate.fullDataHandler(e, f);
		};
	})(f);

	// Read in the image file as a data URL.
	reader.readAsText(f);
};

slate.fullDataHandler = function (e) {
	console.log('full data handler');
	slate.recordImpact = 1;
	slate.mustFills = [];
	slate.lockins = [];
	slate.commandReqs = {};
	var files = e.target.files; // FileList object
	f = files[0];
	let extension = files[0].name.split('.').pop().toLowerCase();
	console.log(extension, 'Extension');

	var reader = new FileReader();
	reader.onload = function (e) {
		slate.lastTime = performance.now();
		var data = e.target.result;
		if (extension == 'json') {
			let data = JSON.parse(e.target.result);
			console.log(data);
			buildPeople.people = data.people;
			slate.matches = data.matches;
			slate.stats = { avg: 5, over3: 5, quintiles: [5, 5, 5, 5, 5] };
			slate.mustFills = data.mustFills;
			slate.lockins = data.lockins;
			slate.commandReqs = data.commandReqs;
			slate.commandOrder = data.commandOrder;

			slate.writeSlate();
			slate.reRun();
			return;
		}
		if (!rABS) data = new Uint8Array(data);
		var workbook = XLSX.read(data, {
			type: rABS ? 'binary' : 'array',
			cellStyles: true,
		});

		var sheet = workbook.SheetNames[0];

		data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);

		let type = 'HSM';
		if (data[0].SQUADRON.includes('VP') || data[0].SQUADRON.includes('VQ')) {
			type = 'MPRF';
		}
		for (var i = 0; i < data.length; i++) {
			let person = {};
			let lastName = data[i].NAME.split(',')[0];
			i < 10 ? console.log(data[i], 'last') : null;
			let desig = data[i].NAME.split('-')[1];
			if (type == 'MPRF') {
				person.name =
					lastName +
					'-' +
					desig +
					'-' +
					data[i].SQUADRON.replace(/[^a-zA-Z]+/g, '');
			} else if (type == 'HSM') {
				person.name = lastName;
			}

			person.breakout = data[i].Breakout;
			person.notes = data[i].Notes;
			person.lockedIn = false;
			person.prd = data[i]['PRD (YYMM)'];
			person.summaryGroup = parseInt(data[i]['Summary Group']);
			let ep;
			if (!isNaN(person.breakout)) {
				ep = 100 - person.breakout;
				person.score = 1 / person.breakout;
			} else {
				ep = person.breakout.includes('EP');
				if (ep) {
					person.score =
						parseInt(person.breakout.replace(/\D/g, '')) / person.summaryGroup;
				} else {
					person.score =
						(6 + parseInt(person.breakout.replace(/\D/g, ''))) /
						person.summaryGroup;
				}
			}
			if (isNaN(person.score)) {
				person.score = 1;
			}

			person.squadron = data[i].SQUADRON;

			delete data[i].NAME;
			delete data[i].Breakout;
			delete data[i].Notes;
			delete data[i]['PRD (YYMM)'];
			delete data[i].RANK;
			delete data[i].rank;
			delete data[i].SQUADRON;
			delete data[i]['Summary Group'];

			person.preferences = [];
			person.properties = {};
			for (let prop in data[i]) {
				//add in peoples property
				if (prop.includes('*PROP-')) {
					let propShort = prop.replace('*PROP-', '');
					person.properties[propShort] = false;
					if (data[i][prop] == 'Y') {
						person.properties[propShort] = true;
					}

					continue;
				}
				let propArray = prop.split(' ');
				let quantity = parseInt(propArray[propArray.length - 1]);
				if (isNaN(quantity) || quantity == 60 || quantity == 6060) {
					quantity = 1;
				}
				let pref = data[i][prop];
				if (pref == 'n') {
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

		buildPeople.people.sort((a, b) => (a.score > b.score ? 1 : -1));
		//build the command requirements datastructure
		for (let ii = 0; ii < buildPeople.people[0].preferences.length; ii++) {
			let pref = buildPeople.people[0].preferences[ii];
			slate.commandReqs[pref.billet] = [];
			let reqs = [];
			for (let prop in buildPeople.people[0].properties) {
				let req = {};
				req.prop = prop;
				req.val = false;
				reqs.push(req);
			}
			reqs.push({ prop: 'Must Fill', val: false });
			for (let iii = 0; iii < pref.quantity; iii++) {
				slate.commandReqs[pref.billet].push(JSON.parse(JSON.stringify(reqs)));
			}
		}

		console.log(slate.commandReqs);
		console.log(buildPeople);
		slate.organizeData();

		slate.commandOrder = slate.getCommmandOrder(
			buildPeople.people[0].preferences,
			workbook.Sheets[sheet]
		);
	};
	reader.onloadend = (e) => {
		$('button').each((_, b) => {
			$(b).removeAttr('disabled');
		});
	};
	if (rABS) reader.readAsBinaryString(f);
	else reader.readAsArrayBuffer(f);
};

slate.getCommmandOrder = function (preferences, sheet) {
	let commandOrder = [];
	//make an array of excel column names out to 200 columns
	let letters = [
		'A',
		'B',
		'C',
		'D',
		'E',
		'F',
		'G',
		'H',
		'I',
		'J',
		'K',
		'L',
		'M',
		'N',
		'O',
		'P',
		'Q',
		'R',
		'S',
		'T',
		'U',
		'V',
		'W',
		'X',
		'Y',
		'Z',
		'AA',
		'AB',
		'AC',
		'AD',
		'AE',
		'AF',
		'AG',
		'AH',
		'AI',
		'AJ',
		'AK',
		'AL',
		'AM',
		'AN',
		'AO',
		'AP',
		'AQ',
		'AR',
		'AS',
		'AT',
		'AU',
		'AV',
		'AW',
		'AX',
		'AY',
		'AZ',
		'BA',
		'BB',
		'BC',
	];
	for (let i = 0; i < letters.length; i++) {
		let val;
		try {
			val = sheet[letters[i] + '1'].v;
		} catch (e) {
			continue;
		}

		for (let ii = 0; ii < preferences.length; ii++) {
			if (val == preferences[ii].billet) {
				commandOrder.push(preferences[ii].billet);
			}
		}
	}
	return commandOrder;
};

slate.organizeData = function () {
	//this is the stable marriage implementation
	slate.matches = optimalMatch.organizeData(
		[],
		slate.mustFills,
		slate.recordImpact
	);
	console.log(slate.matches);
	let stats = optimalMatch.score(slate.matches);
	//slate.matches = stats.summary

	slate.stats = {
		avg: stats.avg,
		over3: stats.over3,
		adjustedAvg: stats.adjustedAvg,
		quintiles: stats.quintiles,
	};
	slate.commands = {};

	for (let match in slate.matches) {
		let theMatch = slate.matches[match];
		let command = theMatch.billet;
		try {
			slate.commands[command].push(theMatch.name);
		} catch {
			slate.commands[command] = [];
			slate.commands[command].push(theMatch.name);
		}
	}

	slate.writeSlate();
	console.log(performance.now() - slate.lastTime);
	console.log(slate.stats);
};

slate.reRun = function () {
	slate.matches = optimalMatch.organizeData(
		slate.lockins,
		slate.mustFills,
		slate.recordImpact
	);
	let stats = optimalMatch.score(slate.matches);
	//slate.matches = stats.summary
	slate.stats = {
		avg: stats.avg,
		over3: stats.over3,
		adjustedAvg: stats.adjustedAvg,
		quintiles: stats.quintiles,
	};
	slate.commands = {};

	for (let match in slate.matches) {
		let theMatch = slate.matches[match];
		let command = theMatch.billet;
		try {
			slate.commands[command].push(theMatch.name);
		} catch {
			slate.commands[command] = [];
			slate.commands[command].push(theMatch.name);
		}
	}

	slate.writeSlate();
};

slate.writeExcelSlate = function () {
	let wb = XLSX.utils.book_new();
	wb.Props = {
		Title: 'Slate',
		Subject: 'Preferences',
		Author: 'MPRWS SDT',
		CreatedDate: new Date(),
	};

	//add headers
	let ws_data = [['Name', 'Command', 'Choice']];

	//add slate
	for (let i = 0; i < slate.matches.length; i++) {
		let match = slate.matches[i];
		ws_data.push([match.name, match.billet, match.pref]);
	}
	let ws = XLSX.utils.aoa_to_sheet(ws_data, { header: 0 });
	XLSX.utils.book_append_sheet(wb, ws, 'Slate');

	console.log(wb);

	XLSX.writeFile(wb, 'slate.xlsx');
};
