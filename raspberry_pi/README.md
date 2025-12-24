# 🏠 Housei - Raspberry Pi Sensör Modülü

Raspberry Pi üzerinde çalışan ve sensör verilerini Firebase Firestore'a gerçek zamanlı olarak gönderen Python uygulaması.

## 📋 Desteklenen Sensörler

| Sensör | Ölçüm | GPIO Pin |
|--------|-------|----------|
| DHT11/DHT22 | Sıcaklık & Nem | GPIO 4 |
| MQ-2/MQ-5 | Gaz Seviyesi | GPIO 17 |
| Flame Sensor | Alev Algılama | GPIO 27 |
| Status LED | Durum Göstergesi | GPIO 18 |

## 🔧 Kurulum

### 1. Gereksinimleri Yükle

```bash
cd raspberry_pi
pip install -r requirements.txt
```

### 2. Firebase Service Account Ayarla

1. [Firebase Console](https://console.firebase.google.com)'a gidin
2. Projenizi seçin
3. **Proje Ayarları** > **Servis Hesapları** sekmesine gidin
4. **Yeni özel anahtar oluştur** butonuna tıklayın
5. İndirilen JSON dosyasını `raspberry_pi/firebase-service-account.json` olarak kaydedin

### 3. Cihaz ID'sini Ayarla

`sensor_to_firebase.py` dosyasındaki `DEVICE_ID` değişkenini Firebase'deki cihaz ID'niz ile değiştirin:

```python
DEVICE_ID = "abc123xyz456"  # Firebase'deki cihaz document ID'si
```

> 💡 Cihaz ID'sini bulmak için Housei dashboard'a girin ve cihaz detaylarına bakın.

## 🔌 Bağlantı Şeması

```
Raspberry Pi GPIO (BCM)          Sensörler
─────────────────────────────────────────────
    3.3V ─────────────────────── DHT11 VCC
    GPIO 4 ───────────────────── DHT11 DATA
    GND ──────────────────────── DHT11 GND

    5V ───────────────────────── MQ-2 VCC
    GPIO 17 ──────────────────── MQ-2 DO (Digital Out)
    GND ──────────────────────── MQ-2 GND

    3.3V ─────────────────────── Flame VCC
    GPIO 27 ──────────────────── Flame DO
    GND ──────────────────────── Flame GND

    GPIO 18 ──────────────────── LED (+)
    GND (220Ω dirençli) ──────── LED (-)
```

## 🚀 Çalıştırma

### Normal Mod (Firebase'e Veri Gönderir)

```bash
python3 sensor_to_firebase.py
```

### Test Modu (Firebase Olmadan Sensörleri Test Eder)

```bash
python3 sensor_to_firebase.py --test
```

### Arka Planda Çalıştırma

```bash
# Screen ile
screen -S sensör
python3 sensor_to_firebase.py
# Çıkmak için: Ctrl+A, sonra D

# Veya systemd servisi olarak
sudo cp housei-sensor.service /etc/systemd/system/
sudo systemctl enable housei-sensor
sudo systemctl start housei-sensor
```

## ⚙️ Yapılandırma

`sensor_to_firebase.py` dosyasındaki yapılandırma bölümünü düzenleyebilirsiniz:

```python
# GPIO Pin Yapılandırması
DHT_PIN = 4           # DHT sensör data pin
GAS_SENSOR_PIN = 17   # Gaz sensörü digital pin
FLAME_SENSOR_PIN = 27 # Alev sensörü digital pin
STATUS_LED_PIN = 18   # Durum LED'i

# Veri gönderme aralığı (saniye)
UPDATE_INTERVAL = 5
```

## 📊 Firebase Veri Yapısı

Script, aşağıdaki yapıda veri gönderir:

```json
{
  "sensorData": {
    "temperature": 25.5,
    "humidity": 60.2,
    "gas": 150,
    "flame": false,
    "lastUpdated": "2024-12-14T12:00:00Z"
  },
  "isOnline": true
}
```

## 🐛 Sorun Giderme

### "Firebase credentials dosyası bulunamadı"

Service account JSON dosyasını indirip `firebase-service-account.json` olarak kaydettiğinizden emin olun.

### "DHT okuma başarısız"

- Bağlantıları kontrol edin
- DHT sensörünün 3.3V ile beslendiğinden emin olun
- Data pini ile VCC arasına 10K pull-up direnci ekleyin

### "Gaz sensörü başlatılamadı"

- GPIO pin numarasını kontrol edin
- Raspberry Pi'yi yeniden başlatmayı deneyin

## 📝 Log Dosyası

Uygulama `sensor_log.txt` dosyasına log yazar. Hataları incelemek için:

```bash
tail -f sensor_log.txt
```

## 📜 Lisans

Bu proje Housei akıllı ev sisteminin bir parçasıdır.
