let buildCommands = new Object();

buildCommands.tableBody = null;

buildCommands.commands = [
	['MPRWS', 'Jacksonville, FL', 'NFO', '400I', 1, 2, 0, ''],
	['MPRWS', 'Jacksonville, FL', 'NFO', '500', 1, 2, 0, ''],
];
buildCommands.headers = [
	'commandName',
	'commandLocation',
	'desiredDesignation',
	'desiredACTC',
	'minBillets',
	'maxBillets',
	'efmcategory',
	'extraDetails',
];

buildCommands.tableState = {
	activeRow: null,
};

buildCommands.enter = function () {
	buildCommands.initCommands();
	$('#header').html('<h3>Commands</h3>');

	buildCommands.writeCommands();
};

buildCommands.initCommands = function () {
	let html = `
             <div id="commands" class="container-fluid">
            <div class="row border" style="height: calc(90% - 150px);">
                <div class="col-9 border h-100 table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light table-striped">
                            <th>Command</th>
                            <th>Location</th>
                            <th>Designator</th>
                            <th>Min ACTC</th>
                            <th>Min Billets</th>
                            <th>Max Billets</th>
                            <th>EFM</th>
							<th>Extra Details</th>
                            <th></th>

                        </thead>
                        <tbody id="build_commands_table">

                        </tbody>
                    </table>
                </div>
                <div class="col-3  h-100 container-fluid">
                    <div class="row  justify-content-center align-items-center" style="height: 10%;">
                        <button class="btn btn-secondary m-2" onclick="buildCommands.load()">Load Config</button>
                        <input type="file" hidden id="fileUpload"></input>
                        <div class="dropdown">
                            <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton"
                                data-toggle="dropdown" data-bs-toggle="dropdown" aria-haspopup="true"
                                aria-expanded="false">
                                Download
                            </button>
                            <div class="dropdown-menu m-2" aria-labelledby="dropdownMenuButton">
                                <a class="dropdown-item" href="#"
                                    onclick="buildCommands.buildPreferenceSheet()">Download Preferences
                                    Sheet</a>
                                <a class="dropdown-item" href="#" onclick="buildCommands.saveConfig()">Download
                                    Config</a>
                            </div>
                        </div>
                    </div>
                    <div class="row " style="height: 80%; overflow-y: scroll;">
                        <form class="w-100 m-2">
                            <div class="form-group">
                                <label for="commandName">Command Name</label>
                                <input type="text" class="form-control" id="commandName" placeholder="MPRWS">
                            </div>
                            <div class="form-group">
                                <label for="commandLocation">Command Location</label>
                                <input type="text" class="form-control" id="commandLocation"
                                    placeholder="Jacksonville, FL">
                            </div>
                            <div class="form-group">
                                <label for="desiredDesignation">Desired Designator</label>
                                <select class="form-control" id="desiredDesignation">
                                    <option selected>Either</option>
                                    <option>NFO</option>
                                    <option>Pilot</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="desiredACTC">Prefered ACTC</label>
                                <select class="form-control" id="desiredACTC">
                                    <option value="None" selected>None</option>
                                    <option value="300">300</option>
                                    <option value="400I">400I</option>
                                    <option value="400M">400M</option>
                                    <option value="500">500</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="minBillets">Min. Billets</label>
                                <input type="text" class="form-control" id="minBillets">
                            </div>
                            <div class="form-group">
                                <label for="maxBillets">Max. Billets</label>
                                <input type="text" class="form-control" id="maxBillets">
                            </div>
                            <div class="form-group">
                                <label for="efmcategory">EFM Category</label>
                                <select class="form-control" id="efmcategory">
                                    <option value="0">None</option>
                                    <option value="1">CAT I</option>
                                    <option value="2">CAT II</option>
                                    <option value="3">CAT III</option>
                                    <option value="4">CAT IV</option>
                                    <option value="5">CAT V</option>
                                    <option value="6">CAT VI</option>
                                </select>
                            </div>
							<div class="form-group">
                                <label for="extraDetails">Extra Details</label>
                                <textarea  class="form-control" rows=10 id="extraDetails"></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="row bg-transparent justify-content-end align-items-center" style="height: 10%;">
                        <button type="button" id="cancel_editing"
                            class="invisible fab_main_btn bg-danger color-white ml-8" onclick="cancelEdit()">
                            <i class="fas fa-times"></i>
                        </button>

                        <button type="button" class="fab_main_btn bg-primary color-white ml-8" id="add_row_btn"
                            onclick="buildCommands.addCommand()">
                            <i class="fas fa-plus"></i>
                        </button>


                    </div>
                </div>
            </div>

        </div>
        `;

	$('#content').html(html);
};

buildCommands.writeCommands = function () {
	if (buildCommands.commands.length < 1) {
		$('#build_commands_table').html(
			`<h3>No commands loaded. Please load a config file or add a command</h3>`
		);
	} else {
		const html = buildCommands.commands.reduce((prev, curr, i) => {
			return (prev += `<tr data-table-row=1 onclick="buildCommands.editRow(${i})">
                        <td ondblclick="buildCommands.editCell(this)" ontextarea="buildCommands.saveCellChange(this, ${i}, 0)" data-table-cell = 0>${
				curr[0]
			}</td>
                        <td ondblclick="buildCommands.editCell(this)" oninput="buildCommands.saveCellChange(this, ${i}, 1)" data-table-cell = 1>${
				curr[1]
			}</td>
                        <td ondblclick="buildCommands.editCell(this)" oninput="buildCommands.saveCellChange(this, ${i}, 2)" data-table-cell = 2>${
				curr[2]
			}</td>
                        <td ondblclick="buildCommands.editCell(this)" oninput="buildCommands.saveCellChange(this, ${i}, 3)" data-table-cell = 3>${
				curr[3]
			}</td>
                        <td ondblclick="buildCommands.editCell(this)" oninput="buildCommands.saveCellChange(this, ${i}, 4)" data-table-cell = 4>${
				curr[4]
			}</td>
                        <td ondblclick="buildCommands.editCell(this)" oninput="buildCommands.saveCellChange(this, ${i}, 5)" data-table-cell = 5>${
				curr[5]
			}</td>
                        <td ondblclick="buildCommands.editCell(this)" oninput="buildCommands.saveCellChange(this, ${i}, 6)" data-table-cell = 6>${
				curr[6]
			}</td>
						<td style = " max-width: 160px; word-wrap:break-word;"ondblclick="buildCommands.editCell(this)" oninput="buildCommands.saveCellChange(this, ${i}, 7)" data-table-cell = 7>${
				curr[7] === '' || curr[7] === undefined ? 'None' : curr[7]
			}</td>
                        <td data-noedit='true'>
                            <div class="d-flex align-items-center">
                                <span class="text-danger ml-2 mr-4 " style="font-size: 1.5rem;" data-row-delete=1
                                    onclick="buildCommands.deleteRow(${i})">
                                    <i class="fas fa-trash "></i>
                                </span>
                            </div>
                        </td >
                    </tr >`);
		}, ``);

		$(`#build_commands_table`).html(html);
	}
};

buildCommands.load = function () {
	document
		.getElementById('fileUpload')
		.addEventListener('change', buildCommands.readFile, false);
	$('#fileUpload').click();
};

buildCommands.readFile = function (evt) {
	var files = evt.target.files; // FileList object
	f = files[0];
	var reader = new FileReader();

	// Closure to capture the file information.
	reader.onload = (function (theFile) {
		return function (e) {
			// Render thumbnail.
			JsonObj = JSON.parse(e.target.result);
			buildCommands.commands = JsonObj;
			buildCommands.writeCommands();
		};
	})(f);

	// Read in the image file as a data URL.
	reader.readAsText(f);
};

buildCommands.saveConfig = function () {
	//from https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
	let exportName = 'commandsConfig';
	var dataStr =
		'data:text/json;charset=utf-8,' +
		encodeURIComponent(JSON.stringify(buildCommands.commands));
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute('href', dataStr);
	downloadAnchorNode.setAttribute('download', exportName + '.json');
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
};

buildCommands.buildPreferenceSheet = function () {
	buildCommands.reshapeData();
	let wb = XLSX.utils.book_new();
	wb.Props = {
		Title: 'Personnel Preference Sheet',
		Subject: 'Preferences',
		Author: 'MPRWS SDT',
		CreatedDate: new Date(),
	};

	//add personal data
	let ws_data = [
		[
			'Rank',
			'First Name',
			'Last Name',
			'Designator',
			'Current Command',
			'ACTC at Checkout',
			'Co-located/Dual-Mil (yes/no)',
			'EFM (no (0), or category #(1-6))',
			'WTI Rec (yes/no)',
			'Extra Details',
		],
	];

	let ws = XLSX.utils.aoa_to_sheet(ws_data, { header: 0 });
	ws['!col'] = {
		wch: 84,
	};
	XLSX.utils.book_append_sheet(wb, ws, 'Personal Details');
	console.log(wb);

	//add preferences
	ws_data = [
		[
			'Command',
			'Location',
			'Min. ACTC',
			`Rank (1-${buildCommands.commands.length})`,
			'Unable due to EFM (yes,no)',
			'Available Billets',
		],
	];
	console.log(ws);

	//add each command to the sheet
	for (let i = 0; i < buildCommands.commands.length; i++) {
		let efmCat;
		if (buildCommands.commands[i].efmCat < 1) {
			efmCat = 'Y';
		} else if (buildCommands.commands[i].efmCat > 1) {
			efmCat = 'N';
		}
		ws_data.push([
			buildCommands.commands[i].name,
			buildCommands.commands[i].location,
			buildCommands.commands[i].minACTC,
			'', // leaving this blank for now
			efmCat,
			parseInt(buildCommands.commands[i].maxBillets),
		]);
		console.log(ws_data);
	}
	ws = XLSX.utils.aoa_to_sheet(ws_data, { header: 0 });
	XLSX.utils.book_append_sheet(wb, ws, 'Individual Preferences');

	console.log(wb);
	ws = wb.Sheets;
	console.log(ws);

	XLSX.writeFile(wb, 'slate_preferences.xlsx');
};

buildCommands.deleteRow = function (i) {
	if (buildCommands.commands.length <= 1) {
		buildCommands.commands = [];
	} else {
		buildCommands.commands.splice(i, 1);
	}
	buildCommands.writeCommands();
};

buildCommands.addCommand = function () {
	const values = [];

	for (let id of buildCommands.headers) {
		values.push($(`#${id}`).val());
	}

	buildCommands.commands.push(values);
	buildCommands.writeCommands();
};

buildCommands.saveChange = function () {
	if (buildCommands.tableState.activeRow !== null) {
		const values = [];

		for (let id of buildCommands.headers) {
			values.push($(`#${id}`).val());
		}

		buildCommands.commands[buildCommands.tableState.activeRow] = values;

		$('#cancel_editing').addClass('invisible');
		$('#add_row_btn')
			.html('<i class="fas fa-plus"></i>')
			.removeClass('bg-success')
			.addClass('bg-primary');

		$('#commandName').focus();

		document.getElementById('add_row_btn').onclick = buildCommands.addCommand;
		$(':input', 'form')
			.not(':button, :submit, :reset, :hidden')
			.val('')
			.prop('checked', false)
			.prop('selected', false)
			.prop('selected', true);
		buildCommands.writeCommands();
	}
};

buildCommands.editRow = function (rowNum) {
	buildCommands.tableState.activeRow = rowNum;
	const entry = buildCommands.commands[rowNum];

	if (
		window.event.target.localName === 'path' ||
		window.event.target.localName === 'svg' ||
		window.event.target.localName === 'span'
	) {
		return;
	}

	for (let index = 0; index < entry.length; index++) {
		const element = entry[index];

		$(`#${buildCommands.headers[index]}`).val(element);
	}
	document.getElementById('add_row_btn').onclick = () =>
		buildCommands.saveChange();

	$('#cancel_editing').removeClass('invisible');
	$('#add_row_btn').html('<i class="fas fa-check"></i>').addClass('bg-success');
};

buildCommands.editCell = function (elem) {
	elem.setAttribute('contenteditable', true);

	elem.addEventListener('blur', (e) => {
		e.target.removeAttribute('contenteditable', true);
	});
};

buildCommands.saveCellChange = function (elem, row, col) {
	const value = $(elem).text();
	if (isNaN(parseInt(value))) {
		buildCommands.commands[row][col] = value;
	} else if (typeof parseInt(value) === 'number') {
		buildCommands.commands[row][col] = parseInt(value);
	}
};

buildCommands.reshapeData = function () {
	let checkEntry = buildCommands.commands[0];
	const values = [];
	['MPRWS', 'Jacksonville, FL', 'NFO', '500', 1, 2, 2];
	if (Array.isArray(checkEntry)) {
		for (let entry of buildCommands.commands) {
			const obj = {
				name: entry[0],
				location: entry[1],
				designator: entry[2],
				minACTC: entry[3],
				minBillets: entry[4],
				maxBillets: entry[5],
				efmCat: entry[6],
				extraDetails: entry[7],
			};

			values.push(obj);
		}
	} else if (typeof checkEntry === 'object' && checkEntry !== null) {
		for (let entry of buildCommands.commands) {
			const arr = [
				entry.name,
				entry.location,
				entry.designator,
				entry.minACTC,
				entry.minBillets,
				entry.maxBillets,
				entry.efmCat,
				entry.extraDetails,
			];
			values.push(arr);
		}
	}

	buildCommands.commands = values;
};
