import { Timestamp } from 'firebase/firestore';

interface Service {
    description: string;
    timestamp: Timestamp;
}

export default Service;