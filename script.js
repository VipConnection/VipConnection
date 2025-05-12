// script.js
// 1) Carga Google Charts OrgChart
google.charts.load('current', { packages:['orgchart'] });
google.charts.setOnLoadCallback(drawChart);

async function drawChart() {
  const sheetId  = '1Cohw3JDwd_zAFHnfzc3GqAEOOutQEnP7XB9dzD0mzx4';   // Reemplaza por tu ID de Spreadsheet
  const sheetGid = '0';  // Reemplaza por el GID de la pestaña “Usuarios”
  const csvUrl   = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${sheetGid}`;
  const errorDiv = document.getElementById('error');

  try {
    // 2) Descarga y parseo del CSV
    const res  = await fetch(csvUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const lines = text.trim().split(/\r?\n/);
    const delim = lines[0].includes(';') ? ';' : ',';
    const rowsAll = lines.map(l => l.split(delim));
    const headers = rowsAll.shift();

    // 3) Busca índices de columnas
    const idxUser = headers.indexOf('UserID');
    const idxPfc  = headers.indexOf('ParentForChart');
    if (idxUser < 0 || idxPfc < 0) {
      throw new Error(`No encontré UserID o ParentForChart en: ${headers.join(delim)}`);
    }

    // 4) Prepara DataTable
    const data = new google.visualization.DataTable();
    data.addColumn('string','Name');
    data.addColumn('string','Manager');

    // 5) Añade filas: originales y espejos colgando del abuelo
    rowsAll.forEach(r => {
      const name    = (r[idxUser]||'').trim();
      const manager = (r[idxPfc] || '').trim();
      if (name) data.addRow([ name, manager ]);
    });

    // 6) Dibuja el OrgChart
    const chart = new google.visualization.OrgChart(
      document.getElementById('chart_div')
    );
    chart.draw(data, { allowHtml: true });
    errorDiv.textContent = '';
  } catch (e) {
    console.error(e);
    errorDiv.textContent = `Error:\n${e.message}`;
  }
}
