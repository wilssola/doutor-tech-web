import React from 'react';

import { Container, Table, Row, Button, Col, Form } from 'react-bootstrap';

import { getApp } from 'firebase/app';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, deleteDoc, updateDoc, setDoc, doc, orderBy, query } from 'firebase/firestore';

import ClientModel from '../../models/client';
import ServiceModel from '../../models/service';

function Dashboard() {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const [clients, setClients] = React.useState<ClientModel[]>([]);
    const [admins, setAdmins] = React.useState<string[]>([]);

    const [admin, setAdmin] = React.useState<string>('');

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
    } , []);

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

    function listPreviousService(previousService: ServiceModel[]) {
        if (!previousService)
            return '';

        let html = '';

        previousService.map(service => html += `<li>${service ? service.description : ''} - ${dateFromTimestamp(service)}</li>`);

        return html;
    }

    function dateFromTimestamp(service: ServiceModel) {
        if (!service)
            return '';

        if (!service.timestamp)
            return '';

        return (new Date(service.timestamp.toMillis())).toLocaleDateString("pt-BR", {
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

    return (
        <Container>
            <Row className='mt-3 mb-3'>
                <Col>
                    <h1>Doutor Tech - Dashboard</h1>
                </Col>

                <Col>
                    <Container>{ auth.currentUser ? auth.currentUser.email : '' }</Container>
                    <Button variant='warning' size='sm' onClick={logout}>LOGOUT</Button>
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
                        <th className='col-2'>Name</th>
                        <th className='col-2'>Phone</th>
                        <th className='col-2'>Service Description</th>
                        <th className='col-1'>Service Timestamp</th>
                        <th className='col-1'>Closed</th>
                        <th className='col-2'>Previous Service</th>
                        <th className='col-1'>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        clients.map((client, index) => {
                            return (
                                <tr className='d-flex' key={index}>
                                    <td className='col-1'>{index}</td>
                                    <td className='col-2'>{client.name}</td>
                                    <td className='col-2'>
                                        +{client.phone}
                                        <br />
                                        <Button className='mt-1' variant='secondary' size='sm' href={'tel:+' + client.phone}>Call</Button>
                                        <br />
                                        <Button className='mt-1' variant='success' size='sm' href={'https://wa.me/' + client.phone} target='_blank'>WhatsApp</Button>
                                    </td>
                                    <td className='col-2 text-break'>{client.actualService ? client.actualService.description : ''}</td>
                                    <td className='col-1 text-break'>{dateFromTimestamp(client.actualService)}</td>
                                    <td className='col-1'>
                                        <Form.Check type='switch' checked={client.closed} onChange={() => updateClientClosed(client.phone, !client.closed)} onClick={() => updateClientClosed(client.phone, !client.closed)} />
                                    </td>
                                    <td className='col-2 text-break'>{listPreviousService(client.previousService)}</td>
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