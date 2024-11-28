function switchView(viewId) {
    // Ẩn tất cả các giao diện
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.style.display = 'none');
    // Hiển thị giao diện được chọn
    document.getElementById(viewId).style.display = 'block';

    // Cập nhật lại dữ liệu sau khi thay đổi giao diện
    if (viewId === 'view2') {
        // Đảm bảo bảng thiết bị luôn được cập nhật
        fetchDeviceData();
        setInterval(fetchDeviceData, 10000);
    }
}
let storedData = [];
// Hàm để lấy dữ liệu từ API và cập nhật giao diện
async function fetchData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/data');
        const data = await response.json();
        console.log(data);
        storedData.push(data); // Lưu trữ dữ liệu mới vào mảng

        // Cập nhật các span với dữ liệu mới nhất
        document.querySelector('.nhietdo').textContent = `${data.temp} °C`;
        document.querySelector('.doam').textContent = `${data.hum} %`;
        document.querySelector('.anhsang').textContent = `${data.light} lx`;

        // Cập nhật dữ liệu cho biểu đồ
        updateCharts(data);
        // Cập nhật bảng với dữ liệu mới
        updateTable(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
let Id = 0;
// Hàm cập nhật bảng
function updateTable(data) {
    const tableBody = document.getElementById('data-table-body');
    const row = document.createElement('tr');
    Id++;
    // Tạo hàng mới cho bảng với dữ liệu từ API
    row.innerHTML = `
        <td>${Id}</td>
        <td>${data.temp}</td>
        <td>${data.hum}</td>
        <td>${data.light}</td>
        <td>${data.time}</td>
    `;
    
    // Thêm hàng mới vào bảng
    tableBody.appendChild(row);
}

// Hàm tìm kiếm dữ liệu trong bảng
function searchTable() {
    const selectValue = document.getElementById('search2-category').value.toLowerCase();
    const searchInput = document.getElementById('search2-input').value.toLowerCase();
    const tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';

    if (!searchInput) {
        // Nếu thanh input rỗng, hiển thị lại toàn bộ dữ liệu
        storedData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.temp}</td>
                <td>${item.hum}</td>
                <td>${item.light}</td>
                <td>${item.time}</td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        // Lọc và hiển thị dữ liệu theo điều kiện tìm kiếm
        const filteredData = storedData.filter(item => {
            return item[selectValue].toString().toLowerCase().includes(searchInput);
        });
        filteredData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.temp}</td>
                <td>${item.hum}</td>
                <td>${item.light}</td>
                <td>${item.time}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Gắn sự kiện click cho nút "Search"
document.getElementById('search2-button').addEventListener('click', searchTable);


let storedDevices = [];
let led4OnCount = 0;
let led5OnCount = 0;

function updateLedCounts(devices) {
    // Reset counts
    led4OnCount = 0;
    led5OnCount = 0;

    // Tăng số lần bật nếu `action` là "on"
    devices.forEach(item => {
        if (item.device.toLowerCase() === 'led4' && item.action.toLowerCase() === 'on') {
            led4OnCount++;
        } else if (item.device.toLowerCase() === 'led5' && item.action.toLowerCase() === 'on') {
            led5OnCount++;
        }
    });

    // Cập nhật số lần bật cho LED4 và LED5
    document.getElementById('led4-count').textContent = `Số lần bật: ${led4OnCount/2}`;
    document.getElementById('led5-count').textContent = `Số lần bật: ${led5OnCount/2}`;
}

// Hàm để lấy dữ liệu thiết bị từ API và cập nhật bảng
async function fetchDeviceData() {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/device', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'  // Đảm bảo CORS đã được kích hoạt
        });
        const devices = await response.json();
        console.log(devices);

        storedDevices = devices;
        console.log(storedDevices);  
        // Cập nhật bảng với dữ liệu thiết bị
        updateDeviceTable(devices);
        updateLedCounts(devices);
    } catch (error) {
        console.error('Error fetching device data:', error);
    }
}

// Hàm cập nhật bảng thiết bị
function updateDeviceTable(devices) {
    // Lấy body của hai bảng
    const tableBody1 = document.getElementById('device-table-body');  // Bảng cho LED1, LED2, LED3
    const tableBody2 = document.getElementById('device1-table-body'); // Bảng cho LED4, LED5

    // Xóa nội dung cũ của hai bảng
    tableBody1.innerHTML = '';
    tableBody2.innerHTML = '';

    devices.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.device}</td>
            <td>${item.action}</td>
            <td>${item.time}</td>
        `;
        const group1Devices = ['led1', 'led2', 'led3'];
        const group2Devices = ['led4', 'led5'];
        if (group1Devices.includes(item.device.toLowerCase())) {
            tableBody1.appendChild(row);
        } else if (group2Devices.includes(item.device.toLowerCase())) {
            tableBody2.appendChild(row);
        }

    });
}


function searchDeviceTable() {
    const searchInput = document.getElementById('search-input').value.toLowerCase(); // Lấy giá trị từ ô tìm kiếm
    const searchCategory = document.getElementById('search-category').value.toLowerCase(); // Lấy giá trị từ select
    const tableRows = document.querySelectorAll('#device-table-body tr'); // Lấy tất cả các hàng trong bảng

    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let isMatch = false;

        // Kiểm tra từng hàng dựa trên cột được chọn
        if (searchCategory === 'device' && cells[1]) {
            isMatch = cells[1].textContent.toLowerCase().includes(searchInput);
        } else if (searchCategory === 'action' && cells[2]) {
            isMatch = cells[2].textContent.toLowerCase().includes(searchInput);
        } else if (searchCategory === 'time' && cells[3]) {
            isMatch = cells[3].textContent.toLowerCase().includes(searchInput);
        } else if (searchCategory === 'id' && cells[0]) {
            isMatch = cells[0].textContent.toLowerCase().includes(searchInput);
        }

        // Hiển thị hoặc ẩn hàng dựa trên kết quả tìm kiếm
        row.style.display = isMatch ? '' : 'none';
    });
}

document.getElementById('search-button').addEventListener('click', searchDeviceTable);


function searchDevice1Table() {
    const searchInput = document.getElementById('search1-input').value.toLowerCase(); // Lấy giá trị từ ô tìm kiếm
    const searchCategory = document.getElementById('search1-category').value.toLowerCase(); // Lấy giá trị từ select
    const tableRows = document.querySelectorAll('#device1-table-body tr'); // Lấy tất cả các hàng trong bảng

    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let isMatch = false;

        // Kiểm tra từng hàng dựa trên cột được chọn
        if (searchCategory === 'device' && cells[1]) {
            isMatch = cells[1].textContent.toLowerCase().includes(searchInput);
        } else if (searchCategory === 'action' && cells[2]) {
            isMatch = cells[2].textContent.toLowerCase().includes(searchInput);
        } else if (searchCategory === 'time' && cells[3]) {
            isMatch = cells[3].textContent.toLowerCase().includes(searchInput);
        } else if (searchCategory === 'id' && cells[0]) {
            isMatch = cells[0].textContent.toLowerCase().includes(searchInput);
        }

        // Hiển thị hoặc ẩn hàng dựa trên kết quả tìm kiếm
        row.style.display = isMatch ? '' : 'none';
    });
}

// Gắn sự kiện click vào nút Search
document.getElementById('search1-button').addEventListener('click', searchDevice1Table);


// Khai báo các biến toàn cục cho các biểu đồ và mảng dữ liệu
let tempChart, humidityChart, lightChart;
let tempData = {
    labels: [],
    datasets: [{
        label: 'Temperature',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
    }]
};

let humidityData = {
    labels: [],
    datasets: [{
        label: 'Humidity',
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
    }]
};

let lightData = {
    labels: [],
    datasets: [{
        label: 'Light',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
    }]
};

// Hàm khởi tạo biểu đồ (chỉ gọi một lần)
function initCharts() {
    tempChart = new Chart(document.getElementById('Chart-first'), {
        type: 'line',
        data: tempData,
    });

    humidityChart = new Chart(document.getElementById('Chart-second'), {
        type: 'line',
        data: humidityData,
    });

    lightChart = new Chart(document.getElementById('Chart-third'), {
        type: 'line',
        data: lightData,
    });
}

// Hàm để cập nhật dữ liệu cho biểu đồ
function updateCharts(data) {
    const label = new Date().toLocaleTimeString();

    // Thêm nhãn và dữ liệu mới vào mảng
    tempData.labels.push(label);
    tempData.datasets[0].data.push(data.temp);

    humidityData.labels.push(label);
    humidityData.datasets[0].data.push(data.hum);

    lightData.labels.push(label);
    lightData.datasets[0].data.push(data.light);

    // Giới hạn số lượng điểm hiển thị (nếu cần)
    const maxDataPoints = 20;
    if (tempData.labels.length > maxDataPoints) { 
        tempData.labels.shift();
        tempData.datasets[0].data.shift();
    }
    if (humidityData.labels.length > maxDataPoints) {
        humidityData.labels.shift();
        humidityData.datasets[0].data.shift();
    }
    if (lightData.labels.length > maxDataPoints) {
        lightData.labels.shift();
        lightData.datasets[0].data.shift();
    }

    // Cập nhật biểu đồ mà không cần hủy và tạo lại
    tempChart.update();
    humidityChart.update();
    lightChart.update();
}

// Gọi hàm khởi tạo biểu đồ khi trang web tải




// Hàm điều khiển LED
async function controlLED(ledNumber, action) {
    try {
        await fetch('http://127.0.0.1:5000/api/led', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                led: `LED${ledNumber}`,  // LED1, LED2, LED3
                action: action,          // "on" hoặc "off"
            }),
        });
    } catch (error) {
        console.error(`Error controlling LED${ledNumber}:`, error);
    }
}

// Đăng ký sự kiện cho các nút bật/tắt LED
document.getElementById('toggleButton1').addEventListener('click', function () {
    const action = this.classList.toggle('active') ? 'on' : 'off';
    controlLED(1, action);
});

document.getElementById('toggleButton2').addEventListener('click', function () {
    const action = this.classList.toggle('active') ? 'on' : 'off';
    controlLED(2, action);
});

document.getElementById('toggleButton3').addEventListener('click', function () {
    const action = this.classList.toggle('active') ? 'on' : 'off';
    controlLED(3, action);
});

document.getElementById('toggleButton4').addEventListener('click', function () {
    const action = this.classList.toggle('active') ? 'on' : 'off';
    controlLED(4, action); // Điều khiển LED4
});

// Đăng ký sự kiện cho nút bật/tắt LED5
document.getElementById('toggleButton5').addEventListener('click', function () {
    const action = this.classList.toggle('active') ? 'on' : 'off';
    controlLED(5, action); // Điều khiển LED5
});


// Gọi hàm fetchData để lấy dữ liệu khi tải trang
window.onload = function() {
    initCharts();
    fetchData();
    fetchDeviceData();
    setInterval(fetchData, 3000); // Cập nhật dữ liệu mỗi 3 giây
};
// Gọi hàm để cập nhật bảng cảm biến khi mở offcanvas
document.getElementById('demoDATA').addEventListener('show.bs.offcanvas', fetchData);
document.getElementById('demoDEVICE').addEventListener('show.bs.offcanvas', fetchDeviceData);
