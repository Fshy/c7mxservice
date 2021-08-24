function calcPval() {
  var pval = parseFloat($('#pval').val()) || 0
  var pclass = $('#class').val()
  var pcons = $('#cons').val()
  var rounded = Math.ceil(pval/1000)
  var total = 0
  if (pcons === 'B'){
    if(pclass === '1') total = rounded * 8.25
    if(pclass === '2') total = rounded * 9.50
    if(pclass === '3') total = rounded * 11.00
    if(pclass === '4') total = rounded * 12.50
    if(pclass === '5') total = rounded * 15.25
    if(pclass === '6') total = rounded * 18.25
  }else{
    if(pclass === '1') total = rounded * 7.25
    if(pclass === '2') total = rounded * 8.75
    if(pclass === '3') total = rounded * 9.75
    if(pclass === '4') total = rounded * 11.25
    if(pclass === '5') total = rounded * 13.00
    if(pclass === '6') total = rounded * 15.00
  }
  return total * 1.05
}

function calcTotal() {
  var p = calcPval()
  if (p < 315) p = 315
  $('#total').val(`$${p.toFixed(2)}`)
}

$('#total').css('color', 'rgb(0, 0, 0, 0)')

$('form').change(function() {
  try {calcTotal()} catch (e) {}
  if ( $('#frame').val()==='yes' || $('#flooding').val()==='yes' || $('#landslip').val()==='yes' ){
    var resp =
    '<div id="frameRes" class="alert alert-warning">'
    +'<strong>Notice:</strong> For structures that are more than 50% timber frame or “butler steel” and/ or for areas prone to flooding and/ or landslip, a Customer Service Representative will contact you to discuss further.'
    +'</div>'
    $('#frameRes').html(resp)
  }else{
    $('#frameRes').html('')
  }
  completeFlag = true
  message = `<h2>Commercial Fire & Special Perils Incl. Catastrophe Perils</h2><br>Date Format (YYYY-MM-DD)<hr>`
  var ids = $('form input[id], select[id]').map(function() {
    if ($('#'+this.id).is(':visible')) {
      appendMsg(this.id)
      return this.id
    }
  })
  for (let i = 0; i < ids.slice(3).length; i++) {
    const element = ids.slice(3)[i]
    if (!!$('#'+element).val()===false) {completeFlag = false}
  }
  if (
    !!$('#total').val()
    && $('#total').val()!=='$0.00'
    && validateDetails()
    && completeFlag
  ) {
    $('#sendbtn').html('<span class="glyphicon glyphicon-send" aria-hidden="true"></span> Submit')
  }else{
    $('#sendbtn').html('<span class="glyphicon glyphicon-hourglass" aria-hidden="true"></span> Waiting for Form Completion...')
  }
  if (checkBadFlags()) {
    $('#total').css('color', 'rgb(0, 0, 0, 0)')    
  }
})

document.getElementById('e-phone').addEventListener('input', function (e) {
  var x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/)
  e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '')
})

function validateEmail(email){return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email)}
function validatePhone(phone){return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)}

function checkDetails() {
  $("<style type='text/css'> .ui.input.success>input { color: #3a9f38; background-color: #f6fff7!important; border-color: #b5e0b4;} </style>").appendTo("head");

  // Validate Name
  if ($('#e-name').val()) {
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
}

$('form input').on('keyup', function () {
  checkDetails()
  if (
    !!$('#total').val()
    && $('#total').val()!=='$0.00'
    && validateDetails()
    && completeFlag
  ) {
    $('#sendbtn').html('<span class="glyphicon glyphicon-send" aria-hidden="true"></span> Submit')
  }else{
    $('#sendbtn').html('<span class="glyphicon glyphicon-hourglass" aria-hidden="true"></span> Waiting for Form Completion...')
  }
})

function validateDetails() {
  return !!($('#e-name').val() && $('#e-email').val() && validateEmail($('#e-email').val()) && $('#e-phone').val() && validatePhone($('#e-phone').val()))
}

function checkBadFlags() {
  return !!($('#frame').val()==='yes' || $('#flooding').val()==='yes' || $('#landslip').val()==='yes')
}
 
function sendEstimate() {
  if (
    !!$('#total').val()
    && $('#total').val()!=='$0.00'
    && validateDetails()
    && completeFlag
    ){
    $("form input, select").prop("disabled", true)
    $('#sendbtn').html('<span class="glyphicon glyphicon-paste" aria-hidden="true"></span> Quote Generated! - Click to Reset')
    $('#sendbtn').attr('onclick', 'resetState()')
    if (!checkBadFlags()) {
      $('#csrBtn').css('display', 'inherit')
      $('#total').css('color', 'rgb(0, 0, 0, 1)')
    }
  }else{
    Swal.fire(
      'Error!',
      'Failed to validate information,<br>Please ensure all fields have been filled; and that a valid email and/or phone number has been entered.',
      'error'
    )
  }
}

function sendToAgent() {
  $.ajax({
    type: "POST",
    url: "http://localhost:50003/email",
    data: {message},
    dataType: "json",
    success: function (data) {
      window.top.location.href = 'https://mandcinsurance.net/thank-you/'; 
    },
    error: function (err) {
      console.log({message});
      window.top.location.href = 'https://mandcinsurance.net/thank-you/'; 
    }
  });
  return false;
}

function resetState() {
  $('#total').css('color', 'rgb(0, 0, 0, 0)')
  $('#total').val('$0.00')
  $('#pval').val(0)
  $("form input, select").prop("disabled", false)
  $('#sendbtn').html('<span class="glyphicon glyphicon-send" aria-hidden="true"></span> Submit')
  $('#sendbtn').attr('onclick', 'sendEstimate()')
  $('#csrBtn').css('display', 'none')
}

var completeFlag = true
var message = `<h2>Commercial Fire & Special Perils Incl. Catastrophe Perils</h2><br>Date Format (YYYY-MM-DD)<hr>`

function appendMsg(id){
  if (id.startsWith('total')) {
    message += `<hr><h3>Calculated Estimate: ${$('#'+id).val()}</h3><br>`
  }else{
    message += `<strong>${$('label[for='+id+']').text()}:</strong> ${$('#'+id).val()}<br>`
  }
}