document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.getElementById('flexSwitchCheckDefault');
    // Event listener for section filter checkboxes
    const sectionFilters = document.querySelectorAll('.section-filter');
    sectionFilters.forEach(filter => {
        filter.addEventListener('change', () => {
            const sirkType = toggle.checked ? 'manual' : 'online';
            loadAndDisplayReports(sirkType);
        });
    });

    // Initialize reports with default type ('online' or 'manual')
    loadAndDisplayReports();

    // Event listener for the toggle switch
    toggle.addEventListener('change', function() {
        const sirkType = toggle.checked ? 'manual' : 'online';
        loadAndDisplayReports(sirkType);
        updateTime();
    });

    // Update time every second
    updateTime();
    setInterval(updateTime, 1000);
});

function loadAndDisplayReports(sirkType = null) {
    fetch('/get-reports')
    .then(response => response.json())
    .then(reports => {
        const reportsBody = document.querySelector('.primary-report tbody');
        reportsBody.innerHTML = ''; // Clear existing rows

        if (!sirkType) sirkType = reports.sirkType;

        let list = (sirkType === 'manual') ? reports.mSirkList : reports.oSirkList;
        let sectionList = (sirkType === 'manual') ? reports.mSectionReports : reports.oSectionReports;

        // Get selected sections
        const selectedSections = Array.from(document.querySelectorAll('.section-filter:checked')).map(checkbox => checkbox.value);

        list = list.filter(record => selectedSections.length === 0 || selectedSections.includes(record.section));

        const reportHeader = document.getElementById('report-header');
        reportHeader.textContent = sirkType === 'online' ? 'Online Report' : 'Manual Report';

        list.forEach(record => {
            let row = `<tr>
                <td>${ record.id       }</td>
                <td>${ record.name     }</td>
                <td>${ record.position }</td>
                <td>${ record.sirk     }</td>
            </tr>`;
            reportsBody.innerHTML += row;
        });

        // Update the chart
        updateChart(sectionList);
    })
    .catch(error => {
        console.error('Error fetching reports:', error);
    });
}

function updateChart(sectionList) {
    const labels = sectionList.map(item => item.section);
    const values = sectionList.map(item => item.sirk);

    const ctx = document.getElementById('myChart').getContext('2d');
    if (window.myChart instanceof Chart) {
        window.myChart.destroy(); // Destroy the old chart
    }
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sirk',
                data: values,
                backgroundColor: [
                    '#3C7F72',  // Balita 
                    '#7A5EA8',  // Isports 
                    '#242223',  // Bayan
                    '#DC6874',  // BnK
                    '#083b73',  // Retrato
                    '#fad02c',  // Sining
                    '#f9943b',  // IT
                ],
                borderColor: [
                    '#63B98F',
                    '#9C80C8',
                    '#474746',
                    '#E37E8B',
                    '#2D6BBF',
                    '#FEEC61',
                    '#FFB561',
                ],
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

function updateTime() {
    const timePlaceholder = document.getElementById('timePlaceholder');
    fetch('/get-time')
    .then(response => response.json())
    .then(data => {
        let sirk;
        const toggle = document.getElementById('flexSwitchCheckDefault');
        const sirkType = toggle.checked ? 'manual' : 'online';

        if (sirkType === 'manual') sirk = data.issue.mSirk;
        else if (sirkType === 'online') sirk = data.issue.oSirk;

        const target = getTarget(sirk);

        if (target) {
            const now = new Date();
            const timeDiff = convertToPhilippineTime(new Date(target)) - now;
            
            let label;
            if (target === sirk.doubleDate) label = 'Double Sirk Countdown: ';
            else if (target === sirk.endDate) label = 'Sirk Countdown: ';

            if (timeDiff >= 0) timePlaceholder.textContent = label + formatTimeRemaining(timeDiff);
            else timePlaceholder.textContent = 'Oras: ' + data.time;
        } else timePlaceholder.textContent = 'Oras: ' + data.time;
    })
    .catch(error => {
        console.error('Error fetching time:', error);
    });
}

function convertToPhilippineTime(date) {
    const PH_TIME_DIFF = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
    return new Date(date.getTime() + PH_TIME_DIFF);
}

// Function to format the remaining time
function formatTimeRemaining(timeDiff) {
    const seconds = Math.floor((timeDiff / 1000) % 60);
    const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;
}

function getTarget(sirk) {
    const currentTime = new Date().toISOString();
    const doubleDate = sirk.doubleDate;
    const endDate = sirk.endDate;

    if (currentTime >= sirk.startDate && currentTime <= endDate) {
        if (currentTime <= doubleDate) return doubleDate;
        else if (currentTime <= endDate) return endDate;
    }
}