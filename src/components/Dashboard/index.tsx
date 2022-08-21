import React from 'react';

import { Container, Table, Row, Button, Col, Form } from 'react-bootstrap';

import { getApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, deleteDoc, updateDoc, setDoc, doc, orderBy, query, getDoc } from 'firebase/firestore';
import { getDatabase, onValue, ref, get, onChildChanged } from 'firebase/database';

import ClientModel from '../../models/client';
import ServiceModel from '../../models/service';

function Dashboard() {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const database = getDatabase(app);

    const [clients, setClients] = React.useState<ClientModel[]>([]);
    const [admins, setAdmins] = React.useState<string[]>([]);

    const [admin, setAdmin] = React.useState<string>('');

    const [online, setOnline] = React.useState<boolean>(false);
    
    let tempOs: Record<string, string> = {};

    React.useEffect(() => {
        const q = query(collection(firestore, 'clients'), orderBy('actualService.timestamp', 'desc'));
        onSnapshot(q, async (snapshot) => {
            const data = snapshot.docs.map(doc => doc.data());
            setClients(data as ClientModel[]);
        });

        const q2 = query(collection(firestore, 'admins'));
        onSnapshot(q2, async (snapshot) => {
            const data = snapshot.docs.map(doc => doc.id);
            setAdmins(data as string[]);
        });

        const reference = ref(database, 'status');
        get(reference).then(snapshot => {
            setOnline(snapshot.val().online);

            console.log(snapshot.val());
        }).catch(error => console.error(error));
        onValue(reference, (snapshot) => {
            setOnline(snapshot.val().online);

            console.log(snapshot.val());
        });
        onChildChanged(reference, (snapshot) => {
            setOnline(snapshot.val().online);

            console.log(snapshot.val());
        });
    } , [firestore, database]);

    function logout() {
        signOut(auth)
        .then(() => console.log('logout'))
        .catch(error => console.log(error));
    }

    function deleteClient(id: string) {
        if (!id)
            return;

        const reference = doc(firestore, 'clients/', id);        
        deleteDoc(reference);
        console.log('deleteClient', id);
    }

    function updateClientClosed(id: string, closed: boolean) {
        if (!id)
            return;

        const reference = doc(firestore, 'clients/', id);        
        updateDoc(reference, { closed });
        console.log('updateClientClosed', id, closed);
    }

    function listPreviousService(id: string, previousService: ServiceModel[]) {
        if (!id)
            return;

        if (!previousService)
            return '';

        return (
            <Container>
                {
                    previousService.map((service, index) => {
                        return (
                            <Container key={index} className='d-flex mt-1'>
                                <Container>{'#' + (service ? service.os.toUpperCase() : '') + '\n'}</Container>
                                &nbsp;
                                <Button variant="danger" size='sm' onClick={() => removePreviousOS(id, service.os)}>x</Button>
                            </Container>
                        )
                    })
                }
            </Container>
        );
    }

    function dateFromTimestamp(service: ServiceModel) {
        if (!service)
            return '';

        if (!service.timestamp)
            return '';

        return (new Date(service.timestamp.toMillis())).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        });
    }

    function deleteAdmin(id: string) {
        if (!id)
            return;

        if (id === auth.currentUser?.email)
            return alert('Can not delete yourself');
            
        const reference = doc(firestore, 'admins/', id);        
        deleteDoc(reference);
        console.log('deleteAdmin', id);
    }

    function addAdmin(email: string) {
        if (!email)
            return;

        const reference = doc(firestore, 'admins/', email);        
        setDoc(reference, {});
        console.log('addAdmin', email);
    }

    function updateClientActualOS(id: string, os: string) {
        if(!id)
            return;

        const reference = doc(firestore, 'clients/', id);

        updateDoc(reference, {
            'actualService.os': os,
        });
    }

    async function addPreviousOS(id: string, os: string) {
        if(!id)
            return;

        const reference = doc(firestore, 'clients/', id);

        const oldData = await getDoc(reference);

        if(!oldData || oldData === undefined || oldData === null)
            return;

        if(!oldData.exists())
            return;

        const oldPreviousService = oldData.data().previousService; 

        const newPreviousService = oldPreviousService ? oldPreviousService as ServiceModel[] : [] as ServiceModel[];

        if(newPreviousService.find(service => service.os === os))
            return;

        const newService = {
            os,
        } as ServiceModel;

        newPreviousService.push(newService);

        const newPreviousServiceFiltered = newPreviousService.filter(service => service.os !== undefined);
        
        console.log('newPreviousServiceFiltered', newPreviousServiceFiltered);

        updateDoc(reference, {
            'previousService': newPreviousServiceFiltered,
        });
    }

    async function removePreviousOS(id: string, os: string) {
        if(!id)
            return;

        const reference = doc(firestore, 'clients/', id);

        const oldData = await getDoc(reference);

        if(!oldData)
            return;

        if(!oldData.exists())
            return;

        const oldPreviousService = oldData.data().previousService; 

        const newPreviousService = oldPreviousService ? oldPreviousService as ServiceModel[] : [] as ServiceModel[];

        const newPreviousServiceFiltered = newPreviousService.filter(service => service.os !== os);
        
        updateDoc(reference, {
            'previousService': newPreviousServiceFiltered,
        });
    }

    return (
        <Container>
            <Row className='mt-3 mb-3'>
                <Col>
                    <h1>Doutor Tech - Dashboard</h1>
                    <h2>Bot Status: {online ? 'online' : 'offline'} </h2>
                </Col>

                <Col>
                    <Container>{ auth.currentUser ? auth.currentUser.email : '' }</Container>
                    <Button className='mt-1' variant='warning' size='sm' onClick={logout}>LOGOUT</Button>
                </Col>
            </Row>

            <Row className='mt-3 mb-3'>
                <Col>
                    <h2>Clients</h2>
                </Col>
            </Row>

            <Table striped bordered hover responsive size='sm'>
                <thead>
                    <tr className='d-flex'>
                        <th className='col-1'>#</th>
                        <th className='col-1'>Name</th>
                        <th className='col-1'>Phone</th>
                        <th className='col-1'>OS</th>
                        <th className='col-1'>Description</th>
                        <th className='col-1'>Timestamp</th>
                        <th className='col-1'>Type</th>
                        <th className='col-1'>Model</th>
                        <th className='col-1'>Closed</th>
                        <th className='col-2'>Previous</th>
                        <th className='col-1'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        clients.map((client, index) => {
                            return (
                                <tr className='d-flex' key={index}>
                                    <td className='col-1'>{index}</td>
                                    <td className='col-1'>{client.name.toUpperCase()}</td>
                                    <td className='col-1 text-break'>
                                        +{client.phone}
                                        <br />
                                        <Button className='mt-1' variant='secondary' size='sm' href={'tel:+' + client.phone}>Call</Button>
                                        <br />
                                        <Button className='mt-1' variant='success' size='sm' href={'https://wa.me/' + client.phone} target='_blank'>WhatsApp</Button>
                                    </td>
                                    <td className='col-1'>
                                        <Form.Control value={client.actualService ? client.actualService.os : ''} onChange={(e) => updateClientActualOS(client.phone, e.target.value)}></Form.Control>
                                    </td>
                                    <td className='col-1 text-break'>{client.actualService ? client.actualService.description.toUpperCase() : ''}</td>
                                    <td className='col-1 text-break'>{dateFromTimestamp(client.actualService).toUpperCase()}</td>
                                    <td className='col-1 text-break'>{client.actualService ? client.actualService.type.toUpperCase() : ''}</td>
                                    <td className='col-1 text-break'>{client.actualService ? client.actualService.model.toUpperCase() : ''}</td>
                                    <td className='col-1'>
                                        <Form.Check type='switch' checked={client.closed} onChange={() => updateClientClosed(client.phone, !client.closed)} onClick={() => updateClientClosed(client.phone, !client.closed)} />
                                    </td>
                                    <td className='col-2 text-break'>
                                        {listPreviousService(client.phone, client.previousService)}

                                        <Container className='d-flex mt-3'>
                                            <Form.Control size='sm' onChange={(e) => tempOs[client.phone] = e.target.value}></Form.Control>
                                            <Button variant='success' size='sm' onClick={() => addPreviousOS(client.phone, tempOs[client.phone])}>+</Button>
                                        </Container>
                                    </td>
                                    <td className='col-1'>
                                        <Button variant='danger' size='sm' onClick={() => deleteClient(client.phone)}>Delete</Button>
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </Table>

            <Row className='mt-3 mb-3'>
                <Col>
                    <h2>Admins</h2>
                </Col>
            </Row>

            <Form className='mt-2 d-flex'>                                                            
                <Container className='col-11'>
                    <Form.Control type='text' placeholder='Email' value={admin} onChange={(e) => setAdmin(e.target.value)} required />
                </Container>
                <Container className='col-1'>
                    <Button variant='success' size='sm' onClick={() => addAdmin(admin)}>Add</Button>
                </Container>
            </Form>

            <Table  striped bordered hover responsive size='sm' className='mt-2'>
                <thead>
                    <tr className='d-flex'>
                        <th className='col-1'>#</th>
                        <th className='col-10'>Admin</th>
                        <th className='col-1'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        admins.map((admin, index) => {
                            return (
                                <tr className='d-flex' key={index}>
                                    <td className='col-1'>{index}</td>
                                    <td className='col-10'>{admin}</td>
                                    <td className='col-1'>
                                        <Button variant='danger' size='sm' onClick={() => deleteAdmin(admin)}>Delete</Button>
                                    </td>
                                </tr>
                            );
                        })
                    }
                </tbody>                
            </Table>
        </Container>
    );
}

export default Dashboard;