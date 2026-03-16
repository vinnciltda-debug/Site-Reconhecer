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
function loadData(filter, unitFilterValue) {
    var registrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Filtrar se houver busca ou filtro de unidade
    if (filter || unitFilterValue) {
        var searchTerm = (filter || '').toLowerCase();
        registrations = registrations.filter(function (r) {
            var matchesSearch = !searchTerm ||
                (r.nomeCompleto || '').toLowerCase().includes(searchTerm) ||
                (r.email || '').toLowerCase().includes(searchTerm) ||
                (r.empresa || '').toLowerCase().includes(searchTerm);

            var matchesUnit = !unitFilterValue || r.unidade === unitFilterValue;

            return matchesSearch && matchesUnit;
        });
    }

    // Atualizar stats (sempre com dados totais)
    var allRegistrations = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    var totalCompanions = allRegistrations.filter(function (r) { return r.acompanhante === 'Sim'; }).length;
    document.getElementById('statTotal').textContent = allRegistrations.length;
    document.getElementById('statCompanions').textContent = totalCompanions;
    document.getElementById('statPeople').textContent = allRegistrations.length + totalCompanions;

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
            '<td><span class="badge ' + (reg.unidade === 'São Paulo' ? 'bg-info' : 'bg-warning text-dark') + '">' + escapeHtml(reg.unidade || '-') + '</span></td>' +
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

// ---- Busca e Filtro ----
document.getElementById('searchInput').addEventListener('input', function () {
    loadData(this.value, document.getElementById('unitFilter').value);
});

document.getElementById('unitFilter').addEventListener('change', function () {
    loadData(document.getElementById('searchInput').value, this.value);
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
