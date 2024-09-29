let check = false
let myChart;

function statsByUser(){
    fetch('http://192.168.1.4:8000/bill/stats-by-user/', {
        method: 'get'
    }).then(function(res) {
        return res.json();
    }).then(function(data) {
        title = document.getElementById('title')
        title.innerText = 'Thống kê doanh thu theo người dùng'

        var table = document.getElementById('table')
        var rowCount = table.rows.length
        for (var i = 0; i < rowCount; i++)
            table.deleteRow(0)

        var head = table.insertRow()
        head.insertCell().innerHTML = '<b>Username</b>'
        head.insertCell().innerHTML = '<b>Số lượng</b>'
        head.insertCell().innerHTML = '<b>Tổng tiền</b>'

        let labels = [];
        let datas = [];
        let bgColors = [];

        for (let d of data){
            var row = table.insertRow()
            row.insertCell().innerText = d.booking__user__username
            row.insertCell().innerText = d.count
            row.insertCell().innerText = String(d.total).replace(/(.)(?=(\d{3})+$)/g,'$1,')

            labels.push(d.booking__user__username)
            datas.push(d.total)
            r=parseInt(Math.random()*255)
            g=parseInt(Math.random()*255)
            b=parseInt(Math.random()*255)
            bgColors.push(`rgba(${r},${g},${b},1)`)
        }
        drawChart(labels, datas, bgColors)
    })
}

function statsByMonth(){
    if(document.getElementById('month').value == '')
        alert("Vui lòng chọn tháng để thống kê!")
    else {
        fetch('http://192.168.1.4:8000/bill/stats-by-month/', {
            method: 'post',
            body: JSON.stringify({
                'month': document.getElementById('month').value
            }),
            headers: {
                'Content-type': 'application/json'
            }
        }).then(function(res) {
            return res.json();
        }).then(function(data) {
            title = document.getElementById('title')
            title.innerText = `Thống kê doanh thu tháng ${data[0].month} năm ${data[0].year}`

            var table = document.getElementById('table')
            var rowCount = table.rows.length
            for (var i = 0; i < rowCount; i++)
                table.deleteRow(0)

            var head = table.insertRow()
            head.insertCell().innerHTML = '<b>Ngày</b>'
            head.insertCell().innerHTML = '<b>Doanh thu</b>'

            let labels = [];
            let datas = [];
            let bgColors = [];

            for (var i = 1; i <= data[0].length; i++){
                var row = table.insertRow()
                row.insertCell().innerText = data[i].day
                row.insertCell().innerText = String(data[i].total).replace(/(.)(?=(\d{3})+$)/g,'$1,')

                labels.push(data[i].day)
                datas.push(data[i].total)
                r=parseInt(Math.random()*255)
                g=parseInt(Math.random()*255)
                b=parseInt(Math.random()*255)
                bgColors.push(`rgba(${r},${g},${b},1)`)
            }
            drawChart(labels, datas, bgColors)
        })
    }
}

function statsByYear(){
    fetch('http://192.168.1.4:8000/bill/stats-by-year/', {
        method: 'post',
        body: JSON.stringify({
            'year': document.getElementById('year').value
        }),
        headers: {
            'Content-type': 'application/json'
        }
    }).then(function(res) {
        return res.json();
    }).then(function(data) {
        title = document.getElementById('title')
        title.innerText = 'Thống kê doanh thu năm ' + document.getElementById('year').value

        var table = document.getElementById('table')
        var rowCount = table.rows.length
        for (var i = 0; i < rowCount; i++)
            table.deleteRow(0)

        var head = table.insertRow()
        head.insertCell().innerHTML = '<b>Tháng</b>'
        head.insertCell().innerHTML = '<b>Doanh thu</b>'

        let labels = [];
        let datas = [];
        let bgColors = [];

        for (var i = 0; i < 12; i++){
            var row = table.insertRow()
            row.insertCell().innerText = data[i].month
            row.insertCell().innerText = String(data[i].total).replace(/(.)(?=(\d{3})+$)/g,'$1,')

            labels.push(data[i].month)
            datas.push(data[i].total)
            r=parseInt(Math.random()*255)
            g=parseInt(Math.random()*255)
            b=parseInt(Math.random()*255)
            bgColors.push(`rgba(${r},${g},${b},1)`)
        }
        drawChart(labels, datas, bgColors)
    })
}

function statsByTour(){
    fetch('http://192.168.1.4:8000/bill/stats-by-tour/', {
        method: 'get'
    }).then(function(res) {
        return res.json();
    }).then(function(data) {
        title = document.getElementById('title')
        title.innerText = 'Thống kê doanh thu theo tour'

        var table = document.getElementById('table')
        var rowCount = table.rows.length
        for (var i = 0; i < rowCount; i++)
            table.deleteRow(0)

        var head = table.insertRow()
        head.insertCell().innerHTML = '<b>Tên tour</b>'
        head.insertCell().innerHTML = '<b>Số lượng vé đặt</b>'
        head.insertCell().innerHTML = '<b>Số lượng vé tổng</b>'
        head.insertCell().innerHTML = '<b>Tỉ lệ</b>'
        head.insertCell().innerHTML = '<b>Doanh thu</b>'

        let labels = [];
        let datas = [];
        let bgColors = [];

        for (let i = 1; i <= data[0].length; i++){
            var row = table.insertRow()
            row.insertCell().innerText = data[i].name
            row.insertCell().innerText = data[i].count
            row.insertCell().innerText = data[i].quantity
            row.insertCell().innerText = Number((100.0 * data[i].count / data[i].quantity).toFixed(2)) + '%'
            row.insertCell().innerText = String(data[i].total).replace(/(.)(?=(\d{3})+$)/g,'$1,')

            labels.push(data[i].name)
            datas.push(data[i].total)
            r=parseInt(Math.random()*255)
            g=parseInt(Math.random()*255)
            b=parseInt(Math.random()*255)
            bgColors.push(`rgba(${r},${g},${b},1)`)
        }
        drawChart(labels, datas, bgColors)
    })
}

function drawChart(labels, data, bgColors){
    const ctx = document.getElementById('myChart');

        if(check == true)
          myChart.destroy()
        else
          check = true
        myChart = new Chart(ctx, {
            type: document.getElementById('select_chart').value,
            data: {
              labels: labels,
              datasets: [{
                label: 'Doanh thu',
                data: data,
                borderWidth: 1,
                backgroundColor: bgColors
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
        });
}