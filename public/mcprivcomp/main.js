// TODO: Dynamically get current year & adjust calcs
var vObj = {}
var vMake = ''
var vModel = ''

$.get('vehicles.json')
  .done((data) => {
    data.forEach(el => {
      if (el.group==="COMM") return
      if(vObj[el.make]){
        vObj[el.make].push({
          model: el.model,
          id: el.id,
          group: el.group,
        })
      }else{
        vObj[el.make] = [{
          model: el.model,
          id: el.id,
          group: el.group,
        }]
      }      
    })
    for (var make in vObj) {
      if (vObj.hasOwnProperty(make)) {
          $('#make').append(`<option value="${make}">${make}</option>`)
          $("#make").prop("selectedIndex", -1)
      }
    }
  })
  
function makeChange(make){
  vMake = make
  $('#model').empty()
  $('#group').val('')
  for (let i = 0; i < vObj[make].length; i++) {
    $('#model').append(`<option value="${vObj[make][i].model}">${vObj[make][i].model}</option>`)
    $("#model").prop("selectedIndex", -1)
  }
}

function modelChange(model){
  vModel = model
  var modelArr = vObj[vMake].filter((item) => {
    return item.model === model
  })
  $('#group').val( modelArr[0].group)
}

// Year Options
var currentYear = new Date().getFullYear()
for (let year = currentYear; year > currentYear - 8; year--) {
  $('#yearmodel').append(`<option value="${year}">${year}</option>`)
  $("#yearmodel").prop("selectedIndex", -1)
}

function yearChange(year){
  $('#yearage').val(new Date().getFullYear() - year + 1)
}

// General Private Vehicle Rating - gpvr[group][year]
var gpvr = [
  [7875,	6720,	  5723,	  4883,	  4148,	  3518,	  3518,  	3518],
  [10500,	8925,	  7613,	  6456,	  5513,	  4673,	  4673,  	4673],
  [12075,	10238,	8663,	  7403,	  6300,	  5355,  	5355,  	5355],
  [13440,	11393,	9713,	  8243,	  7009,	  5959,  	5959,  	5959],
  [14700,	12495,	10658,	9083,	  7718,	  6563,  	6563,  	6563],
  [17325,	14700,	12495,	10658,	9083,   7718,  	7718,  	7718],
  [19688,	16748,	14228,	12075,	10264,  8768, 	8768, 	8768],
  [22838,	19373,	16433,	14175,	12023,	10238,	10238,	10238]
]
var groupMaxVal = [60000,  75000,  85000,  100000,  120000,  150000,  150000,  150000]

function calcBasePremium(){
  $('#currentbasepremium').val(gpvr[$('#group').val()-1][$('#yearage').val()-1])
}

function calcBasePrem1yr(){
  $('#baseprem1yr').val(gpvr[$('#group').val()-1][0])
}

function calcGroupMaxVal(){
  $('#groupmaxvalue').val(groupMaxVal[$('#group').val()-1])
}

// Current Year to Year-7
// 100 / (100 - Percent) * Value | Compounded
var depreciationPercent = [0, 0.20, 0.20, 0.17, 0.15, 0.12, 0.10, 0.10]

function calcOriginalValue(){
  var value = $('#currentvalue').val()
  var age = $('#yearage').val() - 1
  for (let i = age; i >= 0; i--) {
    value = 1 / (1 - depreciationPercent[i]) * value
  }
  $('#originalvalue').val(parseFloat(value).toFixed(2))
}

function calcVVL(){
  var orig = $('#originalvalue').val()
  var groupmax = $('#groupmaxvalue').val()
  var baseprem1yr = $('#baseprem1yr').val()
  var vvl = (orig - groupmax) * 0.08 / baseprem1yr
  $('#vvl').val(vvl > 0 ? (vvl*100).toFixed(2)+'%' : '0.00%')
}

function calcBusinessUse(){
  var businessuse = $('#businessuse').val()
  $('#loadingbusinessuse').val(businessuse === 'yes' ? '10.00%':'0.00%')
}

function calcEngineSizeLoading(){
  var handdrive = $('#handdrive').val()
  var enginesize = $('#enginesize').val()
  var percent = 0
  if (handdrive === 'LHD')
    percent = enginesize === 'low' ? 0.10 : 0.15
  $('#enginesizeloading').val((percent*100).toFixed(2)+'%')
}

function calcPremiumBeforeDiscounts(){
  var currentbasepremium = parseFloat($('#currentbasepremium').val())
  var vvl = parseFloat($('#vvl').val())/100
  $('#prembeforedl').val((currentbasepremium+(currentbasepremium*vvl)).toFixed(2))
}


// new
var flag1 = true
var flag2 = true
var flag3 = true
function processPreviousYears(){
  var previousyears = $('#previousyears').val()
  if (previousyears<1) {
    flag1 = true
    flag2 = true
    flag3 = true
    $('#ncdyear').val(0)
    $('#claimvalue').val(0)
    $('#claimsinpastrow').html('')
    $('#claimdaterow').html('')
    $('#claimvalrow').html('')

  }else{
    var claimsinpastrow = '<label for="claimsinpast" class="control-label col-xs-4">Any Claims in the last 6 years?</label>'
    +'<div class="col-xs-8">'
    +'<select id="claimsinpast" name="claimsinpast" class="select form-control">'
    +'<option value="no">No</option>'
    +'<option value="yes">Yes</option>'
    +'</select>'
    +'</div>'
    if (flag1) {
      $('#claimsinpastrow').html(claimsinpastrow)
      flag1 = false
    }
    if ($('#claimsinpast').val()=='no') {
      flag2 = true
      flag3 = true
      $('#claimdaterow').html('')
      $('#claimvalrow').html('')
      $('#ncdyear').val(previousyears)
      $('#claimvalue').val(0)
    }else{
      // ask for date of accident & approx value of claim including any amount paid to a 3rd party
      var askClaimDate = '<label for="askClaimDate" class="control-label col-xs-4">Date of Accident</label>'
      +'<div class="col-xs-8">'
      +'<input id="askClaimDate" name="askClaimDate" type="date" class="form-control">'
      +'</div>'
      var askClaimVal = '<label for="askClaimVal" class="control-label col-xs-4">Approximate Value of Claim Incl. Any amount paid to 3rd parties</label>'
      +'<div class="col-xs-8">'
      +'<input id="askClaimVal" name="askClaimVal" type="number" class="form-control">'
      +'</div>'
      if (flag2) {
        $('#claimdaterow').html(askClaimDate)
        flag2 = false
      }
      if (flag3) {
        $('#claimvalrow').html(askClaimVal)
        flag3 = false
      }
      // Calc time from last accident
      var doa = new Date($('#askClaimDate').val())
      var age_ms = Date.now() - doa.getTime()
      var ageDate = new Date(age_ms)      
      var age = Math.abs(ageDate.getUTCFullYear() - 1970)
      if (!isNaN(age)) {
        $('#ncdyear').val(age)
      }
      // transplant value of claim
      $('#claimvalue').val($('#askClaimVal').val())
    }
  }
}
// endnew

function calcAdjustedNCD() {
  var yearsOfNCD      = parseInt($('#previousyears').val())  
  var yearsSinceClaim = parseInt($('#ncdyear').val())  
  var claimValue      = $('#claimvalue').val() || 0  

  if (yearsSinceClaim > 0) yearsSinceClaim -= 1
  var adjustedNCD = 0
  var stepBackYear = 0

  if(claimValue>25000){ //claimValue over 25k
    if (yearsOfNCD>5) stepBackYear = 1
    else stepBackYear = 0
  }else if(claimValue>0){ //claimValue below 25k
    if (yearsOfNCD>5) stepBackYear = 3
    if (yearsOfNCD==5) stepBackYear = 2
    if (yearsOfNCD==4) stepBackYear = 1
    if (yearsOfNCD<4) stepBackYear = 0
  }else{//no claim was made
    stepBackYear = 0
  }

  var rebuiltYears = stepBackYear + yearsSinceClaim

  if (rebuiltYears>5) adjustedNCD = 0.65
  if (rebuiltYears==5) adjustedNCD = 0.60
  if (rebuiltYears==4) adjustedNCD = 0.50
  if (rebuiltYears==3) adjustedNCD = 0.40
  if (rebuiltYears==2) adjustedNCD = 0.30
  if (rebuiltYears==1) adjustedNCD = 0.15
  
  $('#adjncd').val((adjustedNCD*100).toFixed(2)+'%')
}

function calcDrivingExp() {
  var drivingexp = $('#drivingexp').val()
  var disc = 0
  if (drivingexp === '5-10') disc = 0.025
  if (drivingexp === '>10') disc = 0.04
  $('#dexpdisc').val((disc*100).toFixed(2)+'%')
}

function calcPermEmploy() {
  var permemp = $('#permemp').val()
  var disc = 0
  if (permemp === 'yes') disc = 0.1
  $('#empdisc').val((disc*100).toFixed(2)+'%')
}

function calcDescretionDisc() {
  var disc = 0.1
  $('#descdiscassign').val((disc*100).toFixed(2)+'%')
}

function calcNaturalDisaster() {
  var disaster = $('#disaster').val()
  var disc = 0
  if (disaster === 'yes') disc = 0.005
  $('#disasterval').val((disc*100).toFixed(2)+'%')
}

function calcRiot() {
  var riotstrike = $('#riotstrike').val()
  var disc = 0
  if (riotstrike === 'yes') disc = 0.0025
  $('#riotstrikeval').val((disc*100).toFixed(2)+'%')
}

function calcWindscreen() {
  var windscreenlimit = $('#windscreenlimit').val()
  var value = 0
  if (windscreenlimit === '2500') value = 100
  if (windscreenlimit === '3000') value = 125
  if (windscreenlimit === '3500') value = 150
  if (windscreenlimit === '4000') value = 175
  if (windscreenlimit === '5000') value = 200
  if (windscreenlimit === '6000') value = 250
  if (windscreenlimit === '10000') value = 400
  $('#windscreenval').val(value.toFixed(2))
}

// Final Estimate
function estBase() {
  var currentbasepremium = parseFloat($('#currentbasepremium').val())
  $('#est1').val(`$${currentbasepremium.toFixed(2)}`)
}

function estVVL() {
  var est1 = $('#est1').val().substring(1)
  var vvl = parseFloat($('#vvl').val())
  var est2 = (est1 * (vvl / 100)).toFixed(2)  
  $('#est2').val(`$${est2}`)
}

function estBusinessUse() {
  var est1 = parseFloat($('#est1').val().substring(1))
  var est2 = parseFloat($('#est2').val().substring(1))
  var loadingbusinessuse = parseFloat($('#loadingbusinessuse').val())
  var est2_5 = ((est1 + est2) * (loadingbusinessuse / 100)).toFixed(2)
  $('#est2-5').val(`$${est2_5}`)
}

function estLHD() {
  var est1 = parseFloat($('#est1').val().substring(1))
  var est2 = parseFloat($('#est2').val().substring(1))
  var est2_5 = parseFloat($('#est2-5').val().substring(1))
  var enginesizeloading = parseFloat($('#enginesizeloading').val())  
  var est3 = ((est1 + est2 + est2_5) * (enginesizeloading / 100)).toFixed(2)

  // start higher excess
  var standardexcess = 0
  var currentvalue = $('#currentvalue').val()
  var higherexcess = $('#higherexcess').val()
  if (currentvalue<=100000) {
    standardexcess = 1000
  }else if (currentvalue<=130000) {
    standardexcess = 2500
  }else if (currentvalue<=150000) {
    standardexcess = 5000
  }else if (currentvalue<=200000) {
    standardexcess = 7500
  }else if (currentvalue<=250000) {
    standardexcess = 10000
  }else {
    standardexcess = 15000
  }
  est3 = parseFloat(est3)
  var est3_5 = parseFloat(standardexcess) + parseFloat(higherexcess)  
  // end higher excess
  $('#est3').val(`$${est3.toFixed(2)}`)
  $('#est3-5').val(`$${est3_5.toFixed(2)}`)
}

function estSub1() {
  var est1 = parseFloat($('#est1').val().substring(1))
  var est2 = parseFloat($('#est2').val().substring(1))
  var est2_5 = parseFloat($('#est2-5').val().substring(1))
  var est3 = parseFloat($('#est3').val().substring(1))
  var est4 = (est1 + est2 + est2_5 + est3).toFixed(2)
  $('#est4').val(`$${est4}`)
}

function estNCD() {
  var est4 = parseFloat($('#est4').val().substring(1))
  var adjncd = parseFloat($('#adjncd').val())
  var est5 = (est4 * (adjncd / 100)).toFixed(2)  
  $('#est5').val(`$${est5}`)
}

function estDrivingExp() {
  var est4 = parseFloat($('#est4').val().substring(1))
  var est5 = parseFloat($('#est5').val().substring(1))
  var dexpdisc = parseFloat($('#dexpdisc').val())
  var est6 = ((est4 - est5) * (dexpdisc / 100)).toFixed(2)  
  $('#est6').val(`$${est6}`)
}

function estEmployment() {
  var est4 = parseFloat($('#est4').val().substring(1))
  var est5 = parseFloat($('#est5').val().substring(1))
  var est6 = parseFloat($('#est6').val().substring(1))
  var empdisc = parseFloat($('#empdisc').val())
  var est7 = ((est4 - est5 - est6) * (empdisc / 100)).toFixed(2)  
  $('#est7').val(`$${est7}`)
}

function estDescretion() {
  var est4 = parseFloat($('#est4').val().substring(1))
  var est5 = parseFloat($('#est5').val().substring(1))
  var est6 = parseFloat($('#est6').val().substring(1))
  var est7 = parseFloat($('#est7').val().substring(1))
  var descdiscassign = parseFloat($('#descdiscassign').val())
  var est8 = ((est4 - est5 - est6 - est7) * (descdiscassign / 100)).toFixed(2)  
  $('#est8').val(`$${est8}`)
}

function estSub2() {
  var est4 = parseFloat($('#est4').val().substring(1))
  var est5 = parseFloat($('#est5').val().substring(1))
  var est6 = parseFloat($('#est6').val().substring(1))
  var est7 = parseFloat($('#est7').val().substring(1))
  var est8 = parseFloat($('#est8').val().substring(1))
  // start higher excess
  var higherexcess = $('#higherexcess').val()
  var excessdiscount = 0
  if (higherexcess == 500) {
    excessdiscount = 10.0
  }else if(higherexcess == 1000){
    excessdiscount = 17.5
  }
  var appliedexcessdiscount = ((est4 - est5 - est6 - est7 - est8) * (excessdiscount / 100))  
  $('#highex').val(`$${appliedexcessdiscount.toFixed(2)}`)
  var est9 = (est4 - est5 - est6 - est7 - est8 - appliedexcessdiscount).toFixed(2)  
  // end higher excess
  $('#est9').val(`$${est9}`)
}

function estDisaster() {
  var currentvalue = parseFloat($('#currentvalue').val())
  var disasterval = parseFloat($('#disasterval').val())
  var est10 = (currentvalue * disasterval / 100).toFixed(2)  
  if (parseFloat(est10)<100 && parseFloat(est10)!==0) est10 = (100).toFixed(2)
  $('#est10').val(`$${est10}`)
}

function estRiot() {
  var currentvalue = parseFloat($('#currentvalue').val())
  var riotstrikeval = parseFloat($('#riotstrikeval').val())
  var est11 = (currentvalue * riotstrikeval / 100).toFixed(2)  
  if (parseFloat(est11)<50 && parseFloat(est11)!==0) est11 = (50).toFixed(2)
  $('#est11').val(`$${est11}`)
}

function estWindscreen() {
  var windscreenval = parseFloat($('#windscreenval').val())
  var est12 = (windscreenval).toFixed(2)  
  $('#est12').val(`$${est12}`)
}

function estSub3() {
  var est9 = parseFloat($('#est9').val().substring(1))
  var est10 = parseFloat($('#est10').val().substring(1))
  var est11 = parseFloat($('#est11').val().substring(1))
  var est12 = parseFloat($('#est12').val().substring(1))
  var est13 = (est9 + est10 + est11 + est12).toFixed(2)  
  $('#est13').val(`$${est13}`)
}

function estSLUTax() {
  var est13 = parseFloat($('#est13').val().substring(1))
  var country = $('#country').val()
  var tax = 0
  if (country === "SLU") tax = 0.05 
  var est14 = (est13 * tax).toFixed(2)  
  $('#est14').val(`$${est14}`)
}

function estTotal() {
  var est13 = parseFloat($('#est13').val().substring(1))
  var est14 = parseFloat($('#est14').val().substring(1))
  var est15 = (est13 + est14).toFixed(2)  
  if (isNaN(est15)) {
    $('#est15').html(`$0.00`)
  }else{
    $('#est15').html(`$${est15}`)
  }
}

function calcAge() {
  var dob = new Date($('#ncd-dob').val())
  var age_ms = Date.now() - dob.getTime()
  var ageDate = new Date(age_ms)
  var age = Math.abs(ageDate.getUTCFullYear() - 1970)
  if (!isNaN(age)) {
    $('#driverage').val(age)
  }
}

function processAge() {
  if (
    (
      $('#driverage').val() &&
      !isNaN($('#driverage').val()) &&
      $('#driverage').val()<25
      
    ) ||
    ( 
      $('#driverlicenseyear').val() &&
      !isNaN($('#driverlicenseyear').val()) &&
      (new Date().getFullYear() - $('#driverlicenseyear').val())<2
    )
    ) {
    var resp =
    '<div id="frameRes" class="alert alert-warning">'
    +'<strong>Notice:</strong> To drivers under 25 years of age and/or having less than 2 years of regular driving experience, a Customer Service Representative will contact you to discuss further.'
    +'</div>'
    $('#ageAlert').html(resp)
  }else{
    $('#ageAlert').html('')
  }
}


function validateEmail(email){
  return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email)
}

function validatePhone(phone){
  return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)
}

function checkDriverDetails() {
  $("<style type='text/css'> .ui.input.success>input { color: #3a9f38; background-color: #f6fff7!important; border-color: #b5e0b4;} </style>").appendTo("head");

  // Validate Name
  if ($('#e-name').val().match(/^[A-Za-z\s]*$/)) {
    $('#e-name').parent().removeClass('error')
    $('#e-name').parent().addClass('ui input success')
  }else{
    $('#e-name').parent().removeClass('success')
    $('#e-name').parent().addClass('ui input error')
  }

  // Validate Emails
  if (validateEmail($('#e-email').val())){
    $('#e-email').parent().removeClass('error')
    $('#e-email').parent().addClass('ui input success')
  }else{
    $('#e-email').parent().removeClass('success')
    $('#e-email').parent().addClass('ui input error')
  }

  // Validate Phone
  if (validatePhone($('#e-phone').val())){
    $('#e-phone').parent().removeClass('error')
    $('#e-phone').parent().addClass('ui input success')
  }else{
    $('#e-phone').parent().removeClass('success')
    $('#e-phone').parent().addClass('ui input error')
  }

  // Validate DOB
  if(
    !isNaN(new Date($('#ncd-dob').val()).valueOf()) &&
    new Date($('#ncd-dob').val()).getFullYear() > 1900 &&
    new Date($('#ncd-dob').val()).getFullYear() < new Date().getFullYear()
  ){
    $('#ncd-dob').parent().removeClass('error')
    $('#ncd-dob').parent().addClass('ui input success')
  }else{
    $('#ncd-dob').parent().removeClass('success')
    $('#ncd-dob').parent().addClass('ui input error')
  }

  if (
    $('#e-name').val() && $('#e-name').val().match(/^[A-Za-z\s]*$/) &&
    $('#e-email').val() && validateEmail($('#e-email').val()) &&
    $('#e-phone').val() && validatePhone($('#e-phone').val()) &&
    !isNaN(new Date($('#ncd-dob').val()).valueOf()) &&
    new Date($('#ncd-dob').val()).getFullYear() > 1900 &&
    new Date($('#ncd-dob').val()).getFullYear() < new Date().getFullYear()
    ) {
      $('#next').attr('disabled', false)
    }else{
      $('#next').attr('disabled', true)
    }
}

$('form input').on('keyup', function () {
  checkDriverDetails()
})

$('form').change(function() {
  try {checkDriverDetails()} catch (e) {}
  // Re-process all calculations
  try {calcBasePremium()} catch (e) {}
  try {calcBasePrem1yr()} catch (e) {}
  try {calcGroupMaxVal()} catch (e) {}
  try {calcOriginalValue()} catch (e) {}
  try {calcVVL()} catch (e) {}
  try {calcBusinessUse()} catch (e) {}
  try {calcEngineSizeLoading()} catch (e) {}
  try {calcPremiumBeforeDiscounts()} catch (e) {}

// new
  try {processPreviousYears()} catch (e) {}
// endnew

  try {calcAdjustedNCD()} catch (e) {}
  try {calcDrivingExp()} catch (e) {}
  try {calcPermEmploy()} catch (e) {}
  try {calcDescretionDisc()} catch (e) {}
  try {calcNaturalDisaster()} catch (e) {}
  try {calcRiot()} catch (e) {}
  try {calcWindscreen()} catch (e) {}

  try {calcAge()} catch (e) {}
  //try {processAge()} catch (e) {}

  // Display Estimate
  try {estBase()} catch (e) {}
  try {estVVL()} catch (e) {}
  try {estBusinessUse()} catch (e) {}
  try {estLHD()} catch (e) {}
  try {estSub1()} catch (e) {}

  try {estNCD()} catch (e) {}
  try {estDrivingExp()} catch (e) {}
  try {estEmployment()} catch (e) {}
  try {estDescretion()} catch (e) {}
  try {estSub2()} catch (e) {}

  try {estDisaster()} catch (e) {}
  try {estRiot()} catch (e) {}
  try {estWindscreen()} catch (e) {}
  try {estSub3()} catch (e) {}

  try {estSLUTax()} catch (e) {}
  try {estTotal()} catch (e) {}
  try {assignEstimateVisibility('#est15')} catch (e) {}
})

document.getElementById('e-phone').addEventListener('input', function (e) {
  var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
  e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
})

// Hide disabled rows
$('input').each(function(){
  if($(this).is(":disabled")){
    if($(this).attr('id')!=='est15'){
      $(this).closest('.form-group').css('display', 'none')
    }
  }
})
function assignEstimateVisibility(el){
  if ((
    $('#driverage').val() &&
    !isNaN($('#driverage').val()) &&
    $('#driverage').val()<25
  ) ||
  ( 
    $('#driverlicenseyear').val() &&
    !isNaN($('#driverlicenseyear').val()) &&
    (new Date().getFullYear() - $('#driverlicenseyear').val())<2
  ) ||
  ($('input:checked').length > 0)
  ){
    $(el).css('font-size', '15px')
    $(el).html('To drivers under 25 years of age and/or having less than 2 years of regular driving experience, a Customer Service Representative will contact you to discuss further.')
  }else{
    $(el).css('font-size', '40px')
    $(el).css('line-height', '40px')
  }
}

function submitToAgent() {
  window.top.location.href = 'https://mandcinsurance.net/thank-you/'; 
  return false;
}

var state = 1;
var completeFlag = true;
$('#next').click(function(){
  if (state === 3) $('#next').toggle()
  $('#step'+(state)).toggleClass('active')
  $('#step'+(state)).toggleClass('completed')
  $('#section'+(++state)).toggle()
  $('#step'+(state)).toggleClass('active')
  if (state === 4) { //Final Stage
    var message = '<h2>Private Vehicle > Comprehensive</h2><br>Date Format (YYYY-MM-DD)<hr>'
    function appendMsg(id){
      if (id.startsWith('est')) {
        message += `<hr><h3>Calculated Estimate: ${$('#'+id).html()}</h3><br>`
      } else if (id.startsWith('chk-')){
        if (!!$('#'+id+':checked').val())
          message += `<strong>Will anyone driving the motor vehicle:</strong> ${$('#'+id+':checked').val()}<br>`
      } else {
        message += `<strong>${$('label[for='+id+']').text()}:</strong> ${$('#'+id).val()}<br>`
      }
    }
    var ids= $('form input[id], select[id], #est15').map(function() {
      if ($('#'+this.id).is(':visible')) {
        appendMsg(this.id)
        return this.id
      }
    })
    for (let i = 0; i < ids.slice(3).length; i++) {
      const element = ids.slice(3)[i]
      if (!!$('#'+element).val()===false) completeFlag = false
    }
    assignEstimateVisibility('#est15')
    // Req: Name + 1 form of contact + All visible fields
    if (!!$('#e-name').val() && !!$('#e-email').val() && !!$('#e-phone').val() /*&& completeFlag*/){
      $.ajax({
        type: "POST",
        url: "http://localhost:50003/email",
        data: {message},
        dataType: "json"
      });
    }
  }
  return false;
})
