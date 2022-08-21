import { Timestamp } from 'firebase/firestore';

interface ServiceModel {
    description: string;
    timestamp: Timestamp;
    type:  '' | 'PC' | 'NOTEBOOK' | 'NETBOOK' | 'ALL IN ONE';
    model: string;
    os: string;
}

export default ServiceModel;