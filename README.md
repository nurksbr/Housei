# 🏠 Housei - Smart Home IoT Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi-A22846?style=for-the-badge&logo=raspberrypi&logoColor=white)

**Akıllı ev cihazlarınızı izleyin, kontrol edin ve yönetin.**

[Demo](#demo) • [Özellikler](#-özellikler) • [Kurulum](#-kurulum) • [Kullanım](#-kullanım) • [API](#-api)

</div>

---

## 📋 Proje Hakkında

**Housei**, Raspberry Pi tabanlı sensörler ile entegre çalışan modern bir akıllı ev IoT platformudur. Gerçek zamanlı sensör verilerini izleyebilir, cihazları kontrol edebilir ve ev otomasyonu sağlayabilirsiniz.

### 🎯 Temel Özellikler

- 🌡️ **Sıcaklık İzleme** - DHT11/DHT22 sensörleri ile gerçek zamanlı sıcaklık takibi
- 💧 **Nem Ölçümü** - Ortam nem seviyelerini izleme
- 🔥 **Alev Algılama** - Yangın güvenliği için alev sensörü entegrasyonu
- 💨 **Gaz Algılama** - MQ serisi sensörler ile gaz kaçağı tespiti
- 📊 **Gerçek Zamanlı Dashboard** - Anlık veri görselleştirme
- 🔐 **Güvenli Kimlik Doğrulama** - Firebase Authentication ile güvenli giriş
- 📱 **Responsive Tasarım** - Mobil uyumlu arayüz

---

## 🏗️ Teknoloji Stack

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| **Next.js 15** | React tabanlı full-stack framework |
| **React 19** | UI kütüphanesi |
| **TypeScript** | Tip güvenli JavaScript |
| **Chart.js** | Veri görselleştirme |
| **CSS Modules** | Modüler stil yönetimi |

### Backend & Database
| Teknoloji | Açıklama |
|-----------|----------|
| **Firebase Realtime Database** | Gerçek zamanlı veri senkronizasyonu |
| **Firebase Authentication** | Kullanıcı kimlik doğrulama |
| **Firebase Cloud** | Bulut altyapısı |

### Hardware
| Teknoloji | Açıklama |
|-----------|----------|
| **Raspberry Pi** | IoT kontrol cihazı |
| **Python + gpiozero** | Sensör okuma scripti |
| **DHT11/DHT22** | Sıcaklık & nem sensörü |
| **MQ Serisi** | Gaz sensörleri |
| **Alev Sensörü** | Yangın algılama |

---

## 📁 Proje Yapısı

```
Housei/
├── src/
│   ├── app/
│   │   ├── dashboard/           # Dashboard sayfaları
│   │   │   ├── page.tsx         # Ana dashboard
│   │   │   ├── device-status/   # Cihaz durumu
│   │   │   ├── add-device/      # Cihaz ekleme
│   │   │   └── control/         # Cihaz kontrolü
│   │   ├── login/               # Giriş sayfası
│   │   ├── setup/               # Kurulum sayfası
│   │   └── globals.css          # Global stiller
│   ├── components/
│   │   ├── Charts/              # Grafik bileşenleri
│   │   └── ui/                  # UI bileşenleri
│   ├── context/
│   │   └── AuthContext.tsx      # Kimlik doğrulama context
│   ├── lib/
│   │   └── firebase.ts          # Firebase konfigürasyonu
│   └── services/
│       ├── auth.service.ts      # Auth servisi
│       └── device.service.ts    # Cihaz servisi
├── raspberry_pi/
│   ├── sensor_to_firebase.py    # Sensör okuma scripti
│   ├── requirements.txt         # Python bağımlılıkları
│   ├── housei-sensor.service    # Systemd servis dosyası
│   └── README.md                # Raspberry Pi kurulum
├── env.example                  # Örnek environment dosyası
└── package.json
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- Firebase hesabı
- Raspberry Pi (sensör entegrasyonu için)

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/nurksbr/Housei.git
cd Housei
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Değişkenlerini Ayarlayın

```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

---

## 🍓 Raspberry Pi Kurulumu

Raspberry Pi sensör entegrasyonu için `raspberry_pi/` klasörüne bakın.

### Hızlı Kurulum

```bash
cd raspberry_pi

# Bağımlılıkları yükle
pip install -r requirements.txt

# Scripti çalıştır
python sensor_to_firebase.py
```

### Systemd Servisi (Otomatik Başlatma)

```bash
sudo cp housei-sensor.service /etc/systemd/system/
sudo systemctl enable housei-sensor
sudo systemctl start housei-sensor
```

Detaylı bilgi için: [Raspberry Pi README](./raspberry_pi/README.md)

---

## 📱 Ekran Görüntüleri

| Dashboard | Cihaz Durumu | Kontrol Paneli |
|-----------|--------------|----------------|
| Ana sayfa ile gerçek zamanlı sensör verileri | Cihaz bağlantı durumları | Cihaz kontrolü ve ayarları |

---

## 🔧 API Referansı

### Firebase Realtime Database Yapısı

```json
{
  "devices": {
    "device_id": {
      "name": "Oturma Odası",
      "sensors": {
        "temperature": true,
        "humidity": true,
        "gas": false,
        "flame": true
      },
      "owner": {
        "email": "user@example.com"
      },
      "createdAt": "2024-12-24T12:00:00Z"
    }
  },
  "sensor_data": {
    "device_id": {
      "temperature": 23.5,
      "humidity": 45,
      "gas_detected": false,
      "flame_detected": false,
      "timestamp": "2024-12-24T12:00:00Z"
    }
  }
}
```

---

## 🛠️ Geliştirme

### Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm start

# Lint kontrolü
npm run lint
```

### Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 👨‍💻 Geliştirici

**Fevziye Nur Kesebir**

- GitHub: [@nurksbr](https://github.com/nurksbr)

---

<div align="center">

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

**Housei** ile akıllı evinizi kontrol altına alın 🏠✨

</div>
