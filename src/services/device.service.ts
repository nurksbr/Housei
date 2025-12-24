import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from "firebase/firestore";

export interface Device {
    id?: string;
    name: string;
    type: string;
    status: 'on' | 'off';
    isOnline: boolean;
    powerUsage?: number; // Estimated usage in Watts
    createdAt: any; // Firestore Timestamp

    // New fields for Sensor & Owner support
    sensors?: string[]; // e.g. ['temperature', 'humidity', 'gas', 'flame']
    ownerEmail?: string;
    ownerPassword?: string;
    sensorData?: {
        temperature?: number;
        humidity?: number;
        gas?: number;
        flame?: boolean;
        lastUpdated?: any;
    };
}

export class DeviceService {
    private static COLLECTION_NAME = "devices";

    /**
     * Adds a new device to Firestore
     */
    static async addDevice(device: Omit<Device, 'id' | 'createdAt'>): Promise<string> {
        try {
            // Initialize sensorData with default values based on selected sensors
            const initialSensorData: any = {};
            if (device.sensors?.includes('temperature')) initialSensorData.temperature = 0;
            if (device.sensors?.includes('humidity')) initialSensorData.humidity = 0;
            if (device.sensors?.includes('gas')) initialSensorData.gas = 0;
            if (device.sensors?.includes('flame')) initialSensorData.flame = false;

            if (Object.keys(initialSensorData).length > 0) {
                initialSensorData.lastUpdated = Timestamp.now();
            }

            const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
                ...device,
                sensorData: initialSensorData,
                createdAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding device:", error);
            throw error;
        }
    }

    /**
     * Toggles the power status of a device
     */
    static async toggleDeviceStatus(deviceId: string, currentStatus: 'on' | 'off'): Promise<void> {
        try {
            const newStatus = currentStatus === 'on' ? 'off' : 'on';
            const deviceRef = doc(db, this.COLLECTION_NAME, deviceId);
            await updateDoc(deviceRef, {
                status: newStatus
            });
        } catch (error) {
            console.error("Error toggling device status:", error);
            throw error;
        }
    }

    /**
     * Deletes a device from Firestore
     */
    static async deleteDevice(deviceId: string): Promise<void> {
        try {
            const deviceRef = doc(db, this.COLLECTION_NAME, deviceId);
            await deleteDoc(deviceRef);
        } catch (error) {
            console.error("Error deleting device:", error);
            throw error;
        }
    }

    /**
     * Subscribes to the devices collection for real-time updates
     * @param callback Function to call with the updated list of devices
     * @returns Unsubscribe function
     */
    static subscribeToDevices(callback: (devices: Device[]) => void) {
        const q = query(
            collection(db, this.COLLECTION_NAME),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const devices = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Device));
            callback(devices);
        }, (error) => {
            console.error("Error watching devices:", error);
        });
    }
}
