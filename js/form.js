/* ============================================
   RECONHECER 2026 - Form JS
   Validação, máscaras, toggle, localStorage
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('registrationForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');
    const companionYes = document.getElementById('companionYes');
    const companionNo = document.getElementById('companionNo');
    const companionFields = document.getElementById('companionFields');
    const phoneInput = document.getElementById('phone');
    const cpfInput = document.getElementById('cpf');

    // ---- Toggle Acompanhante ----
    companionYes.addEventListener('click', function () {
        companionYes.classList.add('active');
        companionNo.classList.remove('active');
        companionFields.classList.add('show');
    });

    companionNo.addEventListener('click', function () {
        companionNo.classList.add('active');
        companionYes.classList.remove('active');
        companionFields.classList.remove('show');
        document.getElementById('companionName').value = '';
    });

    // ---- Máscaras ----
    function maskPhone(value) {
        value = value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 6) {
            return '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7);
        } else if (value.length > 2) {
            return '(' + value.slice(0, 2) + ') ' + value.slice(2);
        } else if (value.length > 0) {
            return '(' + value;
        }
        return value;
    }

    function maskCPF(value) {
        value = value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 9) {
            return value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9);
        } else if (value.length > 6) {
            return value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6);
        } else if (value.length > 3) {
            return value.slice(0, 3) + '.' + value.slice(3);
        }
        return value;
    }

    phoneInput.addEventListener('input', function () {
        this.value = maskPhone(this.value);
    });

    cpfInput.addEventListener('input', function () {
        this.value = maskCPF(this.value);
    });

    // ---- Validação CPF ----
    function isValidCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        var soma = 0;
        for (var i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        var resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (var j = 0; j < 10; j++) {
            soma += parseInt(cpf.charAt(j)) * (11 - j);
        }
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(cpf.charAt(10))) return false;

        return true;
    }

    // ---- Validação de campo individual ----
    function validateField(field) {
        var isValid = true;

        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
        }

        if (field.type === 'email' && field.value) {
            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(field.value)) isValid = false;
        }

        if (field.id === 'cpf' && field.value) {
            if (!isValidCPF(field.value)) isValid = false;
        }

        if (field.id === 'phone' && field.value) {
            var digits = field.value.replace(/\D/g, '');
            if (digits.length < 10) isValid = false;
        }

        if (field.type === 'checkbox' && field.hasAttribute('required')) {
            isValid = field.checked;
        }

        if (isValid) {
            field.classList.remove('is-invalid');
            if (field.value && field.type !== 'checkbox') {
                field.classList.add('is-valid');
            }
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }

        return isValid;
    }

    // ---- Validar em tempo real (blur) ----
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
        field.addEventListener('blur', function () {
            validateField(this);
        });
    });

    // ---- Submit ----
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var allValid = true;
        var fields = form.querySelectorAll('input[required], select[required], textarea[required]');

        fields.forEach(function (field) {
            if (!validateField(field)) {
                allValid = false;
            }
        });

        // Validar checkbox de termos
        var termsCheck = document.getElementById('terms');
        if (!termsCheck.checked) {
            termsCheck.classList.add('is-invalid');
            allValid = false;
        }

        if (!allValid) {
            // Scroll para o primeiro campo inválido
            var firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Coletar dados
        var data = {
            id: Date.now(),
            dataInscricao: new Date().toLocaleString('pt-BR'),
            nomeCompleto: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('phone').value.trim(),
            cpf: document.getElementById('cpf').value.trim(),
            empresa: document.getElementById('company').value.trim(),
            acompanhante: companionYes.classList.contains('active') ? 'Sim' : 'Não',
            nomeAcompanhante: document.getElementById('companionName').value.trim(),
            restricaoAlimentar: document.getElementById('dietary').value,
            observacoes: document.getElementById('observations').value.trim()
        };

        // Salvar no localStorage
        var registrations = JSON.parse(localStorage.getItem('reconhecer_registrations') || '[]');
        registrations.push(data);
        localStorage.setItem('reconhecer_registrations', JSON.stringify(registrations));

        // Mostrar sucesso
        form.classList.add('d-none'); // Usar Bootstrap d-none
        formSuccess.classList.add('show');
    });

    // ---- Reset modal on close ----
    const registrationModal = document.getElementById('registrationModal');
    if (registrationModal) {
        registrationModal.addEventListener('hidden.bs.modal', function () {
            resetForm();
        });
    }

});

// ---- Reset Form (global) ----
function resetForm() {
    var form = document.getElementById('registrationForm');
    var formSuccess = document.getElementById('formSuccess');

    if (!form || !formSuccess) return;

    form.reset();
    form.classList.remove('d-none');
    form.style.display = '';
    formSuccess.classList.remove('show');

    // Reset validação visual
    form.querySelectorAll('.is-valid, .is-invalid').forEach(function (el) {
        el.classList.remove('is-valid', 'is-invalid');
    });

    // Reset toggle
    const companionNo = document.getElementById('companionNo');
    const companionYes = document.getElementById('companionYes');
    const companionFields = document.getElementById('companionFields');

    if (companionNo && companionYes && companionFields) {
        companionNo.classList.add('active');
        companionYes.classList.remove('active');
        companionFields.classList.remove('show');
    }
}
