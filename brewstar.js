function Recipe() {
    // inputs
    this.name = "";
    this.style = -1;
    this.batchSize = 0;
    this.batchUnits = "";
    this.units = "us";
    this.efficiency = 70; // default value 70%
    this.notes = "";
    // lists of components
    this.fermentables = [];
    this.flavorings = [];
    this.fermenters = [];
    // calculated results
    this.atten = 0.0;
    this.gravityPoints = 0.0;
    this.ibu = 0.0;
    this.srm = 0.0;

    this.mashWeight = 0.0;
    this.needsMash = false;
    this.hasSteepable = false;
    this.hasSugar = false;
    this.hasExtract = false;
}

// verify recipe is valid
Recipe.prototype.verify = function() {
    var mpButtonReport = document.getElementById("mpopupButtonReport");
    var complete = true;
    
    complete &= verifyBasics();
    complete &= verifyFermentables();
    complete &= verifyFlavorings();
    complete &= verifyFermenters();
    if (complete) {
	mpButtonReport.setAttribute("style", "background-color:#16a34a;");
	mpButtonReport.onclick = function() {
	    //alert("pre-open");
	    formatRecipeReport("report_div");
	    mpopupReport.style.display = "block";
	};
    } else {
	mpButtonReport.setAttribute("style", "background-color:gray;");
	mpButtonReport.onclick = function() {};
    }
}

function formatRecipeReport(div) {
    let style = Data.Styles[RECIPE.style];
    let i;
    let str = "<h2>" + RECIPE.name + "</h2>";
    str += "<p>Recipe for the BJCP style " + style.name + ".</p>";
    str += "<p>" + style.description + "</p>";
    str += '<table class="table_recipe">';
    str += '<thead>';
    str += '<tr>';
    str += '<th>Batch Size</th>';
    str += '<th>Color</th>';
    str += '<th>Est. OG</th>';
    str += '<th>ABV</th>';
    str += '</tr>';
    str += '</thead>';
    str += '<tbody>';
    str += '<tr>';
    str += '<td>' + RECIPE.batchSize + ' ' + RECIPE.batchUnits + '</td>';
    str += '<td>' + SRMcolorname(RECIPE.srm) + ' <div style="margin:0; height:20px; width:24px; border: 1px solid black; clear:both; ' + 'background-color:' + SRMcolorcode(RECIPE.srm) + '"></div>' + '</td>';
    str += '<td>' + document.getElementById("calcOriginalGravity").innerHTML + '</td>';
    str += '<td>' + document.getElementById("calcAlcohol").innerHTML + '%</td>';
    str += '</tr>';
    str += '</tbody>';
    str += '</table>';

    str += "<h3>Setup</h3> <ol>";
    str += "<li> Prepare yeast starter (if applicable).</li>";
    str += "<li> Double check all ingredients are on hand for recipe.</li>";
    str += "<li> Begin heating water.</li>";
    str += "<li> Add brewing salts, if desired.</li>";
    str += "</ol>";

    //console.log("formatRecipeReport() RECIPE.mashWeight = " + RECIPE.mashWeight);
    let mashWeight = parseFloat(RECIPE.mashWeight, 10);

    let mashWaterThick = (mashWeight * 1.5) / 4;
    let mashWaterMed =  (mashWeight * 2.2) / 4;
    let boilEvaporation = (.12 * RECIPE.batchSize)
    // water absorbed by grain = .125 per pound
    let lossTrub = .125 * RECIPE.mashWeight;
    // "kettle loss" = 8%
    let lossEquipment = Math.max( (RECIPE.batchSize * .08), .4)
    let spargeWater =  (RECIPE.batchSize - mashWaterThick) + boilEvaporation + lossTrub + lossEquipment;

    str += "<h3>Mash</h3>";
    str += "<table class='table_recipe' >";
    str += "<thead>";
    str += "<tr>";
    str += "<th>Name</th>";
    str += "<th>Amount</th>";
    str += "<th>Usage</th>";
    str += "</tr>";
    str += "</thead>";
    str += "<tbody>";
    for (i=0; i<RECIPE.fermentables.length; i++) {
	let item = RECIPE.fermentables[i];
	str += "<tr>";
	str += "<td>" + Data.Malts[item.index].name + "</td>";
	str += "<td>" + item.amount + " " + item.units + "</td>";
	str += "<td>" + item.usage + "</td>";
	str += "</tr>";
    }
    str += "</tbody>";
    str += "</table>";
    str += 'Note: This assumes a simple mash.  Adjust as desired.<br>';
    str += '<table border="1" cellpadding="5">';
    str += "<tr><td>Amount to mash</td>";
    str += "<td>" + mashWeight.toFixed(1) + " lb.</td></tr>";
    str += "<tr><td>Mash water needed (thick)</td>";
    str += "<td>" + mashWaterThick.toFixed(1) + " gal.</td></tr>";
    str += "<tr><td>Mash water needed (medium)</td>";
    str += "<td>" + mashWaterMed.toFixed(1) + " gal.</td></tr>";
    str += "<tr><td>Sparge water needed<br>for a " + RECIPE.batchSize + " gal. batch</td>";
    str += "<td>" + spargeWater.toFixed(1) + " gal.</td></tr>";
    str += "</table> <ol>";

    str += "<li>Weigh out and mill grains.</li>";
    str += "<li>Heat mash water to chosen strike temperature.</li>";
    str += "<li>When strike is reached, add grains to be mashed.</li>";
    str += "<li>Monitor mash temperature during mash and adjust as necessary.</li>";
    str += "</ol>";

    str += "<h3>Sparge/Lauter</h3> <ol>";
    str += "<li>Heat water for sparging to 170&deg;F.</li>";
    str += "<li>Draw off first few quarts of cloudy mash liquid and pour back into mash tun to clarify (vorlauf).</le>";
    str += "<li>After runnings turn clear, add them to the boil kettle.</le>";
    str += "<li>If using batch sparging, add sparge water to mash, wait a few minutes, then drain to kettle.</le>";
    str += "<li>If using continuous/fly sparging, slowly add sparge water to mash, while draining wort.</le>";
    str += "</ol>";

    str += "<h3>Boil</h3> <ol>";
    if (RECIPE.needsMash) {
        str += "<li>Add the sparged wort the kettle and start heat.</li>";
    } else {
        str += "<li>Heat the water.</li>";
    }
    if (RECIPE.hasExtract) {
        str += "<li>Add extract(s). Stir to avoid scorching.</li>";
    }
    if (RECIPE.hasSugar) {
        str += "<li>Add sugar(s). Stir thoroughly to avoid scorching.</li>";
    }
    str += "<li>Stir well to avoid boil over. Start timer when boil starts.</li>";
    str += "<li>Add hops according to schedule.</li> ";
    str += "<table class='table_recipe'>";
    str += "<thead>";
    str += "<tr>";
    str += "<th>Amount</th>";
    str += "<th>Hop</th>";
    str += "<th>Usage</th>";
    str += "</tr>";
    str += "</thead>";
    str += "<tbody>";
    for (let i=0; i<RECIPE.flavorings.length; i++) {
	if (RECIPE.flavorings[i].type == "hop") {
	    let item = RECIPE.flavorings[i];
	    str += "<tr>";
	    str += "<td>";
	    str += item.amount + ' ' + item.units;
	    str += "</td>";
	    str += "<td>";
	    str += Data.Hops[item.index].name;
	    str += "</td>";
	    str += "<td>";
	    str += item.usage;
	    if (item.usage == "boil") {
		str += ' (' + item.boilMinutes + ' minutes)';
	    }
	    str += "</td>";
	    str += "</tr>";
	}
    }
    str += "</tbody>";
    str += "</table>";
    str += "</ol>";

    str += "<h3>Finish</h3> <ol>";
    str += "<li>Cool wort to ~75&deg;F / 25&deg;C.</li>";
    str += "<li>Transfer wort to fermentation container.</li> ";
    str += "<li>Take original gravity reading.</le>";
    str += "<li>Pitch yeast to wort.</li>";
    str += "<li>Store fermentation container in cool, dark place.</li>";
    str += "</ol>";

    let divReport = document.getElementById(div);
    divReport.innerHTML = str;
}


function checkmarkOn(elem) {
    //elem.innerHTML = "&check;";
    //elem.innerHTML = "&#10004;";
    elem.innerHTML = "&#x2705;";
    //elem.innerHTML = "&#x2611;";
}

function checkmarkOff(elem) {
    //alert("checkmarkOff()");
    elem.innerHTML = "&osol;";
}


function verifyBasics() {
    let rs_basics = document.getElementById("recipeStatus_basics");

    //console.log("verifyBasics() name = '" + RECIPE.name + "'");
    if (RECIPE.name.length < 1) {
	checkmarkOff(rs_basics);
	return false;
    }

    //console.log("verifyBasics() style = " + RECIPE.style);
    if (RECIPE.style < 0 || RECIPE.style > Data.Styles.length) {
	checkmarkOff(rs_basics);
	return false;
    }

    //console.log("verifyBasics() batch size = " + RECIPE.batchSize);
    //console.log("verifyBasics() batch size units = '" + RECIPE.batchUnits + "'");
    if (RECIPE.batchSize <= 0) {
	checkmarkOff(rs_basics);
	return false;
    }

    //console.log("verifyBasics() efficiency = '" + RECIPE.efficiency + "'");
    if (RECIPE.efficiency < 40 || RECIPE.efficiency > 90) {
	checkmarkOff(rs_basics);
	return false;
    }
    
    checkmarkOn(rs_basics);
    return true;
}


function verifyFermentables() {
    //console.log("verifyFermentables()");
    let gravTotal = 0.0;
    let colorTotal = 0.0;
    let rs_fermentables = document.getElementById("recipeStatus_fermentables");
    let field_OG = document.getElementById("calcOriginalGravity");

    if (RECIPE.fermentables.length < 1) {
	checkmarkOff(rs_fermentables);
	field_OG.innerHTML = "[add malt]";
	return false;
    }

    RECIPE.mashWeight = 0.0;
    RECIPE.needsMash = false;
    RECIPE.hasSteepable = false;
    RECIPE.hasSugar = false;
    RECIPE.hasExtract = false;

    for (let i=0; i<RECIPE.fermentables.length; i++) {
	//console.log("ingredient type = " + RECIPE.fermentables[i].type);
	let weight = parseFloat(normalizeWeight(RECIPE.fermentables[i].amount, RECIPE.fermentables[i].units));    
	switch (RECIPE.fermentables[i].type) {
	case "malt":
	    let maltYield;
	    if (RECIPE.fermentables[i].usage == "mash") {
		maltYield = Data.Malts[RECIPE.fermentables[i].index].ExtractMashYield/100;
	    } else {
		maltYield = Data.Malts[RECIPE.fermentables[i].index].ExtractSteepYield/100;
	    }
	    let gravPoints = weight * maltYield * Data.Malts[RECIPE.fermentables[i].index].ExtractPotential;
	    let color = weight * Data.Malts[RECIPE.fermentables[i].index].color;
	    //console.log("malt weight = " + weight);
	    //console.log("malt gravPoints = " + gravPoints);
	    //console.log("malt color = " + color);
	    gravTotal += gravPoints;
	    colorTotal += color;
	    if (RECIPE.fermentables[i].usage == "mash") {
		RECIPE.needsMash = true;
		//console.log("verifyFermentables() RECIPE.mashWeight [before] = " + RECIPE.mashWeight);
		//console.log("verifyFermentables() weight = " + weight);
		RECIPE.mashWeight += weight;
		//console.log("verifyFermentables() RECIPE.mashWeight [after] = " + RECIPE.mashWeight);
	    }
	    if (RECIPE.fermentables[i].usage == "steep") {
		RECIPE.hasSteepable = true;
	    }
	    break;
	case 'caramalt':
            gravTotal += weight
                       * Data.CaraMalts[RECIPE.fermentables[i].index].ExtractPotential
                       * Data.CaraMalts[RECIPE.fermentables[i].index].ExtractYield/100;
            colorTotal += weight * Data.CaraMalts[RECIPE.fermentables[i].index].color;
	    if (RECIPE.fermentables[i].usage == "mash") {
		RECIPE.needsMash = true;
		RECIPE.mashWeight += weight;
	    }
	    if (RECIPE.fermentables[i].usage == "steep") {
		RECIPE.hasSteepable = true;
	    }
	    break;
	case 'roastmalt':
            gravTotal += weight
                       * Data.Sugars[RECIPE.fermentables[i].index].ExtractPotential
                       * Data.Sugars[RECIPE.fermentables[i].index].ExtractYield/100;
            colorTotal += weight * Data.Sugars[RECIPE.fermentables[i].index].color;
	    if (RECIPE.fermentables[i].usage == "mash") {
		RECIPE.needsMash = true;
		RECIPE.mashWeight += weight;
	    }
	    if (RECIPE.fermentables[i].usage == "steep") {
		RECIPE.hasSteepable = true;
	    }
	    break;
	case 'specmalt':
            gravTotal += weight
                       * Data.Sugars[RECIPE.fermentables[i].index].ExtractPotential
                       * Data.Sugars[RECIPE.fermentables[i].index].ExtractYield/100;
            colorTotal += weight * Data.Sugars[RECIPE.fermentables[i].index].color;
	    if (RECIPE.fermentables[i].usage == "mash") {
		RECIPE.needsMash = true;
		RECIPE.mashWeight += weight;
	    }
	    if (RECIPE.fermentables[i].usage == "steep") {
		RECIPE.hasSteepable = true;
	    }
	    break;
	case 'extract':
            gravTotal += weight
                       * Data.Extracts[RECIPE.fermentables[i].index].ExtractPotential
                       * Data.Extracts[RECIPE.fermentables[i].index].ExtractYield/100;
            colorTotal += weight * Data.Extracts[RECIPE.fermentables[i].index].color;
	    RECIPE.hasExtract = true;
	    break;
	case 'sugar':
            gravTotal += weight
                       * Data.Sugars[RECIPE.fermentables[i].index].ExtractPotential
                       * Data.Sugars[RECIPE.fermentables[i].index].ExtractYield/100;
            colorTotal += weight * Data.Sugars[RECIPE.fermentables[i].index].color;
	    RECIPE.hasSugar = true;
	    break;
	case 'unmalted':	    
            gravTotal += weight
                       * Data.UnmaltedGrains[RECIPE.fermentables[i].index].ExtractPotential
                       * Data.UnmaltedGrains[RECIPE.fermentables[i].index].ExtractYield/100;
            colorTotal += weight * Data.UnmaltedGrains[RECIPE.fermentables[i].index].color;
	    break;
	default:
	    alert("verifyFermentables() unknown ingredient type = '"
		  + RECIPE.fermentables[i].type + "'");
	}
    }

    // built-in values assume 75% efficiency, adjust if different
    gravTotal = gravTotal * (1.0 + (RECIPE.efficiency - 70)/100);
    //console.log("verifyFermentables() gravTotal = " + gravTotal);
    RECIPE.gravityPoints = gravTotal;
    let volume = RECIPE.batchSize;
    if (RECIPE.batchUnits == "liters") {
	// convert to gallons
	volume *= 0.264;
    }

    // Calculate the original gravity (OG) as the weight of the grains
    //  times their potential extract times the extract efficiency,
    //  all divided by the volume of the beer.
    // OG = (W * PE * EE) / V
    let og = 0.0;
    let plato = 0.0;
    if (RECIPE.batchSize <= 0.0) {
	field_OG.innerHTML = "[No batch size]";
    } else if (RECIPE.gravityPoints > 0.0) {
        // fudge factor for typical homebrew sizes (untested SWAG)
        let fudge = 1.0 - 1.1/(volume * volume);
	let sg = 0.0 + (fudge * RECIPE.gravityPoints) / volume;
	//console.log("sg = " + sg);
	//let plato = (-1 * 616.868) + (1111.14 * sg) - (630.272 * Math.pow(sg, 2)) + (135.997 * Math.pow(sg, 3));
	//console.log("plato = " + plato);
	plato = sg / 4.0;
	og = 1.0 + sg/1000.0;
    }

    if (RECIPE.style >= 0) {
	let styleGravity = Data.Styles[RECIPE.style].gravity.split("-");
	let gravityLow = styleGravity[0];
	let gravityHigh = styleGravity[1];
	//console.log("verifyFermentables() : gravity Low = " + gravityLow);
	//console.log("verifyFermentables() : gravity High = " + gravityHigh);

	if (og < gravityLow) {
            field_OG.innerHTML = "" + og.toFixed(3) + " (Too low)";
	    checkmarkOff(rs_fermentables);
	    return false;
	} else if (og > gravityHigh) {
            field_OG.innerHTML = "" + og.toFixed(3) + " (Too high)";
	    checkmarkOff(rs_fermentables);
	    return false;
	} else {
	    field_OG.innerHTML = "" + og.toFixed(3) + " (" + plato.toFixed(0) + "&deg;P)";
	}
    }

    // Calculate beer color (SRM)
    // SRM = 1.49 * MCU^0.69 (Dan Morey curve for beers up to 50SRM)
    // SRM = (MCU x 0.3) + 4.7 (Randy Mosher)
    // SRM = (MCU * 0.2) + 8.4 (Ray Daniels)
    // where MCU (malt color units) is the weight of the ingredient in pounds
    // times its color rating divided by volume (in gallons).
    //console.log("verifyFermentables() : colorTotal = " + colorTotal);
    if (colorTotal > 0.0 && volume > 0.0)
    {
        let mcu = colorTotal / volume;
        let srm = 1.4922 * Math.pow(mcu, .6859);
        let color = document.getElementById("calcColor");
	RECIPE.srm = srm;
        color.innerHTML = srm.toFixed(0);
    }

    // Calculate alcohol (ABV) 
    // ABV = (OG - FG) * 0.129
    //console.log("verifyFermentables() : RECIPE.atten = " + RECIPE.atten);
    //console.log("verifyFermentables() : RECIPE.gravityPoints = " + RECIPE.gravityPoints);
    //console.log("verifyFermentables() : volume = " + volume);
    if (RECIPE.atten > 0.0 && RECIPE.gravityPoints > 0.0 && volume > 0.0)
    {
        let num = RECIPE.atten/100 * RECIPE.gravityPoints/volume * 0.129;
        let alco = document.getElementById("calcAlcohol");
        alco.innerHTML = num.toFixed(1);
    }

    checkmarkOn(rs_fermentables);
    return true;
}


function verifyFlavorings() {
    //console.log("verifyFlavorings()");
    let rs_flavorings = document.getElementById("recipeStatus_flavorings");
    let field_bitterness = document.getElementById("calcBitterness");

    RECIPE.ibu = 0.0;

    if (RECIPE.flavorings.length < 1) {
	field_bitterness.innerHTML = "[Add Hops]";
	checkmarkOff(rs_flavorings);
	return false;
    }

    if (RECIPE.batchSize <= 0.0) {
	field_bitterness.innerHTML = "[No batch size]";
	checkmarkOff(rs_flavorings);
	return false;
    }
    
    if (RECIPE.gravityPoints <= 0.0) {
        field_bitterness.innerHTML = "[Add malt]";
	checkmarkOff(rs_flavorings);
	return false;
    }
    
    // Calculate bitterness (IBU)
    // AA (mg/l) = hop AA * ozs of hop * 7490 / gallons of wort
    // Garetz formula is often low, not used here
    //Boil Time (min) %Util
    //----------------------------------------
    // 0 -  5           0
    // 6 - 10           0
    //11 - 15           2
    //16 - 20           5
    //21 - 25           8
    //26 - 30          11
    //31 - 35          14
    //36 - 40          16
    //41 - 45          18
    //46 - 50          19
    //51 - 60          20
    //61 - 70          21
    //71 - 80          22
    //81 - 90          23

    //Tinseth formula
    //Util = (1.65*0.000125^(OG-1))*((1-2.72^(-0.04*Boil Time))/4.15)
    //IBU = Util *(oz*(AA% / 100)* 7490) / Volume of Batch in Gallons
    // see http://realbeer.com/hops/research.html
    
    //Rager formula
    // IBU = (W * U * AA% * 7489)/(volume * gravity)
    // where W equals weight (oz.) of the hops,
    // AA% is the alpha acid rating of the hops in percentage,
    // U is the utilization factor as a function of boil time
    //Boil Time(min) %Utilization
    //-----------------------------------
    // 0 -  5         5.0
    // 6 - 10         6.0
    //11 - 15         8.0
    //16 - 20        10.1
    //21 - 25        12.1
    //26 - 30        15.3
    //31 - 35        18.8
    //36 - 40        22.8
    //41 - 45        26.9
    
    //Ray Daniels's chart ("Designing Great Beers", 1996)
    // Boil Time(min) whole pellet
    // dry hop          0     0
    // 0 - 9            5     6
    // 10 - 19          12   15
    // 20 - 29          15   19
    // 30 - 44          19   24
    // 45 - 59          22   27
    // 60 - 74          24   30
    // 75 +             27   34

    // https://mycurvefit.com/
    // y = 3.765896 + 0.5964095*x - 0.00341812*x^2

    // IBU = AAU x U x 74.98 / Vol * adjustments
    // AAU = Weight of hops (oz) x % Alpha Acid rating of the hops.
    // The proper units for IBUs are milligrams per liter.
    // The time and gravity factor of the boil are expressed as the utilization (U).
    // Adjust for heavier worts (OG > 1.050)

    // find IBU based on batch details (size, gravity, boil time, etc.)
    let volume = RECIPE.batchSize;
    if (RECIPE.batchUnits == "liters") {
	// convert to gallons
	volume *= 0.264;
    }
    //console.log("verifyFlavorings() : volume = " + volume);
    //console.log("verifyFlavorings() : gravityPoints = " + RECIPE.gravityPoints);
    for (let i=0; i<RECIPE.flavorings.length; i++) {
	//console.log("verifyFlavorings() : type " + RECIPE.flavorings[i].type);
	if (RECIPE.flavorings[i].type == "hop") {
	    let hopAA = Data.Hops[RECIPE.flavorings[i].index].AlphaAcid;
	    let weight = RECIPE.flavorings[i].amount; // grams or ounces
	    if (RECIPE.flavorings[i].units == "grams") {
		weight /= 28.35;
	    }
	    switch (RECIPE.flavorings[i].hopform) {
	    case "whole": weight *= .92; break;
	    case "pellets": weight *= 1.05; break;
	    case "plugs": break;
	    case "extract": weight *= 3.0; break;
	    }
	    let AA = hopAA * weight;
	    let x = RECIPE.flavorings[i].boilMinutes;
	    let boilUtil = 3.8 + 0.6*x - 0.0034*x*x;
	    let gravCorrection = 1.0;
	    // util = 1.65 * Math.pow(0.000125, gravity) * (1 - Math.exp(-0.04 * time)) / 4.15;
	    if (RECIPE.gravityPoints/volume > 50)
	    {
		let gravDiff = (RECIPE.gravityPoints/volume - 50) /1000.0;
		gravCorrection = 1.0 + (gravDiff / .2);
	    }
	    //console.log("verifyFlavorings() : gravCorrection = " + gravCorrection);
	    
	    let ibu = AA * boilUtil * .75 / volume;
	    RECIPE.ibu += ibu;
	}
    }

    //console.log("verifyFlavorings() : IBU = " + RECIPE.ibu);

    if (RECIPE.style >= 0) {
	let styleIBU = Data.Styles[RECIPE.style].bitterness.split("-");
	let ibuLow = styleIBU[0];
	let ibuHigh = styleIBU[1];
	//console.log("verifyFlavorings() : IBU low = " + ibuLow);
	//console.log("verifyFlavorings() : IBU high = " + ibuHigh);

	if (RECIPE.ibu < ibuLow) {
            field_bitterness.innerHTML = "" + Math.round(RECIPE.ibu) + " (Too low)";
	    checkmarkOff(rs_flavorings);
	    return false;
	}
	if (RECIPE.ibu > ibuHigh) {
            field_bitterness.innerHTML = "" + Math.round(RECIPE.ibu) + " (Too high)";
	    checkmarkOff(rs_flavorings);
	    return false;
	}
    }

    field_bitterness.innerHTML = Math.round(RECIPE.ibu);

    checkmarkOn(rs_flavorings);
    return true;
}

function verifyFermenters() {
    //console.log("verifyFermenters()");
    let rs_fermenters = document.getElementById("recipeStatus_fermenters");

    if (RECIPE.fermenters.length < 1) {
	checkmarkOff(rs_fermenters);
	return false;
    }

    checkmarkOn(rs_fermenters);
    return true;
}

// set to pounds
function normalizeWeight(amount, units) {
    let weight;
    switch (units) {
    case "pounds":
	// parseFloat(
	weight = 0.0 + amount;
	break;
    case "ounces":
	weight = amount / 16.0;
	break;
    case "grams":
	weight = (amount / 1000) * 2.2;
	break;
    case "kilograms":
	weight = amount * 2.2;
	break;
    default:
	alert("normalizeWeight() - bad units '" + units + "'");
    }
    return weight;
}


function changeUnits(sel) {
    //alert("changeUnits " + sel.options[sel.selectedIndex].value);
    RECIPE.units = sel.options[sel.selectedIndex].value;

    RECIPE.verify();
}

function changeStyle(sel) {
    //alert("changeStyle " + sel.selectedIndex);
    
    // subtract one for intro option
    RECIPE.style = sel.selectedIndex - 1;

    let name = document.getElementById("styleName");
    let grav = document.getElementById("styleGravityValue");
    let bitt = document.getElementById("styleBitternessValue");
    let colr = document.getElementById("styleColorValue");
    let alco = document.getElementById("styleAlcoholValue");
    
    let style = Data.Styles[RECIPE.style];
    name.innerHTML = style.name;
    grav.innerHTML = style.gravity;
    bitt.innerHTML = style.bitterness;
    colr.innerHTML = style.color;
    alco.innerHTML = style.alcohol;

    RECIPE.verify();
}

function inputEfficiency(inp) {
    //alert("inputEfficiency() " + inp.value);
    let range = document.getElementById("efficiency_range_value");
    range.innerHTML = inp.value;
}

function changeEfficiency(inp) {
    //alert("changeEfficiency " + sel.options[sel.selectedIndex].value);
    //RECIPE.efficiency = sel.options[sel.selectedIndex].value;
    //alert("changeEfficiency() " + inp.value);
    RECIPE.efficiency = inp.value;

    RECIPE.verify();
}

function changeRecipeName(input) {
    //alert("changeRecipeName " + input.value);
    RECIPE.name = input.value;

    let name = document.getElementById("recipeName");
    name.innerHTML = RECIPE.name;

    RECIPE.verify();
    return false;
}

function changeBasicsNote(text) {
    //alert("changeBasicsNote " + text.value);
    RECIPE.notes = text.value;

    RECIPE.verify();
    return false;
}

function changeBatchSize(form) {
    let units = form['units'];
    //alert("changeBatchSize " + form['amount'].value + ' ' + units.options[units.selectedIndex].value);
    let val = parseFloat(form['amount'].value, 10);
    if (isNaN(val)) {
	RECIPE.batchSize = 0;
    } else {
	RECIPE.batchUnits = units.options[units.selectedIndex].value;
	RECIPE.batchSize = val;
    }

    let batch = document.getElementById("calcBatchSize");
    batch.innerHTML = RECIPE.batchSize + ' ' + RECIPE.batchUnits;

    //let end = 0.9 * RECIPE.batchSize;
    //let yield = document.getElementById("calcYieldSize");
    //yield.innerHTML = end.toFixed(1) + ' ' + RECIPE.batchUnits;

    RECIPE.verify();
    return false;
}


function addRow_Fermentable(subtype, form) {
    let units = form['units'];
    let amt = form['amount'].value;
    let num = form['maltnum'].value;
    //alert("addrow_Fermentable subtype=" + subtype);
    //alert("addrow_Fermentable num=" + num);
    //console.log("addrow_Fermentable num=" + num + ' ' + Data.Malts[num].name);
    //console.log("addrow_Fermentable amt=" + amt);
    //console.log("addrow_Fermentable units=" + units.options[units.selectedIndex].value);

    let usage;
    switch (subtype) {
    case 'malt':
    case 'caramalt':
    case 'roastmalt':
    case 'specmalt':
	{
	    let radios = form["usage"];
	    for (let i = 0, length = radios.length; i < length; i++) {
		//alert("radio i=" + i + " value=" + radios[i].value + " checked=" + radios[i].checked);
		if (radios[i].checked) {
		    usage = radios[i].value;
		    break;
		}
	    }
	}
	break;
    case 'extract':
    case 'sugar':
	usage = "boil";
	break;
    case 'unmalted':
	usage = "gelatinize";
    }

    const rec = {
	"type" : subtype,
	"index" : num,
	"amount" : amt,
	"units" : units.options[units.selectedIndex].value,
	"usage" : usage,
    };
    RECIPE.fermentables.push(rec);

    let list;
    switch (subtype) {
    case 'malt':      list = Data.Malts; break;
    case 'caramalt':  list = Data.CaraMalts; break;
    case 'roastmalt': list = Data.RoastMalts; break;
    case 'specmalt':  list = Data.SpecMalts; break;
    case 'unmalted':  list = Data.UnmaltedGrains; break;
    case 'extract':   list = Data.Extracts; break;
    case 'sugar':     list = Data.Sugars; break;
    default:
	alert("addRow_Fermentable() unknown subtype '" + subtype + "'");
	reurn;
    }

    let cell;
    let cellText;

    let tblBody = document.getElementById("tableFermentables");
    const row = document.createElement("tr");
    
    cell = document.createElement("td");
    let button = document.createElement('button');
    let del = document.createElement("div");
    del.innerHTML = "&otimes;";
    del.classList.add("row-kill");
    button.classList.add("row-kill");
    button.appendChild(del);
    button.setAttribute("onclick", "DeleteRow('tableFermentables', this.parentNode.parentNode.rowIndex)");
    cell.appendChild(button);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(usage);
    cell.appendChild(cellText);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(amt + ' ' + units.options[units.selectedIndex].value);
    cell.appendChild(cellText);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(list[num].name);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    RECIPE.verify();
    return false;
}


function addRow_Flavoring(subtype, form) {
    //alert("addrow_Flavoring subtype=" + subtype);
    let units = form['units'];
    let amt = form['amount'].value;
    let num = -1;

    let usage;
    let boilMinutes = 0;
    let when = form['when'];
    if (subtype == "hop") {
	switch (when.options[when.selectedIndex].value) {
	case "fwh":
	    usage = "First wort hopping";
	    boilMinutes = 75;
	    break;
	case "fullboil":
	    usage = "One-hour boil";
	    boilMinutes = 60;
	    break;
	case "halfboil":
	    usage = "Half-hour boil";
	    boilMinutes = 30;
	    break;
	case "aroma":
	    usage = "Aroma hop";
	    boilMinutes = 10;
	    break;
	case "hopback":
	    usage = "Hopback";
	    boilMinutes = 0;
	    break;
	case "dryhophrausen":
	    usage = "Dry hop (krausen)";
	    boilMinutes = 0;
	    break;
	case "drophopsecondary":
	    usage = "Dry hop (secondary)";
	    boilMinutes = 0;
	    break;
	default:
	    usage = "?";
	}
    } else if (subtype == "spice") {
	switch (when.options[when.selectedIndex].value) {
	case "boil":
	    usage = "Boil";
	    break;
	case "secondary":
	    usage = "Secondary";
	    break;
	case "bottling":
	    usage = "Bottling";
	    break;
	default:
	    usage = "?";
	}
    } else if (subtype == "flavoring") {
	switch (when.options[when.selectedIndex].value) {
	case "boil":
	    usage = "Boil";
	    break;
	case "secondary":
	    usage = "Secondary";
	    break;
	case "bottling":
	    usage = "Bottling";
	    break;
	default:
	    usage = "?";
	}
    } else {
	alert("addRow_Flavoring() unknown subtype '" + subtype + "'");
    }

    let hopform = "";
    if (subtype == "hop") {
	let format = form['format'];
	hopform = format.options[format.selectedIndex].value;
    }

    let tblBody = document.getElementById("tableFlavorings");
    const row = document.createElement("tr");
    
    let cell;
    let cellText;
    
    cell = document.createElement("td");
    let button = document.createElement('button');
    let del = document.createElement("div");
    del.innerHTML = "&otimes;";
    del.classList.add("row-kill");
    button.classList.add("row-kill");
    button.setAttribute('style','background-color:red;');
    button.appendChild(del);
    button.setAttribute("onclick", "DeleteRow('tableFlavorings', this.parentNode.parentNode.rowIndex)");
    cell.appendChild(button);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(usage);
    cell.appendChild(cellText);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(amt + ' ' + units.options[units.selectedIndex].value);
    cell.appendChild(cellText);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    let name;
    if (subtype == "hop") {
	num = form['num'].value;
	name = "(HOP) : " + Data.Hops[num].name;
    } else if (subtype == "spice") {
	name = form['spicename'].value;
    } else if (subtype == "flavoring") {
	name = form['flavorname'].value;
    }
    cellText = document.createTextNode(name);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    const rec = {
	"type" : subtype,
	"index" : num,
	"name" : name,
	"amount" : amt,
	"units" : units.options[units.selectedIndex].value,
	"usage" : usage,
	"hopform" : hopform,
	"boilMinutes" : boilMinutes,
    };
    RECIPE.flavorings.push(rec);

    RECIPE.verify();
    return false;
}


function addRow_Fermenter(subtype, form) {
    //alert("addrow_Fermenter subtype=" + subtype);
    let units = form['units'];
    let amt = form['amount'].value;
    let num;

    let name;
    if (subtype == "yeast") {
	num = form['num'].value;
	name = Data.Yeasts[num].name;
    } else if (subtype == "microbe") {
	num  = -1;
	name = form['microbename'].value;
    }

    let usage;
    let when = form['when'];
    if (subtype == "yeast") {
	switch (when.options[when.selectedIndex].value) {
	case "primary":
	    usage = "Primary yeast";
	    RECIPE.atten = Data.Yeasts[num].attenuation;
	    break;
	case "secondary":
	    usage = "Secondary yeast";
	    break;
	case "bottling":
	    usage = "Bottling yeast";
	    break;
	default:
	    usage = "?";
	}
    } else if (subtype == "microbe") {
	switch (when.options[when.selectedIndex].value) {
	case "primary":
	    usage = "Primary";
	    break;
	case "secondary":
	    usage = "Secondary";
	    break;
	case "bottling":
	    usage = "Bottling";
	    break;
	default:
	    usage = "?";
	}
    } else {
	alert("addRow_Fermenter() unknown subtype '" + subtype + "'");
    }

    let tblBody = document.getElementById("tableFermenters");
    const row = document.createElement("tr");
    let cell;
    let cellText;
    
    cell = document.createElement("td");
    let button = document.createElement('button');
    let del = document.createElement("div");
    del.innerHTML = "&otimes;";
    del.classList.add("row-kill");
    button.classList.add("row-kill");
    button.setAttribute('style','background-color:red;');
    button.appendChild(del);
    button.setAttribute("onclick", "DeleteRow('tableFermenters', this.parentNode.parentNode.rowIndex)");
    cell.appendChild(button);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(usage);
    cell.appendChild(cellText);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(amt + ' ' + units.options[units.selectedIndex].value);
    cell.appendChild(cellText);
    row.appendChild(cell);
    
    cell = document.createElement("td");
    cellText = document.createTextNode(name);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    const rec = {
	"type" : subtype,
	"index" : num,
	"name" : name,
	"amount" : amt,
	"units" : units.options[units.selectedIndex].value,
	"usage" : usage,
    };
    RECIPE.fermenters.push(rec);

    RECIPE.verify();
    return false;
}


function DeleteRow(tableID, rownum) {
    let tbl = document.getElementById(tableID);
    //alert(rownum);
    tbl.deleteRow(rownum - 1);

    if (tableID == 'tableFermentables') {
	RECIPE.fermentables.splice(rownum - 1, 1);
    } else if (tableID == 'tableFlavorings') {
	RECIPE.flavorings.splice(rownum - 1, 1);
    } else if (tableID == 'tableFermenters') {
	RECIPE.fermenters.splice(rownum - 1, 1);
    } else {
	alert("DeleteRow() - unknown table " + tableID);
    }

    RECIPE.verify();
}


function SRMcolorname(srm) {
    if (srm <= 3) return "straw";
    if (srm <= 4) return "yellow";
    if (srm <= 6) return "gold";
    if (srm <= 9) return "amber";
    if (srm <= 14) return "deep amber / light copper";
    if (srm <= 17) return "copper";
    if (srm <= 19) return "deep copper / light brown";
    if (srm <= 22) return "brown";
    if (srm <= 30) return "dark brown";
    if (srm <= 33) return "very dark brown";
    return "black";
}
    
function SRMcolorcode(srm) {
    // browser-safe colors for "1" to "opaque"
    // SRM == Lovibond, up to amber
    if (srm <= 1) return "#F3F993";
    if (srm <= 2) return "#F5F75C";
    if (srm <= 3) return "#F6F513";
    if (srm <= 4) return "#EAE615";
    if (srm <= 5) return "#E0D01B";
    if (srm <= 6) return "#D9C33C";
    if (srm <= 7) return "#C9A732";
    if (srm <= 8) return "#C0943A";
    if (srm <= 9) return "#BE8C3A";
    if (srm <= 10) return "#BE823A";
    if (srm <= 11) return "#BE7837";
    if (srm <= 12) return "#BE7038";
    if (srm <= 13) return "#BC6733";
    if (srm <= 14) return "#AC5D34";
    if (srm <= 15) return "#A85839";
    if (srm <= 16) return "#A05735";
    if (srm <= 18) return "#6C3B1F";
    if (srm <= 20) return "#5D341A";
    if (srm <= 22) return "#4A2727";
    if (srm <= 23) return "#361F1B";
    if (srm <= 25) return "#231716";
    if (srm <= 26) return "#19100F";
    if (srm <= 28) return "#120D0C";
    return "#050B0A";
}
