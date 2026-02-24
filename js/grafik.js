// Penderita hipertensi di wilayah kabupaten sleman
var keluhankesehatanoptions = {
    series: [{
        name: 'Penderita hipertensi di wilayah kabupaten sleman',
        data: [69, 56, 52, 45, 40]
    }],
    chart: {
        type: 'bar',
        height: 320,
        toolbar: { show: false },
        animations: { enabled: true }
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '40%',
            borderRadius: 8,
        },
    },
    colors: ['#1ec3ff'],
    dataLabels: { enabled: true },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Wilayah Mlati', 'Wilayah Sleman', 'Wilayah Seyegan', 'Wilayah Prambanan', 'Wilayah Turi'],
        title: { text: 'Kabupaten' }
    },
    yaxis: {
        title: { text: 'Persentase (%)' }
    },
    fill: { opacity: 0.9 },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + " %"
            }
        }
    }
};
var keluhankesehatanchart = new ApexCharts(document.querySelector("#chart-keluhan-kesehatan"), keluhankesehatanoptions);
keluhankesehatanchart.render();

let currentInsightItems = [];
let currentInsightMode = 'ringkas';

function renderGrafikInsight(mode = 'ringkas') {
    const insightList = document.getElementById('insight-list');
    if (!insightList) return;

    const values = keluhankesehatanoptions.series[0].data || [];
    const labels = keluhankesehatanoptions.xaxis.categories || [];
    if (!values.length || !labels.length) return;

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const maxIndex = values.indexOf(maxValue);
    const minIndex = values.indexOf(minValue);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const spread = maxValue - minValue;

    const cleanedTopLabel = (labels[maxIndex] || '').replace('Wilayah ', '');
    const cleanedLowLabel = (labels[minIndex] || '').replace('Wilayah ', '');
    const aboveAverageCount = values.filter((value) => value >= average).length;
    const riskCategory = maxValue >= 60 ? 'tinggi' : maxValue >= 50 ? 'sedang' : 'rendah';

    const baseInsights = [
        `Wilayah dengan persentase tertinggi adalah ${cleanedTopLabel} (${maxValue}%).`,
        `Wilayah dengan persentase terendah adalah ${cleanedLowLabel} (${minValue}%).`,
        `Rata-rata persentase kasus berada di ${average.toFixed(1)}% dengan selisih antar wilayah sebesar ${spread} poin.`
    ];

    const detailInsights = [
        ...baseInsights,
        `${aboveAverageCount} dari ${values.length} wilayah berada di atas atau setara rata-rata kasus.`,
        `Kategori risiko tertinggi saat ini termasuk level ${riskCategory}, sehingga prioritas intervensi perlu difokuskan pada wilayah dengan nilai puncak.`
    ];

    currentInsightMode = mode === 'detail' ? 'detail' : 'ringkas';
    currentInsightItems = currentInsightMode === 'detail' ? detailInsights : baseInsights;

    insightList.innerHTML = currentInsightItems.map((item) => `<li>${item}</li>`).join('');
}

function initInsightControls() {
    const modeButtons = document.querySelectorAll('.insight-mode-btn');
    const downloadBtn = document.getElementById('downloadInsightBtn');

    modeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            modeButtons.forEach((btn) => btn.classList.remove('active', 'btn-light'));
            modeButtons.forEach((btn) => btn.classList.add('btn-outline-light'));

            button.classList.add('active', 'btn-light');
            button.classList.remove('btn-outline-light');
            renderGrafikInsight(button.getAttribute('data-mode'));
        });
    });

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const textContent = [
                'Insight Grafik Hipertensi Sleman',
                `Mode: ${currentInsightMode === 'detail' ? 'Detail' : 'Ringkas'}`,
                '',
                ...currentInsightItems.map((item, index) => `${index + 1}. ${item}`)
            ].join('\n');

            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const fileUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = 'insight-grafik-hipertensi.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(fileUrl);
        });
    }
}
renderGrafikInsight('ringkas');
initInsightControls();

// Animasi Counter Up untuk Statistik
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000; // Durasi animasi dalam ms (2 detik)
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Efek easing (keluar perlahan)
            const ease = 1 - Math.pow(1 - progress, 4);
            
            const current = start + (target - start) * ease;
            
            // Format angka: jika desimal tampilkan 1 angka belakang koma, jika bulat tampilkan bulat
            counter.innerText = (target % 1 !== 0) ? current.toFixed(1) : Math.floor(current);

            if (progress < 1) requestAnimationFrame(update);
            else counter.innerText = target; // Pastikan angka akhir akurat
        }
        requestAnimationFrame(update);
    });
});