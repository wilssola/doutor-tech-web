import ServiceModel from './service';

interface ClientModel {
    name: string;
    phone: string;
    actualService: ServiceModel;
    previousService: [ServiceModel];
    closed: boolean;
}

export default ClientModel;