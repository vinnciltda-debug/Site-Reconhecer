/* ============================================
   RECONHECER 2026 - Admin JS
   Login, tabela, busca, exportação Excel
   ============================================ */

// ---- Configuração ----
var ADMIN_PASSWORD = 'reconhecer2026';
var STORAGE_KEY = 'reconhecer_registrations';

// ---- Elementos ----
var loginScreen = document.getElementById('loginScreen');
var adminPanel = document.getElementById('adminPanel');
var loginForm = document.getElementById('loginForm');
var loginError = document.getElementById('loginError');
var tableBody = document.getElementById('tableBody');
var emptyState = document.getElementById('emptyState');
var searchInput = document.getElementById('searchInput');

// ---- Login ----
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var password = document.getElementById('adminPassword').value;

    if (password === ADMIN_PASSWORD) {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        sessionStorage.setItem('admin_authenticated', 'true');
        loadData();
    } else {
        loginError.style.display = 'block';
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
});

// ---- Verificar sessão ----
if (sessionStorage.getItem('admin_authenticated') === 'true') {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    loadData();
}

// ---- Logout ----
function logout() {
    sessionStorage.removeItem('admin_authenticated');
    loginScreen.style.display = '';
    adminPanel.style.display = 'none';
    document.getElementById('adminPassword').value = '';
    loginError.style.display = 'none';
}

// ---- Carregar dados ----
function loadData(filter) {
    var registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Filtrar se houver busca ou unidade
    var selectedUnidade = document.getElementById('unitFilter') ? document.getElementById('unitFilter').value : 'todas';
    var searchTerm = filter ? filter.toLowerCase() : (searchInput.value ? searchInput.value.toLowerCase() : '');

    registrations = registrations.filter(function (r) {
        var matchesUnit = (selectedUnidade === 'todas') || (r.unidade === selectedUnidade);
        var matchesSearch = (r.nomeCompleto || '').toLowerCase().includes(searchTerm) ||
            (r.email || '').toLowerCase().includes(searchTerm) ||
            (r.empresa || '').toLowerCase().includes(searchTerm);
        return matchesUnit && matchesSearch;
    });

    // Atualizar stats (breakdown)
    var allRegs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    var totalCompanions = allRegs.filter(function (r) { return r.acompanhante === 'Sim'; }).length;
    var spCount = allRegs.filter(function (r) { return r.unidade === 'São Paulo'; }).length;
    var mgCount = allRegs.filter(function (r) { return r.unidade === 'Minas Gerais'; }).length;

    document.getElementById('statTotal').textContent = allRegs.length;
    document.getElementById('statSP').textContent = spCount;
    document.getElementById('statMG').textContent = mgCount;
    document.getElementById('statPeople').textContent = allRegs.length + totalCompanions;

    // Renderizar tabela
    tableBody.innerHTML = '';

    if (registrations.length === 0) {
        emptyState.style.display = '';
        return;
    }

    emptyState.style.display = 'none';

    registrations.forEach(function (reg, index) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td>' + (index + 1) + '</td>' +
            '<td>' + escapeHtml(reg.dataInscricao || '') + '</td>' +
            '<td><span class="badge ' + (reg.unidade === 'São Paulo' ? 'bg-primary' : 'bg-success') + '">' + escapeHtml(reg.unidade || '-') + '</span></td>' +
            '<td><strong>' + escapeHtml(reg.nomeCompleto || '') + '</strong></td>' +
            '<td>' + escapeHtml(reg.email || '') + '</td>' +
            '<td>' + escapeHtml(reg.telefone || '') + '</td>' +
            '<td>' + escapeHtml(reg.cpf || '') + '</td>' +
            '<td>' + escapeHtml(reg.empresa || '-') + '</td>' +
            '<td>' + (reg.acompanhante === 'Sim'
                ? '<span class="badge bg-success">Sim</span> ' + escapeHtml(reg.nomeAcompanhante || '')
                : '<span class="badge bg-secondary">Não</span>') +
            '</td>' +
            '<td>' + escapeHtml(reg.restricaoAlimentar || '-') + '</td>' +
            '<td>' + escapeHtml(reg.observacoes || '-') + '</td>';
        tableBody.appendChild(tr);
    });
}

// ---- Busca ----
searchInput.addEventListener('input', function () {
    loadData(this.value);
});

// ---- Exportar para Excel ----
function exportToExcel() {
    var registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (registrations.length === 0) {
        alert('Nenhuma inscrição para exportar.');
        return;
    }

    // Preparar dados
    var data = registrations.map(function (reg, index) {
        return {
            '#': index + 1,
            'Data Inscrição': reg.dataInscricao || '',
            'Unidade': reg.unidade || '',
            'Nome Completo': reg.nomeCompleto || '',
            'E-mail': reg.email || '',
            'Telefone': reg.telefone || '',
            'CPF': reg.cpf || '',
            'Empresa/Área': reg.empresa || '',
            'Acompanhante': reg.acompanhante || 'Não',
            'Nome Acompanhante': reg.nomeAcompanhante || '',
            'Restrição Alimentar': reg.restricaoAlimentar || '',
            'Observações': reg.observacoes || ''
        };
    });

    var ws = XLSX.utils.json_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inscrições');

    // Ajustar largura das colunas
    var colWidths = [
        { wch: 4 },   // #
        { wch: 18 },  // Data
        { wch: 15 },  // Unidade
        { wch: 30 },  // Nome
        { wch: 30 },  // Email
        { wch: 16 },  // Telefone
        { wch: 16 },  // CPF
        { wch: 20 },  // Empresa
        { wch: 14 },  // Acompanhante
        { wch: 25 },  // Nome Acompanhante
        { wch: 18 },  // Restrição
        { wch: 30 }   // Observações
    ];
    ws['!cols'] = colWidths;

    // Baixar
    var dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, 'inscricoes_reconhecer_' + dateStr + '.xlsx');
}

// ---- Limpar dados ----
function clearData() {
    var registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (registrations.length === 0) {
        alert('Não há dados para limpar.');
        return;
    }

    if (confirm('⚠️ Tem certeza que deseja excluir TODAS as ' + registrations.length + ' inscrições?\n\nEsta ação não pode ser desfeita. Recomendamos exportar antes de excluir.')) {
        localStorage.removeItem(STORAGE_KEY);
        loadData();
    }
}

// ---- Escape HTML ----
function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// ---- Homenageados (Honorees) ----
var HONOREES_KEY = 'reconhecer_honorees';

document.addEventListener('DOMContentLoaded', function () {
    var honoreesModal = document.getElementById('honoreesModal');
    if (honoreesModal) {
        honoreesModal.addEventListener('show.bs.modal', function () {
            loadHonorees();
        });

        // Atualizar lista em tempo real ao colar/digitar no textarea
        document.getElementById('honoreesList').addEventListener('input', function () {
            var rawText = this.value;
            var rawCpfs = rawText.split(/[\n,;]+/);
            var cleanCpfs = [];
            rawCpfs.forEach(function (val) {
                var clean = val.replace(/\D/g, '');
                if (clean.length === 11) cleanCpfs.push(clean);
            });
            var uniqueCpfs = cleanCpfs.filter(function (item, pos) { return cleanCpfs.indexOf(item) == pos; });
            document.getElementById('honoreesCount').textContent = uniqueCpfs.length + ' homenageado(s)';
        });
    }
});

function loadHonorees() {
    var honorees = JSON.parse(localStorage.getItem(HONOREES_KEY) || '[]');
    document.getElementById('honoreesList').value = honorees.join('\n');
    document.getElementById('honoreesCount').textContent = honorees.length + ' homenageado(s)';
}

function saveHonorees() {
    var rawText = document.getElementById('honoreesList').value;
    var rawCpfs = rawText.split(/[\n,;]+/);
    var cleanCpfs = [];

    rawCpfs.forEach(function (val) {
        var clean = val.replace(/\D/g, '');
        if (clean.length === 11) {
            cleanCpfs.push(clean);
        }
    });

    // Remove duplicates
    var uniqueCpfs = cleanCpfs.filter(function (item, pos) {
        return cleanCpfs.indexOf(item) == pos;
    });

    localStorage.setItem(HONOREES_KEY, JSON.stringify(uniqueCpfs));
    loadHonorees();
}
