// Year Options
const currentYear = new Date().getFullYear();
for (let year = currentYear; year > currentYear - 8; year--) {
  $('#yearmodel').append(`<option value="${year}">${year}</option>`);
  $('#yearmodel').prop('selectedIndex', -1);
}

function yearChange(year) {
  $('#yearage').val(new Date().getFullYear() - year + 1);
}

const premiums = [
  [4725, 5460, 6300, 7140, 8085, 9030, 9660, 10290, 11130, 11760, 12390, 13020, 13860, 14805, 15750], // 2200cc
  [5145, 5775, 6615, 7508, 8505, 9450, 10133, 10763, 11655, 12338, 12968, 13676, 14543, 15540, 16590], // 3050cc
  [5565, 6300, 7245, 8190, 9293, 10395, 11104, 11839, 12810, 13519, 14254, 14963, 15934, 17010, 18113], // 3650cc
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // over 3650cc
];

function calcBasePremium() {
  const enginesize = $('#enginesize').val();
  const currentvalue = $('#currentvalue').val();
  let base = 0;
  let sizeIndex = 0;
  let valIndex = 0;
  let overFlag = false;
  if (enginesize <= 2200) {
    sizeIndex = 0;
  } else if (enginesize <= 3050) {
    sizeIndex = 1;
  } else if (enginesize <= 3650) {
    sizeIndex = 2;
  } else {
    sizeIndex = 3;
  }
  if (currentvalue <= 20000) {
    valIndex = 0;
  } else if (currentvalue <= 25000) {
    valIndex = 1;
  } else if (currentvalue <= 30000) {
    valIndex = 2;
  } else if (currentvalue <= 35000) {
    valIndex = 3;
  } else if (currentvalue <= 40000) {
    valIndex = 4;
  } else if (currentvalue <= 45000) {
    valIndex = 5;
  } else if (currentvalue <= 50000) {
    valIndex = 6;
  } else if (currentvalue <= 55000) {
    valIndex = 7;
  } else if (currentvalue <= 60000) {
    valIndex = 8;
  } else if (currentvalue <= 70000) {
    valIndex = 9;
  } else if (currentvalue <= 80000) {
    valIndex = 10;
  } else if (currentvalue <= 90000) {
    valIndex = 11;
  } else if (currentvalue <= 100000) {
    valIndex = 12;
  } else if (currentvalue <= 110000) {
    valIndex = 13;
  } else if (currentvalue <= 120000) {
    valIndex = 14;
  } else { // over 120k
    valIndex = 14;
    overFlag = true;
  }
  base = premiums[sizeIndex][valIndex];
  let vvl = 0;
  if (overFlag) vvl = (currentvalue - 120000) * 0.08;

  $('#est2').val(`$${vvl.toFixed(2)}`);
  $('#currentbasepremium').val(base);
}

// function calcBasePrem1yr(){
//   $('#baseprem1yr').val(gpvr[$('#group').val()-1][0])
// }

// function calcGroupMaxVal(){
//   $('#groupmaxvalue').val(groupMaxVal[$('#group').val()-1])
// }

// Current Year to Year-7
// 100 / (100 - Percent) * Value | Compounded
const depreciationPercent = [0, 0.20, 0.20, 0.17, 0.15, 0.12, 0.10, 0.10];

// function calcOriginalValue(){
//   var value = $('#currentvalue').val()
//   var age = $('#yearage').val() - 1
//   for (let i = age; i >= 0; i--) {
//     value = 1 / (1 - depreciationPercent[i]) * value
//   }
//   $('#originalvalue').val(parseFloat(value).toFixed(2))
// }

// function calcVVL(){
//   var orig = $('#originalvalue').val()
//   var groupmax = $('#groupmaxvalue').val()
//   var baseprem1yr = $('#baseprem1yr').val()
//   var vvl = (orig - groupmax) * 0.08 / baseprem1yr
//   $('#vvl').val(vvl > 0 ? (vvl*100).toFixed(2)+'%' : '0.00%')
// }

function calcBusinessUse() {
  const businessuse = $('#businessuse').val();
  $('#loadingbusinessuse').val(businessuse === 'yes' ? '10.00%' : '0.00%');
}

function calcEngineSizeLoading() {
  const handdrive = $('#handdrive').val();
  const enginesize = $('#enginesize').val();
  let percent = 0;
  if (handdrive === 'LHD') { percent = enginesize <= 2200 ? 0.10 : 0.15; }
  $('#enginesizeloading').val(`${(percent * 100).toFixed(2)}%`);
}

function calcPremiumBeforeDiscounts() {
  const currentbasepremium = parseFloat($('#currentbasepremium').val());
  // var vvl = parseFloat($('#vvl').val())/100
  $('#prembeforedl').val(currentbasepremium);
}

// new
let flag1 = true;
let flag2 = true;
let flag3 = true;
function processPreviousYears() {
  const previousyears = $('#previousyears').val();
  if (previousyears < 1) {
    flag1 = true;
    flag2 = true;
    flag3 = true;
    $('#ncdyear').val(0);
    $('#claimvalue').val(0);
    $('#claimsinpastrow').html('');
    $('#claimdaterow').html('');
    $('#claimvalrow').html('');
  } else {
    const claimsinpastrow = '<label for="claimsinpast" class="control-label col-xs-4">Any Claims in the last 6 years?</label>'
    + '<div class="col-xs-8">'
    + '<select id="claimsinpast" name="claimsinpast" class="select form-control">'
    + '<option value="no">No</option>'
    + '<option value="yes">Yes</option>'
    + '</select>'
    + '</div>';
    if (flag1) {
      $('#claimsinpastrow').html(claimsinpastrow);
      flag1 = false;
    }
    if ($('#claimsinpast').val() == 'no') {
      flag2 = true;
      flag3 = true;
      $('#claimdaterow').html('');
      $('#claimvalrow').html('');
      $('#ncdyear').val(previousyears);
      $('#claimvalue').val(0);
    } else {
      // ask for date of accident & approx value of claim including any amount paid to a 3rd party
      const askClaimDate = '<label for="askClaimDate" class="control-label col-xs-4">Date of Accident</label>'
      + '<div class="col-xs-8">'
      + '<input id="askClaimDate" name="askClaimDate" type="date" class="form-control">'
      + '</div>';
      const askClaimVal = '<label for="askClaimVal" class="control-label col-xs-4">Approximate Value of Claim Incl. Any amount paid to 3rd parties</label>'
      + '<div class="col-xs-8">'
      + '<input id="askClaimVal" name="askClaimVal" type="number" class="form-control">'
      + '</div>';
      if (flag2) {
        $('#claimdaterow').html(askClaimDate);
        flag2 = false;
      }
      if (flag3) {
        $('#claimvalrow').html(askClaimVal);
        flag3 = false;
      }
      // Calc time from last accident
      const doa = new Date($('#askClaimDate').val());
      const age_ms = Date.now() - doa.getTime();
      const ageDate = new Date(age_ms);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (!isNaN(age)) {
        $('#ncdyear').val(age);
      }
      // transplant value of claim
      $('#claimvalue').val($('#askClaimVal').val());
    }
  }
}
// endnew

function calcAdjustedNCD() {
  const yearsOfNCD      = parseInt($('#previousyears').val());
  let yearsSinceClaim = parseInt($('#ncdyear').val());
  const claimValue      = $('#claimvalue').val() || 0;

  if (yearsSinceClaim > 0) yearsSinceClaim -= 1;
  let adjustedNCD = 0;
  let stepBackYear = 0;

  if (claimValue > 25000) { // claimValue over 25k
    if (yearsOfNCD > 5) stepBackYear = 1;
    else stepBackYear = 0;
  } else if (claimValue > 0) { // claimValue below 25k
    if (yearsOfNCD > 5) stepBackYear = 3;
    if (yearsOfNCD == 5) stepBackYear = 2;
    if (yearsOfNCD == 4) stepBackYear = 1;
    if (yearsOfNCD < 4) stepBackYear = 0;
  } else { // no claim was made
    stepBackYear = 0;
  }

  const rebuiltYears = stepBackYear + yearsSinceClaim;

  if (rebuiltYears > 5) adjustedNCD = 0.50;
  if (rebuiltYears == 5) adjustedNCD = 0.45;
  if (rebuiltYears == 4) adjustedNCD = 0.35;
  if (rebuiltYears == 3) adjustedNCD = 0.25;
  if (rebuiltYears == 2) adjustedNCD = 0.15;
  if (rebuiltYears == 1) adjustedNCD = 0.10;

  $('#adjncd').val(`${(adjustedNCD * 100).toFixed(2)}%`);
}

function calcDrivingExp() {
  const drivingexp = $('#drivingexp').val();
  let disc = 0;
  if (drivingexp === '5-10') disc = 0.025;
  if (drivingexp === '>10') disc = 0.04;
  $('#dexpdisc').val(`${(disc * 100).toFixed(2)}%`);
}

function calcPermEmploy() {
  const permemp = $('#permemp').val();
  let disc = 0;
  if (permemp === 'yes') disc = 0.1;
  $('#empdisc').val(`${(disc * 100).toFixed(2)}%`);
}

function calcDescretionDisc() {
  const disc = 0.1;
  $('#descdiscassign').val(`${(disc * 100).toFixed(2)}%`);
}

function calcNaturalDisaster() {
  const disaster = $('#disaster').val();
  let disc = 0;
  if (disaster === 'yes') disc = 0.005;
  $('#disasterval').val(`${(disc * 100).toFixed(2)}%`);
}

function calcRiot() {
  const riotstrike = $('#riotstrike').val();
  let disc = 0;
  if (riotstrike === 'yes') disc = 0.0025;
  $('#riotstrikeval').val(`${(disc * 100).toFixed(2)}%`);
}

function calcWindscreen() {
  const windscreenlimit = $('#windscreenlimit').val();
  let value = 0;
  if (windscreenlimit === '2500') value = 100;
  if (windscreenlimit === '3000') value = 125;
  if (windscreenlimit === '3500') value = 150;
  if (windscreenlimit === '4000') value = 175;
  if (windscreenlimit === '5000') value = 200;
  if (windscreenlimit === '6000') value = 250;
  if (windscreenlimit === '10000') value = 400;
  $('#windscreenval').val(value.toFixed(2));
}

// Final Estimate
function estBase() {
  const currentbasepremium = parseFloat($('#currentbasepremium').val());
  $('#est1').val(`$${currentbasepremium.toFixed(2)}`);
}

function estBusinessUse() {
  const est1 = parseFloat($('#est1').val().substring(1));
  const est2 = parseFloat($('#est2').val().substring(1));
  const loadingbusinessuse = parseFloat($('#loadingbusinessuse').val());
  const est2_5 = ((est1 + est2) * (loadingbusinessuse / 100)).toFixed(2);
  $('#est2-5').val(`$${est2_5}`);
}

function estLHD() {
  const est1 = parseFloat($('#est1').val().substring(1));
  const est2 = parseFloat($('#est2').val().substring(1));
  const est2_5 = parseFloat($('#est2-5').val().substring(1));
  const enginesizeloading = parseFloat($('#enginesizeloading').val());
  let est3 = ((est1 + est2 + est2_5) * (enginesizeloading / 100)).toFixed(2);

  // start higher excess
  let standardexcess = 0;
  const currentvalue = $('#currentvalue').val();
  const higherexcess = $('#higherexcess').val();
  if (currentvalue <= 100000) {
    standardexcess = 2500;
  } else if (currentvalue <= 130000) {
    standardexcess = 3500;
  } else if (currentvalue <= 150000) {
    standardexcess = 6500;
  } else if (currentvalue <= 200000) {
    standardexcess = 9000;
  } else if (currentvalue <= 250000) {
    standardexcess = 11500;
  } else {
    standardexcess = 16500;
  }
  est3 = parseFloat(est3);
  const est3_5 = parseFloat(est3) + parseFloat(standardexcess) + parseFloat(higherexcess);
  // end higher excess
  $('#est3').val(`$${est3.toFixed(2)}`);
  $('#est3-5').val(`$${est3_5.toFixed(2)}`);
}

function estSub1() {
  const est1 = parseFloat($('#est1').val().substring(1));
  const est2 = parseFloat($('#est2').val().substring(1));
  const est2_5 = parseFloat($('#est2-5').val().substring(1));
  const est3 = parseFloat($('#est3').val().substring(1));
  const est4 = (est1 + est2 + est2_5 + est3).toFixed(2);
  $('#est4').val(`$${est4}`);
}

function estNCD() {
  const est4 = parseFloat($('#est4').val().substring(1));
  const adjncd = parseFloat($('#adjncd').val());
  const est5 = (est4 * (adjncd / 100)).toFixed(2);
  $('#est5').val(`$${est5}`);
}

function estDrivingExp() {
  const est4 = parseFloat($('#est4').val().substring(1));
  const est5 = parseFloat($('#est5').val().substring(1));
  const dexpdisc = parseFloat($('#dexpdisc').val());
  const est6 = ((est4 - est5) * (dexpdisc / 100)).toFixed(2);
  $('#est6').val(`$${est6}`);
}

function estEmployment() {
  const est4 = parseFloat($('#est4').val().substring(1));
  const est5 = parseFloat($('#est5').val().substring(1));
  const est6 = parseFloat($('#est6').val().substring(1));
  const empdisc = parseFloat($('#empdisc').val());
  const est7 = ((est4 - est5 - est6) * (empdisc / 100)).toFixed(2);
  $('#est7').val(`$${est7}`);
}

function estDescretion() {
  const est4 = parseFloat($('#est4').val().substring(1));
  const est5 = parseFloat($('#est5').val().substring(1));
  const est6 = parseFloat($('#est6').val().substring(1));
  const est7 = parseFloat($('#est7').val().substring(1));
  const descdiscassign = parseFloat($('#descdiscassign').val());
  const est8 = ((est4 - est5 - est6 - est7) * (descdiscassign / 100)).toFixed(2);
  $('#est8').val(`$${est8}`);
}

function estSub2() {
  const est4 = parseFloat($('#est4').val().substring(1));
  const est5 = parseFloat($('#est5').val().substring(1));
  const est6 = parseFloat($('#est6').val().substring(1));
  const est7 = parseFloat($('#est7').val().substring(1));
  const est8 = parseFloat($('#est8').val().substring(1));
  // start higher excess
  const higherexcess = $('#higherexcess').val();
  let excessdiscount = 0;
  if (higherexcess == 500) {
    excessdiscount = 10.0;
  } else if (higherexcess == 1000) {
    excessdiscount = 17.5;
  }
  const appliedexcessdiscount = ((est4 - est5 - est6 - est7 - est8) * (excessdiscount / 100));
  $('#highex').val(`$${appliedexcessdiscount.toFixed(2)}`);
  const est9 = (est4 - est5 - est6 - est7 - est8 - appliedexcessdiscount).toFixed(2);
  // end higher excess
  $('#est9').val(`$${est9}`);
}

function estDisaster() {
  const currentvalue = parseFloat($('#currentvalue').val());
  const disasterval = parseFloat($('#disasterval').val());
  let est10 = (currentvalue * disasterval / 100).toFixed(2);
  if (parseFloat(est10) < 100 && parseFloat(est10) !== 0) est10 = (100).toFixed(2);
  $('#est10').val(`$${est10}`);
}

function estRiot() {
  const currentvalue = parseFloat($('#currentvalue').val());
  const riotstrikeval = parseFloat($('#riotstrikeval').val());
  let est11 = (currentvalue * riotstrikeval / 100).toFixed(2);
  if (parseFloat(est11) < 50 && parseFloat(est11) !== 0) est11 = (50).toFixed(2);
  $('#est11').val(`$${est11}`);
}

function estWindscreen() {
  const windscreenval = parseFloat($('#windscreenval').val());
  const est12 = (windscreenval).toFixed(2);
  $('#est12').val(`$${est12}`);
}

function estSub3() {
  const est9 = parseFloat($('#est9').val().substring(1));
  const est10 = parseFloat($('#est10').val().substring(1));
  const est11 = parseFloat($('#est11').val().substring(1));
  const est12 = parseFloat($('#est12').val().substring(1));
  const est13 = (est9 + est10 + est11 + est12).toFixed(2);
  $('#est13').val(`$${est13}`);
}

function estSLUTax() {
  const est13 = parseFloat($('#est13').val().substring(1));
  const country = $('#country').val();
  let tax = 0;
  if (country === 'SLU') tax = 0.05;
  const est14 = (est13 * tax).toFixed(2);
  $('#est14').val(`$${est14}`);
}

function estTotal() {
  const est13 = parseFloat($('#est13').val().substring(1));
  const est14 = parseFloat($('#est14').val().substring(1));
  const est15 = (est13 + est14).toFixed(2);
  if (isNaN(est15)) {
    $('#est15').html('$0.00');
  } else {
    $('#est15').html(`$${est15}`);
  }
}

function calcAge() {
  const dob = new Date($('#ncd-dob').val());
  const age_ms = Date.now() - dob.getTime();
  const ageDate = new Date(age_ms);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  if (!isNaN(age)) {
    $('#driverage').val(age);
  }
}

function processAge() {
  if (
    (
      $('#driverage').val()
      && !isNaN($('#driverage').val())
      && $('#driverage').val() < 25

    )
    || (
      $('#driverlicenseyear').val()
      && !isNaN($('#driverlicenseyear').val())
      && (new Date().getFullYear() - $('#driverlicenseyear').val()) < 2
    )
  ) {
    const resp =    '<div id="frameRes" class="alert alert-warning">'
    + '<strong>Notice:</strong> To drivers under 25 years of age and/or having less than 2 years of regular driving experience, a Customer Service Representative will contact you to discuss further.'
    + '</div>';
    $('#ageAlert').html(resp);
  } else {
    $('#ageAlert').html('');
  }
}

function validateEmail(email) {
  return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);
}

function validatePhone(phone) {
  return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone);
}

function checkDriverDetails() {
  $("<style type='text/css'> .ui.input.success>input { color: #3a9f38; background-color: #f6fff7!important; border-color: #b5e0b4;} </style>").appendTo('head');

  // Validate Name
  if ($('#e-name').val()) {
    $('#e-name').parent().removeClass('error');
    $('#e-name').parent().addClass('ui input success');
  } else {
    $('#e-name').parent().removeClass('success');
    $('#e-name').parent().addClass('ui input error');
  }

  // Validate Emails
  if (validateEmail($('#e-email').val())) {
    $('#e-email').parent().removeClass('error');
    $('#e-email').parent().addClass('ui input success');
  } else {
    $('#e-email').parent().removeClass('success');
    $('#e-email').parent().addClass('ui input error');
  }

  // Validate Phone
  if (validatePhone($('#e-phone').val())) {
    $('#e-phone').parent().removeClass('error');
    $('#e-phone').parent().addClass('ui input success');
  } else {
    $('#e-phone').parent().removeClass('success');
    $('#e-phone').parent().addClass('ui input error');
  }

  if (
    $('#e-name').val()
    && $('#e-email').val() && validateEmail($('#e-email').val())
    && $('#e-phone').val() && validatePhone($('#e-phone').val())
  ) {
    $('#next').attr('disabled', false);
  } else {
    $('#next').attr('disabled', true);
  }
}

$('form input').on('keyup', () => {
  checkDriverDetails();
});

$('form').change(() => {
  try { checkDriverDetails(); } catch (e) {}
  // Re-process all calculations
  try { calcBasePremium(); } catch (e) {}
  // try {calcBasePrem1yr()} catch (e) {}
  // try {calcGroupMaxVal()} catch (e) {}
  // try {calcOriginalValue()} catch (e) {}
  // try {calcVVL()} catch (e) {}
  try { calcBusinessUse(); } catch (e) {}
  try { calcEngineSizeLoading(); } catch (e) {}
  try { calcPremiumBeforeDiscounts(); } catch (e) {}

  // new
  try { processPreviousYears(); } catch (e) {}
  // endnew

  try { calcAdjustedNCD(); } catch (e) {}
  try { calcDrivingExp(); } catch (e) {}
  try { calcPermEmploy(); } catch (e) {}
  try { calcDescretionDisc(); } catch (e) {}
  try { calcNaturalDisaster(); } catch (e) {}
  try { calcRiot(); } catch (e) {}
  try { calcWindscreen(); } catch (e) {}

  try { calcAge(); } catch (e) {}
  // try {processAge()} catch (e) {}

  // Display Estimate
  try { estBase(); } catch (e) {}
  // try {estVVL()} catch (e) {}
  try { estBusinessUse(); } catch (e) {}
  try { estLHD(); } catch (e) {}
  try { estSub1(); } catch (e) {}

  try { estNCD(); } catch (e) {}
  try { estDrivingExp(); } catch (e) {}
  try { estEmployment(); } catch (e) {}
  try { estDescretion(); } catch (e) {}
  try { estSub2(); } catch (e) {}

  try { estDisaster(); } catch (e) {}
  try { estRiot(); } catch (e) {}
  try { estWindscreen(); } catch (e) {}
  try { estSub3(); } catch (e) {}

  try { estSLUTax(); } catch (e) {}
  try { estTotal(); } catch (e) {}
  try { assignEstimateVisibility('#est15'); } catch (e) {}
});

document.getElementById('e-phone').addEventListener('input', (e) => {
  const x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
  e.target.value = !x[2] ? x[1] : `(${x[1]}) ${x[2]}${x[3] ? `-${x[3]}` : ''}`;
});

// Hide disabled rows
$('input').each(function () {
  if ($(this).is(':disabled')) {
    if ($(this).attr('id') !== 'est15') {
      $(this).closest('.form-group').css('display', 'none');
    }
  }
});

function assignEstimateVisibility(el) {
  if ((
    $('#driverage').val()
    && !isNaN($('#driverage').val())
    && $('#driverage').val() < 25
  )
  || (
    $('#driverlicenseyear').val()
    && !isNaN($('#driverlicenseyear').val())
    && (new Date().getFullYear() - $('#driverlicenseyear').val()) < 2
  )
  || ($('input:checked').length > 0)
  ) {
    $(el).css('font-size', '15px');
    $(el).html('To drivers under 25 years of age and/or having less than 2 years of regular driving experience, a Customer Service Representative will contact you to discuss further.');
  } else {
    $(el).css('font-size', '40px');
    $(el).css('line-height', '40px');
  }
}

function submitToAgent() {
  window.top.location.href = 'https://mandcinsurance.net/thank-you/';
  return false;
}

let state = 1;
let completeFlag = true;
let message = '';
$('#next').click(() => {
  if (state === 3) $('#next').toggle();
  $(`#step${state}`).toggleClass('active');
  $(`#step${state}`).toggleClass('completed');
  $(`#section${++state}`).toggle();
  $(`#step${state}`).toggleClass('active');
  if (state === 4) { // Final Stage
    message = '<h2>Commercial Vehicle > Comprehensive</h2><br>Date Format (YYYY-MM-DD)<hr>';
    function appendMsg(id) {
      if (id.startsWith('est')) {
        message += `<hr><h3>Calculated Estimate: ${$(`#${id}`).html()}</h3><br>`;
      } else if (id.startsWith('chk-')) {
        if ($(`#${id}:checked`).val()) { message += `<strong>Will anyone driving the motor vehicle:</strong> ${$(`#${id}:checked`).val()}<br>`; }
      } else {
        message += `<strong>${$(`label[for=${id}]`).text()}:</strong> ${$(`#${id}`).val()}<br>`;
      }
    }
    const ids = $('form input[id], select[id], #est15').map(function () {
      if ($(`#${this.id}`).is(':visible')) {
        appendMsg(this.id);
        return this.id;
      }
    });
    for (let i = 0; i < ids.slice(3).length; i++) {
      const element = ids.slice(3)[i];
      if (!!$(`#${element}`).val() === false) completeFlag = false;
    }
    assignEstimateVisibility('#est15');
    // Req: Name + 1 form of contact + All visible fields
    if (!!$('#e-name').val() && !!$('#e-email').val() && !!$('#e-phone').val() /* && completeFlag */) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:50003/email',
        data: { message },
        dataType: 'json',
      });
    }
  }
  return false;
});
