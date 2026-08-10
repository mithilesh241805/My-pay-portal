  const PASSCODE = '16241805';
  let selectedVpa = "";
  let selectedLabel = "Custom UPI ID";
  let qr = null;
  let pendingOption = null;

  const idOptions = document.querySelectorAll('.id-option');
  const amountInput = document.getElementById('amount');
  const noteInput = document.getElementById('note');
  const countryCode = document.getElementById('countryCode');
  const phoneNumber = document.getElementById('phoneNumber');
  const customVpaRow = document.getElementById('customVpaRow');
  const customVpaInput = document.getElementById('customVpaInput');
  const generateBtn = document.getElementById('generateBtn');
  const payBtn = document.getElementById('payBtn');
  const qrDiv = document.getElementById('qrcode');
  const qrPlaceholder = document.getElementById('qrPlaceholder');
  const receiptLabel = document.getElementById('receiptLabel');
  const receiptAmt = document.getElementById('receiptAmt');
  const receiptNoteRow = document.getElementById('receiptNoteRow');
  const receiptNote = document.getElementById('receiptNote');
  const downloadLink = document.getElementById('downloadLink');
  const passcodeModal = document.getElementById('passcodeModal');
  const passcodeInput = document.getElementById('passcodeInput');
  const passcodeError = document.getElementById('passcodeError');
  const passcodeSubmit = document.getElementById('passcodeSubmit');
  const passcodeCancel = document.getElementById('passcodeCancel');

  function selectOption(opt) {
    idOptions.forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    const isCustom = opt.dataset.custom === 'true';
    selectedLabel = opt.dataset.label;
    if (isCustom) {
      customVpaRow.style.display = 'block';
      selectedVpa = customVpaInput.value.trim();
    } else {
      customVpaRow.style.display = 'none';
      selectedVpa = opt.dataset.vpa;
    }
    receiptLabel.textContent = selectedLabel;
  }

  function openPasscodeModal() {
    passcodeInput.value = '';
    passcodeError.style.display = 'none';
    passcodeModal.style.display = 'flex';
    setTimeout(() => passcodeInput.focus(), 50);
  }

  function closePasscodeModal() {
    passcodeModal.style.display = 'none';
    pendingOption = null;
  }

  function tryUnlock() {
    const requiredCode = (pendingOption && pendingOption.dataset.passcode) || PASSCODE;
    if (passcodeInput.value.trim() === requiredCode) {
      if (pendingOption) {
        pendingOption.dataset.unlocked = 'true';
        selectOption(pendingOption);
      }
      closePasscodeModal();
    } else {
      passcodeError.style.display = 'block';
      passcodeInput.value = '';
      passcodeInput.focus();
    }
  }

  passcodeSubmit.addEventListener('click', tryUnlock);
  passcodeCancel.addEventListener('click', closePasscodeModal);
  passcodeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryUnlock(); });
  passcodeModal.addEventListener('click', (e) => { if (e.target === passcodeModal) closePasscodeModal(); });

  idOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      if (opt.dataset.locked === 'true' && opt.dataset.unlocked !== 'true') {
        pendingOption = opt;
        openPasscodeModal();
        return;
      }
      selectOption(opt);
    });
  });

  customVpaInput.addEventListener('input', () => {
    const activeOption = document.querySelector('.id-option.active');
    if (activeOption && activeOption.dataset.custom === 'true') {
      selectedVpa = customVpaInput.value.trim();
    }
  });

  function resetQrPreview() {
    qrDiv.innerHTML = '';
    qrPlaceholder.style.display = 'flex';
    downloadLink.style.display = 'none';
    downloadLink.onclick = null;
    receiptAmt.textContent = '₹ —';
    receiptNote.textContent = '';
    receiptNoteRow.style.display = 'none';
  }

  function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
  }

  function getQrState() {
    const amountText = amountInput.value.trim();
    let amount = null;
    if (amountText) {
      amount = parseFloat(amountText);
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, error: 'amount', amount: null };
      }
    }

    if (customVpaRow.style.display === 'block') {
      selectedVpa = customVpaInput.value.trim();
      if (!selectedVpa) {
        return { ok: false, error: 'vpa', amount };
      }
    }

    return { ok: true, error: null, amount, note: noteInput.value.trim() };
  }

  function getPaymentState() {
    const amountText = amountInput.value.trim();
    let amount = null;
    if (amountText) {
      amount = parseFloat(amountText);
      if (!Number.isFinite(amount) || amount <= 0) {
        return { ok: false, error: 'amount', amount: null };
      }
    }
 
    if (customVpaRow.style.display === 'block') {
      selectedVpa = customVpaInput.value.trim();
      if (!selectedVpa) {
        return { ok: false, error: 'vpa', amount };
      }
    }

    const phoneNum = phoneNumber.value.trim();
    if (!phoneNum) {
      return { ok: false, error: 'mobile', amount };
    }
    const mobile = countryCode.value + phoneNum;
 
    return { ok: true, error: null, amount, note: noteInput.value.trim(), mobile };
  }

  function buildUpiUrl(amount, note) {
    const params = new URLSearchParams();
    params.set('pa', selectedVpa);
    params.set('pn', 'Payment');
    params.set('cu', 'INR');
    if (amount !== null) params.set('am', amount.toFixed(2));
    if (note) params.set('tn', note);
    return 'upi://pay?' + params.toString();
  }

  function showValidationError(error) {
    resetQrPreview();
    if (error === 'amount') {
      amountInput.focus();
      amountInput.style.borderColor = '#e0575a';
      setTimeout(() => { amountInput.parentElement.style.borderColor = ''; }, 900);
    } else if (error === 'vpa') {
      customVpaInput.focus();
      customVpaInput.style.borderColor = '#e0575a';
      setTimeout(() => { customVpaInput.style.borderColor = ''; }, 900);
    } else if (error === 'mobile') {
      phoneNumber.focus();
      phoneNumber.style.borderColor = '#e0575a';
      setTimeout(() => { phoneNumber.style.borderColor = ''; }, 900);
    }
  }

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      amountInput.value = btn.dataset.amt;
    });
  });

  generateBtn.addEventListener('click', () => {
    const paymentState = getQrState();
    if (!paymentState.ok) {
      showValidationError(paymentState.error);
      return;
    }
 
    const { amount, note } = paymentState;
    const upiUrl = buildUpiUrl(amount, note);
 
    qrDiv.innerHTML = '';
    qr = new QRCode(qrDiv, {
      text: upiUrl,
      width: 190,
      height: 190,
      colorDark: '#1c2130',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
    qrPlaceholder.style.display = 'none';
 
    receiptAmt.textContent = amount === null ? '₹ —' : '₹ ' + amount.toLocaleString('en-IN', {minimumFractionDigits: amount % 1 === 0 ? 0 : 2});
    const activeIdOption = document.querySelector('.id-option.active');
    const isCustomActive = activeIdOption && activeIdOption.dataset.custom === 'true';
    receiptLabel.textContent = isCustomActive ? selectedVpa : selectedLabel;
    if (note) {
      receiptNote.textContent = note;
      receiptNoteRow.style.display = 'flex';
    } else {
      receiptNoteRow.style.display = 'none';
    }
 
    setTimeout(() => {
      const img = qrDiv.querySelector('img') || qrDiv.querySelector('canvas');
      if (img) {
        downloadLink.style.display = 'block';
        downloadLink.onclick = () => {
          const canvas = qrDiv.querySelector('canvas');
          const url = canvas ? canvas.toDataURL('image/png') : img.src;
          const a = document.createElement('a');
          a.href = url;
          a.download = 'upi-qr-' + (amount === null ? 'blank' : amount) + '.png';
          a.click();
        };
      }
    }, 150);
  });
 
  const whatsappBtn = document.getElementById('whatsappBtn');
  whatsappBtn.addEventListener('click', () => {
    const paymentState = getPaymentState();
    if (!paymentState.ok) {
      showValidationError(paymentState.error);
      return;
    }

    const { mobile, amount, note } = paymentState;
    const cleanMobile = mobile.replace(/[\s\-()]/g, '').replace(/^\+/, '');
    const upiUrl = buildUpiUrl(amount, note);
    
    const amountText = amount ? '₹' + amount : 'Amount to be decided';
    const noteText = note ? '\n📝 Note: ' + note : '';
    const message = encodeURIComponent('💳 *Payment Request* 💳\n\nPlease pay via UPI:\n' + upiUrl + '\n\n💰 Amount: ' + amountText + noteText + '\n\nTap the link to pay instantly!');

    const whatsappUrl = isMobileDevice()
      ? 'whatsapp://send?phone=' + cleanMobile + '&text=' + message
      : 'https://web.whatsapp.com/send?phone=' + cleanMobile + '&text=' + message;

    window.open(whatsappUrl, '_blank');
  });
 
  payBtn.addEventListener('click', () => {
    const paymentState = getQrState();
    if (!paymentState.ok) {
      showValidationError(paymentState.error);
      return;
    }

    const { amount, note } = paymentState;
    const upiUrl = buildUpiUrl(amount, note);
    window.location.href = upiUrl;
  });
