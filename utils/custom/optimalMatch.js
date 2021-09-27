let optimalMatch = {};

// set an array of large numbers hex 9E30 => 40496^10
optimalMatch.initializeLarge = function (size) {
	// let array = [];
	// for (let i = 0; i < size; i++) {
	// 	array.push(9e30);
	// }
	// return array;
	return new Array(size).fill(9e30); // just feeling it out.
};

optimalMatch.findCommandIndex = function (command) {
	let index = -1;
	for (let i = 0; i < optimalMatch.commands.length; i++) {
		if (optimalMatch.commands[i] === command) {
			index = i;
			break;
		}
	}
	return index;
};

//ten is best,one is worst
optimalMatch.scorePeopleFromOneToTen = function (people, rankFactor) {
	//get min and max score
	let min = 9e30;
	let max = -9e30;
	for (let i = 0; i < people.length; i++) {
		let score = people[i].score;
		if (score < min) {
			min = score;
		}
		if (score > max) {
			max = score;
		}
	}

	let range = max - min;
	for (let i = 0; i < people.length; i++) {
		//people[i].score = (max - people[i].score)/range * (rankFactor-1) + 1;
		//this is the exponential version
		people[i].score = Math.pow(
			(max - people[i].score + 0.01) / range,
			rankFactor - 1
		);
	}

	return people;
};

optimalMatch.organizeData = function (lockins, mustFill, rankFactor) {
	//console.table(buildPeople.people);
	//console.log(rankFactor);
	let data = JSON.parse(JSON.stringify(buildPeople.people));
	data = optimalMatch.scorePeopleFromOneToTen(data, rankFactor);
	//console.log(data);
	optimalMatch.matchData = [];

	//add all the billets
	optimalMatch.commands = [];
	for (let i = 0; i < data[0].preferences.length; i++) {
		let cmd = data[0].preferences[i];
		for (let ii = 0; ii < cmd.quantity; ii++) {
			optimalMatch.commands.push(cmd.billet + '--' + ii);
		}
	}

	//add all the people and their preferences into the matchData array
	optimalMatch.people = [];
	for (let i = 0; i < data.length; i++) {
		let person = data[i].name;
		let lockedIn = false;
		if (lockins[person]) {
			lockedIn = true;
		}
		optimalMatch.people.push(person);
		let prefs = optimalMatch.initializeLarge(optimalMatch.commands.length);
		let props = data[i].properties;
		for (let ii = 0; ii < data[i].preferences.length; ii++) {
			let pref = data[i].preferences[ii].pref;
			let billet = data[i].preferences[ii].billet;
			let quantity = data[i].preferences[ii].quantity;
			//console.log(quantity, 'QUANTITY');

			if (lockedIn) {
				if (lockins[person].includes(billet)) {
					pref = 0;
				} else {
					pref = 9e30;
				}
			}

			if (pref != 9e30) {
				pref = pref * data[i].score;
			}

			let reqs = slate.commandReqs[billet];
			for (let iii = 0; iii < quantity; iii++) {
				let index = optimalMatch.findCommandIndex(billet + '--' + iii);
				//console.table([props, reqs]);
				let match = optimalMatch.checkPropertyMatch(props, reqs[iii]);

				if (index !== -1) {
					if (match || lockedIn) {
						prefs[index] = pref;
					} else {
						prefs[index] = 9e30;
						////console.log("no match");
					}
				}
			}
		}
		optimalMatch.matchData.push(prefs);
	}

	//add dummy people and their preferences
	for (let i = 0; i < optimalMatch.commands.length - data.length; i++) {
		optimalMatch.people.push('DummyPerson' + i);
		let prefs = [];
		for (let ii = 0; ii < data[0].preferences.length; ii++) {
			let quantity = data[0].preferences[ii].quantity;
			let thisPref = 0;
			if (mustFill.includes(data[0].preferences[ii].billet)) {
				thisPref = 9e30;
			}
			for (let iii = 0; iii < quantity; iii++) {
				let mustFillThis =
					slate.commandReqs[data[0].preferences[ii].billet][iii];
				mustFillThis = mustFillThis[mustFillThis.length - 1].val;
				if (data[0].preferences[ii].billet.includes('CPRW-10')) {
					//console.log(mustFillThis, iii);
				}
				if (mustFillThis) {
					prefs.push(9e30);
				} else {
					//pushing 0 here means that the dummy person can fill any of these and the billet is not a mando fill
					prefs.push(thisPref);
				}
			}
		}
		optimalMatch.matchData.push(prefs);
	}

	let solution = computeMunkres(optimalMatch.matchData);

	//console.log(solution);
	//console.log(optimalMatch);
	//console.log(optimalMatch.matchData);
	let results = optimalMatch.formatResults(solution, data);

	return results;
};

optimalMatch.checkPropertyMatch = function (personProps, billetProps) {
	let match = true;
	for (let i = 0; i < billetProps.length; i++) {
		if (billetProps[i].prop == 'Must Fill') {
			continue;
		}
		let billetVal = billetProps[i].val;
		let personVal = personProps[billetProps[i].prop];
		if (billetVal && !personVal) {
			match = false;
			break;
		}
	}

	return match;
};

optimalMatch.getPreference = function (name, billet) {
	let person = optimalMatch.getPerson(name);
	for (let i = 0; i < person.preferences.length; i++) {
		if (person.preferences[i].billet.includes(billet)) {
			return person.preferences[i].pref;
		}
	}
	return null;
};

optimalMatch.getPerson = function (name) {
	for (let i = 0; i < buildPeople.people.length; i++) {
		if (buildPeople.people[i].name === name) {
			return buildPeople.people[i];
		}
	}
};

optimalMatch.getLocalPersonIndex = function (people, name) {
	// go over people array
	for (let i = 0; i < people.length; i++) {
		if (people[i].name == name) {
			return i;
		}
	}

	return -1;
};

optimalMatch.formatResults = function (solution) {
	let results = [];
	for (let i = 0; i < solution.length; i++) {
		let sol = solution[i];
		let person = optimalMatch.people[sol[0]];
		if (person.includes('DummyPerson')) {
			continue;
		}
		let billet = optimalMatch.commands[sol[1]];
		if (billet.includes('--')) {
			billet = billet.split('--')[0];
		}

		let pref = optimalMatch.getPreference(person, billet);
		results.push({ name: person, billet: billet, pref: pref });
	}
	return results;
};

optimalMatch.avg = function (arr) {
	//get the average of the array arr
	let sum = 0;
	for (let i = 0; i < arr.length; i++) {
		sum += arr[i];
	}

	return sum / arr.length;
};
optimalMatch.score = function (matches) {
	let localPeople = JSON.parse(JSON.stringify(buildPeople.people));
	localPeople.sort((a, b) => (a.score > b.score ? 1 : -1));
	let totalPeople = localPeople.length;
	let data = {};
	let total = 0;
	let adjustedTotal = 0;
	let quintiles = new Array(5);
	for (let q = 0; q < quintiles.length; q++) {
		quintiles[q] = [];
	}
	data.over3 = 0;
	for (let i = 0; i < matches.length; i++) {
		let person = optimalMatch.getPerson(matches[i].name);
		let adjustedPref = optimalMatch.getAdjustedPrefs(
			person.preferences,
			matches[i].pref
		);

		total += matches[i].pref;
		adjustedTotal += adjustedPref;
		if (matches[i].pref > 5) {
			data.over3++;
		}

		let personIndex = optimalMatch.getLocalPersonIndex(
			localPeople,
			matches[i].name
		);
		let percentile = Math.floor((personIndex / totalPeople) * 5);
		quintiles[percentile].push(matches[i].pref);
	}
	//get avg of each quintile
	for (let q = 0; q < quintiles.length; q++) {
		quintiles[q] = optimalMatch.avg(quintiles[q]);
	}
	data.avg = total / matches.length;
	data.adjustedAvg = adjustedTotal / matches.length;
	data.quintiles = quintiles;
	return data;
};

optimalMatch.getAdjustedPrefs = function (prefs, thePref) {
	let adjusted = [];
	for (let i = 0; i < prefs.length; i++) {
		let pref = parseInt(prefs[i].pref);
		if (pref < 9e30) {
			adjusted.push(pref);
		}
	}

	adjusted.sort(function (a, b) {
		return a - b;
	});

	for (let i = 0; i < adjusted.length; i++) {
		if (adjusted[i] == thePref) {
			return i + 1;
		}
	}
	return null;
};
