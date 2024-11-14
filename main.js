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
    const selectValue = document.querySelector('.form-select').value.toLowerCase();
    const searchInput = document.querySelector('.form-control').value.toLowerCase();
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

// Đăng ký sự kiện cho nút tìm kiếm
document.querySelector('.btn-primary').addEventListener('click', searchTable);

let storedDevices = [];

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
    } catch (error) {
        console.error('Error fetching device data:', error);
    }
}

// Hàm cập nhật bảng thiết bị
function updateDeviceTable(devices) {
    const tableBody = document.getElementById('device-table-body');
    tableBody.innerHTML = ''; // Xóa nội dung bảng trước khi thêm mới

    devices.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.device}</td>
            <td>${item.action}</td>
            <td>${item.time}</td>
        `;
        tableBody.appendChild(row);
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

// Gắn sự kiện click vào nút Search
document.getElementById('search-button').addEventListener('click', searchDeviceTable);

// Gắn sự kiện tìm kiếm ngay khi người dùng nhập
document.getElementById('search-input').addEventListener('input', searchDeviceTable);


// Khai báo các biến toàn cục cho các biểu đồ và mảng dữ liệu
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



// Gọi hàm fetchData để lấy dữ liệu khi tải trang
window.onload = function() {
    initCharts();
    fetchData();
    fetchDeviceData();
    setInterval(fetchData, 2000);  // Cập nhật dữ liệu mỗi 2 giây
};
// Gọi hàm để cập nhật bảng cảm biến khi mở offcanvas
document.getElementById('demoDATA').addEventListener('show.bs.offcanvas', fetchData);
document.getElementById('demoDEVICE').addEventListener('show.bs.offcanvas', fetchDeviceData);
