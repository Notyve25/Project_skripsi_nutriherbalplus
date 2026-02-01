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

// Jaminan Kesehatan
var jaminankesehatanoptions = {
    series: [{
        name: 'wilayah puskesmas sleman',
        data: [77.5, 63.3, 53.92, 40.3, 39.56]
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
    colors: ['#28a745'],
    dataLabels: { enabled: true },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Triharjo', 'Caturharjo', 'Tridadi', 'Trimulyo', 'Pendowoharjo'],
        title: { text: 'Desa' }
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
var jaminankesehatanchart = new ApexCharts(document.querySelector("#chart-jaminan-kesehatan"), jaminankesehatanoptions);
jaminankesehatanchart.render();

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