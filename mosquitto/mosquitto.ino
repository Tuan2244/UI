#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <BH1750.h>

#define DHTPIN 4     // Chân cảm biến DHT
#define DHTTYPE DHT11 // DHT11 nếu bạn dùng cảm biến này
#define LED1 2     // Chân điều khiển LED
#define LED2 15 
#define LED3 18 
#define LED4 5  // Chân điều khiển LED4
#define LED5 19  // Chân điều khiển LED5

// Thông tin kết nối WiFi
const char* ssid = "Redmi 9";
const char* password = "00000000";

// Thông tin MQTT broker
const char* mqtt_server = "192.168.205.93";
const char* mqtt_user = "tuan";
const char* mqtt_pass = "123";
const char* mqtt_topic_pub = "data";   // Topic để gửi dữ liệu
const char* mqtt_topic_sub = "led";       // Topic để nhận lệnh bật/tắt LED

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHTPIN, DHTTYPE);
BH1750 lightMeter;

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Dang ket noi voi ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("Wifi da ket noi");
  Serial.println("Dia chi IP: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Nhan duoc lenh tu topic: ");
  Serial.println(topic);
  String message;
  
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println("Lenh: " + message);

  // Xử lý lệnh bật/tắt LED
  if (String(topic) == mqtt_topic_sub) {
      if (message == "led1_on") {
        digitalWrite(LED1, HIGH);
      } else if (message == "led1_off") {
        digitalWrite(LED1, LOW);
      }

  // Xử lý lệnh điều khiển cho LED 2
      else if (message == "led2_on") {
        digitalWrite(LED2, HIGH);
      } else if (message == "led2_off") {
        digitalWrite(LED2, LOW);
      }

  // Xử lý lệnh điều khiển cho LED 3
      else if (message == "led3_on") {
        digitalWrite(LED3, HIGH);
      } else if (message == "led3_off") {
        digitalWrite(LED3, LOW);
      }
      else if (message == "led4_on") {
        digitalWrite(LED4, HIGH);
      } else if (message == "led4_off") {
         digitalWrite(LED4, LOW);
      }

    // Điều khiển LED5
      else if (message == "led5_on") {
        digitalWrite(LED5, HIGH);
      } else if (message == "led5_off") {
        digitalWrite(LED5, LOW);
      }

  // Lệnh bật tất cả các LED
      else if (message == "all_on") {
        digitalWrite(LED1, HIGH);
        digitalWrite(LED2, HIGH);
        digitalWrite(LED3, HIGH);
      }

  // Lệnh tắt tất cả các LED
      else if (message == "all_off") {
        digitalWrite(LED1, LOW);
        digitalWrite(LED2, LOW);
        digitalWrite(LED3, LOW);
      }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Dang ket noi....");
    if (client.connect("ESP32Client", mqtt_user, mqtt_pass)) {
      Serial.println("Da ket noi");

      // Đăng ký topic để nhận lệnh bật/tắt LED
      client.subscribe(mqtt_topic_sub);
    } else {
      Serial.print("that bai, ma loi...!");
      Serial.print(client.state());
      Serial.println(" Thu lai sau 1 giay ...");
      delay(1000);
    }
  }
}

void setup() {
  pinMode(LED1, OUTPUT);
  pinMode(LED2, OUTPUT);
  pinMode(LED3, OUTPUT);
  pinMode(LED4, OUTPUT); // Khai báo LED4
  pinMode(LED5, OUTPUT); // Khai báo LED5
  Serial.begin(115200);
  setup_wifi();
  
  client.setServer(mqtt_server, 1884);
  reconnect();
  client.setCallback(callback);
  
  dht.begin();
  Wire.begin();
  if (!lightMeter.begin()) {
    Serial.println("Khong the tim thay BH1750");
    while (1);
  }
  Serial.println("Cam bien BH1750 san sang");
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // Đọc dữ liệu cảm biến
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  float ldrValue = lightMeter.readLightLevel();

  // Kiểm tra lỗi cảm biến DHT
  if (isnan(h) || isnan(t)) {
    Serial.println("Loi doc cam bien DHT!");
    return;
  }

  // Tạo chuỗi JSON để gửi dữ liệu
  String payload = "{";
  payload += "\"temperature\":";
  payload += t;
  payload += ",\"humidity\":";
  payload += h;
  payload += ",\"light\":";
  payload += ldrValue;
  payload += "}";

  Serial.print("Dang gui du lieu:");
  Serial.println(payload);

  // Gửi dữ liệu lên Mosquitto
  client.publish(mqtt_topic_pub, payload.c_str());

  // Đợi 2 giây trước khi gửi dữ liệu tiếp theo
  delay(2000);
}
