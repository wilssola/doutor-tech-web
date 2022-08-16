import { Timestamp } from 'firebase/firestore';

interface ServiceModel {
    description: string;
    timestamp: Timestamp;
    type:  '' | 'PC' | 'NOTEBOOK' | 'NETBOOK' | 'ALL IN ONE';
    model: string;
}

export default ServiceModel;