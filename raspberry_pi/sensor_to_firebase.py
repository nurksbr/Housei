#!/usr/bin/env python3
"""
Raspberry Pi Sensör Verilerini Firebase'e Gönderme Uygulaması
=============================================================

Bu script, Raspberry Pi üzerinde bağlı sensörlerden verileri okur
ve Firebase Firestore veritabanına gerçek zamanlı olarak gönderir.

Desteklenen Sensörler:
- DHT11/DHT22: Sıcaklık ve Nem
- MQ-2/MQ-5: Gaz Algılama
- Flame Sensor: Alev Algılama

Gerekli Kütüphaneler:
- gpiozero
- firebase-admin
- Adafruit_DHT (DHT sensörler için)

Kurulum:
    pip install gpiozero firebase-admin Adafruit_DHT

Bağlantı Şeması (BCM numaralandırma):
    - DHT11/DHT22 Data Pin: GPIO 4
    - MQ-2 Gas Sensor Digital Pin: GPIO 17
    - Flame Sensor Digital Pin: GPIO 27
    - LED (durum göstergesi): GPIO 18
"""

import time
import json
import logging
from datetime import datetime
from pathlib import Path

# Firebase Admin SDK
import firebase_admin
from firebase_admin import credentials, firestore

# GPIO kütüphanesi
from gpiozero import DigitalInputDevice, LED, MCP3008

# DHT sensör için (opsiyonel - kuruluysa)
try:
    import Adafruit_DHT
    DHT_AVAILABLE = True
except ImportError:
    DHT_AVAILABLE = False
    print("⚠️  Adafruit_DHT kütüphanesi bulunamadı. Simüle edilmiş sıcaklık/nem kullanılacak.")

# ============================================================================
# YAPILANDIRMA
# ============================================================================

# Firebase yapılandırması
FIREBASE_CREDENTIALS_PATH = "firebase-service-account.json"  # Service account JSON dosyası
DEVICE_ID = "YOUR_DEVICE_ID_HERE"  # Firebase'deki cihaz ID'si

# GPIO Pin Yapılandırması (BCM numaralandırma)
DHT_PIN = 4           # DHT11/DHT22 data pin
GAS_SENSOR_PIN = 17   # MQ-2/MQ-5 digital output pin
FLAME_SENSOR_PIN = 27 # Flame sensor digital output pin
STATUS_LED_PIN = 18   # Durum LED'i

# Sensör Türü (DHT11 veya DHT22)
DHT_SENSOR_TYPE = Adafruit_DHT.DHT11 if DHT_AVAILABLE else None

# Veri gönderme aralığı (saniye)
UPDATE_INTERVAL = 5

# Gaz sensörü eşik değeri (analog okuma için MCP3008 kullanılıyorsa)
GAS_THRESHOLD = 500

# Logging yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sensor_log.txt'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


# ============================================================================
# FIREBASE BAĞLANTISI
# ============================================================================

class FirebaseManager:
    """Firebase Firestore bağlantısı ve veri yönetimi"""
    
    def __init__(self, credentials_path: str):
        """
        Firebase'i başlatır.
        
        Args:
            credentials_path: Service account JSON dosyasının yolu
        """
        self.db = None
        self._initialize_firebase(credentials_path)
    
    def _initialize_firebase(self, credentials_path: str):
        """Firebase Admin SDK'yı başlatır"""
        try:
            # Credentials dosyasını kontrol et
            if not Path(credentials_path).exists():
                raise FileNotFoundError(
                    f"Firebase credentials dosyası bulunamadı: {credentials_path}\n"
                    "Lütfen Firebase Console'dan service account JSON dosyasını indirin."
                )
            
            # Firebase uygulamasını başlat
            if not firebase_admin._apps:
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            logger.info("✅ Firebase bağlantısı başarılı!")
            
        except Exception as e:
            logger.error(f"❌ Firebase bağlantı hatası: {e}")
            raise
    
    def update_sensor_data(self, device_id: str, sensor_data: dict) -> bool:
        """
        Belirtilen cihazın sensör verilerini günceller.
        
        Args:
            device_id: Firestore'daki cihaz document ID'si
            sensor_data: Sensör verileri dictionary'si
            
        Returns:
            bool: Güncelleme başarılı ise True
        """
        try:
            # Timestamp ekle
            sensor_data['lastUpdated'] = firestore.SERVER_TIMESTAMP
            
            # Cihaz document'ını güncelle
            device_ref = self.db.collection('devices').document(device_id)
            device_ref.update({
                'sensorData': sensor_data,
                'isOnline': True
            })
            
            logger.info(f"📤 Veri gönderildi: {sensor_data}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Veri gönderme hatası: {e}")
            return False
    
    def set_device_offline(self, device_id: str):
        """Cihazı çevrimdışı olarak işaretle"""
        try:
            device_ref = self.db.collection('devices').document(device_id)
            device_ref.update({'isOnline': False})
            logger.info("📴 Cihaz çevrimdışı olarak işaretlendi")
        except Exception as e:
            logger.error(f"❌ Çevrimdışı işaretleme hatası: {e}")


# ============================================================================
# SENSÖR YÖNETİMİ
# ============================================================================

class SensorManager:
    """Tüm sensörleri yönetir ve okumalar yapar"""
    
    def __init__(self, dht_pin: int, gas_pin: int, flame_pin: int, led_pin: int):
        """
        Sensörleri başlatır.
        
        Args:
            dht_pin: DHT sensör data pin numarası
            gas_pin: Gaz sensörü digital pin numarası  
            flame_pin: Alev sensörü digital pin numarası
            led_pin: Durum LED pin numarası
        """
        self.dht_pin = dht_pin
        
        # Digital sensörleri başlat
        try:
            self.gas_sensor = DigitalInputDevice(gas_pin, pull_up=True)
            logger.info(f"✅ Gaz sensörü başlatıldı (GPIO {gas_pin})")
        except Exception as e:
            logger.warning(f"⚠️  Gaz sensörü başlatılamadı: {e}")
            self.gas_sensor = None
        
        try:
            self.flame_sensor = DigitalInputDevice(flame_pin, pull_up=True)
            logger.info(f"✅ Alev sensörü başlatıldı (GPIO {flame_pin})")
        except Exception as e:
            logger.warning(f"⚠️  Alev sensörü başlatılamadı: {e}")
            self.flame_sensor = None
        
        # Durum LED'i
        try:
            self.status_led = LED(led_pin)
            logger.info(f"✅ Durum LED'i başlatıldı (GPIO {led_pin})")
        except Exception as e:
            logger.warning(f"⚠️  Durum LED'i başlatılamadı: {e}")
            self.status_led = None
        
        # MCP3008 ADC (analog gaz okumasi için - opsiyonel)
        try:
            self.adc = MCP3008(channel=0)
            logger.info("✅ MCP3008 ADC başlatıldı")
        except Exception as e:
            logger.warning(f"⚠️  MCP3008 ADC bulunamadı (analog okuma devre dışı): {e}")
            self.adc = None
    
    def read_temperature_humidity(self) -> tuple:
        """
        DHT sensöründen sıcaklık ve nem okur.
        
        Returns:
            tuple: (sıcaklık_celsius, nem_yüzde) veya hata durumunda (None, None)
        """
        if DHT_AVAILABLE and DHT_SENSOR_TYPE:
            try:
                humidity, temperature = Adafruit_DHT.read_retry(
                    DHT_SENSOR_TYPE, 
                    self.dht_pin
                )
                
                if humidity is not None and temperature is not None:
                    return round(temperature, 1), round(humidity, 1)
                else:
                    logger.warning("⚠️  DHT okuma başarısız, yeniden deneniyor...")
                    return None, None
                    
            except Exception as e:
                logger.error(f"❌ DHT okuma hatası: {e}")
                return None, None
        else:
            # Simüle edilmiş değerler (test için)
            import random
            temp = round(random.uniform(20.0, 30.0), 1)
            humidity = round(random.uniform(40.0, 70.0), 1)
            logger.debug(f"🔄 Simüle edilmiş veriler: Sıcaklık={temp}°C, Nem={humidity}%")
            return temp, humidity
    
    def read_gas_level(self) -> int:
        """
        Gaz sensöründen okuma yapar.
        
        Returns:
            int: Gaz seviyesi (0-1023 arası analog veya 0/1 digital)
        """
        # Önce analog okumayı dene (MCP3008 varsa)
        if self.adc is not None:
            try:
                value = int(self.adc.value * 1023)  # 0-1023 arası değer
                return value
            except Exception as e:
                logger.warning(f"⚠️  Analog gaz okuma hatası: {e}")
        
        # Digital okuma
        if self.gas_sensor is not None:
            try:
                # Digital sensör: 0 = gaz yok, 1 = gaz algılandı
                return 1000 if self.gas_sensor.is_active else 0
            except Exception as e:
                logger.warning(f"⚠️  Digital gaz okuma hatası: {e}")
        
        # Simüle edilmiş değer
        import random
        return random.randint(100, 400)
    
    def read_flame_detected(self) -> bool:
        """
        Alev sensöründen okuma yapar.
        
        Returns:
            bool: True = alev algılandı, False = alev yok
        """
        if self.flame_sensor is not None:
            try:
                # Çoğu alev sensörü aktif-düşük çalışır (alev varsa LOW)
                return not self.flame_sensor.is_active
            except Exception as e:
                logger.warning(f"⚠️  Alev sensörü okuma hatası: {e}")
        
        # Simüle edilmiş değer (genelde alev yok)
        return False
    
    def blink_led(self, times: int = 1, on_time: float = 0.1):
        """Durum LED'ini yakıp söndür"""
        if self.status_led:
            for _ in range(times):
                self.status_led.on()
                time.sleep(on_time)
                self.status_led.off()
                time.sleep(on_time)
    
    def get_all_sensor_data(self) -> dict:
        """
        Tüm sensörlerden veri okur.
        
        Returns:
            dict: Tüm sensör verileri
        """
        temperature, humidity = self.read_temperature_humidity()
        gas_level = self.read_gas_level()
        flame_detected = self.read_flame_detected()
        
        data = {
            'temperature': temperature if temperature is not None else 0,
            'humidity': humidity if humidity is not None else 0,
            'gas': gas_level,
            'flame': flame_detected
        }
        
        # Okuma başarılı ise LED'i bir kez yakıp söndür
        self.blink_led(1)
        
        return data
    
    def cleanup(self):
        """Sensörleri temizle ve GPIO'ları serbest bırak"""
        if self.status_led:
            self.status_led.off()
        logger.info("🧹 Sensörler temizlendi")


# ============================================================================
# ANA PROGRAM
# ============================================================================

def main():
    """Ana program döngüsü"""
    
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║     🏠 Housei - Raspberry Pi Sensör İzleme Sistemi 🏠        ║
    ║                                                              ║
    ║  Sensör verilerini Firebase'e gönderiyorum...                ║
    ║  Durdurmak için Ctrl+C tuşlarına basın.                      ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Yapılandırmayı kontrol et
    if DEVICE_ID == "YOUR_DEVICE_ID_HERE":
        print("⚠️  UYARI: Lütfen DEVICE_ID değişkenini Firebase'deki cihaz ID'niz ile değiştirin!")
        print("   Örnek: DEVICE_ID = 'abc123xyz456'")
        print()
    
    # Firebase bağlantısı
    firebase = None
    sensors = None
    
    try:
        # Firebase'i başlat
        firebase = FirebaseManager(FIREBASE_CREDENTIALS_PATH)
        
        # Sensörleri başlat
        sensors = SensorManager(
            dht_pin=DHT_PIN,
            gas_pin=GAS_SENSOR_PIN,
            flame_pin=FLAME_SENSOR_PIN,
            led_pin=STATUS_LED_PIN
        )
        
        logger.info(f"🚀 Sensör izleme başladı! (Güncelleme aralığı: {UPDATE_INTERVAL} saniye)")
        
        # Ana döngü
        while True:
            try:
                # Sensör verilerini oku
                sensor_data = sensors.get_all_sensor_data()
                
                # Firebase'e gönder
                success = firebase.update_sensor_data(DEVICE_ID, sensor_data)
                
                if success:
                    # Başarılı gönderim
                    print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] "
                          f"Sıcaklık: {sensor_data['temperature']}°C | "
                          f"Nem: {sensor_data['humidity']}% | "
                          f"Gaz: {sensor_data['gas']} | "
                          f"Alev: {'⚠️ VAR!' if sensor_data['flame'] else '✓ Yok'}")
                else:
                    print(f"❌ [{datetime.now().strftime('%H:%M:%S')}] Veri gönderilemedi!")
                
                # Belirlenen süre kadar bekle
                time.sleep(UPDATE_INTERVAL)
                
            except KeyboardInterrupt:
                raise
            except Exception as e:
                logger.error(f"❌ Döngü hatası: {e}")
                time.sleep(UPDATE_INTERVAL)
    
    except KeyboardInterrupt:
        print("\n")
        logger.info("⏹️  Program kullanıcı tarafından durduruldu.")
    
    except Exception as e:
        logger.error(f"❌ Kritik hata: {e}")
    
    finally:
        # Temizlik
        if sensors:
            sensors.cleanup()
        if firebase and DEVICE_ID != "YOUR_DEVICE_ID_HERE":
            firebase.set_device_offline(DEVICE_ID)
        
        print("\n👋 Güle güle!")


# ============================================================================
# TEST MODU
# ============================================================================

def test_mode():
    """
    Sensörleri Firebase bağlantısı olmadan test eder.
    Raspberry Pi üzerinde çalışırken sensörlerin doğru bağlandığını kontrol etmek için kullanın.
    """
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║              🧪 SENSÖR TEST MODU 🧪                          ║
    ║                                                              ║
    ║  Firebase bağlantısı olmadan sensörleri test ediyorum...     ║
    ║  Durdurmak için Ctrl+C tuşlarına basın.                      ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    sensors = None
    
    try:
        sensors = SensorManager(
            dht_pin=DHT_PIN,
            gas_pin=GAS_SENSOR_PIN,
            flame_pin=FLAME_SENSOR_PIN,
            led_pin=STATUS_LED_PIN
        )
        
        print("\n📊 Sensör okumaları başlıyor...\n")
        
        while True:
            data = sensors.get_all_sensor_data()
            
            print(f"[{datetime.now().strftime('%H:%M:%S')}]")
            print(f"  🌡️  Sıcaklık: {data['temperature']}°C")
            print(f"  💧 Nem: {data['humidity']}%")
            print(f"  💨 Gaz Seviyesi: {data['gas']}")
            print(f"  🔥 Alev: {'⚠️ ALGILANDI!' if data['flame'] else '✓ Yok'}")
            print("-" * 40)
            
            time.sleep(2)
    
    except KeyboardInterrupt:
        print("\n⏹️  Test modu durduruldu.")
    
    finally:
        if sensors:
            sensors.cleanup()


# ============================================================================
# PROGRAM GİRİŞ NOKTASI
# ============================================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_mode()
    else:
        main()
