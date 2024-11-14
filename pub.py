from flask import Flask, jsonify, request
from flask_cors import CORS  # Import thêm CORS
import mysql.connector
import paho.mqtt.client as mqtt
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:5500"}})

# Cấu hình MySQL
db = mysql.connector.connect(
    host='localhost',
    user='root',
    password='tuan2503',
    database='mcb'
)
cursor = db.cursor()
# Cấu hình MQTT broker
MQTT_BROKER = "192.168.205.93"
MQTT_PORT = 1884
MQTT_TOPIC_SENSOR = "data"
MQTT_TOPIC_LED = "led"

# Khởi tạo MQTT client
mqtt_client = mqtt.Client()
mqtt_client.username_pw_set("tuan", "123")

# Hàm xử lý khi nhận tin nhắn từ MQTT
def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode('utf-8')
    
    # Xử lý dữ liệu cảm biến từ topic 'data'
    if topic == MQTT_TOPIC_SENSOR:
        data = json.loads(payload)
        temp = data.get('temperature')
        hum = data.get('humidity')
        light = data.get('light')
        
        # Lưu vào bảng 'data'
        sql_data = "INSERT INTO `data` (`temp`, `hum`, `light`) VALUES (%s, %s, %s)"
        val_data = (temp, hum, light)
        cursor.execute(sql_data, val_data)
        db.commit()
        print(f"Lưu vào bảng 'data': {temp}, {hum}, {light}")

    # Xử lý trạng thái LED từ topic 'led'
    elif topic == MQTT_TOPIC_LED:
        action = payload.strip()
        if action in ["led1_on", "led1_off", "led2_on", "led2_off", "led3_on", "led3_off"]:
            device = action[:4]
            status = action[5:]
            
            # Lưu vào bảng 'device'
            sql_device = "INSERT INTO `device` (`device`, `action`) VALUES (%s, %s)"
            val_device = (device, status)
            cursor.execute(sql_device, val_device)
            db.commit()
            print(f"Lưu vào bảng 'device': {device}, {status}")

# Hàm xử lý khi kết nối thành công với MQTT
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Kết nối thành công với MQTT Broker")
        client.subscribe(MQTT_TOPIC_SENSOR)
        client.subscribe(MQTT_TOPIC_LED)
    else:
        print(f"Kết nối thất bại. Mã lỗi {rc}")

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message
mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)

# API lấy dữ liệu cảm biến để hiển thị lên web
@app.route('/api/data', methods=['GET'])
def get_sensor_data():
    cursor.execute("SELECT * FROM data ORDER BY id DESC LIMIT 1")  # Chỉ lấy bản ghi mới nhất
    row = cursor.fetchone()
    if row:
        data = {"id": row[0], "temp": row[1], "hum": row[2], "light": row[3], "time": row[4]}
    else:
        data = {"id": None, "temp": None, "hum": None, "light": None, "time": None}
    return jsonify(data)

# API lấy dữ liệu thiết bị để hiển thị lên web
@app.route('/api/device', methods=['GET'])
def get_device_data():
    cursor.execute("SELECT * FROM device ORDER BY id DESC")  # Lấy tất cả bản ghi từ bảng device
    rows = cursor.fetchall()
    devices = []
    
    for row in rows:
        devices.append({
            "id": row[0],      # Giả sử Id là trường đầu tiên
            "device": row[1],
            "action": row[2],
            "time": row[3]     # Nếu bạn có trường 'time', hãy thay thế nó cho phù hợp
        })
    
    return jsonify(devices)

# API điều khiển LED
@app.route('/api/led', methods=['POST'])
def control_led():
    data = request.json
    led = data.get("led")
    action = data.get("action")
    
    if led in ["LED1", "LED2", "LED3"] and action in ["on", "off"]:
        topic = "led"
        message = f"{led.lower()}_{action}"
        mqtt_client.publish(topic, message)
        
        return jsonify({"status": "success", "message": f"{led} is turned {action}"})
    else:
        return jsonify({"status": "error", "message": "Invalid LED or action"}), 400

if __name__ == '__main__':
    mqtt_client.loop_start()
    app.run(host="0.0.0.0", port=5000, debug=True)
